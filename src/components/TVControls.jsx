import { LoaderCircle } from "lucide-react";

export default function TVControls({
  seasons,
  episodes,
  season,
  episode,
  seasonsLoading,
  episodesLoading,
  onSeasonChange,
  onEpisodeChange,
}) {
  return (
    <div className="tv-controls">
      <label>
        <span>Season</span>

        <select
          value={season}
          onChange={(event) =>
            onSeasonChange(event.target.value)
          }
          disabled={
            seasonsLoading || !seasons.length
          }
        >
          {seasonsLoading ? (
            <option value="">
              Loading seasons...
            </option>
          ) : seasons.length ? (
            seasons.map((item) => (
              <option
                key={item.season_number}
                value={item.season_number}
              >
                Season {item.season_number}
              </option>
            ))
          ) : (
            <option value="">
              No seasons
            </option>
          )}
        </select>
      </label>

      <label>
        <span>Episode</span>

        <select
          value={episode}
          onChange={(event) =>
            onEpisodeChange(event.target.value)
          }
          disabled={
            episodesLoading || !episodes.length
          }
        >
          {episodesLoading ? (
            <option value="">
              Loading episodes...
            </option>
          ) : episodes.length ? (
            episodes.map((item) => (
              <option
                key={item.episode_number}
                value={item.episode_number}
              >
                Episode {item.episode_number}
                {item.name
                  ? `: ${item.name}`
                  : ""}
              </option>
            ))
          ) : (
            <option value="">
              No episodes
            </option>
          )}
        </select>
      </label>
    </div>
  );
}