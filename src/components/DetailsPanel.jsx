import {
  ArrowLeft,
  Bookmark,
  Check,
  LoaderCircle,
  Play,
  Star,
} from "lucide-react";

import TVControls from "./TVControls";

import {
  getPoster,
  getRating,
  getTitle,
  getYear,
} from "../utils/media";

export default function DetailsPanel({
  item,
  seasons,
  episodes,
  season,
  episode,
  seasonsLoading,
  episodesLoading,
  streamLoading,
  sources,
  error,
  onBack,
  onSeasonChange,
  onEpisodeChange,
  onGetStreams,
  onPlay,
  onToggleList,
  isSaved,
}) {
  if (!item) return null;

  const title = getTitle(item);
  const poster = getPoster(item, "w780");
  const year = getYear(item);
  const rating = getRating(item);

  return (
    <section className="details-page">

      <div
        className="details-backdrop"
        style={
          poster
            ? {
                backgroundImage: `url(${poster})`,
              }
            : undefined
        }
      />

      <div className="details-backdrop-overlay" />

      <div className="details-page-inner">

        <div className="details-nav">
          <button
            className="details-back"
            onClick={onBack}
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <button
            className={`details-list ${
              isSaved ? "saved" : ""
            }`}
            onClick={() => onToggleList(item)}
          >
            {isSaved ? (
              <Check size={17} />
            ) : (
              <Bookmark size={17} />
            )}

            <span>
              {isSaved
                ? "In My List"
                : "Add to My List"}
            </span>
          </button>
        </div>

        <div className="details-hero">

          <div className="details-poster-large">
            {poster ? (
              <img
                src={poster}
                alt={`${title} poster`}
              />
            ) : (
              <div className="poster-empty">
                No poster
              </div>
            )}
          </div>

          <div className="details-info">

            <div className="details-type">
              {item.media_type === "tv"
                ? "TV SERIES"
                : "MOVIE"}
            </div>

            <h1>{title}</h1>

            <div className="details-meta-large">

              {year && (
                <span>{year}</span>
              )}

              <span>
                {item.media_type === "tv"
                  ? "TV Show"
                  : "Movie"}
              </span>

              {rating && (
                <span className="rating">
                  <Star
                    size={14}
                    fill="currentColor"
                  />
                  {rating}
                </span>
              )}

            </div>

            <p className="details-description">
              {item.overview ||
                "No description is available for this title."}
            </p>

            {item.media_type === "tv" && (
              <TVControls
                seasons={seasons}
                episodes={episodes}
                season={season}
                episode={episode}
                seasonsLoading={seasonsLoading}
                episodesLoading={episodesLoading}
                onSeasonChange={onSeasonChange}
                onEpisodeChange={onEpisodeChange}
              />
            )}

            <button
              className="details-stream-button"
              onClick={onGetStreams}
              disabled={
                streamLoading ||
                (item.media_type === "tv" &&
                  (!season || !episode))
              }
            >
              {streamLoading ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="button-spinner"
                  />
                  Finding sources...
                </>
              ) : (
                <>
                  <Play
                    size={18}
                    fill="currentColor"
                  />
                  Find streaming sources
                </>
              )}
            </button>

            {error && (
              <div className="details-error">
                {error}
              </div>
            )}

          </div>
        </div>

        {!!sources.length && (
          <section className="sources-section">

            <div className="sources-header">
              <div>
                <span className="section-kicker">
                  STREAMING
                </span>

                <h2>Available sources</h2>
              </div>

              <span className="source-count">
                {sources.length} sources
              </span>
            </div>

            <div className="source-grid">

              {sources.map((source, index) => (
                <button
                  className="source-card"
                  key={`${source.name}-${index}`}
                  onClick={() =>
                    onPlay(
                      source.url,
                      source.name
                    )
                  }
                >
                  <span className="source-play">
                    <Play
                      size={15}
                      fill="currentColor"
                    />
                  </span>

                  <span className="source-info">
                    <strong>
                      {source.name || "Source"}
                    </strong>

                    <small>
                      {source.quality || "HD"}
                    </small>
                  </span>

                  <span className="source-arrow">
                    →
                  </span>
                </button>
              ))}

            </div>
          </section>
        )}

      </div>
    </section>
  );
}