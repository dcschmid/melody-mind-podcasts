import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import path from 'path';
import minifyHtml from 'astro-minify-html-swc';

export default defineConfig({
  site: 'https://podcasts.melody-mind.de',
  output: 'static',
  redirects: {},
  integrations: [
    mdx({
      optimize: true,
    }),
    sitemap({
      xslURL: '/sitemap.xsl',
      namespaces: {
        news: false,
        video: false,
        image: false,
        xhtml: true,
      },
      serialize: (item) => {
        if (item.url.endsWith('/')) {
          item.priority = 1.0;
          item.changefreq = 'weekly';
        } else {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        }
        return item;
      },
    }),
    minifyHtml({
      collapseWhitespace: 'conservative',
      removeComments: true,
      removeRedundantAttributes: true,
      minifyCss: true,
      collapseBooleanAttributes: true,
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
    assets: 'assets',
    format: 'directory',
  },
  compressHTML: true,
  vite: {
    css: {
      transformer: 'lightningcss',
    },
    resolve: {
      alias: {
        '@components': path.resolve('./src/components'),
        '@layouts': path.resolve('./src/layouts'),
        '@utils': path.resolve('./src/utils'),
        '@data': path.resolve('./src/data'),
        '@types': path.resolve('./src/types'),
      },
    },
  },
});
