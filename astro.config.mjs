import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import minifyHtml from 'astro-minify-html-swc';

export default defineConfig({
  site: 'https://podcasts.melody-mind.de',
  output: 'static',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-US',
          de: 'de-DE', 
          es: 'es-ES',
          fr: 'fr-FR',
          it: 'it-IT',
          pt: 'pt-PT'
        }
      },
      xslURL: '/sitemap.xsl',
      namespaces: {
        news: false,
        video: false,
        image: false,
        xhtml: true
      },
      // SEO optimized sitemap settings
      serialize: (item) => {
        // Add priority and changefreq based on page type
        if (item.url.includes('/en/') || item.url.endsWith('/en')) {
          item.priority = 1.0;
          item.changefreq = 'weekly';
        } else if (item.url.match(/\/[a-z]{2}\/[^/]+$/)) {
          // Episode pages
          item.priority = 0.8;
          item.changefreq = 'monthly';
        } else {
          // Language homepage
          item.priority = 0.9;
          item.changefreq = 'weekly';
        }
        return item;
      }
    }),
    // HTML Minification via SWC for better performance
    minifyHtml({
      // Conservative collapse to avoid breaking whitespace-sensitive content in transcripts/show notes
      collapseWhitespace: 'conservative',
      // Keep comments in case of structured metadata (set to false if not needed)
      removeComments: true,
      // Remove redundant attributes
      removeRedundantAttributes: true,
      // Minify inline CSS in style attributes
      minifyCss: true,
      // Ensure boolean attributes are minimized (e.g. "disabled")
      collapseBooleanAttributes: true
    })
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de', 'es', 'fr', 'it', 'pt'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  build: {
    // SEO optimizations
    inlineStylesheets: 'auto',
    assets: 'assets'
  },
  compressHTML: true,
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@components': path.resolve('./src/components'),
        '@layouts': path.resolve('./src/layouts'),
        '@utils': path.resolve('./src/utils'),
        '@data': path.resolve('./src/data'),
        '@types': path.resolve('./src/types'),
      },
    },
  }
});