// Custom audio player behavior with keyboard and progress control.
const initAudioPlayers = () => {
  const globalWindow = window as typeof window & {
    __mmAudioPlayerInitialized?: boolean;
  };

  if (globalWindow.__mmAudioPlayerInitialized) {return;}
  globalWindow.__mmAudioPlayerInitialized = true;

  const players = document.querySelectorAll(".episode-player");
  if (!players.length) {return;}

  const formatTime = (seconds: number) => {
    const safeSeconds = Number.isFinite(seconds) ? seconds : 0;
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = Math.floor(safeSeconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  players.forEach((player) => {
    const audio = player.querySelector(".episode-player__audio");
    if (!(audio instanceof HTMLAudioElement)) {return;}

    const playerId = player.getAttribute("data-player-id") || "";
    const toggleButton = player.querySelector('[data-action="toggle"]');
    const rewindButton = player.querySelector('[data-action="rewind"]');
    const forwardButton = player.querySelector('[data-action="forward"]');
    const playIcon = toggleButton?.querySelector(".episode-player__control-icon--play");
    const pauseIcon = toggleButton?.querySelector(".episode-player__control-icon--pause");
    const progress = player.querySelector(".episode-player__progress");
    const progressFill = player.querySelector(".episode-player__progress-fill");
    const timeDisplay = player.querySelector(".episode-player__time");
    const status = player.querySelector(".episode-player__status");
    const hint = player.querySelector(".episode-player__shortcut-hint");

    let isPlaying = false;
    const title = audio.dataset.title || "episode";

    // Broadcast progress for transcript sync.
    const dispatchTimeEvent = () => {
      if (!playerId) {return;}
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
      const currentTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
      window.dispatchEvent(
        new CustomEvent("audio:time", {
          detail: {
            playerId,
            currentTime,
            duration,
            isPlaying,
          },
        }),
      );
    };

    const setStatus = (message: string) => {
      if (status instanceof HTMLElement) {status.textContent = message;}
    };

    const updateToggleButton = () => {
      if (!(toggleButton instanceof HTMLButtonElement)) {return;}
      toggleButton.dataset.state = isPlaying ? "playing" : "paused";
      toggleButton.setAttribute("aria-pressed", isPlaying ? "true" : "false");
      toggleButton.setAttribute("aria-label", `${isPlaying ? "Pause" : "Play"} ${title}`);
      if (playIcon instanceof SVGElement) {
        playIcon.style.display = isPlaying ? "none" : "block";
      }
      if (pauseIcon instanceof SVGElement) {
        pauseIcon.style.display = isPlaying ? "block" : "none";
      }
    };

    const updateProgress = () => {
      if (
        !(progressFill instanceof HTMLElement) ||
        !(progress instanceof HTMLElement) ||
        !(timeDisplay instanceof HTMLElement)
      ) {
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
      progress.setAttribute("aria-valuetext", `${currentFormatted} of ${durationFormatted}`);
    };

    const applySeek = (timeSeconds: number, autoplay: boolean) => {
      if (!Number.isFinite(timeSeconds)) {return;}
      const duration = Number.isFinite(audio.duration) ? audio.duration : null;
      const clampedTime =
        duration === null
          ? Math.max(0, timeSeconds)
          : Math.min(Math.max(0, timeSeconds), duration);
      audio.currentTime = clampedTime;
      if (autoplay) {
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      }
      updateProgress();
      dispatchTimeEvent();
    };

    const seekToPosition = (clientX: number) => {
      if (!(progress instanceof HTMLElement) || !Number.isFinite(audio.duration)) {return;}
      const rect = progress.getBoundingClientRect();
      const percent = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      audio.currentTime = percent * audio.duration;
    };

    toggleButton?.addEventListener("click", () => {
      if (audio.paused || audio.ended) {
        audio.play();
      } else {
        audio.pause();
      }
    });

    rewindButton?.addEventListener("click", () => {
      audio.currentTime = Math.max(0, audio.currentTime - 10);
      updateProgress();
      dispatchTimeEvent();
    });

    forwardButton?.addEventListener("click", () => {
      if (Number.isFinite(audio.duration)) {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
        updateProgress();
        dispatchTimeEvent();
      }
    });

    progress?.addEventListener("click", (event) => {
      if (event instanceof MouseEvent) {
        seekToPosition(event.clientX);
        updateProgress();
        dispatchTimeEvent();
      }
    });

    progress?.addEventListener("keydown", (event) => {
      if (!(event instanceof KeyboardEvent)) {return;}
      if (!Number.isFinite(audio.duration)) {return;}
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
        dispatchTimeEvent();
      }
    });

    player.addEventListener("keydown", (event) => {
      if (!(event instanceof KeyboardEvent)) {return;}
      const target = event.target;
      if (!(target instanceof HTMLElement)) {return;}
      if (target.classList.contains("episode-player__progress")) {return;}
      if (["BUTTON", "A", "INPUT", "TEXTAREA"].includes(target.tagName)) {return;}

      if (event.code === "Space") {
        event.preventDefault();
        if (toggleButton instanceof HTMLButtonElement) {toggleButton.click();}
      } else if (event.code === "ArrowLeft") {
        if (rewindButton instanceof HTMLButtonElement) {rewindButton.click();}
      } else if (event.code === "ArrowRight") {
        if (forwardButton instanceof HTMLButtonElement) {forwardButton.click();}
      } else if (event.key === "?") {
        event.preventDefault();
        if (hint instanceof HTMLElement) {
          hint.classList.toggle("episode-player__shortcut-hint--hidden");
        }
      }
    });

    // Listen for transcript cue jumps.
    window.addEventListener("transcript:seek", (event) => {
      if (!(event instanceof CustomEvent)) {return;}
      const detail = event.detail;
      if (!detail || detail.playerId !== playerId) {return;}
      const targetTime = Number(detail.time);
      applySeek(targetTime, Boolean(detail.autoplay));
    });

    audio.addEventListener("loadedmetadata", () => {
      updateProgress();
      dispatchTimeEvent();
    });
    audio.addEventListener("timeupdate", () => {
      updateProgress();
      dispatchTimeEvent();
    });
    audio.addEventListener("waiting", () => {
      setStatus(`Buffering ${title}...`);
    });
    audio.addEventListener("error", () => {
      setStatus(`Error loading ${title}`);
    });
    audio.addEventListener("playing", () => {
      isPlaying = true;
      updateToggleButton();
      setStatus(`Playing ${title}`);
      dispatchTimeEvent();
    });
    audio.addEventListener("pause", () => {
      if (audio.ended) {return;}
      isPlaying = false;
      updateToggleButton();
      setStatus(`Paused ${title}`);
      dispatchTimeEvent();
    });
    audio.addEventListener("ended", () => {
      isPlaying = false;
      updateToggleButton();
      if (progressFill instanceof HTMLElement) {progressFill.style.width = "0%";}
      updateProgress();
      setStatus(`Finished ${title}`);
      dispatchTimeEvent();
    });

    setStatus(`Paused ${title}`);
    updateProgress();
    updateToggleButton();
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAudioPlayers, { once: true });
} else {
  initAudioPlayers();
}
