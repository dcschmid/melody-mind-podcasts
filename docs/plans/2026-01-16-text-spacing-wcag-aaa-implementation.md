# WCAG AAA Text Spacing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve global text readability by increasing spacing and raising muted text contrast while keeping the current layout intact.

**Architecture:** Adjust CSS tokens in `PodcastLayout.astro` and refine text styles in `Prose.astro` and the episode page stylesheet. No new components or global stylesheets.

**Tech Stack:** Astro 5, scoped CSS in `.astro` files.

**Note:** No automated tests requested; manual visual verification only.

### Task 1: Raise muted text contrast token

**Files:**
- Modify: `src/layouts/PodcastLayout.astro`

**Step 1: Update muted text color token**

Change:
```css
--color-text-muted: #aab7c9;
```
To:
```css
--color-text-muted: #c5d2e6;
```

**Step 2: Manual verification**

- Confirm muted text remains visually distinct but more readable.

**Step 3: Commit**

```bash
git add src/layouts/PodcastLayout.astro
git commit -m "style: raise muted text contrast"
```

### Task 2: Improve Prose readability

**Files:**
- Modify: `src/components/Prose.astro`

**Step 1: Increase line-height and spacing**

Apply:
```css
.prose {
  line-height: 1.8;
  max-width: 70ch;
}

.prose p {
  margin: 0 0 1.4rem;
}

.prose li {
  margin-bottom: 0.75rem;
}
```

**Step 2: Manual verification**

- Check show notes blocks for improved spacing and line length.

**Step 3: Commit**

```bash
git add src/components/Prose.astro
git commit -m "style: improve prose spacing"
```

### Task 3: Improve episode text spacing

**Files:**
- Modify: `src/pages/[id].astro`

**Step 1: Enhance description + knowledge text**

Update styles:
```css
.episode__description {
  line-height: 1.85;
  font-size: 1.05rem;
  max-width: 70ch;
}

.episode__knowledge-text {
  line-height: 1.75;
  max-width: 68ch;
}
```

**Step 2: Manual verification**

- Confirm episode intro and knowledge text have more breathing room.

**Step 3: Commit**

```bash
git add src/pages/[id].astro
git commit -m "style: improve episode text spacing"
```
