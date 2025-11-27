import type { APIRoute } from "astro";
import enPodcastsJson from "../data/podcasts/en.json";
import { generatePodcastRSSFeed } from "../utils/rss";
import type { PodcastData } from "../types/podcast";

export const GET: APIRoute = async ({ request }) => {
  const episodes = (enPodcastsJson.podcasts as PodcastData[]).filter(
    (episode) => episode.isAvailable,
  );

  const baseUrl = new URL(request.url).origin;
  const rssXML = await generatePodcastRSSFeed(episodes, baseUrl);

  return new Response(rssXML, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800, s-maxage=3600",
      "X-Episode-Count": episodes.length.toString(),
      "X-Language": "en",
      "X-Generated-At": new Date().toISOString(),
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};

export const prerender = true;
