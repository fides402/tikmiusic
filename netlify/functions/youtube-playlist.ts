import type { Handler } from "@netlify/functions";
import axios from "axios";

const YOUTUBE_API_KEY = "AIzaSyBiNS-Xtp-Ck-z39OAxVCGtqZNx6h-pVW8";

export const handler: Handler = async (event) => {
  const query = event.queryStringParameters?.query;
  if (!query) {
    return { statusCode: 400, body: JSON.stringify({ error: "Query required" }) };
  }

  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: query,
          key: YOUTUBE_API_KEY,
          type: "playlist",
          maxResults: 1,
        },
      }
    );

    const items = response.data.items;
    if (!items || items.length === 0) {
      return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: "null" };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items[0]),
    };
  } catch (error) {
    console.error("YouTube Playlist API Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to fetch playlist from YouTube" }) };
  }
};
