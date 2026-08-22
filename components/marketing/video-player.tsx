"use client";

import { useRef, useState, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

function formatTime(s: number): string {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function VideoPlayer({
  src,
  className = "",
  videoClassName = "",
}: {
  src: string;
  className?: string;
  videoClassName?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [muted, setMuted] = useState(false);

  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }, []);

  const onTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setCurrentTime(v.currentTime);
    setProgress((v.currentTime / v.duration) * 100);
  }, []);

  const onLoadedMetadata = useCallback(() => {
    const v = videoRef.current;
    if (v) setDuration(v.duration);
  }, []);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = ratio * v.duration;
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const fullscreen = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen();
  }, []);

  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-black ${className}`}>
      {/* Vidéo */}
      <video
        ref={videoRef}
        src={src}
        className={`h-full w-full cursor-pointer object-contain ${videoClassName}`}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => setPlaying(false)}
        onClick={toggle}
        preload="metadata"
        playsInline
      />

      {/* Overlay play au centre quand en pause */}
      {!playing && (
        <button
          onClick={toggle}
          aria-label="Lire la vidéo"
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-[var(--accent-gold)] text-[#0a0a0b] shadow-lg">
            <Play className="size-7 translate-x-0.5" />
          </span>
        </button>
      )}

      {/* Barre de contrôles — toujours visible */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-3 pt-8">
        {/* Barre de progression */}
        <div
          role="slider"
          aria-label="Progression"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mb-2 h-1.5 w-full cursor-pointer rounded-full bg-white/30 hover:h-2.5 transition-all"
          onClick={seek}
        >
          <div
            className="h-full rounded-full bg-[var(--accent-gold)] relative"
            style={{ width: `${progress}%` }}
          >
            <span className="absolute right-0 top-1/2 size-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow" />
          </div>
        </div>

        {/* Boutons */}
        <div className="flex items-center gap-3">
          <button onClick={toggle} aria-label={playing ? "Pause" : "Lecture"} className="text-white hover:text-[var(--accent-gold)] transition-colors">
            {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
          </button>

          <button onClick={toggleMute} aria-label={muted ? "Activer le son" : "Couper le son"} className="text-white hover:text-[var(--accent-gold)] transition-colors">
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>

          <span className="text-xs text-white/70 tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <button onClick={fullscreen} aria-label="Plein écran" className="ml-auto text-white hover:text-[var(--accent-gold)] transition-colors">
            <Maximize className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
