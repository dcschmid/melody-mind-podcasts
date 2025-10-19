/**
 * Dynamic RSS Feed Endpoint for MelodyMind Podcasts
 *
 * Generates language-specific RSS feeds for podcast episodes
 * URL: /[lang]/rss.xml
 *
 * @author Daniel Schmid <dcschmid@murena.io>
 */

import type { APIRoute } from 'astro';
import enPodcastsJson from '../../data/podcasts/en.json';
import dePodcastsJson from '../../data/podcasts/de.json';
import esPodcastsJson from '../../data/podcasts/es.json';
import frPodcastsJson from '../../data/podcasts/fr.json';
import itPodcastsJson from '../../data/podcasts/it.json';
import ptPodcastsJson from '../../data/podcasts/pt.json';
import { generatePodcastRSSFeed } from '../../utils/rss';
import type { PodcastData } from '../../types/podcast';

// Supported languages
const SUPPORTED_LANGUAGES = ['en', 'de', 'es', 'fr', 'it', 'pt'];
const FALLBACK_LANGUAGE = 'en';

/**
 * Load podcast data for a specific language with fallback.
 */
async function loadPodcastsForLanguage(language: string): Promise<PodcastData[]> {
  const podcastMap = {
    en: enPodcastsJson.podcasts,
    de: dePodcastsJson.podcasts,
    es: esPodcastsJson.podcasts,
    fr: frPodcastsJson.podcasts,
    it: itPodcastsJson.podcasts,
    pt: ptPodcastsJson.podcasts,
  } as const;
  
  return (podcastMap[language as keyof typeof podcastMap] || enPodcastsJson.podcasts) as PodcastData[];
}

/**
 * Generate static paths for all supported languages
 */
export async function getStaticPaths(): Promise<{ params: { lang: string } }[]> {
  return SUPPORTED_LANGUAGES.map((lang) => ({ params: { lang } }));
}

/**
 * RSS Feed API Route Handler
 */
export const GET: APIRoute = async ({ params, request }) => {
  try {
    const langParam = params.lang as string;
    const lang = langParam?.toLowerCase() || FALLBACK_LANGUAGE;

    // Validate language parameter
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      return new Response("Language not supported", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // Load podcast episodes for the language
    const episodes = await loadPodcastsForLanguage(lang);
    const availableEpisodes = episodes.filter((ep) => ep.isAvailable);

    if (availableEpisodes.length === 0) {
      // Return empty but valid RSS feed if no episodes
  const emptyRSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:podcast="https://podcastindex.org/namespace/1.0">
  <channel>
    <title>MelodyMind Podcasts - ${lang.toUpperCase()}</title>
    <description>Music history podcast episodes - no episodes available yet</description>
    <link>https://podcasts.melody-mind.de/${lang}</link>
    <language>${lang}</language>
    <itunes:author>MelodyMind</itunes:author>
    <itunes:summary>Music history podcast episodes</itunes:summary>
    <itunes:owner>
      <itunes:name>Daniel Schmid</itunes:name>
      <itunes:email>dcschmid@murena.io</itunes:email>
    </itunes:owner>
    <itunes:image href="https://podcasts.melody-mind.de/the-melody-mind-podcast.png"/>
    <itunes:category text="Music">
      <itunes:category text="Music History"/>
    </itunes:category>
    <itunes:explicit>no</itunes:explicit>
  <itunes:type>episodic</itunes:type>
  <podcast:guid>urn:podcast:melodymind:${lang}</podcast:guid>
  <podcast:locked owner="dcschmid@murena.io">yes</podcast:locked>
    <atom:link href="https://podcasts.melody-mind.de/${lang}/rss.xml" rel="self" type="application/rss+xml"/>
  </channel>
</rss>`;

      return new Response(emptyRSS, {
        status: 200,
        headers: {
          "Content-Type": "application/rss+xml; charset=utf-8",
          "Cache-Control": "public, max-age=1800, s-maxage=3600",
          "X-Episode-Count": "0",
        },
      });
    }

    // Generate RSS feed
    const baseUrl = new URL(request.url).origin;
    const rssXML = await generatePodcastRSSFeed(lang, availableEpisodes, baseUrl);

    return new Response(rssXML, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=1800, s-maxage=3600",
        "X-Episode-Count": availableEpisodes.length.toString(),
        "X-Language": lang,
        "X-Generated-At": new Date().toISOString(),
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error(`RSS feed generation error for ${params.lang}:`, error);

    // Return error as valid RSS feed
    // Even in error state supply required iTunes tags so directory validators don't flag missing channel elements
  const errorRSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:podcast="https://podcastindex.org/namespace/1.0">
  <channel>
    <title>MelodyMind Podcast - Error</title>
    <description>RSS feed temporarily unavailable</description>
    <link>https://podcasts.melody-mind.de/${params.lang}</link>
    <language>${params.lang}</language>
    <itunes:author>MelodyMind</itunes:author>
    <itunes:summary>RSS feed temporarily unavailable</itunes:summary>
    <itunes:owner>
      <itunes:name>Daniel Schmid</itunes:name>
      <itunes:email>dcschmid@murena.io</itunes:email>
    </itunes:owner>
    <itunes:image href="https://podcasts.melody-mind.de/the-melody-mind-podcast.png"/>
    <itunes:category text="Music">
      <itunes:category text="Music History"/>
    </itunes:category>
    <itunes:explicit>no</itunes:explicit>
  <itunes:type>episodic</itunes:type>
  <podcast:guid>urn:podcast:melodymind:${params.lang}</podcast:guid>
  <podcast:locked owner="dcschmid@murena.io">yes</podcast:locked>
    <atom:link href="https://podcasts.melody-mind.de/${params.lang}/rss.xml" rel="self" type="application/rss+xml"/>
    <item>
      <title>Service Temporarily Unavailable</title>
      <description>Please try again later</description>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <guid isPermaLink="false">melody-mind-error-${Date.now()}</guid>
    </item>
  </channel>
</rss>`;

    return new Response(errorRSS, {
      status: 500,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  }
};

// Enable static generation for better performance
export const prerender = true;
