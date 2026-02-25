import axios from "axios";
import { DiscogsRelease, YouTubeVideo, YouTubePlaylist } from "../types";

const DISCOGS_TOKEN = "fvYYQHvhAEHVshXGPHYtbAWSlTUNQpnNJcBBbYCB";
const YOUTUBE_API_KEY = "AIzaSyBiNS-Xtp-Ck-z39OAxVCGtqZNx6h-pVW8";

export const fetchRandomRelease = async (genre: string, style?: string): Promise<DiscogsRelease> => {
  const searchParams: Record<string, any> = {
    token: DISCOGS_TOKEN,
    type: "release",
    per_page: 1,
  };
  if (genre) searchParams.genre = genre;
  if (style) searchParams.style = style;

  const initialSearch = await axios.get("https://api.discogs.com/database/search", {
    params: searchParams,
    headers: { "User-Agent": "DiscogsTikTokDigger/1.0" },
  });

  const totalPages = initialSearch.data.pagination.pages;
  const maxPage = Math.min(totalPages, 100);
  const randomPage = Math.floor(Math.random() * maxPage) + 1;

  const randomSearch = await axios.get("https://api.discogs.com/database/search", {
    params: { ...searchParams, page: randomPage, per_page: 50 },
    headers: { "User-Agent": "DiscogsTikTokDigger/1.0" },
  });

  const results = randomSearch.data.results;
  if (!results || results.length === 0) {
    throw new Error("No results found");
  }

  return results[Math.floor(Math.random() * results.length)];
};

export const searchYouTubeVideo = async (query: string): Promise<YouTubeVideo | null> => {
  const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
    params: {
      part: "snippet",
      q: query,
      key: YOUTUBE_API_KEY,
      type: "video",
      maxResults: 1,
    },
  });

  const items = response.data.items;
  if (!items || items.length === 0) return null;
  return items[0];
};

export const searchYouTubePlaylist = async (query: string): Promise<YouTubePlaylist | null> => {
  const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
    params: {
      part: "snippet",
      q: query,
      key: YOUTUBE_API_KEY,
      type: "playlist",
      maxResults: 1,
    },
  });

  const items = response.data.items;
  if (!items || items.length === 0) return null;
  return items[0];
};
