import React, { useState, useEffect, useRef } from 'react';
import { YouTubePlayer } from './YouTubePlayer';
import { motion, AnimatePresence } from 'motion/react';
import { DiscogsRelease, YouTubeVideo, YouTubePlaylist } from '../types';
import { fetchRandomRelease, searchYouTubeVideo, searchYouTubePlaylist } from '../services/api';
import { Disc, ExternalLink, ListMusic, Loader2, ArrowLeft } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

interface VideoFeedProps {
  genre: string;
  onBack: () => void;
}

interface FeedItem {
  id: string; // unique id for key
  release: DiscogsRelease;
  video?: YouTubeVideo;
  playlist?: YouTubePlaylist;
  loading: boolean;
  error?: string;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({ genre, onBack }) => {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load initial batch
  useEffect(() => {
    loadMoreItems(3);
  }, [genre]);

  const loadMoreItems = async (count: number) => {
    const newItems: FeedItem[] = Array(count).fill(null).map(() => ({
      id: Math.random().toString(36).substr(2, 9),
      release: {} as DiscogsRelease,
      loading: true
    }));

    setItems(prev => [...prev, ...newItems]);
    setLoadingInitial(false);

    // Fetch data for each new item
    newItems.forEach(async (item) => {
      try {
        const release = await fetchRandomRelease(genre);
        
        // Search for video
        const query = `${release.title} ${release.year || ''}`;
        let video = undefined;
        try {
            video = await searchYouTubeVideo(query);
        } catch (e) {
            console.error("Video not found", e);
        }

        // Search for playlist
        let playlist = undefined;
        try {
            const playlistResult = await searchYouTubePlaylist(`${release.title} full album playlist`);
            if (playlistResult) {
                playlist = playlistResult;
            }
        } catch (e) {
            // Ignore errors for optional playlist
        }

        setItems(prev => prev.map(i => i.id === item.id ? { 
          ...i, 
          release, 
          video, 
          playlist, 
          loading: false 
        } : i));
      } catch (error) {
        console.error("Error loading item", error);
        setItems(prev => prev.map(i => i.id === item.id ? { 
          ...i, 
          loading: false, 
          error: "Failed to load content" 
        } : i));
      }
    });
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - clientHeight) {
        // Load more when near bottom
        // Debounce or check if already loading? 
        // For simplicity, just check if last item is loaded
        const lastItem = items[items.length - 1];
        if (!lastItem.loading) {
           loadMoreItems(2);
        }
      }
    }
  };

  return (
    <div className="relative h-screen bg-black text-white overflow-hidden">
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 z-50 p-2 bg-black/50 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item, index) => (
          <VideoCard key={item.id} item={item} isActive={true} />
        ))}
        {loadingInitial && (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white/50" />
            </div>
        )}
      </div>
    </div>
  );
};

const VideoCard: React.FC<{ item: FeedItem, isActive: boolean }> = ({ item }) => {
  const { ref, inView } = useInView({
    threshold: 0.6,
  });

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true); // Start muted to allow autoplay

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (inView && !item.loading && item.video) {
      // Small delay to prevent "play() interrupted by pause()" on fast scroll
      timeout = setTimeout(() => {
        setPlaying(true);
      }, 300);
    } else {
      setPlaying(false);
    }

    return () => clearTimeout(timeout);
  }, [inView, item.loading, item.video]);

  if (item.loading) {
    return (
      <div className="h-screen w-full snap-start flex items-center justify-center bg-zinc-900 border-b border-white/10">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-white/50" />
            <p className="text-white/50 text-sm font-mono animate-pulse">Digging in the crates...</p>
        </div>
      </div>
    );
  }

  if (item.error || !item.video) {
    return (
      <div className="h-screen w-full snap-start flex items-center justify-center bg-zinc-900 border-b border-white/10">
        <div className="text-center p-8">
            <Disc className="w-12 h-12 mx-auto mb-4 text-white/20" />
            <p className="text-white/50">{item.error || "No video found"}</p>
            <p className="text-white/30 text-sm mt-2">{item.release.title}</p>
        </div>
      </div>
    );
  }

  const revancedUrl = item.playlist 
    ? `intent://www.youtube.com/playlist?list=${item.playlist.id.playlistId}#Intent;scheme=http;action=android.intent.action.VIEW;end`
    : `intent://www.youtube.com/watch?v=${item.video.id.videoId}#Intent;scheme=http;action=android.intent.action.VIEW;end`;

  return (
    <div ref={ref} className="h-screen w-full snap-start relative bg-black flex items-center justify-center border-b border-white/10">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <YouTubePlayer
          videoId={item.video.id.videoId}
          playing={playing}
          muted={true} // Always muted for background
          controls={false}
          className="w-full h-full pointer-events-none scale-150 opacity-60 blur-sm"
        />
        <div className="absolute inset-0 bg-black/60" /> {/* Overlay for readability */}
      </div>

      {/* Main Player */}
      <div className="z-10 w-full max-w-md aspect-video shadow-2xl bg-black relative overflow-hidden rounded-xl border border-white/10 group">
         <YouTubePlayer
          videoId={item.video.id.videoId}
          playing={playing}
          muted={muted}
          controls={true}
          className="w-full h-full"
          onError={(e) => console.error("Player Error:", e)}
        />
        
        {/* Unmute Overlay Hint (only if muted and playing) */}
        {muted && playing && (
            <button 
                onClick={() => setMuted(false)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-md transition-all z-30"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-volume-x"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" x2="17" y1="9" y2="15"/><line x1="17" x2="23" y1="9" y2="15"/></svg>
            </button>
        )}
      </div>

      {/* Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-black via-black/80 to-transparent pt-24 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold leading-tight mb-1 line-clamp-2">{item.release.title}</h2>
                    <p className="text-white/70 text-lg mb-2">{item.release.year || "Unknown Year"}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                        {item.release.genre?.map(g => (
                            <span key={g} className="px-2 py-1 bg-white/10 rounded-md text-xs font-medium uppercase tracking-wider">{g}</span>
                        )) || null}
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {/* Discogs Link */}
                    <a 
                        href={`https://www.discogs.com${item.release.uri || ''}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors backdrop-blur-md border border-white/10"
                        title="View on Discogs"
                    >
                        <Disc className="w-6 h-6" />
                    </a>

                    {/* ReVanced / Playlist Link */}
                    <a 
                        href={revancedUrl}
                        className="w-12 h-12 rounded-full bg-[#FF0000]/20 hover:bg-[#FF0000]/40 text-[#FF0000] flex items-center justify-center transition-colors backdrop-blur-md border border-[#FF0000]/30"
                        title="Open Album Playlist in ReVanced"
                    >
                        <ListMusic className="w-6 h-6" />
                    </a>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
