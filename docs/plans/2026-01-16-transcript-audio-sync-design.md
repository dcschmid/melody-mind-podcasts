# Transcript audio sync design

## Context
Users want transcript cues to be clickable so the audio jumps to that time and starts playing. While audio plays, the transcript should stay synchronized and auto-scroll with the active cue.

## Goals
- Click a transcript cue to seek the audio and autoplay.
- While audio plays, highlight the active cue and auto-scroll to it.
- Always auto-follow the active cue, even if the user scrolls manually.
- Keep components decoupled and avoid global state.

## Non-goals
- Full transcript editing or search.
- Timeline waveform or chapter navigation.
- Advanced performance optimizations beyond current needs.

## Proposed approach
Use CustomEvent-based communication between `AudioPlayer` and `TranscriptDropdown`.
- AudioPlayer dispatches `audio:time` on time updates.
- TranscriptDropdown listens for `audio:time`, updates the active cue, and auto-scrolls.
- TranscriptDropdown dispatches `transcript:seek` when a cue is clicked.
- AudioPlayer listens for `transcript:seek`, seeks, and plays.

## Event contract
- `audio:time` detail:
  - `playerId`: string
  - `currentTime`: number (seconds)
  - `duration`: number (seconds)
  - `isPlaying`: boolean
- `transcript:seek` detail:
  - `playerId`: string
  - `time`: number (seconds)
  - `autoplay`: boolean

## Player identity
- Both components will set a matching `data-player-id`.
- Use `subtitleUrl` when present; otherwise fallback to `audioUrl`.
- Events are ignored when `playerId` does not match.

## Transcript rendering
- Parse VTT and store cue start times in seconds.
- Render each cue as a `<button>` with BEM classes.
- Add `aria-current="true"` to the active cue only.
- Auto-scroll on active cue changes using `scrollIntoView({ block: "nearest", behavior: "smooth" })`.

## Error handling
- If transcript fetch fails or no cues are found, show the error state and do not bind events.
- If audio or duration is unavailable, ignore time events without throwing.

## Accessibility
- Buttons are keyboard accessible by default.
- Visible focus styles on cues.
- Use `aria-current` for the active cue.

## Testing
- Deferred by request; will be added later for event dispatch and active cue updates.

