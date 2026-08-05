async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { Accept: "application/json", ...(options.headers || {}) }
  });
  let data;
  try { data = await response.json(); }
  catch { throw new Error(`Server returned an invalid response (${response.status}).`); }
  if (!response.ok) throw new Error(data?.detail || data?.message || data?.error || `Request failed (${response.status}).`);
  return data;
}

export function searchMedia(query, type = "multi", signal) {
  return request(`/api/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}`, { signal });
}
export function getSuggestions(genre, signal) {
  return request(`/api/suggestions/${encodeURIComponent(genre)}`, { signal });
}
export function getTVSeasons(id) { return request(`/api/tv/${encodeURIComponent(id)}/seasons`); }
export function getTVEpisodes(id, season) { return request(`/api/tv/${encodeURIComponent(id)}/season/${encodeURIComponent(season)}/episodes`); }
export function getMediaDetails(type, id) { return request(`/api/${type === "tv" ? "tv" : "movie"}/${encodeURIComponent(id)}`); }
export function getStreams(payload) {
  return request("/api/stream", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
}
