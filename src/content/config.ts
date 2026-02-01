import { defineCollection, z } from 'astro:content';

const podcasts = defineCollection({
  type: 'data',
  schema: z.object({
    podcasts: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        audioUrl: z.string().url(),
        imageUrl: z.string(),
        publishedAt: z.string().datetime(),
        language: z.string(),
        isAvailable: z.boolean(),
        durationSeconds: z.number().optional(),
        episodeNumber: z.number().optional(),
        knowledgeUrl: z.string().url().optional(),
        subtitleUrl: z.string().url().optional(),
        showNotesHtml: z.string().optional(),
        metaDescription: z.string().optional(),
        seriesName: z.string().optional(),
        fileSizeBytes: z.number().optional(),
        imageWidth: z.number().optional(),
        imageHeight: z.number().optional()
      })
    )
  })
});

export const collections = {
  podcasts
};
