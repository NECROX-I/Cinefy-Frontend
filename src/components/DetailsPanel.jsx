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
  const poster = getPoster(item, "w500");
  const rating = getRating(item);
  const year = getYear(item);

  return (
    <section className="details-panel">
      <div className="details-top">
        <button
          className="back-button"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <button
          className={`list-button ${
            isSaved ? "saved" : ""
          }`}
          onClick={() => onToggleList(item)}
          type="button"
        >
          {isSaved ? (
            <Check size={16} />
          ) : (
            <Bookmark size={16} />
          )}

          <span>
            {isSaved
              ? "In My List"
              : "Add to My List"}
          </span>
        </button>
      </div>

      <div className="details-main">
        <div className="details-poster">
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

        <div className="details-content">
          <div className="details-type">
            {item.media_type === "tv"
              ? "TV SERIES"
              : "MOVIE"}
          </div>

          <h1>{title}</h1>

          <div className="details-meta">
            {year && <span>{year}</span>}

            {rating && (
              <span className="rating">
                <Star
                  size={13}
                  fill="currentColor"
                />
                {rating}
              </span>
            )}
          </div>

          <p className="overview">
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
            className="button button-primary stream-action"
            onClick={onGetStreams}
            disabled={
              streamLoading ||
              (item.media_type === "tv" &&
                (!season || !episode))
            }
            type="button"
          >
            {streamLoading ? (
              <>
                <LoaderCircle
                  className="button-spinner"
                  size={17}
                />
                Finding sources...
              </>
            ) : (
              <>
                <Play
                  size={17}
                  fill="currentColor"
                />
                Find streaming sources
              </>
            )}
          </button>

          {error && (
            <div className="inline-error">
              {error}
            </div>
          )}

          {!!sources.length && (
            <div className="source-area">
              <div className="source-heading">
                <div>
                  <strong>Choose a source</strong>
                  <span>
                    Select a server to start watching
                  </span>
                </div>

                <small>
                  {sources.length} available
                </small>
              </div>

              <div className="source-list">
                {sources.map((source, index) => (
                  <button
                    className="source-button"
                    key={`${source.name}-${index}`}
                    onClick={() =>
                      onPlay(
                        source.url,
                        source.name
                      )
                    }
                    type="button"
                  >
                    <span className="source-play">
                      <Play
                        size={13}
                        fill="currentColor"
                      />
                    </span>

                    <span className="source-info">
                      <strong>
                        {source.name ||
                          `Source ${index + 1}`}
                      </strong>

                      <small>
                        {source.quality || "HD"}
                      </small>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}