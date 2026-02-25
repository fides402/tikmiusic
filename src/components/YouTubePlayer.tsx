import React, { useEffect, useRef } from 'react';
import { loadYouTubeApi } from '../utils/youtubeApi';

interface YouTubePlayerProps {
  videoId: string;
  playing: boolean;
  muted: boolean;
  controls?: boolean;
  className?: string;
  onReady?: () => void;
  onError?: (e: any) => void;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ 
  videoId, 
  playing, 
  muted, 
  controls = true, 
  className,
  onReady,
  onError
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    loadYouTubeApi().then(() => {
      if (!isMounted || !containerRef.current) return;

      // If player already exists, don't recreate
      if (playerRef.current) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          'playsinline': 1,
          'controls': controls ? 1 : 0,
          'disablekb': 1,
          'fs': 0,
          'rel': 0,
          'modestbranding': 1,
          'origin': window.location.origin,
          'autoplay': playing ? 1 : 0,
          'mute': muted ? 1 : 0,
        },
        events: {
          'onReady': (event: any) => {
            if (muted) event.target.mute();
            if (playing) event.target.playVideo();
            if (onReady) onReady();
          },
          'onError': (event: any) => {
            if (onError) onError(event);
          },
          'onStateChange': (event: any) => {
             // Optional: handle state changes
          }
        }
      });
    });

    return () => {
      isMounted = false;
      if (playerRef.current) {
        try {
            playerRef.current.destroy();
        } catch (e) {
            // Ignore destroy errors
        }
        playerRef.current = null;
      }
    };
  }, []); // Init once

  // Handle Props Updates
  useEffect(() => {
    if (!playerRef.current || !playerRef.current.playVideo) return;
    
    if (playing) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [playing]);

  useEffect(() => {
    if (!playerRef.current || !playerRef.current.mute) return;

    if (muted) {
      playerRef.current.mute();
    } else {
      playerRef.current.unMute();
    }
  }, [muted]);

  return <div ref={containerRef} className={className} />;
};
