import { Bookmark, Play, Star } from "lucide-react";
import { getPoster, getRating, getTitle, getYear } from "../utils/media";

export default function MovieCard({ item, onSelect, onToggleList, isSaved }) {
  const title = getTitle(item), poster = getPoster(item), year = getYear(item), rating = getRating(item);
  return (
    <article className="movie-card" tabIndex={0} onClick={() => onSelect(item)} onKeyDown={(e) => { if (e.key === "Enter") onSelect(item); }}>
      <div className="poster">
        {poster ? <img src={poster} alt={`${title} poster`} loading="lazy" /> : <div className="poster-empty">No poster</div>}
        <div className="poster-shade" />
        <span className="media-badge">{item.media_type === "tv" ? "TV" : "MOVIE"}</span>
        <div className="card-hover">
          <button className="round-action play-action" onClick={(e) => { e.stopPropagation(); onSelect(item); }} aria-label={`Open ${title}`}><Play size={17} fill="currentColor" /></button>
          <button className={`round-action ${isSaved(item) ? "saved" : ""}`} onClick={(e) => { e.stopPropagation(); onToggleList(item); }} aria-label="Toggle My List"><Bookmark size={17} fill={isSaved(item) ? "currentColor" : "none"} /></button>
        </div>
      </div>
      <div className="movie-info">
        <h3 title={title}>{title}</h3>
        <div className="movie-meta">
          {year && <span>{year}</span>}
          {rating && <span className="rating"><Star size={11} fill="currentColor" /> {rating}</span>}
        </div>
      </div>
    </article>
  );
}
