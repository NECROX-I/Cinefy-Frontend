# CineFy React Frontend

React + Vite frontend for the movie/TV streaming API.

## Requirements

- Node.js 18+
- Your existing backend running locally

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

The Vite development server proxies `/api` to:

```text
http://localhost:5000
```

Change `server.proxy["/api"].target` in `vite.config.js` if your backend uses another local port.

## API expected by the frontend

```text
GET  /api/search?q=<query>
GET  /api/tv/:id/seasons
GET  /api/tv/:id/season/:season/episodes
GET  /api/:media_type/:id
POST /api/stream
```

The stream request keeps the existing payload structure:

```json
{
  "tmdb_id": 123,
  "imdb_id": "tt1234567",
  "media_type": "tv",
  "season": 1,
  "episode": 1
}
```

For movies, `season` and `episode` are omitted.

## Production build

```bash
npm run build
npm run preview
```

## Notes

The frontend does not provide or host copyrighted media. It displays stream URLs returned by your backend and embeds those URLs in the player.
