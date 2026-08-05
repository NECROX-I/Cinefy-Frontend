import { ArrowLeft, Bookmark, Check, LoaderCircle, Play, Star } from "lucide-react";
import TVControls from "./TVControls";
import { getPoster, getRating, getTitle, getYear } from "../utils/media";

export default function DetailsPanel({ item, seasons, episodes, season, episode, seasonsLoading, episodesLoading, streamLoading, sources, error, onBack, onSeasonChange, onEpisodeChange, onGetStreams, onPlay, onToggleList, isSaved }) {
  if (!item) return null;
  const title = getTitle(item);
  return (
    <section className="details-panel">
      <div className="details-top">
        <button className="back-button" onClick={onBack}><ArrowLeft size={16} /> Back to titles</button>
        <button className={`list-button ${isSaved ? "saved" : ""}`} onClick={() => onToggleList(item)}>
          {isSaved ? <Check size={16} /> : <Bookmark size={16} />} {isSaved ? "In My List" : "Add to My List"}
        </button>
      </div>
      <div className="details-main">
        <div className="details-poster">{getPoster(item, "w500") ? <img src={getPoster(item, "w500")} alt={`${title} poster`} /> : <div className="poster-empty">No poster</div>}</div>
        <div className="details-content">
          <span className="section-kicker">{item.media_type === "tv" ? "TV SHOW" : "MOVIE"}</span>
          <h2>{title}</h2>
          <div className="details-meta">{getYear(item) && <span>{getYear(item)}</span>}{getRating(item) && <span className="rating"><Star size={12} fill="currentColor" /> {getRating(item)}</span>}</div>
          <p className="overview">{item.overview || "No description is available for this title."}</p>
          {item.media_type === "tv" && <TVControls seasons={seasons} episodes={episodes} season={season} episode={episode} seasonsLoading={seasonsLoading} episodesLoading={episodesLoading} onSeasonChange={onSeasonChange} onEpisodeChange={onEpisodeChange} />}

          <button
            className="button button-primary stream-action"
            onClick={onGetStreams}
            disabled={
              streamLoading ||
              (item.media_type === "tv" && (!season || !episode))
            }
          >
            {streamLoading ? (
              <>
                <LoaderCircle className="button-spinner" size={17} />
                Finding sources...
              </>
            ) : (
              <>
                <Play size={17} fill="currentColor" />
                Find streaming sources
              </>
            )}
          </button>

          {error && <p className="inline-error">{error}</p>}
          {!!sources.length && <div className="source-area"><div className="source-heading"><strong>Available sources</strong><span>{sources.length} sources</span></div><div className="source-list">{sources.map((source, i) => <button className="source-button" key={`${source.name}-${i}`} onClick={() => onPlay(source.url, source.name)}><Play size={14} fill="currentColor" /><span>{source.name || "Source"}</span><small>{source.quality || "HD"}</small></button>)}</div></div>}
        </div>
      </div>
    </section>
  );
}
