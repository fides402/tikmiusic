import type { Handler } from "@netlify/functions";
import axios from "axios";

const DISCOGS_TOKEN = "fvYYQHvhAEHVshXGPHYtbAWSlTUNQpnNJcBBbYCB";

export const handler: Handler = async (event) => {
  const genre = event.queryStringParameters?.genre;
  const style = event.queryStringParameters?.style;

  const searchParams: Record<string, any> = {
    token: DISCOGS_TOKEN,
    type: "release",
    per_page: 1,
  };
  if (genre) searchParams.genre = genre;
  if (style) searchParams.style = style;

  try {
    const initialSearch = await axios.get(
      "https://api.discogs.com/database/search",
      {
        params: searchParams,
        headers: { "User-Agent": "DiscogsTikTokDigger/1.0" },
      }
    );

    const totalPages = initialSearch.data.pagination.pages;
    const maxPage = Math.min(totalPages, 100);
    const randomPage = Math.floor(Math.random() * maxPage) + 1;

    const randomSearch = await axios.get(
      "https://api.discogs.com/database/search",
      {
        params: { ...searchParams, page: randomPage, per_page: 50 },
        headers: { "User-Agent": "DiscogsTikTokDigger/1.0" },
      }
    );

    const results = randomSearch.data.results;
    if (!results || results.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: "No results found" }) };
    }

    const randomRelease = results[Math.floor(Math.random() * results.length)];
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(randomRelease),
    };
  } catch (error) {
    console.error("Discogs API Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to fetch from Discogs" }) };
  }
};
