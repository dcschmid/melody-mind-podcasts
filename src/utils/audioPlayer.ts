/**
 * Simplified Audio Player Utilities for Podcast Repository
 */

export function safeGetElementById<T extends HTMLElement>(id: string): T | null {
  try {
    return document.getElementById(id) as T;
  } catch {
    return null;
  }
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function initSimpleAudioPlayer() {
  const playButton = safeGetElementById<HTMLButtonElement>("play-button");
  const pauseButton = safeGetElementById<HTMLButtonElement>("pause-button");
  const audioElement = safeGetElementById<HTMLAudioElement>("audio-player");
  const progressBar = safeGetElementById<HTMLElement>("progress-bar");
  const progressFill = safeGetElementById<HTMLElement>("progress-fill");
  const timeDisplay = safeGetElementById<HTMLElement>("time-display");
  const rewindButton = safeGetElementById<HTMLButtonElement>("rewind-button");
  const forwardButton = safeGetElementById<HTMLButtonElement>("forward-button");

  if (!audioElement) {
    return;
  }

  let isPlaying = false;

  function updatePlayPauseButtons() {
    if (playButton && pauseButton) {
      if (isPlaying) {
        playButton.classList.add("hidden");
        pauseButton.classList.remove("hidden");
      } else {
        playButton.classList.remove("hidden");
        pauseButton.classList.add("hidden");
      }
    }
  }

  function updateProgress() {
    if (!audioElement || !progressFill || !timeDisplay) return;

    const currentTime = audioElement.currentTime;
    const duration = audioElement.duration;

    if (duration) {
      const progress = (currentTime / duration) * 100;
      progressFill.style.width = `${progress}%`;
    }

    const currentTimeFormatted = formatTime(currentTime);
    const durationFormatted = duration ? formatTime(duration) : "0:00";
    timeDisplay.textContent = `${currentTimeFormatted} / ${durationFormatted}`;
  }

  // Play button
  playButton?.addEventListener("click", () => {
    audioElement.play();
    isPlaying = true;
    updatePlayPauseButtons();
  });

  // Pause button
  pauseButton?.addEventListener("click", () => {
    audioElement.pause();
    isPlaying = false;
    updatePlayPauseButtons();
  });

  // Rewind 10 seconds
  rewindButton?.addEventListener("click", () => {
    audioElement.currentTime = Math.max(0, audioElement.currentTime - 10);
  });

  // Forward 10 seconds
  forwardButton?.addEventListener("click", () => {
    if (audioElement.duration) {
      audioElement.currentTime = Math.min(
        audioElement.duration,
        audioElement.currentTime + 10
      );
    }
  });

  // Progress bar click
  progressBar?.addEventListener("click", (e) => {
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const seekTime = (clickX / width) * audioElement.duration;
    audioElement.currentTime = seekTime;
  });

  // Audio events
  audioElement.addEventListener("timeupdate", updateProgress);
  audioElement.addEventListener("ended", () => {
    isPlaying = false;
    updatePlayPauseButtons();
    if (progressFill) progressFill.style.width = "0%";
    updateProgress();
  });

  // Keyboard controls
  document.addEventListener("keydown", (e) => {
    // Skip if user is typing in an input
    if (document.activeElement?.tagName === "INPUT" || 
        document.activeElement?.tagName === "TEXTAREA") {
      return;
    }

    if (e.code === "Space") {
      e.preventDefault();
      if (isPlaying) {
        pauseButton?.click();
      } else {
        playButton?.click();
      }
    } else if (e.code === "ArrowLeft") {
      rewindButton?.click();
    } else if (e.code === "ArrowRight") {
      forwardButton?.click();
    }
  });

  // Initialize display
  updateProgress();
  updatePlayPauseButtons();
}