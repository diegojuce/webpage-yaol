"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useModal } from "../hooks/use-modal";
import { FullscreenModal } from "../ui/fullscreen-modal";
import { WelcomeModalContent } from "./welcome-modal-content";

// Coloca aquí las rutas de tus videos
const VIDEO_SOURCES = [
  { src: "/videos/background_1.webm", label: "Video 1" },
  { src: "/videos/background_2.webm", label: "Video 2" },
  { src: "/videos/background_3.webm", label: "Video 3" },
];

const FALLBACK_DURATION_MS = 9000;
const MIN_DURATION_MS = 3000;
const MASTHEAD_OFFSET = "6rem";

export default function Welcome() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoDurations, setVideoDurations] = useState<number[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const { isOpen: isModalOpen, open: openModal, close: closeModal } = useModal();

  const totalVideos = VIDEO_SOURCES.length;
  const activeDurationMs = Math.max(
    MIN_DURATION_MS,
    Math.round(videoDurations[activeIndex] ?? FALLBACK_DURATION_MS)
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setProgress(0);
  }, [activeIndex]);

  useEffect(() => {
    if (isPaused || totalVideos <= 1) return;

    const remaining =
      activeDurationMs * (1 - Math.min(100, progress) / 100) || activeDurationMs;

    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % totalVideos);
    }, remaining);

    return () => clearTimeout(timer);
  }, [activeDurationMs, activeIndex, isPaused, progress, totalVideos]);

  useEffect(() => {
    const el = videoRefs.current[activeIndex];
    if (!el) return;
    el.currentTime = 0;
    void el.play().catch(() => {
      /* autoplay can fail silently; ignore */
    });
  }, [activeIndex]);

  useEffect(() => {
    const el = videoRefs.current[activeIndex];
    if (!el) return;
    if (isPaused) {
      el.pause();
    } else {
      void el.play().catch(() => {
        /* autoplay can fail silently; ignore */
      });
    }
  }, [activeIndex, isPaused]);

  useEffect(() => {
    let raf: number;

    const updateProgress = () => {
      const el = videoRefs.current[activeIndex];
      if (!el || !Number.isFinite(el.duration) || el.duration <= 0) {
        setProgress(0);
      } else {
        const percent = (el.currentTime / el.duration) * 100;
        setProgress(Math.min(100, Math.max(0, percent)));
      }
      raf = requestAnimationFrame(updateProgress);
    };

    if (!isPaused) {
      raf = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [activeIndex, isPaused]);

  const handleLoadedMetadata = (index: number) => {
    const el = videoRefs.current[index];
    const durationMs =
      el && Number.isFinite(el.duration) && el.duration > 0
        ? el.duration * 1000
        : FALLBACK_DURATION_MS;

    setVideoDurations((prev) => {
      if (prev[index] === durationMs) return prev;
      const next = [...prev];
      next[index] = durationMs;
      return next;
    });
  };

  if (!totalVideos) {
    return null;
  }

  return (
    <>
      <section
        aria-label="Carrusel de videos"
        className="relative isolate w-full overflow-hidden bg-black"
        style={{
          marginTop: `var(--masthead-offset, ${MASTHEAD_OFFSET})`,
          height: `calc(100dvh - var(--masthead-offset, ${MASTHEAD_OFFSET}))`,
          maxHeight: `calc(100dvh - var(--masthead-offset, ${MASTHEAD_OFFSET}))`,
        }}
      >
        <div className="absolute inset-0">
          {VIDEO_SOURCES.map((video, index) => {
            const isActive = index === activeIndex;
            const durationMs = Math.max(
              MIN_DURATION_MS,
              Math.round(videoDurations[index] ?? FALLBACK_DURATION_MS)
            );

            return (
              <video
                key={`${index}-${video.src || "video"}`}
                className={clsx(
                  "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out",
                  isActive ? "opacity-100" : "opacity-0"
                )}
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                src={video.src || undefined}
                autoPlay
                muted
                playsInline
                aria-hidden={!isActive}
                onLoadedMetadata={() => handleLoadedMetadata(index)}
                onEnded={() => {
                  setActiveIndex((prev) => (prev + 1) % totalVideos);
                }}
              />
            );
          })}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/50"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center pb-10">
          <p className="sr-only" aria-live="polite">
            Reproduciendo video {activeIndex + 1} de {totalVideos}
          </p>
          <div className="flex w-full flex-col items-center gap-4">
            <div
              role="tablist"
              aria-label="Selector de video"
              className="pointer-events-auto flex flex-row w-full items-center justify-center gap-4"
            >
              {VIDEO_SOURCES.map((video, index) => {
                const isActive = index === activeIndex;
                const durationMs = Math.max(
                  MIN_DURATION_MS,
                  Math.round(videoDurations[index] ?? FALLBACK_DURATION_MS)
                );

                return (
                  <button
                    key={`indicator-${index}-${video.src || "video"}`}
                    type="button"
                    aria-label={`Ver video ${index + 1}`}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => setActiveIndex(index)}
                    className={clsx(
                      "flex items-center justify-center transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                      isActive
                        ? "relative h-3 w-16 overflow-hidden rounded-full bg-white/20"
                        : "h-3 w-3 rounded-full bg-white/60 hover:bg-white/80"
                    )}
                  >
                    {isActive ? (
                      <span
                        className="absolute left-0 top-0 h-full bg-white transition-[width] duration-150 ease-linear"
                        style={{
                          width: mounted ? `${progress}%` : "0%",
                        }}
                      />
                    ) : null}
                  </button>
                );
              })}
              <button
                type="button"
                aria-pressed={isPaused}
                aria-label={isPaused ? "Reanudar video" : "Pausar video"}
                onClick={() => setIsPaused((prev) => !prev)}
                className="ml-2 flex h-0 w-0 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                {isPaused ? (
                  <span
                    aria-hidden="true"
                    className="block h-0 w-0 border-y-[5px] border-y-transparent border-l-[8px] border-l-white"
                  />
                ) : (
                  <span aria-hidden="true" className="flex items-center gap-[4px]">
                    <span className="block h-2 w-[2px] bg-white" />
                    <span className="block h-2 w-[2px] bg-white" />
                  </span>
                )}
              </button>
            </div>
            <div className="pointer-events-auto flex w-full px-6 pt-2 md:px-40 lg:px-60">
              <div className="flex h-15 p-2 md:h-20 w-full items-center  justify-start rounded-full border border-white/25 bg-white/95">
                <button
                  type="button"
                  onClick={openModal}
                  className="flex items-center justify-center h-full rounded-full border border-black bg-black p-5 text-sm font-semibold text-white transition hover:bg-white hover:text-black focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                >
                  Buscar llantas
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <FullscreenModal open={isModalOpen} onClose={closeModal}>
        <WelcomeModalContent />
      </FullscreenModal>
    </>
  );
}
