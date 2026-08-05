import { Maximize, X } from "lucide-react";

export default function VideoPlayer({ url, title, onClose }) {
  if (!url) return null;

  return (
    <section className="player">
      <div className="player-header">
        <strong>{title || "Player"}</strong>
        <div className="player-actions">
          <button
            onClick={() => {
              const iframe = document.querySelector(".player-frame");
              iframe?.requestFullscreen?.();
            }}
            aria-label="Fullscreen"
          >
            <Maximize size={17} />
          </button>
          <button onClick={onClose} aria-label="Close player">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="player-frame-wrap">
        <iframe
          className="player-frame"
          src={url}
          title={title || "Video player"}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="no-referrer"
        />
      </div>
    </section>
  );
}