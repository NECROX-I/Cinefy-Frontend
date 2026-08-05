import { useEffect, useRef, useState } from "react";

import Header from "./components/Header";
import Hero from "./components/Hero";
import MovieGrid from "./components/MovieGrid";
import DetailsPanel from "./components/DetailsPanel";
import VideoPlayer from "./components/VideoPlayer";
import Toast from "./components/Toast";

import {
  getMediaDetails,
  getStreams,
  getTVEpisodes,
  getTVSeasons,
  getSuggestions,
  searchMedia,
} from "./services/api";

import { getTitle } from "./utils/media";

const PAGE_TITLES = {
  home: "Trending now",
  movies: "Movies",
  tv: "TV Shows",
  trending: "Trending",
  popular: "Popular",
  "top-rated": "Top Rated",
  "my-list": "My List",
  search: "Search results",
};

const GENRES = [
  "action",
  "comedy",
  "drama",
  "horror",
  "sci-fi",
];

function normalize(items = []) {
  const map = new Map();

  for (const item of items) {
    if (!item?.id) continue;

    const mediaType =
      item.media_type ||
      (item.title ? "movie" : "tv");

    map.set(`${mediaType}-${item.id}`, {
      ...item,
      media_type: mediaType,
    });
  }

  return [...map.values()];
}

/* =========================================================
   ROUTING
========================================================= */

function readRoute() {
  const hash = window.location.hash
    .replace(/^#\/?/, "")
    .replace(/\/+$/, "");

  // Normal pages
  if (PAGE_TITLES[hash]) {
    return {
      page: hash,
      detail: null,
    };
  }

  const parts = hash.split("/");

  // #/movie/123
  if (parts[0] === "movie" && parts[1]) {
    return {
      page: "movie-detail",
      detail: {
        media_type: "movie",
        id: parts[1],
      },
    };
  }

  // #/tv/123
  if (parts[0] === "tv" && parts[1]) {
    return {
      page: "tv-detail",
      detail: {
        media_type: "tv",
        id: parts[1],
      },
    };
  }

  return {
    page: "home",
    detail: null,
  };
}

export default function App() {
  const initialRoute = readRoute();

  /* =======================================================
     PAGE
  ======================================================= */

  const [page, setPage] = useState(
    initialRoute.page
  );

  const [query, setQuery] = useState("");

  /* =======================================================
     CONTENT
  ======================================================= */

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =======================================================
     SELECTED TITLE
  ======================================================= */

  const [selectedItem, setSelectedItem] = useState(
    initialRoute.detail
  );

  const [detailLoading, setDetailLoading] = useState(
    Boolean(initialRoute.detail)
  );

  /* =======================================================
     TV
  ======================================================= */

  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);

  const [season, setSeason] = useState("");
  const [episode, setEpisode] = useState("");

  const [seasonsLoading, setSeasonsLoading] =
    useState(false);

  const [episodesLoading, setEpisodesLoading] =
    useState(false);

  /* =======================================================
     STREAMING
  ======================================================= */

  const [sources, setSources] = useState([]);
  const [streamLoading, setStreamLoading] =
    useState(false);

  const [streamError, setStreamError] =
    useState("");

  /* =======================================================
     PLAYER
  ======================================================= */

  const [player, setPlayer] = useState(null);

  /* =======================================================
     TOAST
  ======================================================= */

  const [toast, setToast] = useState(null);

  /* =======================================================
     MY LIST
  ======================================================= */

  const [myList, setMyList] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(
          "cinestream-my-list"
        ) || "[]"
      );
    } catch {
      return [];
    }
  });

  const abortRef = useRef(null);

  /* =======================================================
     SAVE MY LIST
  ======================================================= */

  useEffect(() => {
    localStorage.setItem(
      "cinestream-my-list",
      JSON.stringify(myList)
    );
  }, [myList]);

  /* =======================================================
     NOTIFICATION
  ======================================================= */

  function notify(message, isError = false) {
    setToast({
      message,
      error: isError,
    });

    window.clearTimeout(notify.timer);

    notify.timer = window.setTimeout(() => {
      setToast(null);
    }, 3200);
  }

  /* =======================================================
     RESET DETAIL
  ======================================================= */

  function resetSelectedTitle() {
    setSelectedItem(null);

    setDetailLoading(false);

    setSeasons([]);
    setEpisodes([]);

    setSeason("");
    setEpisode("");

    setSources([]);
    setStreamError("");

    setPlayer(null);
  }

  /* =======================================================
     NAVIGATION
  ======================================================= */

  function navigate(nextPage) {
    abortRef.current?.abort();

    resetSelectedTitle();

    setError("");

    window.location.hash = `/${nextPage}`;

    setPage(nextPage);
  }

  /* =======================================================
     HASH CHANGE
  ======================================================= */

  useEffect(() => {
    function handleHashChange() {
      const route = readRoute();

      setPage(route.page);

      if (route.detail) {
        setSelectedItem(route.detail);
        setDetailLoading(true);

        setSources([]);
        setStreamError("");
        setPlayer(null);

        setSeasons([]);
        setEpisodes([]);

        setSeason("");
        setEpisode("");
      } else {
        resetSelectedTitle();
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    window.addEventListener(
      "hashchange",
      handleHashChange
    );

    return () => {
      window.removeEventListener(
        "hashchange",
        handleHashChange
      );
    };
  }, []);

  /* =======================================================
     LOAD NORMAL PAGE
  ======================================================= */

  async function loadPage(target) {
    abortRef.current?.abort();

    const controller = new AbortController();

    abortRef.current = controller;

    setLoading(true);
    setError("");

    try {
      let items = [];

      /* MY LIST */

      if (target === "my-list") {
        items = myList;
      }

      /* HOME / TRENDING */

      else if (
        target === "home" ||
        target === "trending"
      ) {
        const data = await getSuggestions(
          "trending",
          controller.signal
        );

        items = data?.results || [];
      }

      /* OTHER PAGES */

      else {
        const responses = await Promise.all(
          GENRES.map((genre) =>
            getSuggestions(
              genre,
              controller.signal
            )
          )
        );

        items = normalize(
          responses.flatMap(
            (response) =>
              response?.results || []
          )
        );

        if (target === "movies") {
          items = items.filter(
            (item) =>
              item.media_type === "movie"
          );
        }

        if (target === "tv") {
          items = items.filter(
            (item) =>
              item.media_type === "tv"
          );
        }

        if (target === "popular") {
          items.sort(
            (a, b) =>
              Number(b.popularity || 0) -
              Number(a.popularity || 0)
          );
        }

        if (target === "top-rated") {
          items.sort(
            (a, b) =>
              Number(b.vote_average || 0) -
              Number(a.vote_average || 0)
          );
        }
      }

      if (!controller.signal.aborted) {
        setResults(normalize(items));
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        setResults([]);

        setError(
          err?.message ||
            "Could not load this section."
        );
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }

  /* =======================================================
     LOAD CURRENT PAGE
  ======================================================= */

  useEffect(() => {
    if (
      page !== "search" &&
      page !== "movie-detail" &&
      page !== "tv-detail"
    ) {
      loadPage(page);
    }
  }, [page, myList]);

  /* =======================================================
     LOAD DETAIL PAGE
     
     This runs when:
       /movie/123
       /tv/456

     is opened directly or refreshed.
  ======================================================= */

  useEffect(() => {
    if (
      page !== "movie-detail" &&
      page !== "tv-detail"
    ) {
      return;
    }

    const route = readRoute();

    if (!route.detail) {
      return;
    }

    let active = true;

    async function loadDetail() {
      setDetailLoading(true);
      setError("");

      try {
        const data =
          await getMediaDetails(
            route.detail.media_type,
            route.detail.id
          );

        if (!active) return;

        const detail = {
          ...data,
          id: route.detail.id,
          media_type:
            route.detail.media_type,
        };

        setSelectedItem(detail);

        /* TV */

        if (
          route.detail.media_type ===
          "tv"
        ) {
          setSeasonsLoading(true);

          try {
            const seasonData =
              await getTVSeasons(
                route.detail.id
              );

            if (!active) return;

            const validSeasons =
              (
                seasonData?.seasons ||
                []
              ).filter(
                (entry) =>
                  entry.season_number !== 0
              );

            setSeasons(
              validSeasons
            );

            if (validSeasons.length) {
              setSeason(
                String(
                  validSeasons[0]
                    .season_number
                )
              );
            }
          } catch (err) {
            if (active) {
              notify(
                err?.message ||
                  "Could not load seasons.",
                true
              );
            }
          } finally {
            if (active) {
              setSeasonsLoading(false);
            }
          }
        }
      } catch (err) {
        if (!active) return;

        setSelectedItem(null);

        setError(
          err?.message ||
            "Could not load this title."
        );
      } finally {
        if (active) {
          setDetailLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      active = false;
    };
  }, [page]);

  /* =======================================================
     SEARCH
  ======================================================= */

  async function handleSearch() {
    const value = query.trim();

    if (value.length < 2) {
      notify(
        "Enter at least 2 characters to search.",
        true
      );
      return;
    }

    abortRef.current?.abort();

    const controller =
      new AbortController();

    abortRef.current = controller;

    setPage("search");

    window.location.hash = "/search";

    setLoading(true);
    setError("");

    resetSelectedTitle();

    try {
      const data =
        await searchMedia(
          value,
          "multi",
          controller.signal
        );

      const filtered =
        (data?.results || []).filter(
          (item) =>
            item.media_type ===
              "movie" ||
            item.media_type === "tv"
        );

      setResults(
        normalize(filtered)
      );
    } catch (err) {
      if (err?.name !== "AbortError") {
        setResults([]);

        setError(
          err?.message ||
            "Search failed."
        );
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }

  /* =======================================================
     MY LIST
  ======================================================= */

  function toggleMyList(item) {
    setMyList((current) => {
      const exists = current.some(
        (saved) =>
          saved.id === item.id &&
          saved.media_type ===
            item.media_type
      );

      if (exists) {
        notify(
          `${getTitle(
            item
          )} removed from My List.`
        );

        return current.filter(
          (saved) =>
            !(
              saved.id === item.id &&
              saved.media_type ===
                item.media_type
            )
        );
      }

      notify(
        `${getTitle(
          item
        )} added to My List.`
      );

      return [...current, item];
    });
  }

  function isSaved(item) {
    return myList.some(
      (saved) =>
        saved.id === item.id &&
        saved.media_type ===
          item.media_type
    );
  }

  /* =======================================================
     SELECT MOVIE / TV
  ======================================================= */

  async function handleSelect(item) {
    if (!item?.id) return;

    const type =
      item.media_type === "tv"
        ? "tv"
        : "movie";

    console.log(
      "OPENING:",
      type,
      item.id
    );

    /*
      IMPORTANT:

      Search:
      #/search

      Movie:
      #/movie/123

      TV:
      #/tv/456
    */

    window.location.hash =
      `/${type}/${item.id}`;

    setPage(
      type === "tv"
        ? "tv-detail"
        : "movie-detail"
    );

    setSelectedItem(item);

    setDetailLoading(true);

    setSources([]);
    setStreamError("");
    setPlayer(null);

    setSeasons([]);
    setEpisodes([]);

    setSeason("");
    setEpisode("");

    try {
      const details =
        await getMediaDetails(
          type,
          item.id
        );

      const completeItem = {
        ...item,
        ...details,
        id: item.id,
        media_type: type,
      };

      setSelectedItem(
        completeItem
      );

      /* TV SEASONS */

      if (type === "tv") {
        setSeasonsLoading(true);

        try {
          const data =
            await getTVSeasons(
              item.id
            );

          const validSeasons =
            (
              data?.seasons ||
              []
            ).filter(
              (entry) =>
                entry.season_number !== 0
            );

          setSeasons(
            validSeasons
          );

          if (validSeasons.length) {
            setSeason(
              String(
                validSeasons[0]
                  .season_number
              )
            );
          }
        } finally {
          setSeasonsLoading(false);
        }
      }
    } catch (err) {
      console.error(
        "DETAIL ERROR:",
        err
      );

      notify(
        err?.message ||
          "Could not load this title.",
        true
      );
    } finally {
      setDetailLoading(false);
    }
  }

  /* =======================================================
     TV EPISODES
  ======================================================= */

  useEffect(() => {
    if (
      !selectedItem ||
      selectedItem.media_type !==
        "tv" ||
      !season
    ) {
      return;
    }

    let active = true;

    async function loadEpisodes() {
      setEpisodesLoading(true);

      setEpisodes([]);
      setEpisode("");

      try {
        const data =
          await getTVEpisodes(
            selectedItem.id,
            season
          );

        if (!active) return;

        const list =
          data?.episodes || [];

        setEpisodes(list);

        if (list.length) {
          setEpisode(
            String(
              list[0]
                .episode_number
            )
          );
        }
      } catch (err) {
        if (active) {
          notify(
            err?.message ||
              "Could not load episodes.",
            true
          );
        }
      } finally {
        if (active) {
          setEpisodesLoading(false);
        }
      }
    }

    loadEpisodes();

    return () => {
      active = false;
    };
  }, [
    selectedItem,
    season,
  ]);

  /* =======================================================
     GET STREAMS
  ======================================================= */

  async function handleGetStreams() {
    if (!selectedItem) {
      return;
    }

    if (
      selectedItem.media_type ===
        "tv" &&
      (!season || !episode)
    ) {
      notify(
        "Select a season and episode first.",
        true
      );
      return;
    }

    setStreamLoading(true);
    setStreamError("");
    setSources([]);

    try {
      const details =
        await getMediaDetails(
          selectedItem.media_type,
          selectedItem.id
        );

      const imdbId =
        details?.external_ids
          ?.imdb_id ||
        details?.imdb_id ||
        null;

      const payload = {
        tmdb_id:
          selectedItem.id,

        imdb_id:
          imdbId,

        media_type:
          selectedItem.media_type,
      };

      if (
        selectedItem.media_type ===
        "tv"
      ) {
        payload.season =
          Number(season);

        payload.episode =
          Number(episode);
      }

      console.log(
        "STREAM PAYLOAD:",
        payload
      );

      const data =
        await getStreams(
          payload
        );

      console.log(
        "STREAM RESPONSE:",
        data
      );

      const streamSources =
        Array.isArray(
          data?.sources
        )
          ? data.sources.filter(
              (source) =>
                source?.url &&
                typeof source.url ===
                  "string"
            )
          : [];

      setSources(
        streamSources
      );

      if (
        streamSources.length ===
        0
      ) {
        setStreamError(
          "No streaming sources were returned by the backend."
        );
      }
    } catch (err) {
      console.error(
        "STREAM ERROR:",
        err
      );

      setSources([]);

      setStreamError(
        err?.message ||
          "Unable to find streaming sources."
      );
    } finally {
      setStreamLoading(false);
    }
  }

  /* =======================================================
     PLAY
  ======================================================= */

  function handlePlay(
    url,
    sourceName
  ) {
    console.log(
      "PLAY STREAM:",
      url
    );

    if (!url) {
      notify(
        "The backend returned an empty stream URL.",
        true
      );
      return;
    }

    try {
      const parsed =
        new URL(
          url,
          window.location.origin
        );

      if (
        parsed.protocol !==
          "http:" &&
        parsed.protocol !==
          "https:"
      ) {
        throw new Error(
          "Invalid URL protocol."
        );
      }

      const title =
        selectedItem
          ? getTitle(
              selectedItem
            )
          : "Player";

      setPlayer({
        url: parsed.href,
        title: `${title} · ${
          sourceName ||
          "Player"
        }`,
      });

      setTimeout(() => {
        document
          .querySelector(
            ".player"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } catch (err) {
      console.error(
        "PLAYER ERROR:",
        err
      );

      notify(
        "Invalid stream URL received from the backend.",
        true
      );
    }
  }

  /* =======================================================
     BACK FROM DETAIL
  ======================================================= */

  function handleBack() {
    setSelectedItem(null);

    setSources([]);
    setStreamError("");
    setPlayer(null);

    setSeasons([]);
    setEpisodes([]);

    setSeason("");
    setEpisode("");

    setDetailLoading(false);

    /*
      If we have a search query/results,
      return to search.
    */

    if (
      query.trim().length >= 2 &&
      results.length > 0
    ) {
      window.location.hash =
        "/search";

      setPage("search");

      return;
    }

    window.location.hash =
      "/home";

    setPage("home");
  }

  /* =======================================================
     CLEAR
  ======================================================= */

  function clearResults() {
    abortRef.current?.abort();

    setQuery("");
    setResults([]);
    setError("");

    resetSelectedTitle();

    window.location.hash =
      "/home";

    setPage("home");
  }

  /* =======================================================
     DETAIL PAGE?
  ======================================================= */

  const isDetailPage =
    page === "movie-detail" ||
    page === "tv-detail";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="app-shell">

      <Header
        query={query}
        setQuery={setQuery}
        onSearch={handleSearch}
        activePage={
          isDetailPage
            ? ""
            : page
        }
        onNavigate={navigate}
      />

      <main className="page">

        {/* =================================================
            NORMAL PAGES
        ================================================= */}

        {!isDetailPage && (
          <>
            <Hero
              onSearchFocus={() =>
                document
                  .querySelector(
                    ".search-form input"
                  )
                  ?.focus()
              }
              onClear={
                clearResults
              }
            />

            <section className="results-section">

              <div className="section-heading">

                <div>
                  <span className="section-kicker">
                    CINEFY
                  </span>

                  <h2>
                    {page ===
                    "search"
                      ? `Results for “${query.trim()}”`
                      : PAGE_TITLES[
                          page
                        ]}
                  </h2>
                </div>

                {!loading && (
                  <span className="result-count">
                    {results.length}{" "}
                    titles
                  </span>
                )}

              </div>

              <MovieGrid
                items={results}
                loading={loading}
                error={error}
                onSelect={
                  handleSelect
                }
                onToggleList={
                  toggleMyList
                }
                isSaved={
                  isSaved
                }
              />

            </section>
          </>
        )}

        {/* =================================================
            DETAIL PAGE
        ================================================= */}

        {isDetailPage && (
          <>
            {detailLoading &&
              !selectedItem && (
                <div className="state-box">
                  <strong>
                    Loading title...
                  </strong>

                  <p>
                    Getting title details.
                  </p>
                </div>
              )}

            {error &&
              !selectedItem && (
                <div className="state-box error-state">

                  <strong>
                    Could not load this title
                  </strong>

                  <p>
                    {error}
                  </p>

                  <button
                    className="button button-secondary"
                    onClick={
                      handleBack
                    }
                  >
                    Go back
                  </button>

                </div>
              )}

            {selectedItem && (
              <DetailsPanel
                item={
                  selectedItem
                }

                seasons={
                  seasons
                }

                episodes={
                  episodes
                }

                season={
                  season
                }

                episode={
                  episode
                }

                seasonsLoading={
                  seasonsLoading
                }

                episodesLoading={
                  episodesLoading
                }

                streamLoading={
                  streamLoading
                }

                sources={
                  sources
                }

                error={
                  streamError
                }

                onBack={
                  handleBack
                }

                onSeasonChange={
                  setSeason
                }

                onEpisodeChange={
                  setEpisode
                }

                onGetStreams={
                  handleGetStreams
                }

                onPlay={
                  handlePlay
                }

                onToggleList={
                  toggleMyList
                }

                isSaved={
                  isSaved(
                    selectedItem
                  )
                }
              />
            )}

            <VideoPlayer
              url={
                player?.url
              }

              title={
                player?.title
              }

              onClose={() =>
                setPlayer(null)
              }
            />
          </>
        )}

      </main>

      <Toast
        message={
          toast?.message
        }
        error={
          toast?.error
        }
      />

    </div>
  );
}