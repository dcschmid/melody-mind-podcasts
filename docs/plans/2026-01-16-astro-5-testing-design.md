# Astro 5 Testing Design

## Goal
Enable Astro 5.x testing with Vitest (component/layout tests) and Playwright (E2E flows), using Yarn. Cover all existing components with meaningful assertions and add a small set of high-value E2E checks for the homepage and episode pages.

## Scope
- Components: AudioPlayer, EpisodeCard, Footer, Header, Headline, HomeHero, Paragraph, Prose, SearchBar, TranscriptDropdown.
- Layouts: PodcastLayout (basic metadata + skip link presence).
- E2E flows: homepage renders, episode navigation works, and key UI landmarks are visible.

## Approach
- Use Vitest with Astro's `getViteConfig()` to inherit Astro project settings, and use the Astro Container API to render `.astro` components to strings for assertions. Keep tests deterministic and avoid snapshots.
- Use Playwright to run against production preview output (`yarn build` + `yarn preview`) with a configured `webServer` and `baseURL`, and prefer role/text-based selectors over CSS classes.

## Test Structure
- `vitest.config.ts` + component/layout tests in `tests/components` and `tests/layouts`.
- `playwright.config.ts` + E2E tests in `tests/e2e`.

## Determinism & Reliability
- Avoid triggering network-dependent behaviors (audio playback, transcript fetch).
- Use stable selectors (roles, labels, visible text).
- Keep assertions small and focused (2-3 per test).

## Non-Goals
- No snapshot-heavy tests.
- No additional test frameworks beyond Vitest and Playwright.
- No heavy fixtures or factories.
