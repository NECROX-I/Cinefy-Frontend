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
  searchMedia
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
  search: "Search results"
};

const GENRES = ["action", "comedy", "drama", "horror", "sci-fi"];

function normalize(items = []) {
  const map = new Map();
  for (const item of items) {
    if (!item?.id) continue;
    const type = item.media_type || (item.title ? "movie" : "tv");
    map.set(`${type}-${item.id}`, { ...item, media_type: type });
  }
  return [...map.values()];
}

function readPage() {
  const value = window.location.hash.replace(/^#\/?/, "");
  return PAGE_TITLES[value] ? value : "home";
}

export default function App() {
  const [page, setPage] = useState(readPage);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [season, setSeason] = useState("");
  const [episode, setEpisode] = useState("");
  const [seasonsLoading, setSeasonsLoading] = useState(false);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [sources, setSources] = useState([]);
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamError, setStreamError] = useState("");
  const [player, setPlayer] = useState(null);
  const [toast, setToast] = useState(null);
  const [myList, setMyList] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cinestream-my-list") || "[]"); }
    catch { return []; }
  });
  const abortRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("cinestream-my-list", JSON.stringify(myList));
  }, [myList]);

  useEffect(() => {
    const onHash = () => setPage(readPage());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function notify(message, isError = false) {
    setToast({ message, error: isError });
    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => setToast(null), 3200);
  }

  function navigate(next) {
    window.location.hash = `/${next}`;
    setPage(next);
    setSelectedItem(null);
    setPlayer(null);
    setSources([]);
    setStreamError("");
  }

  async function loadPage(target) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError("");
    setSelectedItem(null);
    setPlayer(null);

    try {
      let items = [];

      if (target === "my-list") {
        items = myList;
      } else if (target === "home" || target === "trending") {
        const data = await getSuggestions("trending", controller.signal);
        items = data.results || [];
      } else {
        const responses = await Promise.all(
          GENRES.map((genre) => getSuggestions(genre, controller.signal))
        );
        items = normalize(responses.flatMap((data) => data.results || []));

        if (target === "movies") items = items.filter((item) => item.media_type === "movie");
        if (target === "tv") items = items.filter((item) => item.media_type === "tv");
        if (target === "popular") items.sort((a, b) => Number(b.popularity || 0) - Number(a.popularity || 0));
        if (target === "top-rated") items.sort((a, b) => Number(b.vote_average || 0) - Number(a.vote_average || 0));
      }

      if (!controller.signal.aborted) setResults(normalize(items));
    } catch (err) {
      if (err.name !== "AbortError") {
        setResults([]);
        setError(err.message || "Could not load this section.");
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    if (page !== "search") loadPage(page);
  }, [page, myList]);

  async function handleSearch() {
    const value = query.trim();
    if (value.length < 2) {
      notify("Enter at least 2 characters to search.", true);
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setPage("search");
    window.location.hash = "/search";
    setLoading(true);
    setError("");
    setSelectedItem(null);
    setPlayer(null);
    try {
      const data = await searchMedia(value, "multi", controller.signal);
      setResults((data.results || []).filter((item) => item.media_type === "movie" || item.media_type === "tv"));
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message || "Search failed.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  function toggleMyList(item) {
    setMyList((current) => {
      const exists = current.some((x) => x.id === item.id && x.media_type === item.media_type);
      notify(exists ? `${getTitle(item)} removed from My List.` : `${getTitle(item)} added to My List.`);
      return exists
        ? current.filter((x) => !(x.id === item.id && x.media_type === item.media_type))
        : [...current, item];
    });
  }

  function isSaved(item) {
    return myList.some((x) => x.id === item.id && x.media_type === item.media_type);
  }

  async function handleSelect(item) {
    setSelectedItem(item);
    setSources([]);
    setStreamError("");
    setPlayer(null);
    setSeason("");
    setEpisode("");
    setSeasons([]);
    setEpisodes([]);

    if (item.media_type !== "tv") return;
    setSeasonsLoading(true);
    try {
      const data = await getTVSeasons(item.id);
      const valid = (data.seasons || []).filter((x) => x.season_number !== 0);
      setSeasons(valid);
      if (valid.length) setSeason(String(valid[0].season_number));
    } catch (err) {
      notify(err.message, true);
    } finally {
      setSeasonsLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedItem || selectedItem.media_type !== "tv" || !season) return;
    let active = true;
    (async () => {
      setEpisodesLoading(true);
      try {
        const data = await getTVEpisodes(selectedItem.id, season);
        if (!active) return;
        const list = data.episodes || [];
        setEpisodes(list);
        if (list.length) setEpisode(String(list[0].episode_number));
      } catch (err) {
        if (active) notify(err.message, true);
      } finally {
        if (active) setEpisodesLoading(false);
      }
    })();
    return () => { active = false; };
  }, [selectedItem, season]);

  async function handleGetStreams() {
    if (!selectedItem) return;
    if (selectedItem.media_type === "tv" && (!season || !episode)) {
      notify("Select a season and episode first.", true);
      return;
    }
    setStreamLoading(true);
    setStreamError("");
    setSources([]);
    try {
      const details = await getMediaDetails(selectedItem.media_type, selectedItem.id);
      const imdbId = details?.external_ids?.imdb_id || details?.imdb_id || null;
      const payload = { tmdb_id: selectedItem.id, imdb_id: imdbId, media_type: selectedItem.media_type };
      if (selectedItem.media_type === "tv") {
        payload.season = Number(season);
        payload.episode = Number(episode);
      }
      const data = await getStreams(payload);
      const list = (data.sources || []).filter((x) => x?.url);
      setSources(list);
      if (!list.length) setStreamError("No streams found for this title.");
    } catch (err) {
      setStreamError(err.message || "Unable to find streams.");
    } finally {
      setStreamLoading(false);
    }
  }

  function handlePlay(url, name) {
    try {
      const parsed = new URL(url, window.location.origin);
      if (!/^https?:$/.test(parsed.protocol)) throw new Error();
      setPlayer({ url: parsed.href, title: `${getTitle(selectedItem)} · ${name || "Player"}` });
      setTimeout(() => document.querySelector(".player")?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {
      notify("Invalid stream URL received from the server.", true);
    }
  }

  function clearResults() {
    abortRef.current?.abort();
    setQuery("");
    setResults([]);
    setError("");
    setSelectedItem(null);
    setSources([]);
    setPlayer(null);
    navigate("home");
  }

  return (
    <div className="app-shell">
      <Header query={query} setQuery={setQuery} onSearch={handleSearch} activePage={page} onNavigate={navigate} />
      <main className="page">
        <Hero onSearchFocus={() => document.querySelector(".search-form input")?.focus()} onClear={clearResults} />
        <section className="results-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">CINEFY</span>
              <h2>{page === "search" ? `Results for “${query.trim()}”` : PAGE_TITLES[page]}</h2>
            </div>
            {!loading && <span className="result-count">{results.length} titles</span>}
          </div>
          <MovieGrid items={results} loading={loading} error={error} onSelect={handleSelect} onToggleList={toggleMyList} isSaved={isSaved} />
        </section>
        {selectedItem && (
          <DetailsPanel
            item={selectedItem} seasons={seasons} episodes={episodes} season={season} episode={episode}
            seasonsLoading={seasonsLoading} episodesLoading={episodesLoading} streamLoading={streamLoading}
            sources={sources} error={streamError} onBack={() => setSelectedItem(null)} onSeasonChange={setSeason}
            onEpisodeChange={setEpisode} onGetStreams={handleGetStreams} onPlay={handlePlay}
            onToggleList={toggleMyList} isSaved={isSaved(selectedItem)}
          />
        )}
        <VideoPlayer url={player?.url} title={player?.title} onClose={() => setPlayer(null)} />
      </main>
      <Toast message={toast?.message} error={toast?.error} />
    </div>
  );
}
