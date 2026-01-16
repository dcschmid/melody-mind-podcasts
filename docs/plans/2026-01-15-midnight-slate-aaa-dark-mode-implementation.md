# Midnight Slate AAA Dark Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Re-theme the entire site to the Midnight Slate AAA dark mode system with sectional separation and no sticky header.

**Architecture:** Centralize palette tokens in `src/layouts/PodcastLayout.astro`, then adjust component-level styles to consume the new tokens. Keep BEM classes and component structure intact; limit changes to CSS values and minimal A11y improvements where needed.

**Tech Stack:** Astro 5.x, scoped `<style>` in `.astro` components, vanilla JS for existing behaviors.

## Notes
- User requested no worktree; all changes will be done in the current workspace.
- No new fonts or external/global CSS.
- No new JS behavior unless required for accessibility.

---

### Task 1: Update global tokens and base layout styles

**Files:**
- Modify: `src/layouts/PodcastLayout.astro`

**Step 1: Update tokens and base styles**
- Replace existing color tokens with Midnight Slate palette.
- Update base background, gradients, shadows, focus ring, and text colors to new tokens.
- Ensure no sticky header (handled in Header component task).

**Step 2: Quick build check**
Run: `npm run build`
Expected: build completes without errors.

**Step 3: Commit**
```
git add src/layouts/PodcastLayout.astro

git commit -m "style: apply midnight slate tokens"
```

---

### Task 2: Header + Footer re-tone (no sticky header)

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro`

**Step 1: Update Header styles**
- Remove `position: sticky` and related backdrop behavior.
- Apply new surface, border, text, and focus colors.

**Step 2: Update Footer styles**
- Align borders, text colors, and pill/button styles to new tokens.

**Step 3: Quick build check**
Run: `npm run build`
Expected: build completes without errors.

**Step 4: Commit**
```
git add src/components/Header.astro src/components/Footer.astro

git commit -m "style: retone header and footer"
```

---

### Task 3: Home page hero, search, and episode cards

**Files:**
- Modify: `src/components/HomeHero.astro`
- Modify: `src/components/SearchBar.astro`
- Modify: `src/components/EpisodeCard.astro`
- Modify: `src/pages/index.astro`

**Step 1: Home hero styles**
- Apply new layer colors, borders, and CTA colors.
- Ensure badge/highlight contrast remains AAA.

**Step 2: Search bar styles**
- Update input, placeholder, status, and focus styles for AAA contrast.

**Step 3: Episode card styles**
- Apply new surface layers, button colors, and text colors.

**Step 4: Index page styles**
- Update section title gradient and grid accents to align with new tokens.

**Step 5: Quick build check**
Run: `npm run build`
Expected: build completes without errors.

**Step 6: Commit**
```
git add src/components/HomeHero.astro src/components/SearchBar.astro src/components/EpisodeCard.astro src/pages/index.astro

git commit -m "style: retone home components"
```

---

### Task 4: Episode page layout, navigation, and audio/transcript UI

**Files:**
- Modify: `src/pages/[id].astro`
- Modify: `src/components/AudioPlayer.astro`
- Modify: `src/components/TranscriptDropdown.astro`

**Step 1: Episode page styles**
- Update hero, metadata, nav cards, and knowledge CTA to new tokens.

**Step 2: Audio player styles**
- Update control colors, progress track, and focus ring to new tokens.

**Step 3: Transcript styles**
- Update surfaces, cue styling, and status colors for AAA contrast.

**Step 4: Quick build check**
Run: `npm run build`
Expected: build completes without errors.

**Step 5: Commit**
```
git add src/pages/[id].astro src/components/AudioPlayer.astro src/components/TranscriptDropdown.astro

git commit -m "style: retone episode page components"
```

---

### Task 5: Typography and prose components

**Files:**
- Modify: `src/components/Headline.astro`
- Modify: `src/components/Paragraph.astro`
- Modify: `src/components/Prose.astro`

**Step 1: Typography adjustments**
- Ensure text colors align with new tokens and remain AAA.
- Keep existing font stack unchanged.

**Step 2: Quick build check**
Run: `npm run build`
Expected: build completes without errors.

**Step 3: Commit**
```
git add src/components/Headline.astro src/components/Paragraph.astro src/components/Prose.astro

git commit -m "style: retone typography"
```

---

### Task 6: Final verification

**Files:**
- None

**Step 1: Build**
Run: `npm run build`
Expected: build completes without errors.

**Step 2: Manual QA**
- Keyboard navigation: focus visible on all controls/links.
- No sticky header.
- Contrast spot-check on muted text and badges.

**Step 3: Commit**
```
git status --short
```
Expected: clean working tree.
