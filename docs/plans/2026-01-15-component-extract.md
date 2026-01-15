# Component Extraction Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract AudioPlayer, EpisodeCard, and HomeHero into separate Astro components with local styles/scripts, keeping existing UI and behavior intact.

**Architecture:** Each extracted component owns its markup and `<style>` block (scoped), and any required `<script is:inline>` (AudioPlayer). The pages (`src/pages/[id].astro` and `src/pages/index.astro`) become composition shells that pass minimal props and retain page-level layout only. No global CSS, no Tailwind, BEM-only class naming within each component.

**Tech Stack:** Astro 5.x, TypeScript, inline JS, Node (for simple verification scripts), existing npm scripts.

---

### Task 1: Extract AudioPlayer Component

**Files:**
- Create: `src/components/AudioPlayer.astro`
- Modify: `src/pages/[id].astro`
- Create: `scripts/check-component-extract.mjs`
- Test: `scripts/check-component-extract.mjs`

**Step 1: Write the failing test**

Create `scripts/check-component-extract.mjs`:

```js
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const audioComponent = resolve("src/components/AudioPlayer.astro");
if (!existsSync(audioComponent)) {
  fail("AudioPlayer component missing: src/components/AudioPlayer.astro");
}

const episodePage = readFileSync(resolve("src/pages/[id].astro"), "utf8");
if (!episodePage.includes("AudioPlayer")) {
  fail("AudioPlayer not used in src/pages/[id].astro");
}

if (episodePage.includes("episode-player__")) {
  fail("AudioPlayer markup still present in src/pages/[id].astro");
}

console.log("AudioPlayer extraction check passed.");
```

**Step 2: Run test to verify it fails**

Run: `node scripts/check-component-extract.mjs`

Expected: FAIL with “AudioPlayer component missing …”

**Step 3: Write minimal implementation**

Create `src/components/AudioPlayer.astro` (full file):

```astro
---
interface Props {
  title: string;
  audioUrl: string;
  subtitleUrl?: string;
}

const { title, audioUrl, subtitleUrl } = Astro.props as Props;
---

<div
  class="episode-player"
  data-episode-player
  tabindex="0"
  aria-label={`${title} audio player`}
>
  <div class="episode-player__controls">
    <button
      class="episode-player__control episode-player__control--play"
      type="button"
      data-action="play"
      aria-label={`Play ${title}`}
      aria-describedby="episode-player-status"
    >
      <svg class="episode-player__control-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 5v14l11-7z" />
      </svg>
    </button>
    <button
      class="episode-player__control episode-player__control--pause"
      type="button"
      data-action="pause"
      aria-label={`Pause ${title}`}
      aria-describedby="episode-player-status"
      hidden
    >
      <svg class="episode-player__control-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
      </svg>
    </button>
  </div>

  <div
    class="episode-player__status"
    id="episode-player-status"
    aria-live="polite"
    aria-atomic="true"
  >
    {title}
  </div>

  <div class="episode-player__progress-wrap">
    <span id="episode-player-progress-label" class="episode__sr-only">
      Audio progress
    </span>
    <div
      class="episode-player__progress"
      role="slider"
      aria-labelledby="episode-player-progress-label"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow="0"
      aria-valuetext="0:00 of 0:00"
      tabindex="0"
    >
      <div class="episode-player__progress-fill" aria-hidden="true"></div>
    </div>
  </div>

  <div class="episode-player__meta">
    <span
      class="episode-player__time"
      id="episode-player-time"
      aria-live="polite"
      aria-atomic="true"
    >
      0:00 / 0:00
    </span>
    <span
      class="episode-player__shortcut-hint episode-player__shortcut-hint--hidden"
      id="episode-player-hint"
      aria-live="polite"
    >
      Press ? for shortcuts (Space, ←/→, Home/End)
    </span>
  </div>

  <div
    class="episode-player__transport"
    role="group"
    aria-label="Audio player controls"
  >
    <button
      class="episode-player__transport-button"
      type="button"
      data-action="rewind"
      aria-label="Rewind 10 seconds"
      title="Rewind 10 seconds"
    >
      <svg class="episode-player__transport-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
      </svg>
    </button>
    <button
      class="episode-player__transport-button"
      type="button"
      data-action="forward"
      aria-label="Forward 10 seconds"
      title="Forward 10 seconds"
    >
      <svg class="episode-player__transport-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
      </svg>
    </button>
  </div>

  <audio
    class="episode-player__audio"
    preload="metadata"
    aria-label={`Audio player for ${title}`}
    data-title={title}
    crossorigin="anonymous"
  >
    <source src={audioUrl} type="audio/mpeg" />
    {subtitleUrl && (
      <track
        kind="captions"
        src={subtitleUrl}
        srclang="en"
        label="English"
        default
      />
    )}
    Your browser does not support the audio element.
  </audio>
</div>

<script is:inline>
  (() => {
    const players = document.querySelectorAll(".episode-player");
    if (!players.length) return;

    const formatTime = (seconds) => {
      const safeSeconds = Number.isFinite(seconds) ? seconds : 0;
      const minutes = Math.floor(safeSeconds / 60);
      const remainingSeconds = Math.floor(safeSeconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    players.forEach((player) => {
      const audio = player.querySelector(".episode-player__audio");
      if (!(audio instanceof HTMLAudioElement)) return;

      const playButton = player.querySelector('[data-action="play"]');
      const pauseButton = player.querySelector('[data-action="pause"]');
      const rewindButton = player.querySelector('[data-action="rewind"]');
      const forwardButton = player.querySelector('[data-action="forward"]');
      const progress = player.querySelector(".episode-player__progress");
      const progressFill = player.querySelector(".episode-player__progress-fill");
      const timeDisplay = player.querySelector(".episode-player__time");
      const status = player.querySelector(".episode-player__status");
      const hint = player.querySelector(".episode-player__shortcut-hint");

      let isPlaying = false;
      const title = audio.dataset.title || "episode";

      const setStatus = (message) => {
        if (status) status.textContent = message;
      };

      const updateButtons = () => {
        if (!(playButton instanceof HTMLElement) || !(pauseButton instanceof HTMLElement)) return;
        playButton.hidden = isPlaying;
        pauseButton.hidden = !isPlaying;
      };

      const updateProgress = () => {
        if (!(progressFill instanceof HTMLElement) || !(progress instanceof HTMLElement) || !(timeDisplay instanceof HTMLElement)) {
          return;
        }

        const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
        const currentTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
        const progressValue = duration ? (currentTime / duration) * 100 : 0;

        progressFill.style.width = `${progressValue}%`;
        progress.setAttribute("aria-valuenow", Math.round(progressValue).toString());

        const currentFormatted = formatTime(currentTime);
        const durationFormatted = duration ? formatTime(duration) : "0:00";
        timeDisplay.textContent = `${currentFormatted} / ${durationFormatted}`;
        progress.setAttribute(
          "aria-valuetext",
          `${currentFormatted} of ${durationFormatted}`,
        );
      };

      const seekToPosition = (clientX) => {
        if (!(progress instanceof HTMLElement) || !Number.isFinite(audio.duration)) return;
        const rect = progress.getBoundingClientRect();
        const percent = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
        audio.currentTime = percent * audio.duration;
      };

      playButton?.addEventListener("click", () => {
        audio.play();
        isPlaying = true;
        setStatus(`Playing ${title}`);
        updateButtons();
      });

      pauseButton?.addEventListener("click", () => {
        audio.pause();
        isPlaying = false;
        setStatus(`Paused ${title}`);
        updateButtons();
      });

      rewindButton?.addEventListener("click", () => {
        audio.currentTime = Math.max(0, audio.currentTime - 10);
        updateProgress();
      });

      forwardButton?.addEventListener("click", () => {
        if (Number.isFinite(audio.duration)) {
          audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
          updateProgress();
        }
      });

      progress?.addEventListener("click", (event) => {
        if (event instanceof MouseEvent) {
          seekToPosition(event.clientX);
          updateProgress();
        }
      });

      progress?.addEventListener("keydown", (event) => {
        if (!Number.isFinite(audio.duration)) return;
        const step = 5;
        const largeStep = 15;

        if (["ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown"].includes(event.key)) {
          event.preventDefault();
          switch (event.key) {
            case "ArrowLeft":
              audio.currentTime = Math.max(0, audio.currentTime - step);
              break;
            case "ArrowRight":
              audio.currentTime = Math.min(audio.duration, audio.currentTime + step);
              break;
            case "Home":
              audio.currentTime = 0;
              break;
            case "End":
              audio.currentTime = audio.duration;
              break;
            case "PageUp":
              audio.currentTime = Math.min(audio.duration, audio.currentTime + largeStep);
              break;
            case "PageDown":
              audio.currentTime = Math.max(0, audio.currentTime - largeStep);
              break;
          }
          updateProgress();
        }
      });

      player.addEventListener("keydown", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        if (target.classList.contains("episode-player__progress")) return;
        if (["BUTTON", "A", "INPUT", "TEXTAREA"].includes(target.tagName)) return;

        if (event.code === "Space") {
          event.preventDefault();
          if (isPlaying) {
            pauseButton?.click();
          } else {
            playButton?.click();
          }
        } else if (event.code === "ArrowLeft") {
          rewindButton?.click();
        } else if (event.code === "ArrowRight") {
          forwardButton?.click();
        } else if (event.key === "?") {
          event.preventDefault();
          if (hint instanceof HTMLElement) {
            hint.classList.toggle("episode-player__shortcut-hint--hidden");
          }
        }
      });

      audio.addEventListener("loadedmetadata", updateProgress);
      audio.addEventListener("timeupdate", updateProgress);
      audio.addEventListener("waiting", () => {
        setStatus(`Buffering ${title}...`);
      });
      audio.addEventListener("error", () => {
        setStatus(`Error loading ${title}`);
      });
      audio.addEventListener("playing", () => {
        isPlaying = true;
        updateButtons();
        setStatus(`Playing ${title}`);
      });
      audio.addEventListener("pause", () => {
        if (audio.ended) return;
        isPlaying = false;
        updateButtons();
        setStatus(`Paused ${title}`);
      });
      audio.addEventListener("ended", () => {
        isPlaying = false;
        updateButtons();
        if (progressFill instanceof HTMLElement) progressFill.style.width = "0%";
        updateProgress();
        setStatus(`Finished ${title}`);
      });

      setStatus(`Paused ${title}`);
      updateProgress();
      updateButtons();
    });
  })();
</script>

<style>
  .episode-player {
    display: grid;
    gap: 1rem;
    text-align: center;
    outline: none;
  }

  .episode-player:focus-visible {
    border-radius: 0.85rem;
    box-shadow: var(--focus-ring);
  }

  .episode-player__controls {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
  }

  .episode-player__control {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3.4rem;
    height: 3.4rem;
    border-radius: 999px;
    border: none;
    background: var(--color-primary);
    color: var(--color-background);
    box-shadow: var(--shadow-strong);
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .episode-player__control:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  .episode-player__control:hover {
    transform: translateY(-1px) scale(1.02);
  }

  .episode-player__control--pause {
    background: var(--color-secondary);
  }

  .episode-player__control-icon {
    width: 1.8rem;
    height: 1.8rem;
  }

  .episode-player__status {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .episode-player__progress-wrap {
    width: 100%;
  }

  .episode-player__progress {
    position: relative;
    width: 100%;
    height: 0.65rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--color-layer-2) 80%, var(--color-primary) 20%);
    border: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
    cursor: pointer;
  }

  .episode-player__progress:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  .episode-player__progress-fill {
    position: absolute;
    inset: 0 auto 0 0;
    width: 0%;
    border-radius: inherit;
    background: var(--brand-gradient);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
    transition: width 0.15s ease-out;
  }

  .episode-player__meta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.9rem;
    color: var(--color-text-muted);
  }

  .episode-player__shortcut-hint {
    font-size: 0.8rem;
  }

  .episode-player__shortcut-hint--hidden {
    display: none;
  }

  .episode-player__transport {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .episode-player__transport-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.35rem;
    border-radius: 0.6rem;
    border: 1px solid color-mix(in srgb, var(--color-primary) 25%, transparent);
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: color 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
  }

  .episode-player__transport-button:hover {
    color: var(--color-text);
    border-color: var(--color-primary);
    transform: translateY(-1px);
  }

  .episode-player__transport-button:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  .episode-player__transport-icon {
    width: 1.4rem;
    height: 1.4rem;
  }

  .episode-player__audio {
    display: none;
  }
</style>
```

Update `src/pages/[id].astro`:
- Add `import AudioPlayer from "../components/AudioPlayer.astro";`
- Replace the `<div class="episode-player" ...>` markup with:

```astro
<AudioPlayer
  title={currentPodcast.title}
  audioUrl={currentPodcast.audioUrl}
  subtitleUrl={currentPodcast.subtitleUrl}
/>
```

- Remove the inlined AudioPlayer `<script is:inline>` and the `.episode-player*` styles from `[id].astro`.

**Step 4: Run test to verify it passes**

Run: `node scripts/check-component-extract.mjs`

Expected: PASS with “AudioPlayer extraction check passed.”

**Step 5: Commit**

```bash
git add src/components/AudioPlayer.astro src/pages/[id].astro scripts/check-component-extract.mjs
git commit -m "feat: extract audio player component"
```

---

### Task 2: Extract EpisodeCard Component

**Files:**
- Create: `src/components/EpisodeCard.astro`
- Modify: `src/pages/index.astro`
- Modify: `scripts/check-component-extract.mjs`
- Test: `scripts/check-component-extract.mjs`

**Step 1: Write the failing test**

Update `scripts/check-component-extract.mjs` to add EpisodeCard checks:

```js
const episodeCardComponent = resolve("src/components/EpisodeCard.astro");
if (!existsSync(episodeCardComponent)) {
  fail("EpisodeCard component missing: src/components/EpisodeCard.astro");
}

const indexPage = readFileSync(resolve("src/pages/index.astro"), "utf8");
if (!indexPage.includes("EpisodeCard")) {
  fail("EpisodeCard not used in src/pages/index.astro");
}

if (indexPage.includes("home__episode-card")) {
  fail("Episode card markup still present in src/pages/index.astro");
}

console.log("EpisodeCard extraction check passed.");
```

**Step 2: Run test to verify it fails**

Run: `node scripts/check-component-extract.mjs`

Expected: FAIL with “EpisodeCard component missing …”

**Step 3: Write minimal implementation**

Create `src/components/EpisodeCard.astro` (full file):

```astro
---
interface Props {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  durationSeconds?: number;
  searchText: string;
}

const {
  id,
  title,
  description,
  imageUrl,
  durationSeconds,
  searchText,
} = Astro.props as Props;
---

<article
  data-episode
  data-search={searchText}
  class="episode-card"
  role="listitem"
>
  <div class="episode-card__media">
    <img
      src={`/images/${imageUrl}.jpg`}
      alt={`Cover image for ${title} podcast episode`}
      class="episode-card__image"
      loading="lazy"
      decoding="async"
      width={600}
      height={400}
    />
    {durationSeconds && (
      <span class="episode-card__duration">
        {Math.floor(durationSeconds / 60)} min
      </span>
    )}
  </div>
  <div class="episode-card__body">
    <h3 class="episode-card__title">
      {title}
    </h3>
    <p class="episode-card__description">
      {description}
    </p>
    <a
      href={`/${id}`}
      class="episode-card__link"
      aria-label={`Listen to ${title} podcast episode`}
    >
      Listen Now
    </a>
  </div>
</article>

<style>
  .episode-card {
    display: grid;
    background: var(--color-surface);
    border-radius: 1.4rem;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
    box-shadow: var(--shadow-soft);
  }

  .episode-card[hidden] {
    display: none;
  }

  .episode-card__media {
    position: relative;
  }

  .episode-card__image {
    width: 100%;
    height: auto;
    display: block;
  }

  .episode-card__duration {
    position: absolute;
    right: 0.75rem;
    bottom: 0.75rem;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .episode-card__body {
    padding: 1rem 1.25rem 1.5rem;
    display: grid;
    gap: 0.6rem;
  }

  .episode-card__title {
    margin: 0;
    font-size: 1.1rem;
    color: var(--color-text);
  }

  .episode-card__description {
    margin: 0;
    color: var(--color-text-muted);
    line-height: 1.6;
  }

  .episode-card__link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.6rem 1rem;
    border-radius: 0.75rem;
    background: var(--color-primary);
    color: var(--color-background);
    font-weight: 700;
    text-decoration: none;
    width: fit-content;
  }

  .episode-card__link:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }
</style>
```

Update `src/pages/index.astro`:
- Add `import EpisodeCard from "../components/EpisodeCard.astro";`
- Replace the `<article ... class="home__episode-card">...</article>` block with:

```astro
<EpisodeCard
  id={podcast.id}
  title={podcast.title}
  description={podcast.description}
  imageUrl={podcast.imageUrl}
  durationSeconds={podcast.durationSeconds}
  searchText={`${podcast.title} ${podcast.description}`}
/>
```

- Remove the `.home__episode-*` CSS rules from `index.astro` (they now live in `EpisodeCard.astro`).

**Step 4: Run test to verify it passes**

Run: `node scripts/check-component-extract.mjs`

Expected: PASS with “EpisodeCard extraction check passed.”

**Step 5: Commit**

```bash
git add src/components/EpisodeCard.astro src/pages/index.astro scripts/check-component-extract.mjs
git commit -m "feat: extract episode card component"
```

---

### Task 3: Extract HomeHero Component

**Files:**
- Create: `src/components/HomeHero.astro`
- Modify: `src/pages/index.astro`
- Modify: `scripts/check-component-extract.mjs`
- Test: `scripts/check-component-extract.mjs`

**Step 1: Write the failing test**

Update `scripts/check-component-extract.mjs` to add HomeHero checks:

```js
const homeHeroComponent = resolve("src/components/HomeHero.astro");
if (!existsSync(homeHeroComponent)) {
  fail("HomeHero component missing: src/components/HomeHero.astro");
}

if (!indexPage.includes("HomeHero")) {
  fail("HomeHero not used in src/pages/index.astro");
}

if (indexPage.includes("home__hero")) {
  fail("Home hero markup still present in src/pages/index.astro");
}

console.log("HomeHero extraction check passed.");
```

**Step 2: Run test to verify it fails**

Run: `node scripts/check-component-extract.mjs`

Expected: FAIL with “HomeHero component missing …”

**Step 3: Write minimal implementation**

Create `src/components/HomeHero.astro` (full file):

```astro
---
interface Props {
  title: string;
  subtitle: string;
  description: string;
  totalEpisodes: number;
  featuredContent: string;
  availableOn: string;
  spotifyUrl: string;
  deezerUrl: string;
}

const {
  title,
  subtitle,
  description,
  totalEpisodes,
  featuredContent,
  availableOn,
  spotifyUrl,
  deezerUrl,
} = Astro.props as Props;
---

<section class="home-hero">
  <div class="home-hero__inner">
    <div class="home-hero__badges">
      <span class="home-hero__badge">🎙️ Sound-rich storytelling</span>
      <span class="home-hero__badge">Warm studio vibes, hi-fi polish</span>
    </div>

    <div class="home-hero__intro">
      <h1 class="home-hero__title">{title}</h1>
      <p class="home-hero__subtitle">{subtitle}</p>
      <p class="home-hero__description">{description}</p>
    </div>

    <div class="home-hero__media">
      <img
        src="/the-melody-mind-podcast.jpg"
        alt="Illustrated cover art"
        class="home-hero__image"
        loading="lazy"
        decoding="async"
      />
      <span class="home-hero__media-label">🔆 Analog glow, hi-fi clarity</span>
    </div>

    <div class="home-hero__highlights">
      <div class="home-hero__highlight">
        <span aria-hidden="true">🎧</span>
        <span>
          New episodes perfect for a walk, commute, or cozy night in.
        </span>
      </div>
      <div class="home-hero__highlight">
        <span aria-hidden="true">✨</span>
        <span>
          Stories first, facts second: always warm, curious, and welcoming.
        </span>
      </div>
      <div class="home-hero__highlight home-hero__highlight--wide">
        <span aria-hidden="true">🎶</span>
        <span>
          From rock ’n’ roll sparks to electronic fireworks — hear how music became the soundtrack of our lives.
        </span>
      </div>
    </div>

    <div class="home-hero__cta-row">
      <a href="#episodes-heading" class="home-hero__cta home-hero__cta--primary">
        Browse episodes
      </a>
      <a href="/rss.xml" class="home-hero__cta home-hero__cta--secondary" aria-label="Subscribe to RSS feed">
        RSS feed
      </a>
    </div>

    <div class="home-hero__platforms">
      <span class="home-hero__platforms-label">{availableOn}</span>
      <div class="home-hero__platforms-row">
        <a
          href={spotifyUrl}
          class="home-hero__platform-link"
          aria-label="Listen on Spotify"
          target="_blank"
          rel="noopener"
        >
          Spotify
        </a>
        <a
          href={deezerUrl}
          class="home-hero__platform-link"
          aria-label="Listen on Deezer"
          target="_blank"
          rel="noopener"
        >
          Deezer
        </a>
      </div>
    </div>

    <div class="home-hero__meta">
      <span class="home-hero__meta-item">
        {totalEpisodes} episodes available
      </span>
      <span class="home-hero__meta-item">
        {featuredContent}
      </span>
    </div>
  </div>
</section>

<style>
  .home-hero {
    position: relative;
    padding: 3rem 2rem;
    border-radius: 2rem;
    background: var(--color-surface);
    border: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
    box-shadow: var(--shadow-soft);
    overflow: hidden;
  }

  .home-hero::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 18% 22%, rgba(246, 193, 119, 0.08), transparent 35%),
      radial-gradient(circle at 82% 12%, rgba(122, 203, 191, 0.08), transparent 32%),
      radial-gradient(circle at 70% 68%, rgba(255, 149, 128, 0.05), transparent 38%);
    opacity: 0.8;
  }

  .home-hero__inner {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    text-align: center;
    align-items: center;
  }

  .home-hero__badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }

  .home-hero__badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    background: var(--color-layer-2);
    border: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
    color: var(--color-text);
    font-size: 0.9rem;
  }

  .home-hero__intro {
    display: grid;
    gap: 0.75rem;
    max-width: 48rem;
  }

  .home-hero__title {
    margin: 0;
    font-size: 2.6rem;
    font-weight: 800;
    background: var(--brand-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: 0 18px 40px rgba(0, 0, 0, 0.4);
  }

  .home-hero__subtitle {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .home-hero__description {
    margin: 0;
    font-size: 1.05rem;
    color: var(--color-text-muted);
    line-height: 1.6;
  }

  .home-hero__media {
    position: relative;
    width: 100%;
    max-width: 40rem;
  }

  .home-hero__image {
    width: 100%;
    height: auto;
    border-radius: 1.6rem;
    border: 1px solid color-mix(in srgb, var(--color-primary) 25%, transparent);
    box-shadow: var(--shadow-strong);
    display: block;
  }

  .home-hero__media-label {
    position: absolute;
    right: 1rem;
    top: 1rem;
    font-size: 0.75rem;
    padding: 0.35rem 0.7rem;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .home-hero__highlights {
    display: grid;
    gap: 1rem;
    width: 100%;
    max-width: 48rem;
  }

  .home-hero__highlight {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    padding: 1rem 1.1rem;
    border-radius: 1rem;
    background: var(--color-layer-1);
    border: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
    color: var(--color-text);
    box-shadow: var(--shadow-soft);
  }

  .home-hero__highlight--wide {
    grid-column: 1 / -1;
  }

  .home-hero__cta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }

  .home-hero__cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.4rem;
    border-radius: 0.9rem;
    font-size: 0.95rem;
    font-weight: 700;
    text-decoration: none;
  }

  .home-hero__cta--primary {
    background: var(--color-primary);
    color: var(--color-background);
    box-shadow: var(--shadow-strong);
  }

  .home-hero__cta--secondary {
    background: var(--color-layer-1);
    border: 1px solid color-mix(in srgb, var(--color-primary) 25%, transparent);
    color: var(--color-text);
  }

  .home-hero__cta:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  .home-hero__platforms {
    display: grid;
    gap: 0.75rem;
    justify-items: center;
  }

  .home-hero__platforms-label {
    color: var(--color-text-muted);
    font-weight: 600;
    font-size: 0.9rem;
  }

  .home-hero__platforms-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }

  .home-hero__platform-link {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 999px;
    background: var(--color-layer-1);
    border: 1px solid color-mix(in srgb, var(--color-primary) 25%, transparent);
    color: var(--color-text);
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
  }

  .home-hero__platform-link:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  .home-hero__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
    color: var(--color-text);
    font-size: 0.9rem;
  }

  .home-hero__meta-item {
    padding: 0.5rem 0.9rem;
    border-radius: 0.9rem;
    background: var(--color-layer-2);
    border: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
    box-shadow: var(--shadow-soft);
  }
</style>
```

Update `src/pages/index.astro`:
- Add `import HomeHero from "../components/HomeHero.astro";`
- Replace the `<section class="home__hero">...</section>` block with:

```astro
<HomeHero
  title={t.title}
  subtitle={t.subtitle}
  description={t.description}
  totalEpisodes={podcasts.length}
  featuredContent={t.featuredContent}
  availableOn={t.availableOn}
  spotifyUrl={t.spotifyUrl}
  deezerUrl={t.deezerUrl}
/>
```

- Remove the `.home__hero*` CSS rules from `index.astro` (they now live in `HomeHero.astro`).

**Step 4: Run test to verify it passes**

Run: `node scripts/check-component-extract.mjs`

Expected: PASS with “HomeHero extraction check passed.”

**Step 5: Commit**

```bash
git add src/components/HomeHero.astro src/pages/index.astro scripts/check-component-extract.mjs
git commit -m "feat: extract home hero component"
```

---

### Task 4: Full Build Verification

**Files:**
- Test: `npm run build`

**Step 1: Run build**

Run: `npm run build`

Expected: PASS

**Step 2: Commit verification note**

```bash
git commit --allow-empty -m "chore: verify build after component extraction"
```
