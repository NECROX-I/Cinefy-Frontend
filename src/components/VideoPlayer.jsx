import { Maximize, X } from "lucide-react";
import { useRef } from "react";

export default function VideoPlayer({
  url,
  title,
  onClose,
}) {
  const frameRef = useRef(null);

  if (!url) {
    return (
      <section className="player-empty">
        <div>
          <span className="player-empty-icon">▶</span>
          <strong>Select a source to start watching</strong>
          <p>
            Choose one of the available streaming sources
            above.
          </p>
        </div>
      </section>
    );
  }

  async function fullscreen() {
    const frame = frameRef.current;

    if (!frame) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      await frame.requestFullscreen?.();
    } catch (error) {
      console.error(
        "Fullscreen failed:",
        error
      );
    }
  }

  return (
    <section className="player">
      <header className="player-header">
        <div className="player-title">
          <span className="player-live-dot" />
          <div>
            <strong>{title || "Now Playing"}</strong>
            <small>Streaming</small>
          </div>
        </div>

        <div className="player-actions">
          <button
            type="button"
            onClick={fullscreen}
            aria-label="Fullscreen"
            title="Fullscreen"
          >
            <Maximize size={18} />
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close player"
            title="Close player"
          >
            <X size={19} />
          </button>
        </div>
      </header>

      <div className="player-frame-wrap">
        <iframe
          ref={frameRef}
          className="player-frame"
          src={url}
          title={title || "Video player"}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          referrerPolicy="no-referrer"
        />
      </div>
    </section>
  );
}