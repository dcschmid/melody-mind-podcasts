import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  site: 'https://podcasts.melody-mind.de',
  output: 'static',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          de: 'de', 
          es: 'es',
          fr: 'fr',
          it: 'it',
          pt: 'pt'
        }
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