# Transcript audio sync implementation plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Connect transcript cues with the audio player so clicking a cue seeks and autoplay plays, while the transcript highlights and auto-scrolls to the active cue during playback.

**Architecture:** Use `CustomEvent` messages on `window` between `AudioPlayer` and `TranscriptDropdown`. Each component scopes events by a shared `playerId` derived from `subtitleUrl` or `audioUrl`. Transcript renders cues as buttons and updates the active state in response to `audio:time` events.

**Tech Stack:** Astro 5, vanilla JS in inline scripts, scoped CSS in `.astro` files.

**Note:** User requested to proceed without tests for now; test steps are marked deferred.

### Task 1: Wire AudioPlayer events

**Files:**
- Modify: `src/components/AudioPlayer.astro`

**Step 1: (Deferred) Write the failing test**

```js
// Deferred by request. Intended: verify transcript:seek triggers audio.currentTime + play.
```

**Step 2: (Deferred) Run test to verify it fails**

Run: `yarn test`
Expected: FAIL (deferred)

**Step 3: Implement minimal event dispatch + listener**

- Add `data-player-id` to the player root using `subtitleUrl ?? audioUrl`.
- Dispatch `audio:time` on `loadedmetadata`, `timeupdate`, and after manual seeks.
- Listen for `transcript:seek` and set `audio.currentTime`, then `play()` when `autoplay` is true.

**Step 4: (Deferred) Run tests**

Run: `yarn test`
Expected: PASS (deferred)

**Step 5: Manual verification**

- Click transcript cue (after Task 2) and confirm audio jumps + plays.

**Step 6: Commit**

```bash
git add src/components/AudioPlayer.astro
git commit -m "feat: wire audio events for transcript sync"
```

### Task 2: Make transcript cues interactive + sync

**Files:**
- Modify: `src/components/TranscriptDropdown.astro`

**Step 1: (Deferred) Write the failing test**

```js
// Deferred by request. Intended: audio:time sets active cue and scrolls.
```

**Step 2: (Deferred) Run test to verify it fails**

Run: `yarn test`
Expected: FAIL (deferred)

**Step 3: Implement cue rendering + event handling**

- Parse VTT into cues with `startSeconds`.
- Render each cue as a `<button class="transcript__cue">` with `data-start`.
- Dispatch `transcript:seek` on click/keyboard.
- Listen for `audio:time` and update active cue class + `aria-current`.
- Auto-scroll active cue with `scrollIntoView({ block: "nearest", behavior: "smooth" })`.

**Step 4: (Deferred) Run tests**

Run: `yarn test`
Expected: PASS (deferred)

**Step 5: Manual verification**

- Play audio and ensure active cue highlights + scrolls.
- Click a cue and verify audio seeks + plays.

**Step 6: Commit**

```bash
git add src/components/TranscriptDropdown.astro
git commit -m "feat: add transcript cue seek + auto-sync"
```

### Task 3: Styling + active state visuals

**Files:**
- Modify: `src/components/TranscriptDropdown.astro`

**Step 1: Implement active/focus styles**

- Add `.transcript__cue--active` styling in `:global` block.
- Ensure focus-visible is distinct for keyboard users.

**Step 2: Manual verification**

- Tab through cues and ensure focus ring is visible.
- Confirm active cue styling is clear.

**Step 3: Commit**

```bash
git add src/components/TranscriptDropdown.astro
git commit -m "style: highlight active transcript cue"
```
