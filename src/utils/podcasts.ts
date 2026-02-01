import { getEntry, type CollectionEntry } from "astro:content";
import type { PodcastData } from "../types/podcast";

type PodcastsData = {
  podcasts: PodcastData[];
};

type PodcastsEntry = CollectionEntry<"podcasts">;

const isPodcastsEntry = (
  entry: PodcastsEntry | undefined,
): entry is PodcastsEntry & { data: PodcastsData } =>
  Boolean(entry && Array.isArray(entry.data?.podcasts));

// Loads the English podcast data set from Astro content collections.
export const getPodcastList = async (): Promise<PodcastData[]> => {
  const entry = await getEntry("podcasts", "en");
  if (!isPodcastsEntry(entry)) {return [];}
  return entry.data.podcasts;
};

// Returns only episodes marked as available.
export const getAvailablePodcasts = async (): Promise<PodcastData[]> => {
  const podcasts = await getPodcastList();
  return podcasts.filter((podcast) => podcast.isAvailable);
};

// Looks up a single episode by id, optionally reusing a preloaded list.
export const getPodcastById = async (
  id: string,
  podcasts?: PodcastData[],
): Promise<PodcastData | undefined> => {
  const list = podcasts ?? (await getPodcastList());
  return list.find((podcast) => podcast.id === id);
};
