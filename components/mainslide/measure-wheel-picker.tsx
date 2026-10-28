"use client";

import clsx from "clsx";
import { closestValue, tireHeights, tireRims, tireWidths } from "lib/tire-sizes";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

// Rueda tipo temporizador de iOS para elegir ancho/alto/rin en celular.
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const SETTLE_MS = 120;
export const DEFAULT_MEASURE = { width: 205, height: 55, rim: 16 };

export type Measure = { width: number; height: number; rim: number };

/** Ajusta alto y rin para que la medida exista (el ancho manda, luego el alto). */
export function fitMeasure(width: number, height: number, rim: number): Measure {
  const heights = tireHeights(width);
  const nextHeight = heights.includes(height) ? height : closestValue(heights, height);
  const rims = tireRims(width, nextHeight);
  const nextRim = rims.includes(rim) ? rim : closestValue(rims, rim);
  return { width, height: nextHeight, rim: nextRim };
}

type WheelColumnProps = {
  label: string;
  options: number[];
  value: number;
  onChange: (value: number) => void;
};

function WheelColumn({ label, options, value, onChange }: WheelColumnProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [liveIndex, setLiveIndex] = useState(() =>
    Math.max(0, options.indexOf(value))
  );

  // Coloca la rueda en el valor actual (al abrir o cuando cambian las opciones).
  useLayoutEffect(() => {
    const index = Math.max(0, options.indexOf(value));
    setLiveIndex(index);
    ref.current?.scrollTo({ top: index * ITEM_HEIGHT });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.join(","), value]);

  useEffect(
    () => () => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
    },
    []
  );

  const indexFromScroll = () => {
    const top = ref.current?.scrollTop ?? 0;
    return Math.min(options.length - 1, Math.max(0, Math.round(top / ITEM_HEIGHT)));
  };

  const handleScroll = () => {
    setLiveIndex(indexFromScroll());
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const next = options[indexFromScroll()];
      if (next !== undefined && next !== value) onChange(next);
    }, SETTLE_MS);
  };

  return (
    <div className="min-w-0 flex-1">
      <div
        ref={ref}
        role="listbox"
        aria-label={label}
        onScroll={handleScroll}
        className="relative w-full snap-y snap-mandatory overflow-y-scroll overscroll-contain [&::-webkit-scrollbar]:hidden"
        style={{
          height: ITEM_HEIGHT * VISIBLE_ITEMS,
          paddingBlock: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
          scrollbarWidth: "none",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, #000 35%, #000 65%, transparent)",
          maskImage:
            "linear-gradient(to bottom, transparent, #000 35%, #000 65%, transparent)",
        }}
      >
        {options.map((option, index) => (
          <button
            key={option}
            type="button"
            role="option"
            aria-selected={index === liveIndex}
            onClick={() =>
              ref.current?.scrollTo({
                top: index * ITEM_HEIGHT,
                behavior: "smooth",
              })
            }
            className={clsx(
              "flex w-full snap-center items-center justify-center text-[22px] tabular-nums transition-colors",
              index === liveIndex
                ? "font-bold text-white"
                : "font-medium text-white/40"
            )}
            style={{ height: ITEM_HEIGHT }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Las tres ruedas (ancho, alto, rin) con la banda de selección al centro. */
export function MeasureWheels({
  value,
  onChange,
}: {
  value: Measure;
  onChange: (measure: Measure) => void;
}) {
  const widths = useMemo(() => tireWidths(), []);
  const heights = useMemo(() => tireHeights(value.width), [value.width]);
  const rims = useMemo(
    () => tireRims(value.width, value.height),
    [value.width, value.height]
  );

  return (
    <div>
      <div className="flex gap-2">
        {["Ancho", "Alto", "Rin"].map((label) => (
          <span
            key={label}
            className="flex-1 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-white/55"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="relative mt-2 flex gap-2">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 rounded-xl border border-white/10 bg-white/[0.06]"
          style={{
            top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
            height: ITEM_HEIGHT,
          }}
        />
        <WheelColumn
          label="Ancho"
          options={widths}
          value={value.width}
          onChange={(width) => onChange(fitMeasure(width, value.height, value.rim))}
        />
        <WheelColumn
          label="Alto"
          options={heights}
          value={value.height}
          onChange={(height) =>
            onChange(fitMeasure(value.width, height, value.rim))
          }
        />
        <WheelColumn
          label="Rin"
          options={rims}
          value={value.rim}
          onChange={(rim) => onChange({ ...value, rim })}
        />
      </div>
    </div>
  );
}
