// Client-only episode search + load-more behavior for the homepage list.
type EpisodeEntry = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  durationSeconds?: number;
  publishedAt: string;
  publishedLabel: string;
  isLatest: boolean;
  searchText?: string;
};

const initEpisodes = () => {
  const globalWindow = window as typeof window & {
    __mmEpisodesInitialized?: boolean;
  };

  if (globalWindow.__mmEpisodesInitialized) {return;}
  globalWindow.__mmEpisodesInitialized = true;

  const pageSize = 30;
  // Episodes are serialized in the HTML to avoid an extra fetch.
  const dataEl = document.querySelector("#episodes-data");
  const encoded = dataEl?.getAttribute("data-episodes") || "";
  const decoded = encoded
    ? new TextDecoder().decode(
        Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0)),
      )
    : "[]";
  const episodes = JSON.parse(decoded) as EpisodeEntry[];

  const form = document.querySelector(".search-bar");
  if (!form) {return;}

  const input = form.querySelector(".search-bar__input");
  const clearButton = form.querySelector(".search-bar__clear");
  const status = form.querySelector("#search-status");
  const empty = form.querySelector("#search-empty");
  const list = document.querySelector("#episodes-list");
  const templateWrapper = document.querySelector("#episode-template");
  const loadMore = document.querySelector("#episodes-load-more");
  const loadMoreStatus = document.querySelector("#episodes-load-more-status");
  const loadMoreButton = document.querySelector("#episodes-load-more-button");

  if (
    !(input instanceof HTMLInputElement) ||
    !(list instanceof HTMLElement) ||
    !(templateWrapper instanceof HTMLElement) ||
    !(loadMore instanceof HTMLElement) ||
    !(loadMoreStatus instanceof HTMLElement) ||
    !(loadMoreButton instanceof HTMLButtonElement)
  ) {
    return;
  }

  let debounceId: number | undefined;
  let query = "";
  let visibleCount = pageSize;

  const normalize = (value: string) => value.trim().toLowerCase();

  const buildEpisode = (episode: EpisodeEntry) => {
    const source = templateWrapper.firstElementChild;
    if (!(source instanceof HTMLElement)) {return null;}
    const node = source.cloneNode(true);
    if (!(node instanceof HTMLElement)) {return null;}

    node.setAttribute("data-search", episode.searchText || "");

    const image = node.querySelector(".episode-card__image");
    if (image instanceof HTMLImageElement) {
      image.src = `/images/${episode.imageUrl}.jpg`;
      image.alt = `Cover image for ${episode.title} podcast episode`;
    }

    const time = node.querySelector(".episode-card__date");
    if (time instanceof HTMLTimeElement) {
      time.dateTime = episode.publishedAt;
      time.textContent = episode.publishedLabel;
    }

    const badge = node.querySelector(".episode-card__badge");
    if (!episode.isLatest && badge) {
      badge.remove();
    }

    const duration = node.querySelector(".episode-card__duration");
    if (duration instanceof HTMLElement) {
      if (typeof episode.durationSeconds === "number" && episode.durationSeconds > 0) {
        duration.textContent = `${Math.floor(episode.durationSeconds / 60)} min`;
      } else {
        duration.remove();
      }
    }

    const title = node.querySelector(".episode-card__title");
    if (title instanceof HTMLElement) {
      title.textContent = episode.title;
    }

    const description = node.querySelector(".episode-card__description");
    if (description instanceof HTMLElement) {
      description.textContent = episode.description;
    }

    const link = node.querySelector(".episode-card__link");
    if (link instanceof HTMLAnchorElement) {
      link.href = `/${episode.id}`;
      link.setAttribute("aria-label", `Listen to ${episode.title} podcast episode`);
    }

    return node;
  };

  const updateStatus = (found: number, total: number) => {
    if (!(status instanceof HTMLElement)) {return;}
    const word = found === 1 ? "episode" : "episodes";
    const showing = Math.min(visibleCount, found);
    status.textContent = `Found ${found} of ${total} ${word}. Showing ${showing}.`;
  };

  // Keep the search query in the URL for shareable results.
  const updateUrl = (currentQuery: string) => {
    const params = new URLSearchParams();
    if (currentQuery) {params.set("q", currentQuery);}
    const queryString = params.toString();
    const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}`;
    window.history.replaceState(null, "", nextUrl);
  };

  // Render the filtered list and update status + load-more state.
  const render = () => {
    const normalized = normalize(query);
    const filtered = normalized
      ? episodes.filter((episode) => (episode.searchText || "").includes(normalized))
      : episodes;
    const total = episodes.length;
    const found = filtered.length;
    const visible = filtered.slice(0, visibleCount);

    list.innerHTML = "";
    visible.forEach((episode) => {
      const node = buildEpisode(episode);
      if (node) {list.appendChild(node);}
    });

    updateStatus(found, total);
    updateUrl(query);

    const showing = Math.min(visibleCount, found);
    loadMoreStatus.textContent = `Showing ${showing} of ${found} episodes.`;
    loadMore.hidden = found <= pageSize;
    loadMoreButton.disabled = showing >= found;

    if (empty instanceof HTMLElement) {
      empty.hidden = found !== 0;
    }
  };

  const initFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    query = params.get("q") || "";
    input.value = query;
  };

  form.addEventListener("submit", (event) => event.preventDefault());

  input.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {return;}
    const value = target.value;
    window.clearTimeout(debounceId);
    debounceId = window.setTimeout(() => {
      query = value;
      visibleCount = pageSize;
      render();
    }, 180);
  });

  clearButton?.addEventListener("click", () => {
    input.value = "";
    input.focus();
    query = "";
    visibleCount = pageSize;
    render();
  });

  loadMoreButton.addEventListener("click", () => {
    visibleCount += pageSize;
    render();
  });

  initFromUrl();
  render();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initEpisodes, { once: true });
} else {
  initEpisodes();
}
