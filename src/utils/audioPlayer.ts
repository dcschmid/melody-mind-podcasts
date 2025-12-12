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
  const statusDisplay = safeGetElementById<HTMLElement>("audio-status");
  const shortcutHint = safeGetElementById<HTMLElement>("shortcut-hint");
  const rewindButton = safeGetElementById<HTMLButtonElement>("rewind-button");
  const forwardButton = safeGetElementById<HTMLButtonElement>("forward-button");

  if (!audioElement) {
    return;
  }

  let isPlaying = false;

  function updatePlayPauseButtons() {
    const title = audioElement?.dataset.title || "episode";
    if (playButton && pauseButton) {
      if (isPlaying) {
        playButton.classList.add("hidden");
        pauseButton.classList.remove("hidden");
        pauseButton.setAttribute("aria-label", `Pause ${title}`);
        playButton.setAttribute("aria-label", `Play ${title}`);
      } else {
        playButton.classList.remove("hidden");
        pauseButton.classList.add("hidden");
        playButton.setAttribute("aria-label", `Play ${title}`);
        pauseButton.setAttribute("aria-label", `Pause ${title}`);
      }
    }
    if (statusDisplay) {
      statusDisplay.textContent = isPlaying ? `Playing ${title}` : `Paused ${title}`;
    }
  }

  function updateProgress() {
    if (!audioElement || !progressFill || !timeDisplay) return;

    const currentTime = audioElement.currentTime;
    const duration = audioElement.duration;

    if (duration) {
      const progress = (currentTime / duration) * 100;
      progressFill.style.width = `${progress}%`;
      progressBar?.setAttribute("aria-valuenow", progress.toFixed(0));
    }

    const currentTimeFormatted = formatTime(currentTime);
    const durationFormatted = duration ? formatTime(duration) : "0:00";
    timeDisplay.textContent = `${currentTimeFormatted} / ${durationFormatted}`;
    progressBar?.setAttribute(
      "aria-valuetext",
      `${currentTimeFormatted} of ${durationFormatted}`,
    );
  }

  function setStatusMessage(message: string) {
    if (statusDisplay) statusDisplay.textContent = message;
  }

  // Play button
  playButton?.addEventListener("click", () => {
    audioElement.play();
    isPlaying = true;
    setStatusMessage(`Playing ${audioElement.dataset.title || "episode"}`);
    updatePlayPauseButtons();
  });

  // Pause button
  pauseButton?.addEventListener("click", () => {
    audioElement.pause();
    isPlaying = false;
    setStatusMessage(`Paused ${audioElement.dataset.title || "episode"}`);
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

  // Progress bar keyboard support
  progressBar?.addEventListener("keydown", (e) => {
    if (!audioElement || !audioElement.duration) return;
    const step = 5; // seconds
    const largeStep = 15;
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
      e.preventDefault();
      switch (e.key) {
        case "ArrowLeft":
          audioElement.currentTime = Math.max(0, audioElement.currentTime - step);
          break;
        case "ArrowRight":
          audioElement.currentTime = Math.min(audioElement.duration, audioElement.currentTime + step);
          break;
        case "Home":
          audioElement.currentTime = 0;
          break;
        case "End":
          audioElement.currentTime = audioElement.duration;
          break;
      }
      updateProgress();
    } else if (["PageUp", "PageDown"].includes(e.key)) {
      e.preventDefault();
      if (e.key === "PageUp") {
        audioElement.currentTime = Math.min(audioElement.duration, audioElement.currentTime + largeStep);
      } else {
        audioElement.currentTime = Math.max(0, audioElement.currentTime - largeStep);
      }
      updateProgress();
    }
  });

  // Audio events
  audioElement.addEventListener("timeupdate", updateProgress);
  audioElement.addEventListener("waiting", () => {
    setStatusMessage(`Buffering ${audioElement.dataset.title || "episode"}...`);
  });
  audioElement.addEventListener("error", () => {
    setStatusMessage(`Error loading ${audioElement.dataset.title || "episode"}`);
  });
  audioElement.addEventListener("playing", () => {
    setStatusMessage(`Playing ${audioElement.dataset.title || "episode"}`);
  });
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
    } else if (e.key === "?") {
      e.preventDefault();
      if (shortcutHint) {
        const isHidden = shortcutHint.classList.contains("hidden");
        shortcutHint.classList.toggle("hidden", !isHidden);
      }
    }
  });

  // Initialize display
  updateProgress();
  updatePlayPauseButtons();
}
