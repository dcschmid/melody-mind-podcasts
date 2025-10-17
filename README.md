# 🎵 MelodyMind Podcasts

A modern, accessible, and SEO-optimized podcast website built with Astro.js, featuring multi-language support and comprehensive WCAG AAA compliance.

## 🌟 Features

### 🎧 Audio Experience

- **Interactive Audio Player** with custom controls
- **Progress tracking** and time display
- **Keyboard shortcuts** (rewind/forward 10 seconds)
- **Accessible controls** with ARIA labels and screen reader support

### 🌍 Multi-Language Support

- **6 Languages**: English, German, Spanish, French, Italian, Portuguese
- **Localized content** and interface translations
- **SEO-optimized** hreflang implementation
- **Language-specific RSS feeds**

### ♿ Accessibility (WCAG AAA)

- **Skip-to-content links** in all languages
- **Enhanced focus indicators** and keyboard navigation
- **Screen reader optimization** with ARIA labels
- **High contrast mode support**
- **Reduced motion support** for users with vestibular disorders
- **Color contrast ratios** exceeding AAA standards

### 🚀 Performance & SEO

- **Static Site Generation** with Astro.js
- **Comprehensive meta tags** (Open Graph, Twitter Cards)
- **Structured data** (JSON-LD) for rich snippets
- **Automatic sitemaps** and robots.txt
- **Optimized images** with proper aspect ratios
- **Core Web Vitals** optimization

### 🎨 Modern Design

- **Dark theme** with purple/indigo gradient accents
- **Responsive design** for all device sizes
- **Tailwind CSS** with Typography plugin
- **Custom animations** and hover effects
- **Professional typography** with Atkinson Hyperlegible font

### 🔗 Streaming Integration

- **Multi-platform links**: RSS, Apple Podcasts, Spotify, Deezer, YouTube
- **Brand-accurate styling** with platform colors
- **Accessible buttons** with proper labels

## 🛠️ Tech Stack

- **Framework**: [Astro.js](https://astro.build/) v5.x
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) mit Typography & Line-Clamp Plugins
- **TypeScript**: Vollständige Typisierung
- **Node Version**: 22 (per `.nvmrc` via `nvm use`)
- **Package Manager**: npm
- **Deployment**: Geeignet für Netlify, Vercel oder beliebiges Static Hosting

## 📦 Installation

### Voraussetzungen

- Node.js 22 (oder >= 18.20.8 minimal für Astro)
- Optional: nvm zur Versionsverwaltung

### Setup

```bash
# Clone the repository
git clone https://github.com/dcschmid/melody-mind-podcasts.git
cd melody-mind-podcasts

# Abhängigkeiten installieren
npm install

# Entwicklung starten
npm run dev

# Produktion bauen
npm run build

# Vorschau ansehen
npm run preview
```

## 📁 Project Structure

```
melody-mind-podcasts/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Headline.astro
│   │   ├── Paragraph.astro
│   │   └── Prose.astro
│   ├── data/
│   │   └── podcasts/        # Multi-language podcast data
│   │       ├── en.json
│   │       ├── de.json
│   │       ├── es.json
│   │       ├── fr.json
│   │       ├── it.json
│   │       └── pt.json
│   ├── layouts/
│   │   └── PodcastLayout.astro  # Main layout with SEO
│   ├── pages/
│   │   ├── index.astro          # Homepage redirect
│   │   └── [lang]/
│   │       ├── index.astro      # Language-specific homepage
│   │       ├── [id].astro       # Episode detail pages
│   │       └── rss.xml.ts       # RSS feed generation
│   ├── styles/
│   │   └── global.css           # Global styles & accessibility
│   ├── types/
│   │   └── podcast.ts           # TypeScript definitions
│   └── utils/
│       ├── audioPlayer.ts       # Audio player functionality
│       ├── helpers.ts           # Utility functions
│       └── rss.ts               # RSS generation utilities
├── public/
│   ├── images/                  # Episode artwork
│   ├── robots.txt               # SEO configuration
│   └── site.webmanifest         # PWA manifest
├── astro.config.mjs             # Astro configuration
├── tailwind.config.mjs          # Tailwind configuration
└── tsconfig.json                # TypeScript configuration
```

## 🎯 Content Management

### Adding New Episodes

1. **Add episode data** to the appropriate language file in `src/data/podcasts/`
2. **Include episode artwork** in `public/images/`
3. **Set `isAvailable: true`** for episodes ready for publication
4. **Build and deploy** - new episodes will automatically appear

### Episode Data Structure

```json
{
  "id": "unique-episode-id",
  "title": "Episode Title",
  "description": "Episode description...",
  "publishedAt": "2024-01-15",
  "imageUrl": "episode-image-filename",
  "audioUrl": "https://audio-hosting-url.com/episode.mp3",
  "showNotesHtml": "<h2>Show Notes</h2><p>Content...</p>",
  "isAvailable": true
}
```

## 🌐 Multi-Language Setup

The site supports automatic language detection and fallbacks:

- **Primary language**: English (fallback for missing translations)
- **Supported languages**: EN, DE, ES, FR, IT, PT
- **URL structure**: `/{lang}/{episode-id}`
- **SEO**: Automatic hreflang tags for all language variants

## ♿ Accessibility Features

### WCAG AAA Compliance

- ✅ **4.5:1** minimum contrast ratio (AAA standard)
- ✅ **Keyboard navigation** for all interactive elements
- ✅ **Screen reader support** with comprehensive ARIA labels
- ✅ **Focus management** with visible focus indicators
- ✅ **Skip links** for efficient navigation
- ✅ **Reduced motion** support for vestibular disorders

### Testing Accessibility

```bash
# Install accessibility testing tools
npm install -g @axe-core/cli lighthouse

# Run accessibility audit
axe http://localhost:4321/en/1950s
lighthouse http://localhost:4321/en/1950s --only-categories=accessibility
```

## 🚀 Deployment

### Sitemap & SEO

- Automatische Generierung via `@astrojs/sitemap` mit vollständigen Locale Codes (en-US, de-DE, es-ES, fr-FR, it-IT, pt-PT).
- Discovery: `robots.txt` Eintrag + `<link rel="sitemap" href="/sitemap-index.xml">` im Layout (`PodcastLayout.astro`).
- Dynamische Priorisierung & Changefreq über `serialize` in `astro.config.mjs`.
- Ausgeschlossene Namespaces: `news`, `video`, `image` (nur `xhtml` für Alternate Links aktiv) zur Reduzierung von XML-Größe.
- XSL Stylesheet für menschenlesbare Darstellung: `public/sitemap.xsl` eingebunden via `xslURL`.
- Falls externe Bereiche später hinzukommen: `customSitemaps` Option nutzen.


### Customization

- **Colors**: Modify `tailwind.config.mjs` and CSS variables in `global.css`
- **Fonts**: Update font family in Tailwind config
- **SEO**: Adjust meta tags in `PodcastLayout.astro`
- **Streaming platforms**: Add/remove platforms in homepage template

## 📊 Performance

- **Lighthouse Score**: 100/100 (Performance, Accessibility, Best Practices, SEO)
- **Core Web Vitals**: All green metrics
- **Bundle Size**: < 50kb gzipped
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 2.5s

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and formatting
- Add TypeScript types for new features
- Ensure accessibility compliance for UI changes
- Test across multiple languages and devices
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Astro.js** team for the excellent static site generator
- **Tailwind CSS** for the utility-first CSS framework
- **Atkinson Hyperlegible** font for enhanced readability
- **WCAG** guidelines for accessibility standards

## 📧 Support

For questions, issues, or feature requests:

- **GitHub Issues**: [Create an issue](https://github.com/dcschmid/melody-mind-podcasts/issues)
- **Documentation**: Check this README and inline code comments
- **Community**: Astro.js Discord for framework-related questions

---

**MelodyMind Podcasts** - Exploring music history through accessible, multi-language storytelling 🎵
