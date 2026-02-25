export interface DiscogsRelease {
  id: number;
  title: string;
  year?: string;
  thumb?: string;
  cover_image?: string;
  uri?: string;
  resource_url?: string;
  genre?: string[];
  style?: string[];
  label?: string[];
}

export interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
  };
}

export interface YouTubePlaylist {
  id: {
    playlistId: string;
  };
  snippet: {
    title: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
  };
}
