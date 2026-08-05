import {
  Film,
  Search,
  Menu,
  X,
  Home,
  Clapperboard,
  Tv,
  Flame,
  Star,
  Bookmark,
} from "lucide-react";
import { useState } from "react";

const links = [
  ["home", "Home", Home],
  ["movies", "Movies", Clapperboard],
  ["tv", "TV Shows", Tv],
  ["trending", "Trending", Flame],
  ["popular", "Popular", Star],
  ["top-rated", "Top Rated", Star],
  ["my-list", "My List", Bookmark],
];

export default function Header({
  query,
  setQuery,
  onSearch,
  activePage,
  onNavigate,
}) {
  const [open, setOpen] = useState(false);

  function go(page) {
    onNavigate(page);
    setOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <header className="site-header">
      <nav className="navbar">

        <button
          className="brand"
          onClick={() => go("home")}
          aria-label="CineFy home"
        >
          <span className="brand-mark">
            <Film size={17} />
          </span>

          <span>
            Cine<span>Fy</span>
          </span>
        </button>

        <div className={`nav-links ${open ? "open" : ""}`}>
          {links.map(([id, label, Icon]) => (
            <button
              key={id}
              className={`nav-link ${
                activePage === id ? "active" : ""
              }`}
              onClick={() => go(id)}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        <form
          className="search-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSearch();
          }}
        >
          <Search
            className="search-icon"
            size={17}
          />

          <input
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search movies, shows..."
            aria-label="Search movies and TV shows"
          />

          <button
            type="submit"
            className="search-button"
            aria-label="Search"
          >
            <Search size={15} />
          </button>
        </form>

        <button
          className="mobile-menu"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {open ? (
            <X size={19} />
          ) : (
            <Menu size={19} />
          )}
        </button>

      </nav>
    </header>
  );
}