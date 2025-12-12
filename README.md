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

### 🧩 Podcast Operations (Tooling)

- Automatische Audio-Metadaten-Ermittlung (Dateigröße, Dauer, Cache) via `update:audio-metadata` Script
- Validierung aller Episodenmetadaten (fehlende Felder, Bilddimensionen, zukünftige Publish-Daten) via `validate:podcasts`
- Bild-Normalisierung zu quadratischen Thumbnails (`normalize:images` mit Pad oder Crop Modus)
- Podcasting 2.0 Erweiterungen: `<podcast:transcript>` und `<podcast:person>` Tags


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
```text

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
  "isAvailable": true,
  "fileSizeBytes": 12345678,
  "durationSeconds": 3120,
  "subtitleUrl": "https://cdn.example.com/episode.vtt",
  "episodeNumber": 12
}
```

Felder wie `fileSizeBytes` und `durationSeconds` werden bevorzugt automatisch gepflegt (siehe Scripts unten). `subtitleUrl` ermöglicht Ausgabe eines `<podcast:transcript>` Tags für Untertitel/Transkripte.

### Personen (Podcasting 2.0)

Globale Datei `src/data/persons.json` definiert Personen, die im RSS als `<podcast:person>` erscheinen:

```json
[
  {
    "name": "Daniel Schmid",
    "role": "host",
    "href": "https://melody-mind.de",
    "img": "https://melody-mind.de/images/daniel.jpg"
  }
]
```

Unterstützte Felder: `name` (Pflicht), `role`, `href`, `img`. Rollen können z.B. `host`, `producer`, `guest` sein.

## 🔧 Scripts & Tooling

### Audio Metadaten Aktualisieren

Ermittelt Dateigrößen (Content-Length) und optional Dauer (ffprobe oder Fallback music-metadata). Nutzt Cache-Datei `.cache/audio-metadata.json` zur Reduktion von Netzwerkzugriffen.

```bash
yarn update:audio-metadata --duration --ffprobe
```

Flags:

- `--duration` Dauer extrahieren
- `--ffprobe` bevorzugt ffprobe (falls installiert)
- `--max-bytes=10485760` begrenzt Bytes für Fallback-Analyse
- `--no-cache` Cache nicht lesen
- `--refresh` Cache ignorieren & neu schreiben

### Validierung

Prüft Vollständigkeit und Qualität.

```bash
yarn validate:podcasts --strict
```

Flags: `--strict`, `--json`, `--no-network`, `--filter=de,en`

Zusätzliche Checks: Quadrat-Derivat `*-square.jpg` wenn Originalbild nicht quadratisch.

#### Inhaltlicher Styleguide (Version 2.0)

Alle Episoden-Metadaten (Titel & Kurzbeschreibung) folgen konsistenten Vorgaben für Branding, SEO & Plattform-Optimierung:

- Titel: 55–65 Zeichen (inkl. Leerzeichen) – prägnant
- Beschreibung: 250–300 Zeichen – verdichteter Überblick
- Host-Phrase muss vorkommen: `Daniel and Annabelle guide you` (Groß-/Kleinschreibung egal)
- Call-To-Action beginnt mit: `Press play and ...`
- Der Validierungsscript führt diese Prüfungen automatisch aus. Mit `--style-strict` werden Style-Verstöße als Fehler statt Warnungen behandelt:

```bash
node scripts/validate-podcasts.mjs --style-strict --filter=en --no-network
```

Typische Hinweise bei Verstößen:

- `Style: title length 52 outside 55–65`
- `Style: missing host phrase`
- `Style: description contains emoji`

Empfohlener Workflow beim Hinzufügen neuer Episoden:

1. Rohdaten schreiben
2. Titel/Description gegen Längenfenster prüfen
3. Host-Phrase + CTA ergänzen
4. Emojis entfernen (falls aus Quellen kopiert)
5. `validate-podcasts.mjs --style-strict` ausführen
6. Korrekturen anwenden, erneut validieren

### Bild Normalisierung

Erzeugt quadratische Thumbnails mittels Padding (contain) oder Zentrums-Zuschnitt (crop).

```bash
# Vorschau ohne Schreiben
yarn normalize:images --dry-run

# Erstellen mit Crop Modus
yarn normalize:images --mode=crop

# Original ersetzen & transparenten Hintergrund
yarn normalize:images --replace --background=transparent
```

Flags: `--filter=<lang>`, `--dry-run`, `--replace`, `--background=<hex|transparent>`, `--mode=<contain|crop>`

### Personen Aktualisieren

Bearbeite `src/data/persons.json` – bei Build/Abruf des RSS Feeds erscheinen aktualisierte `<podcast:person>` Einträge automatisch.

## 🛰 RSS Erweiterungen

- Namespace `xmlns:podcast="https://podcastindex.org/namespace/1.0"`
- `<podcast:transcript>` bei vorhandenem `subtitleUrl`
- `<podcast:person>` für jede Person in `persons.json`
- Dynamische `<itunes:episode>` Nummerierung (Fallback auf Reihenfolge)
- `<itunes:duration>` aus `durationSeconds`
- `<enclosure length="fileSizeBytes">` für genaue Größe

Generator Version aktuell: `MelodyMind RSS Generator v1.1.0`

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

### Accessible Search

Die Sprach-Indexseiten besitzen eine barrierearme Suchfunktion (`SearchBar.astro`):

 - `role="search"` mit sprachspezifischem `aria-label`.
 - Screenreader-freundliches verborgenes Label (`.visually-hidden`).
 - Live-Region (`aria-live="polite"`) meldet Trefferanzahl nach Filterung ohne Fokusverlust.
 - Tastaturbedienung: Input & Lösch-Button voll fokussierbar, klare Fokus-Ringe (AAA Kontrast).
 - Hoher Kontrast inkl. `prefers-contrast: high` Medienabfrage.
 - Unterstützt reduzierte Bewegung (`prefers-reduced-motion`).
 - Filterlogik nutzt `hidden` Attribut, erhält semantische Artikel-Struktur.

Benutzung: Ab 2 Zeichen wird nach Titel + Beschreibung gefiltert; „Clear“ setzt zurück. Anpassungen für serverseitige Suche oder Fuzzy-Matching können leicht ergänzt werden.

### Testing Accessibility

```bash
# Install accessibility testing tools
yarn global add @axe-core/cli lighthouse

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
