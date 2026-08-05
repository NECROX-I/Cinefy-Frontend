export function getTitle(item) {
  return item?.title || item?.name || "Untitled";
}

export function getYear(item) {
  return (item?.release_date || item?.first_air_date || "").slice(0, 4);
}

export function getPoster(item, size = "w342") {
  return item?.poster_path
    ? `https://image.tmdb.org/t/p/${size}${item.poster_path}`
    : null;
}

export function getRating(item) {
  const rating = Number(item?.vote_average);
  return rating > 0 ? rating.toFixed(1) : null;
}