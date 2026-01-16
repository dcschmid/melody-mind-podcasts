# Astro 5 Testing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable Vitest + Playwright testing in this Astro 5.x project and add meaningful component/layout tests plus a couple of stable E2E flows.

**Architecture:** Use Vitest with Astro's `getViteConfig()` and the Astro Container API for component/layout rendering to strings. Use Playwright against `yarn preview` with a fixed baseURL for a small set of stable, role-based E2E checks.

**Tech Stack:** Astro 5.x, Vitest, Playwright, Yarn.

### Task 1: Add baseline Vitest setup + media component tests

**Files:**
- Create: `tests/components/media.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json`
- Modify: `yarn.lock`

**Step 1: Write the failing test**

Create `tests/components/media.test.ts`:

```ts
import { beforeAll, describe, expect, it } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import AudioPlayer from "../../src/components/AudioPlayer.astro";
import TranscriptDropdown from "../../src/components/TranscriptDropdown.astro";

describe("AudioPlayer", () => {
  let container: Awaited<ReturnType<typeof AstroContainer.create>>;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it("renders core audio markup when no transcript is provided", async () => {
    const html = await container.renderToString(AudioPlayer, {
      props: {
        title: "Episode One",
        audioUrl: "https://example.com/audio.mp3",
      },
    });

    expect(html).toContain('aria-label="Episode One audio player"');
    expect(html).toContain('data-player-id="https://example.com/audio.mp3"');
    expect(html).toContain('<source src="https://example.com/audio.mp3"');
    expect(html).not.toContain("<track");
  });

  it("renders captions track when subtitleUrl is provided", async () => {
    const html = await container.renderToString(AudioPlayer, {
      props: {
        title: "Episode Two",
        audioUrl: "https://example.com/audio-two.mp3",
        subtitleUrl: "https://example.com/episode-two.vtt",
      },
    });

    expect(html).toContain('data-player-id="https://example.com/episode-two.vtt"');
    expect(html).toContain("<track");
    expect(html).toContain('src="https://example.com/episode-two.vtt"');
  });
});

describe("TranscriptDropdown", () => {
  let container: Awaited<ReturnType<typeof AstroContainer.create>>;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it("renders transcript section when a subtitle URL is present", async () => {
    const html = await container.renderToString(TranscriptDropdown, {
      props: {
        subtitleUrl: "https://example.com/episode-one.vtt",
        podcastTitle: "Episode One",
      },
    });

    expect(html).toContain('class="transcript"');
    expect(html).toContain('data-subtitle-url="https://example.com/episode-one.vtt"');
    expect(html).toContain('data-podcast-title="Episode One"');
    expect(html).toContain("Transcript");
  });

  it("renders nothing when no subtitle URL is provided", async () => {
    const html = await container.renderToString(TranscriptDropdown, {
      props: {
        podcastTitle: "Episode One",
      },
    });

    expect(html.trim()).toBe("");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `yarn test`
Expected: FAIL (no test script / vitest not installed yet).

**Step 3: Update package.json scripts + devDependencies**

Update `package.json` to:

```json
{
  "name": "melody-mind-podcasts",
  "type": "module",
  "version": "0.0.1",
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "update:audio-metadata": "node scripts/update-audio-metadata.mjs",
    "validate:podcasts": "node scripts/validate-podcasts.mjs",
    "check:style": "node scripts/check-style.mjs",
    "normalize:images": "node scripts/normalize-images.mjs",
    "convert:png": "python3 scripts/convert-png-to-jpg.py",
    "test": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@astrojs/node": "^9.5.1",
    "@astrojs/sitemap": "^3.1.0",
    "astro": "^5.16.6",
    "image-size": "^2.0.2",
    "music-metadata": "^11.10.3",
    "sharp": "^0.34.5",
    "typescript": "^5.5.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.55.0",
    "astro-minify-html-swc": "^0.1.10",
    "vitest": "^2.1.9"
  }
}
```

**Step 4: Install dependencies**

Run: `yarn install`
Expected: `yarn.lock` updated with Vitest + Playwright entries.

**Step 5: Add Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import { getViteConfig } from "astro/config";

export default defineConfig(
  getViteConfig({
    test: {
      environment: "node",
      include: ["tests/**/*.test.ts"],
    },
  }),
);
```

**Step 6: Run test to verify it passes**

Run: `yarn test`
Expected: PASS (media component tests).

**Step 7: Commit**

```bash
git add package.json vitest.config.ts tests/components/media.test.ts yarn.lock
git commit -m "test: add vitest setup"
```

### Task 2: Add remaining component tests (episode UI + site chrome + typography)

**Files:**
- Create: `tests/components/episode-ui.test.ts`
- Create: `tests/components/chrome.test.ts`
- Create: `tests/components/typography.test.ts`

**Step 1: Add episode UI tests**

Create `tests/components/episode-ui.test.ts`:

```ts
import { beforeAll, describe, expect, it } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import EpisodeCard from "../../src/components/EpisodeCard.astro";
import SearchBar from "../../src/components/SearchBar.astro";
import HomeHero from "../../src/components/HomeHero.astro";

describe("EpisodeCard", () => {
  let container: Awaited<ReturnType<typeof AstroContainer.create>>;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it("renders title, date, duration, and latest badge when provided", async () => {
    const html = await container.renderToString(EpisodeCard, {
      props: {
        id: "1950s",
        title: "1950s Rock",
        description: "A decade of firsts.",
        imageUrl: "1950s",
        durationSeconds: 1800,
        searchText: "1950s rock",
        publishedAt: "1950-01-01",
        publishedLabel: "Jan 1, 1950",
        isLatest: true,
      },
    });

    expect(html).toContain("1950s Rock");
    expect(html).toContain('datetime="1950-01-01"');
    expect(html).toContain("30 min");
    expect(html).toContain("Latest");
    expect(html).toContain('href="/1950s"');
  });

  it("omits badge and duration when not provided", async () => {
    const html = await container.renderToString(EpisodeCard, {
      props: {
        id: "1960s",
        title: "1960s Soul",
        description: "Motown and beyond.",
        imageUrl: "1960s",
        searchText: "1960s soul",
        publishedAt: "1960-01-01",
        publishedLabel: "Jan 1, 1960",
        isLatest: false,
      },
    });

    expect(html).not.toContain("episode-card__badge");
    expect(html).not.toContain("episode-card__duration");
  });
});

describe("SearchBar", () => {
  let container: Awaited<ReturnType<typeof AstroContainer.create>>;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it("renders search form with status text", async () => {
    const html = await container.renderToString(SearchBar, {
      props: { total: 2 },
    });

    expect(html).toContain('role="search"');
    expect(html).toContain('aria-controls="episodes-list"');
    expect(html).toContain("Search episodes");
    expect(html).toContain("Found: 2 of 2 results");
  });
});

describe("HomeHero", () => {
  let container: Awaited<ReturnType<typeof AstroContainer.create>>;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it("renders title, episode count, and platform links", async () => {
    const html = await container.renderToString(HomeHero, {
      props: {
        title: "MelodyMind Podcasts",
        subtitle: "Music history for everyone",
        description: "Listen through the decades.",
        totalEpisodes: 12,
        featuredContent: "Featured content",
        availableOn: "Available on",
        spotifyUrl: "https://open.spotify.com/show/example",
        deezerUrl: "https://www.deezer.com/show/example",
        youtubeUrl: "https://www.youtube.com/example",
      },
    });

    expect(html).toContain("MelodyMind Podcasts");
    expect(html).toContain("12 episodes available");
    expect(html).toContain('aria-label="Listen on Spotify"');
    expect(html).toContain('href="https://open.spotify.com/show/example"');
  });
});
```

**Step 2: Add site chrome tests**

Create `tests/components/chrome.test.ts`:

```ts
import { beforeAll, describe, expect, it } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Header from "../../src/components/Header.astro";
import Footer from "../../src/components/Footer.astro";

describe("Header", () => {
  let container: Awaited<ReturnType<typeof AstroContainer.create>>;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it("marks the brand link as current on the homepage", async () => {
    const html = await container.renderToString(Header, {
      request: new Request("https://podcasts.melody-mind.de/"),
    });

    expect(html).toContain('aria-current="page"');
    expect(html).toContain('aria-label="MelodyMind Podcasts"');
  });

  it("does not set aria-current on non-root pages", async () => {
    const html = await container.renderToString(Header, {
      request: new Request("https://podcasts.melody-mind.de/1950s"),
    });

    expect(html).not.toContain('aria-current="page"');
  });
});

describe("Footer", () => {
  let container: Awaited<ReturnType<typeof AstroContainer.create>>;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it("renders support and legal links", async () => {
    const html = await container.renderToString(Footer);
    const year = new Date().getFullYear();

    expect(html).toContain("Melody Mind");
    expect(html).toContain('aria-label="Subscribe to the RSS feed"');
    expect(html).toContain("Privacy Policy");
    expect(html).toContain(`© ${year} MelodyMind`);
  });
});
```

**Step 3: Add typography tests**

Create `tests/components/typography.test.ts`:

```ts
import { beforeAll, describe, expect, it } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Headline from "../../src/components/Headline.astro";
import Paragraph from "../../src/components/Paragraph.astro";
import Prose from "../../src/components/Prose.astro";

describe("Headline", () => {
  let container: Awaited<ReturnType<typeof AstroContainer.create>>;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it("renders the correct heading level and size class", async () => {
    const html = await container.renderToString(Headline, {
      props: {
        level: "h1",
        textSize: "2xl",
      },
      slots: {
        default: "Episode Title",
      },
    });

    expect(html).toContain("<h1");
    expect(html).toContain("headline--2xl");
    expect(html).toContain("Episode Title");
  });
});

describe("Paragraph", () => {
  let container: Awaited<ReturnType<typeof AstroContainer.create>>;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it("applies size and tone classes", async () => {
    const html = await container.renderToString(Paragraph, {
      props: {
        textSize: "lg",
        tone: "default",
      },
      slots: {
        default: "Paragraph copy",
      },
    });

    expect(html).toContain("paragraph--lg");
    expect(html).toContain("paragraph--default");
    expect(html).toContain("Paragraph copy");
  });
});

describe("Prose", () => {
  let container: Awaited<ReturnType<typeof AstroContainer.create>>;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it("renders HTML and size class", async () => {
    const html = await container.renderToString(Prose, {
      props: {
        html: "<p>Hello world</p>",
        size: "lg",
      },
    });

    expect(html).toContain('class="prose prose--lg"');
    expect(html).toContain("<p>Hello world</p>");
  });
});
```

**Step 4: Run tests to verify they pass**

Run: `yarn test`
Expected: PASS (all component tests).

**Step 5: Commit**

```bash
git add tests/components/episode-ui.test.ts tests/components/chrome.test.ts tests/components/typography.test.ts
git commit -m "test: add component coverage"
```

### Task 3: Add layout test

**Files:**
- Create: `tests/layouts/PodcastLayout.test.ts`

**Step 1: Write the failing test**

Create `tests/layouts/PodcastLayout.test.ts`:

```ts
import { beforeAll, describe, expect, it } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import PodcastLayout from "../../src/layouts/PodcastLayout.astro";

describe("PodcastLayout", () => {
  let container: Awaited<ReturnType<typeof AstroContainer.create>>;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it("renders title, description, and skip link", async () => {
    const html = await container.renderToString(PodcastLayout, {
      props: {
        title: "Test Page",
        description: "Testing layout output",
      },
      slots: {
        default: "<div>Slot content</div>",
      },
    });

    expect(html).toContain("Test Page | MelodyMind Podcasts");
    expect(html).toContain('name="description" content="Testing layout output"');
    expect(html).toContain('href="#main-content"');
    expect(html).toContain("Skip to main content");
    expect(html).toContain("Slot content");
  });
});
```

**Step 2: Run test to verify it passes**

Run: `yarn test tests/layouts/PodcastLayout.test.ts`
Expected: PASS.

**Step 3: Commit**

```bash
git add tests/layouts/PodcastLayout.test.ts
git commit -m "test: add layout coverage"
```

### Task 4: Add Playwright config + E2E tests

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/home.spec.ts`
- Create: `tests/e2e/episode.spec.ts`

**Step 1: Write E2E tests**

Create `tests/e2e/home.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("homepage shows search and episodes list", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("search", { name: "Search episodes" }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Episodes" }),
  ).toBeVisible();

  await expect(page.locator("#episodes-list")).toBeVisible();

  const firstListenLink = page
    .getByRole("link", { name: /Listen to .* podcast episode/i })
    .first();

  await expect(firstListenLink).toBeVisible();
});
```

Create `tests/e2e/episode.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("can navigate to an episode and see audio section", async ({ page }) => {
  await page.goto("/");

  const firstListenLink = page
    .getByRole("link", { name: /Listen to .* podcast episode/i })
    .first();

  await firstListenLink.click();

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("group", { name: "Audio player controls" })).toBeVisible();
  await expect(page.getByText("Transcript")).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `yarn test:e2e`
Expected: FAIL (no Playwright config yet).

**Step 3: Add Playwright config**

Create `playwright.config.ts`:

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  use: {
    baseURL: "http://localhost:4321",
  },
  webServer: {
    command: "yarn preview",
    port: 4321,
    reuseExistingServer: true,
  },
});
```

**Step 4: Install Playwright browsers (one-time)**

Run: `yarn playwright install`
Expected: Browsers downloaded.

**Step 5: Run E2E tests to verify they pass**

Run: `yarn test:e2e`
Expected: PASS (homepage + episode flow).

**Step 6: Commit**

```bash
git add playwright.config.ts tests/e2e/home.spec.ts tests/e2e/episode.spec.ts
git commit -m "test: add playwright e2e"
```
