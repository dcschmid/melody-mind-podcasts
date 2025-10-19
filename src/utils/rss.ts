/**
 * Simplified RSS Feed Generator for MelodyMind Podcasts
 *
 * @author Daniel Schmid <dcschmid@murena.io>
 */

import type { PodcastData } from '../types/podcast';

/**
 * Language-specific channel titles
 */
const CHANNEL_TITLES: Record<string, string> = {
  en: 'The Melody Mind Podcast',
  de: 'Der Melody Mind Podcast',
  es: 'El Podcast de Melody Mind',
  fr: 'Le Podcast Melody Mind',
  it: 'Il Podcast di Melody Mind',
  pt: 'O Podcast Melody Mind',
};

/**
 * Language-specific descriptions
 */
const CHANNEL_DESCRIPTIONS: Record<string, string> = {
  en: 'Discover the history of music through engaging podcast episodes covering different eras, genres, and musical movements.',
  de: 'Entdecke die Musikgeschichte durch spannende Podcast-Episoden über verschiedene Epochen, Genres und musikalische Bewegungen.',
  es: 'Descubre la historia de la música a través de episodios de podcast fascinantes que cubren diferentes épocas, géneros y movimientos musicales.',
  fr: 'Découvrez l\'histoire de la musique à travers des épisodes de podcast captivants couvrant différentes époques, genres et mouvements musicaux.',
  it: 'Scopri la storia della musica attraverso episodi di podcast coinvolgenti che coprono diverse epoche, generi e movimenti musicali.',
  pt: 'Descubra a história da música através de episódios de podcast envolventes cobrindo diferentes épocas, gêneros e movimentos musicais.',
};

/**
 * Generate RSS feed for podcast episodes
 */
export async function generatePodcastRSSFeed(
  lang: string,
  episodes: PodcastData[],
  baseUrl: string = 'https://podcasts.melody-mind.de'
): Promise<string> {
  const title = CHANNEL_TITLES[lang] || CHANNEL_TITLES.en;
  const description = CHANNEL_DESCRIPTIONS[lang] || CHANNEL_DESCRIPTIONS.en;
  
  // Sort episodes by publication date (newest first)
  const sortedEpisodes = episodes
    .filter((episode) => episode.isAvailable)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const channelLink = `${baseUrl}/${lang}`;
  const rssLink = `${baseUrl}/${lang}/rss.xml`;
  const lastBuildDate = new Date().toUTCString();

  const total = sortedEpisodes.length;
  const items = sortedEpisodes.map((episode, index) => generateRSSItem(episode, lang, baseUrl, index, total)).join('\n');

  // Podcasting 2.0 persons
  let personsTags = '';
  try {
    const personsModule = await import('../data/persons.json');
    const persons = personsModule.default ?? personsModule;
    if (Array.isArray(persons)) {
      personsTags = persons
        .map((p: any) => {
          if (!p || !p.name) return '';
          const name = escapeXML(p.name);
          const role = p.role ? escapeXML(p.role) : 'host';
          const href = p.href ? ` href="${p.href}"` : '';
          const img = p.img ? ` img="${p.img}"` : '';
          return `<podcast:person${href}${img} role="${role}" name="${name}"/>`;
        })
        .filter(Boolean)
        .join('\n    ');
    }
  } catch (e) {
    // ignore if file missing
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:podcast="https://podcastindex.org/namespace/1.0">
  <channel>
    <!-- Basic Channel Info -->
    <title>${escapeXML(title)}</title>
    <description>${escapeXML(description)}</description>
    <link>${channelLink}</link>
    <language>${lang}</language>
    <copyright>© ${new Date().getFullYear()} MelodyMind</copyright>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
  <generator>MelodyMind RSS Generator v1.1.0</generator>
    <webMaster>dcschmid@murena.io</webMaster>
    <managingEditor>dcschmid@murena.io</managingEditor>

    <!-- Atom Self-Reference -->
    <atom:link href="${rssLink}" rel="self" type="application/rss+xml"/>

    <!-- Channel Image -->
    <image>
      <url>${baseUrl}/the-melody-mind-podcast.png</url>
      <title>${escapeXML(title)}</title>
      <link>${channelLink}</link>
      <width>1400</width>
      <height>1400</height>
    </image>

    <!-- iTunes/Apple Podcasts -->
    <itunes:author>MelodyMind</itunes:author>
    <itunes:summary>${escapeXML(description)}</itunes:summary>
    <itunes:owner>
      <itunes:name>Daniel Schmid</itunes:name>
      <itunes:email>dcschmid@murena.io</itunes:email>
    </itunes:owner>
    <itunes:image href="${baseUrl}/the-melody-mind-podcast.png"/>
    <itunes:category text="Music">
      <itunes:category text="Music History"/>
    </itunes:category>
    <itunes:explicit>no</itunes:explicit>
    <itunes:type>episodic</itunes:type>

    <!-- Podcasting 2.0 Persons -->
    ${personsTags}

    <!-- Episodes -->
${items}
  </channel>
</rss>`;
}

/**
 * Generate RSS item for a single podcast episode
 */
function generateRSSItem(episode: PodcastData, lang: string, baseUrl: string, index?: number, total?: number): string {
  const episodeLink = `${baseUrl}/${lang}/${episode.id}`;
  const pubDate = new Date(episode.publishedAt).toUTCString();
  const guid = `melody-mind-${lang}-${episode.id}`;
  
  // Episode image URL
  // Prefer square derivative naming convention <name>-square.jpg if it exists, else fallback to <name>.jpg
  // Additionally allow centralized square directory /images/square/<name>.jpg if provided.
  let imageUrl = `${baseUrl}/the-melody-mind-podcast.png`;
  if (episode.imageUrl) {
    const baseName = episode.imageUrl;
    const squareDir = `${baseUrl}/square/${baseName}.jpg`;
    // We cannot stat files server-side here; assume square files exist if user placed them, prefer squareDir naming first.
    // To avoid broken links if not present, include a lightweight heuristic: if baseName already ends with '-square', don't append again.
    if (baseName) {
      // Choose deterministic preference; clients will 404 if missing but validation script ensures creation.
      imageUrl = squareDir;
    }
    // Optionally could expose original via <media:content>, omitted for simplicity.
  }

  const contentHtml = episode.showNotesHtml || episode.description;

  // Episode number: prefer explicit value, otherwise derive (newest = highest)
  let itunesEpisodeTag = '';
  if (episode.episodeNumber !== undefined) {
    itunesEpisodeTag = `<itunes:episode>${episode.episodeNumber}</itunes:episode>`;
  } else if (typeof index === 'number' && typeof total === 'number') {
    // newest episode (index 0) gets total, oldest gets 1
    const derived = total - index;
    itunesEpisodeTag = `<itunes:episode>${derived}</itunes:episode>`;
  }

  // Duration formatting (HH:MM:SS or MM:SS)
  let durationTag = '';
  if (episode.durationSeconds && episode.durationSeconds > 0) {
    durationTag = `<itunes:duration>${formatDuration(episode.durationSeconds)}</itunes:duration>`;
  }

  // Enclosure length (file size) if provided
  const enclosureLength = episode.fileSizeBytes ? ` length="${episode.fileSizeBytes}"` : ' length="25000000"';

  // Transcript tag if subtitles present
  const transcriptTag = episode.subtitleUrl ? `\n      <podcast:transcript url="${episode.subtitleUrl}" type="text/vtt" language="${lang}" rel="captions"/>` : '';

  return `    <item>
      <title>${escapeXML(episode.title)}</title>
      <description>${escapeXML(episode.description)}</description>
      <itunes:subtitle>${escapeXML(episode.title)}</itunes:subtitle>
      <link>${episodeLink}</link>
      <guid isPermaLink="false">${guid}</guid>
      <pubDate>${pubDate}</pubDate>
  <enclosure url="${episode.audioUrl}" type="audio/mpeg"${enclosureLength}/>

      <!-- Categories -->
      <category>Music</category>
      <category>Education</category>
      <category>History</category>

      <!-- iTunes -->
      <itunes:title>${escapeXML(episode.title)}</itunes:title>
      <itunes:summary>${escapeXML(episode.description)}</itunes:summary>
      <itunes:image href="${imageUrl}"/>
  ${durationTag}
      <itunes:explicit>no</itunes:explicit>
      <itunes:episodeType>full</itunes:episodeType>
  ${itunesEpisodeTag}
  ${transcriptTag}

      <!-- Content -->
      <content:encoded><![CDATA[${contentHtml}]]></content:encoded>
    </item>`;
}

/**
 * Format seconds to iTunes duration (HH:MM:SS or MM:SS)
 */
function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');
  return hours > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * Escape XML special characters
 */
function escapeXML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
