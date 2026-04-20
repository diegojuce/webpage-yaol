"use client";

import { useEffect, useRef } from "react";
import type { BranchOption } from "./branches";

type LeafletMarker = {
  on: (event: string, cb: () => void) => void;
  bindTooltip: (text: string, opts?: Record<string, unknown>) => void;
  getElement: () => HTMLElement | null;
};

type LeafletMap = {
  fitBounds: (bounds: unknown) => void;
  flyTo: (center: [number, number], zoom: number, options?: Record<string, unknown>) => void;
  getZoom: () => number;
  invalidateSize?: (options?: boolean | Record<string, unknown>) => void;
  remove: () => void;
};

type LeafletLike = {
  map: (container: HTMLElement, options: Record<string, unknown>) => LeafletMap;
  tileLayer: (url: string, options?: Record<string, unknown>) => { addTo: (map: LeafletMap) => void };
  control: { zoom: (options?: Record<string, unknown>) => { addTo: (map: LeafletMap) => void } };
  divIcon: (options: Record<string, unknown>) => unknown;
  marker: (latLng: [number, number], options?: Record<string, unknown>) => LeafletMarker & { addTo: (map: LeafletMap) => LeafletMarker };
  featureGroup: (markers: LeafletMarker[]) => { getBounds: () => { pad: (ratio: number) => unknown } };
};

declare global {
  interface Window {
    L?: LeafletLike;
  }
}

const LEAFLET_CSS_ID = "leaflet-css";
const LEAFLET_SCRIPT_ID = "leaflet-js";

function ensureLeafletAssets() {
  if (!document.getElementById(LEAFLET_CSS_ID)) {
    const link = document.createElement("link");
    link.id = LEAFLET_CSS_ID;
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.crossOrigin = "";
    document.head.appendChild(link);
  }

  if (!document.getElementById(LEAFLET_SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = LEAFLET_SCRIPT_ID;
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    document.body.appendChild(script);
  }
}

export default function BranchMap({
  branches,
  selectedId,
  onSelect,
  tall = false,
  minHeight,
}: {
  branches: BranchOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  tall?: boolean;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, LeafletMarker>>({});
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    ensureLeafletAssets();

    let disposed = false;
    let pollId: number | null = null;

    const initMap = () => {
      if (disposed || !ref.current || mapRef.current) {
        return;
      }
      const L = window.L;
      if (!L) {
        pollId = window.setTimeout(initMap, 90);
        return;
      }

      const map = L.map(ref.current, {
        center: [19.2, -103.85],
        zoom: 9,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom: 19,
        opacity: 0.85,
      }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);

      const nextMarkers: Record<string, LeafletMarker> = {};
      for (const branch of branches) {
        const icon = L.divIcon({
          className: "yt-pin",
          html: `<div class="yt-pin-dot" data-id="${branch.id}"><span class="yt-pin-core"></span></div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });
        const marker = L.marker([branch.lat, branch.lng], { icon }).addTo(map);
        marker.on("click", () => {
          onSelectRef.current(branch.id);
        });
        marker.bindTooltip(branch.name, {
          direction: "top",
          offset: [0, -12],
          className: "yt-tip",
        });
        nextMarkers[branch.id] = marker;
      }
      markersRef.current = nextMarkers;

      const featureGroup = L.featureGroup(Object.values(nextMarkers));
      map.fitBounds(featureGroup.getBounds().pad(0.25));
    };

    initMap();

    return () => {
      disposed = true;
      if (pollId !== null) {
        window.clearTimeout(pollId);
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = {};
    };
  }, [branches]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    for (const [id, marker] of Object.entries(markersRef.current)) {
      const markerEl = marker.getElement();
      if (!markerEl) continue;
      const dot = markerEl.querySelector(".yt-pin-dot");
      if (!dot) continue;

      if (id === selectedId) {
        dot.classList.add("active");
        const selectedBranch = branches.find((branch) => branch.id === id);
        if (
          selectedBranch &&
          Number.isFinite(selectedBranch.lat) &&
          Number.isFinite(selectedBranch.lng)
        ) {
          try {
            map.invalidateSize?.(false);
            const currentZoom = map.getZoom();
            const targetZoom = Number.isFinite(currentZoom)
              ? Math.max(currentZoom, 12)
              : 12;
            map.flyTo([selectedBranch.lat, selectedBranch.lng], targetZoom, {
              duration: 0.6,
            });
          } catch (error) {
            console.warn("[BranchMap] flyTo failed", error);
          }
        }
      } else {
        dot.classList.remove("active");
      }
    }
  }, [branches, selectedId]);

  const resolvedMinHeight =
    typeof minHeight === "number" ? minHeight : tall ? 520 : 380;

  return (
    <>
      <div
        ref={ref}
        style={{
          width: "100%",
          height: "100%",
          minHeight: resolvedMinHeight,
          borderRadius: 14,
          overflow: "hidden",
          background: "#0A0A0A",
        }}
      />
      <style jsx global>{`
        .yt-pin {
          background: transparent !important;
          border: none !important;
        }

        .yt-pin-dot {
          width: 30px;
          height: 30px;
          border-radius: 9999px;
          background: rgba(255, 198, 0, 0.18);
          border: 2px solid #ffc600;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
          transition:
            transform 200ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 200ms,
            background 200ms;
        }

        .yt-pin-core {
          width: 10px;
          height: 10px;
          border-radius: 9999px;
          background: #ffc600;
          display: block;
          transition: all 200ms;
        }

        .yt-pin-dot:hover {
          transform: scale(1.15);
          background: rgba(255, 198, 0, 0.35);
        }

        .yt-pin-dot.active {
          background: #ffc600;
          transform: scale(1.25);
          box-shadow:
            0 0 0 5px rgba(255, 198, 0, 0.25),
            0 8px 20px rgba(255, 198, 0, 0.4);
          animation: yt-pulse 1.8s ease-out infinite;
        }

        .yt-pin-dot.active .yt-pin-core {
          background: #0f0f0f;
        }

        .yt-tip {
          background: #0f0f10 !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          color: #fff !important;
          border-radius: 8px !important;
          padding: 5px 9px !important;
          font-family: "Geist", system-ui, sans-serif !important;
          font-size: 10px !important;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase !important;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5) !important;
        }

        .yt-tip::before {
          display: none !important;
        }

        .leaflet-control-zoom {
          display: none !important;
        }

        .leaflet-control-attribution {
          display: none !important;
        }

        @keyframes yt-pulse {
          0%,
          100% {
            box-shadow:
              0 0 0 5px rgba(255, 198, 0, 0.25),
              0 8px 20px rgba(255, 198, 0, 0.4);
          }
          50% {
            box-shadow:
              0 0 0 10px rgba(255, 198, 0, 0.1),
              0 8px 20px rgba(255, 198, 0, 0.4);
          }
        }
      `}</style>
    </>
  );
}
