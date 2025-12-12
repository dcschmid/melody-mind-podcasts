import type { PodcastData } from "../types/podcast";

export async function generatePodcastRSSFeed(
  episodes: PodcastData[],
  baseUrl: string = "https://podcasts.melody-mind.de",
): Promise<string> {
  const lang = "en";
  const locale = "en-US";
  const title = "Melody Mind – Journey Through Music History";
  const description =
    "Melody Mind explores the stories behind the music that shaped generations. Annabelle and Daniel guide listeners through decades, genres, and iconic artists—from the 1950s to today. Each episode blends rich history, emotional insights, and immersive storytelling, showing how music connects cultures and defines moments. A podcast for everyone who wants to hear the world through sound.";

  const sortedEpisodes = episodes
    .filter((episode) => episode.isAvailable)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

  const channelLink = `${baseUrl}/`;
  const rssLink = `${baseUrl}/rss.xml`;
  const lastBuildDate = new Date().toUTCString();

  const total = sortedEpisodes.length;
  const items = sortedEpisodes
    .map((episode, index) =>
      generateRSSItem({
        episode,
        baseUrl,
        index,
        total,
        locale,
      }),
    )
    .join("\n");

  let personsTags = "";
  try {
    const personsModule = await import("../data/persons.json");
    const persons = personsModule.default ?? personsModule;
    if (Array.isArray(persons)) {
      personsTags = persons
        .map((p: any) => {
          if (!p || !p.name) return "";
          const name = escapeXML(p.name);
          const role = p.role ? escapeXML(p.role) : "host";
          const href = p.href ? ` href="${p.href}"` : "";
          const img = p.img ? ` img="${p.img}"` : "";
          return `<podcast:person${href}${img} role="${role}" name="${name}"/>`;
        })
        .filter(Boolean)
        .join("\n    ");
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
    <language>${locale}</language>
    <copyright>© ${new Date().getFullYear()} MelodyMind</copyright>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>MelodyMind RSS Generator v1.1.0</generator>
    <webMaster>dcschmid@murena.io</webMaster>
    <managingEditor>dcschmid@murena.io</managingEditor>

    <!-- Atom Self-Reference -->
    <atom:link href="${rssLink}" rel="self" type="application/rss+xml"/>

    <!-- Channel Image -->
    <image>
      <url>${baseUrl}/the-melody-mind-podcast.jpg</url>
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
    <itunes:image href="${baseUrl}/the-melody-mind-podcast.jpg"/>
    <itunes:category text="Music">
      <itunes:category text="Music History"/>
    </itunes:category>
    <itunes:explicit>no</itunes:explicit>
    <itunes:type>episodic</itunes:type>

    <!-- Podcasting 2.0 Required/Recommended Channel Tags -->
    <podcast:guid>urn:podcast:melodymind:${lang}</podcast:guid>
    <podcast:locked owner="dcschmid@murena.io">yes</podcast:locked>

    <!-- Podcasting 2.0 Persons -->
    ${personsTags}

    <!-- Episodes -->
${items}
  </channel>
</rss>`;
}

type GenerateItemArgs = {
  episode: PodcastData;
  baseUrl: string;
  index?: number;
  total?: number;
  locale: string;
};

function generateRSSItem({
  episode,
  baseUrl,
  index,
  total,
  locale,
}: GenerateItemArgs): string {
  const episodeLink = `${baseUrl}/${episode.id}`;
  const pubDate = new Date(episode.publishedAt).toUTCString();
  const guid = `melody-mind-en-${episode.id}`;

  let imageUrl = `${baseUrl}/the-melody-mind-podcast.jpg`;
  if (episode.imageUrl) {
    const baseName = episode.imageUrl;
    const squareDir = `${baseUrl}/square/${baseName}.jpg`;
    if (baseName) {
      imageUrl = squareDir;
    }
  }

  const contentHtml = episode.showNotesHtml || episode.description;

  let itunesEpisodeTag = "";
  if (episode.episodeNumber !== undefined) {
    itunesEpisodeTag = `<itunes:episode>${episode.episodeNumber}</itunes:episode>`;
  } else if (typeof index === "number" && typeof total === "number") {
    const derived = total - index;
    itunesEpisodeTag = `<itunes:episode>${derived}</itunes:episode>`;
  }

  let durationTag = "";
  if (episode.durationSeconds && episode.durationSeconds > 0) {
    durationTag = `<itunes:duration>${formatDuration(episode.durationSeconds)}</itunes:duration>`;
  }

  const enclosureLength = episode.fileSizeBytes
    ? ` length="${episode.fileSizeBytes}"`
    : ' length="25000000"';

  const transcriptTag = episode.subtitleUrl
    ? `\n      <podcast:transcript url="${episode.subtitleUrl}" type="text/vtt" language="${locale}" rel="captions"/>`
    : "";

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

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const hh = hours.toString().padStart(2, "0");
  const mm = minutes.toString().padStart(2, "0");
  const ss = seconds.toString().padStart(2, "0");
  return hours > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
}

function escapeXML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
