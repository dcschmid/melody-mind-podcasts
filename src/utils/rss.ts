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

  const items = sortedEpisodes.map((episode) => generateRSSItem(episode, lang, baseUrl)).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <!-- Basic Channel Info -->
    <title>${escapeXML(title)}</title>
    <description>${escapeXML(description)}</description>
    <link>${channelLink}</link>
    <language>${lang}</language>
    <copyright>© ${new Date().getFullYear()} MelodyMind</copyright>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>MelodyMind RSS Generator v1.0.0</generator>
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

    <!-- Episodes -->
${items}
  </channel>
</rss>`;
}

/**
 * Generate RSS item for a single podcast episode
 */
function generateRSSItem(episode: PodcastData, lang: string, baseUrl: string): string {
  const episodeLink = `${baseUrl}/${lang}/${episode.id}`;
  const pubDate = new Date(episode.publishedAt).toUTCString();
  const guid = `melody-mind-${lang}-${episode.id}`;
  
  // Episode image URL
  const imageUrl = episode.imageUrl 
    ? `${baseUrl}/images/${episode.imageUrl}.jpg`
    : `${baseUrl}/the-melody-mind-podcast.png`;

  const contentHtml = episode.showNotesHtml || episode.description;

  return `    <item>
      <title>${escapeXML(episode.title)}</title>
      <description>${escapeXML(episode.description)}</description>
      <itunes:subtitle>${escapeXML(episode.title)}</itunes:subtitle>
      <link>${episodeLink}</link>
      <guid isPermaLink="false">${guid}</guid>
      <pubDate>${pubDate}</pubDate>
      <enclosure url="${episode.audioUrl}" type="audio/mpeg" length="25000000"/>

      <!-- Categories -->
      <category>Music</category>
      <category>Education</category>
      <category>History</category>

      <!-- iTunes -->
      <itunes:title>${escapeXML(episode.title)}</itunes:title>
      <itunes:summary>${escapeXML(episode.description)}</itunes:summary>
      <itunes:image href="${imageUrl}"/>
      <itunes:duration>26:30</itunes:duration>
      <itunes:explicit>no</itunes:explicit>
      <itunes:episodeType>full</itunes:episodeType>

      <!-- Content -->
      <content:encoded><![CDATA[${contentHtml}]]></content:encoded>
    </item>`;
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
