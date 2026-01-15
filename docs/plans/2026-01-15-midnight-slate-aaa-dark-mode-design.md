# Midnight Slate AAA Dark Mode (Alternative 1)

Date: 2026-01-15
Status: Approved

## Summary
Create a WCAG AAA-compliant, all-dark-mode visual system for the entire site (layouts, pages, and all components). The new direction is "Midnight Slate" with strong sectional separation (Alternative 1) and no sticky header. Typography remains the existing accessible font stack.

## Goals
- Full-site AAA contrast for normal text on all primary surfaces.
- Clear sectional separation via layered dark surfaces (Sectional Slate).
- Consistent interactive states: hover, active, focus-visible.
- Keep BEM classes intact; change CSS values only unless A11y needs minimal structure updates.
- Keep all styles scoped inside their respective `.astro` files.

## Non-Goals
- No new external fonts or global CSS files.
- No component redesign that changes information architecture.
- No JavaScript behavior changes unless required for A11y.

## Key Decisions
- Remove sticky header behavior.
- Centralize the new palette tokens in `src/layouts/PodcastLayout.astro`.
- Use one accent family (cyan/teal) for primary actions, focus rings, and links.
- Preserve existing BEM naming and component structure.

## Palette Tokens (AAA-oriented)
These are the core tokens to define in `PodcastLayout.astro` and reused everywhere.

- `--color-background`: #0b1119
- `--color-surface`: #111a24
- `--color-surface-2`: #141f2b
- `--color-layer-1`: #141f2b
- `--color-layer-2`: #182535
- `--color-layer-3`: #1b2a3d
- `--color-layer-4`: #0f1621
- `--color-text`: #f2f6fb
- `--color-text-muted`: #aab7c9
- `--color-accent`: #4fd3ff
- `--color-accent-2`: #2cc6ff
- `--color-on-accent`: #0b1119
- `--color-error-soft`: #ff9fb1
- `--brand-gradient`: linear-gradient(110deg, #8ad9ff 0%, #4fd3ff 45%, #2cc6ff 90%)
- `--focus-ring`: 0 0 0 3px rgba(79, 211, 255, 0.6)
- `--shadow-soft`: 0 20px 50px rgba(2, 6, 13, 0.45)
- `--shadow-strong`: 0 30px 80px rgba(2, 6, 13, 0.7)

## Sectional Slate Mapping
- Header, footer, and page shells: `--color-surface` or `--color-layer-1` for defined edges.
- Cards, badges, and pills: `--color-layer-1` or `--color-layer-2`.
- Deep focus areas (player, transcript): `--color-layer-4` for contrast separation.
- Borders: use subtle `color-mix` with `--color-accent` for high clarity without glare.

## Component Impact (CSS-only changes)
- `src/layouts/PodcastLayout.astro`: new tokens, updated base background, no sticky header.
- `src/components/Header.astro`: remove `position: sticky`, adjust background and border to new palette.
- `src/components/Footer.astro`: shift text/borders to new tokens.
- `src/components/HomeHero.astro`: re-tone surfaces, badges, highlights, CTA colors to new palette.
- `src/components/SearchBar.astro`: input, placeholder, focus, and status colors to new palette.
- `src/components/EpisodeCard.astro`: surfaces, borders, link button colors to new palette.
- `src/components/AudioPlayer.astro`: control colors, progress track, and focus ring.
- `src/components/TranscriptDropdown.astro`: surface layers and cue styling.
- `src/components/Headline.astro`, `Paragraph.astro`, `Prose.astro`: ensure text colors align with AAA tokens.
- `src/pages/index.astro` and `src/pages/[id].astro`: section titles and page-specific elements tuned to tokens.

## Accessibility Notes
- Maintain visible `:focus-visible` styles across all interactive elements.
- Keep link underline styling for inline text.
- Avoid muted text falling below AAA on lighter layers.
- Inputs and placeholders must remain AAA-compliant.

## Performance Notes
- No new JS; keep existing static markup.
- Keep CSS scoped within each Astro component.

## Verification Plan
- Visual contrast spot-checks for primary and muted text across all surfaces.
- Keyboard navigation pass: focus ring visible everywhere.
- Verify no sticky header in `Header.astro`.

