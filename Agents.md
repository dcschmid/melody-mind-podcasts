# AGENTS.md

A focused operations and conventions guide for AI coding agents working on the `melody-mind-podcasts` repository. Humans should read `README.md` for product context; agents should prioritize this file for precise instructions, architecture, and execution rules.

---

## 1. Project Snapshot

List of core attributes:

- Stack: Astro 5.x (static output) + Tailwind CSS + TypeScript 5.x
- Node: 22.x (minimum 18.20.8 for Astro, prefer 22)
- Package manager: npm (lockfile: `yarn.lock` currently present; treat scripts as portable via `npm run <script>` or `yarn <script>`; prefer `npm` for new instructions)
- Primary domain: `https://podcasts.melody-mind.de`
- Supported locales: `en`, `de`, `es`, `fr`, `it`, `pt`
- Core data: JSON episode lists per language in `src/data/podcasts/*.json`

### Key Goals

1. Serve accessible multi‑language podcast pages and per‑language RSS feeds.
2. Maintain Podcasting 2.0 tags (transcripts, persons) in RSS.
3. Enforce content style guidelines (length windows, CTA patterns, emoji mapping).
4. Optimize SEO (hreflang, structured metadata, sitemap, performant HTML).

---

## 2. Directory Overview (Agent-Relevant)

```text
src/
  components/        Reusable presentation building blocks
  data/              Podcast episode & persons JSON
  layouts/           Page layout & meta tags (SEO, OG, hreflang)
  pages/             Route definitions (dynamic `[lang]`, `[id]`, RSS endpoint)
  types/             TypeScript interfaces (podcast structures)
  utils/             Logic: rss generator, audio player helpers
scripts/             Maintenance & validation automation
public/              Static assets (images, sitemap.xsl, manifest)
.cache/              Generated audio metadata cache
```

Agents must not delete directories listed above. Adding new scripts is allowed if justified with clear naming (`<verb>-<target>.mjs`).

---

## 3. Build & Run Commands

Use the fastest applicable command; do not invent alternatives.

| Intent | Command |
|--------|---------|
| Install deps | `npm install` |
| Dev server (local) | `npm run dev` (default port 4321) |
| Production build | `npm run build` |
| Preview build | `npm run preview` |
| Update audio metadata | `npm run update:audio-metadata` |
| Validate podcast data | `npm run validate:podcasts` |
| Check style compliance | `npm run check:style` |
| Normalize images | `npm run normalize:images` |
| Convert PNG to JPG | `npm run convert:png` |

Always run validation scripts after modifying episode JSON or persons data.

---

## 4. Data Contracts

### Episode Object (per language JSON)

```ts
{
  "id": string,                 // unique, stable slug
  "title": string,              // must meet style guide rules
  "description": string,        // style guide length & CTA rules
  "publishedAt": "YYYY-MM-DD", // ISO date (UTC assumed)
  "imageUrl": string,           // base name (without /images/ prefix logic)
  "audioUrl": string,           // absolute or CDN URL to MP3
  "showNotesHtml": string?,     // optional rich HTML (sanitized by author)
  "isAvailable": boolean,       // include only if true in UI & RSS
  "fileSizeBytes": number?,     // filled by metadata script
  "durationSeconds": number?,   // filled by metadata analysis
  "subtitleUrl": string?,       // VTT for transcript (RSS <podcast:transcript>)
  "episodeNumber": number?      // overrides derived numbering
}
```

Constraints:

- `id` must not contain spaces; use hyphenated lowercase.
- `publishedAt` future dates allowed; episodes appear only when `isAvailable` is true.
- `showNotesHtml` must avoid untrusted scripts; agents do not inline `<script>`.

### Persons (`src/data/persons.json`)

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

Never remove existing person entries without an explicit request. Additions require a `name` and optionally `role`.

---

## 5. Style Enforcement (Content)

See `STYLEGUIDE.md` for comprehensive rules. Critical subset agents must enforce:

- Title length: 55–65 characters inclusive; exactly one terminal emoji matching mapping.
- Decade episodes: `1950s – Hook ... <Emoji>` (en dash, no colon).
- Description length: 250–300 characters inclusive; contains host phrase: `Daniel and Annabelle guide you` (case-insensitive) before CTA.
- CTA sentence starts with `Press play and` and ends with a single mapped emoji.
- No multiple emojis or emojis mid‑title (only trailing one).
- No exclamation marks in CTA.

On violation: update minimally; retain semantic intent. Report changes in commit message.

---

## 6. RSS Generation Rules

Function: `generatePodcastRSSFeed(lang, episodes, baseUrl)` in `src/utils/rss.ts`.
Agents modifying RSS logic must preserve:

- Namespaces: `itunes`, `atom`, `content`, `podcast`.
- `<podcast:locked>` must remain `yes` with owner email unchanged.
- Persons tags built from `persons.json` (do not hardcode).
- Episode ordering: newest first by `publishedAt`.
- Derived `<itunes:episode>` when `episodeNumber` absent (newest = total count).
- `<enclosure length>` uses `fileSizeBytes` or fallback if missing.
- Transcript tag only when `subtitleUrl` present.

If adding new Podcasting 2.0 tags, include brief inline comment and maintain XML validity.

---

## 7. Testing & Validation Workflow

Before committing changes that affect data or RSS logic:

1. Run `npm run validate:podcasts` (add `--style-strict` if adjusting style-critical fields).
2. Run `npm run check:style` for any additional internal style checks (if present).
3. Build: `npm run build` to ensure no TypeScript or Astro compile errors.
4. Optional: manual spot-check served pages via `npm run preview`.

Agents should not skip these steps even for small changes to JSON data.

---
 
## 8. Error Handling Principles

- Scripts: Fail fast with non‑zero exit codes on validation errors (`--style-strict` path). Do not suppress these.
- TypeScript: Avoid `any`. Extend interfaces in `src/types/podcast.ts` if new fields are needed—do not repurpose existing ones.
- Fallback logic: Keep conservative defaults (e.g., placeholder enclosure length). If enriching, ensure backwards compatibility.

---
 
## 9. Performance & Accessibility

Agents adding UI components must:

- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`).
- Provide `aria-label` for interactive custom controls.
- Avoid large client bundles; prefer server/static rendering.
- Reuse existing Tailwind utility patterns; avoid inline styles unless necessary.

Never introduce blocking large scripts or unoptimized images.

---
 
## 10. Security & Safety

- No inline or remote third‑party scripts without explicit request.
- Do not introduce tracking pixels or analytics code.
- Sanitize or escape any dynamic HTML added to RSS (already enclosed in CDATA for show notes).
- Keep email addresses in RSS unchanged unless user instructs.

---
 
## 11. Git & Commit Conventions

Format: `Update: <scope> <short description> <YYYY-MM-DD>` or `Fix: <scope> ... <YYYY-MM-DD>`.
Include scope tags: `data`, `rss`, `layout`, `styleguide`, `scripts`.
Example: `Update: data episode metadata corrections 2025-10-23`.

Group related JSON adjustments in one commit when possible.

---
 
## 12. Extensibility Guidelines

When introducing new episode attributes:

1. Add to `PodcastData` interface.
2. Update validation script (if semantics require checks).
3. Provide default handling in RSS (omit tag if undefined to avoid noise).
4. Document in Section 4 (Data Contracts) of this file.

When adding a new language:

1. Extend `astro.config.mjs` locales mapping (i18n & sitemap integration).
2. Add new JSON file `src/data/podcasts/<lang>.json` with initial episodes.
3. Adjust CHANNEL_TITLES & CHANNEL_DESCRIPTIONS in `rss.ts`.
4. Include hreflang updates if explicit mapping logic added elsewhere.

---
 
## 13. Local Development Tips

- If image processing error occurs (from `sharp`), ensure host system has required shared libraries; retry install.
- Use targeted filtering flags on scripts if available (`--filter=en` etc.) to speed iteration.
- Prefer editing only the language JSON you need; avoid reformatting entire file to minimize diff noise.

---
 
## 14. Do Not Change Without Approval

- Domain in `astro.config.mjs` (`site` property).
- `<podcast:locked>` owner email.
- Existing person `name` values.
- License references.
- Emoji mappings in `STYLEGUIDE.md` (may extend but not alter existing without user sign‑off).

---
 
## 15. Glossary

- Episode JSON: Structured metadata describing a single podcast episode.
- Persons Tag: Podcasting 2.0 `<podcast:person>` element listing contributors.
- Transcript Tag: `<podcast:transcript>` referencing a captions/VTT resource.
- Derived Episode Number: Numeric assignment based on chronological ordering when explicit number absent.
- CTA: Call to Action sentence in description ending with mapped emoji.

---
 
## 16. FAQ (Agent-Focused)

Q: Where to add a new validation rule?
A: Create/modify logic in `scripts/validate-podcasts.mjs` (prefer small pure functions). Document changes here.

Q: Missing `fileSizeBytes`—should I guess?
A: No. Leave existing fallback; run metadata script to populate accurately.

Q: Add analytics?
A: Do not unless explicitly asked.

Q: Can I rename episode IDs?
A: Avoid. IDs are stable keys for routing and RSS GUIDs.

---
 
## 17. Completion Checklist for Agents

Before concluding a task that modifies code or data:

- [ ] Validation scripts pass
- [ ] Build succeeds (no type errors)
- [ ] RSS logic unaffected or updated with tests
- [ ] Style rules preserved (titles/descriptions)
- [ ] Commit message follows convention
- [ ] This file updated if data contract or rules changed

---
Treat `AGENTS.md` as living documentation. Update sections responsibly when conventions evolve.
