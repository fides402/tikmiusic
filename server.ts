import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";

// User provided keys
const DISCOGS_TOKEN = "fvYYQHvhAEHVshXGPHYtbAWSlTUNQpnNJcBBbYCB";
const YOUTUBE_API_KEY = "AIzaSyBiNS-Xtp-Ck-z39OAxVCGtqZNx6h-pVW8";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Discogs Random Release
  app.get("/api/discogs/random", async (req, res) => {
    try {
      const { genre, style } = req.query;
      
      // 1. Get total items for the genre/style to calculate random page
      const searchParams: any = {
        token: DISCOGS_TOKEN,
        type: "release",
        per_page: 1,
      };
      
      if (genre) searchParams.genre = genre;
      if (style) searchParams.style = style;

      const initialSearch = await axios.get("https://api.discogs.com/database/search", {
        params: searchParams,
        headers: { "User-Agent": "DiscogsTikTokDigger/1.0" }
      });

      const totalItems = initialSearch.data.pagination.items;
      const totalPages = initialSearch.data.pagination.pages;
      
      // Discogs limits to 100 pages for deep pagination sometimes, but let's try random page
      // Actually Discogs search API has a limit of 10,000 items (100 pages of 100).
      // Let's constrain the random page to be within the first 100 pages to be safe and fast.
      const maxPage = Math.min(totalPages, 100);
      const randomPage = Math.floor(Math.random() * maxPage) + 1;

      // 2. Fetch random page
      const randomSearch = await axios.get("https://api.discogs.com/database/search", {
        params: { ...searchParams, page: randomPage, per_page: 50 }, // Get 50 items to pick one from
        headers: { "User-Agent": "DiscogsTikTokDigger/1.0" }
      });

      const results = randomSearch.data.results;
      if (!results || results.length === 0) {
        return res.status(404).json({ error: "No results found" });
      }

      const randomRelease = results[Math.floor(Math.random() * results.length)];
      
      // 3. Get detailed release info (optional, but good for tracklist)
      // For now, let's just use the search result to save API calls
      // We need video.
      
      res.json(randomRelease);
    } catch (error) {
      console.error("Discogs API Error:", error);
      res.status(500).json({ error: "Failed to fetch from Discogs" });
    }
  });

  // YouTube Search
  app.get("/api/youtube/search", async (req, res) => {
    try {
      const { query } = req.query;
      if (!query) return res.status(400).json({ error: "Query required" });

      const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          part: "snippet",
          q: query,
          key: YOUTUBE_API_KEY,
          type: "video",
          maxResults: 1
        }
      });

      const items = response.data.items;
      if (!items || items.length === 0) {
        // Return null instead of 404 to avoid console errors
        return res.json(null);
      }

      res.json(items[0]);
    } catch (error) {
      console.error("YouTube API Error:", error);
      res.status(500).json({ error: "Failed to fetch from YouTube" });
    }
  });

  // YouTube Playlist Search
  app.get("/api/youtube/playlist", async (req, res) => {
    try {
      const { query } = req.query;
      if (!query) return res.status(400).json({ error: "Query required" });

      const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          part: "snippet",
          q: query,
          key: YOUTUBE_API_KEY,
          type: "playlist",
          maxResults: 1
        }
      });

      const items = response.data.items;
      if (!items || items.length === 0) {
        // Return null instead of 404 to avoid console errors for optional content
        return res.json(null);
      }

      res.json(items[0]);
    } catch (error) {
      console.error("YouTube Playlist API Error:", error);
      res.status(500).json({ error: "Failed to fetch playlist from YouTube" });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
