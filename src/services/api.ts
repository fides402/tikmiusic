import axios from "axios";
import { DiscogsRelease, YouTubeVideo, YouTubePlaylist } from "../types";

export const fetchRandomRelease = async (genre: string, style?: string): Promise<DiscogsRelease> => {
  const params: any = { genre };
  if (style) params.style = style;
  const response = await axios.get("/api/discogs/random", { params });
  return response.data;
};

export const searchYouTubeVideo = async (query: string): Promise<YouTubeVideo | null> => {
  const response = await axios.get("/api/youtube/search", { params: { query } });
  return response.data;
};

export const searchYouTubePlaylist = async (query: string): Promise<YouTubePlaylist | null> => {
  const response = await axios.get("/api/youtube/playlist", { params: { query } });
  return response.data;
};
