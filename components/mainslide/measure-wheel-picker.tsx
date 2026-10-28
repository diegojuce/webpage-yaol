"use client";

import clsx from "clsx";
import { closestValue, tireHeights, tireRims, tireWidths } from "lib/tire-sizes";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { createPortal } from "react-dom";

// Rueda tipo temporizador de iOS para elegir ancho/alto/rin en celular.
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const SETTLE_MS = 120;
const DEFAULT_MEASURE = { width: 205, height: 55, rim: 16 };
// Arrastre hacia abajo para cerrar: distancia o velocidad mínimas.
const DISMISS_DISTANCE = 90;
const DISMISS_VELOCITY = 0.5; // px/ms

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

type MeasureWheelSheetProps = {
  open: boolean;
  initial: Partial<Measure>;
  onClose: () => void;
  onConfirm: (measure: Measure) => void;
  buttonClassName: string;
};

export function MeasureWheelSheet({
  open,
  initial,
  onClose,
  onConfirm,
  buttonClassName,
}: MeasureWheelSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState<Measure>(DEFAULT_MEASURE);
  const [dragY, setDragY] = useState(0);
  const drag = useRef<{ startY: number; startTime: number } | null>(null);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    drag.current = { startY: event.clientY, startTime: event.timeStamp };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setDragY(Math.max(0, event.clientY - drag.current.startY));
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const distance = event.clientY - drag.current.startY;
    const elapsed = Math.max(1, event.timeStamp - drag.current.startTime);
    drag.current = null;
    setDragY(0);
    if (distance > DISMISS_DISTANCE || distance / elapsed > DISMISS_VELOCITY) {
      onClose();
    }
  };

  useEffect(() => setMounted(true), []);

  // Al abrir, parte de lo ya elegido (o de la medida más común).
  useEffect(() => {
    if (!open) return;
    setDraft(
      fitMeasure(
        initial.width ?? DEFAULT_MEASURE.width,
        initial.height ?? DEFAULT_MEASURE.height,
        initial.rim ?? DEFAULT_MEASURE.rim
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const widths = useMemo(() => tireWidths(), []);
  const heights = useMemo(() => tireHeights(draft.width), [draft.width]);
  const rims = useMemo(
    () => tireRims(draft.width, draft.height),
    [draft.width, draft.height]
  );

  if (!mounted) return null;

  return createPortal(
    <div
      className={clsx(
        "fixed inset-0 z-[400] flex items-end transition-[visibility] duration-300",
        open ? "visible" : "invisible pointer-events-none"
      )}
      aria-hidden={!open}
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className={clsx(
          "absolute inset-0 touch-none bg-black/60 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Elige la medida"
        className={clsx(
          "relative w-full rounded-t-[24px] border-t border-white/10 bg-[#161617] px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] text-white ease-out",
          dragY === 0 && "transition-transform duration-300",
          open ? "translate-y-0" : "translate-y-full"
        )}
        style={dragY > 0 ? { transform: `translateY(${dragY}px)` } : undefined}
      >
        {/* Barra para deslizar hacia abajo y cerrar. */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="cursor-grab touch-none select-none pb-1 pt-3"
        >
          <div
            aria-hidden="true"
            className="mx-auto h-1.5 w-11 rounded-full bg-white/25"
          />
          <p className="m-0 mt-4 text-center text-[17px] font-bold tabular-nums text-[#FFC600]">
            {draft.width}/{draft.height} R{draft.rim}
          </p>
        </div>

        <div className="mt-4 flex gap-2">
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
            value={draft.width}
            onChange={(width) => setDraft((d) => fitMeasure(width, d.height, d.rim))}
          />
          <WheelColumn
            label="Alto"
            options={heights}
            value={draft.height}
            onChange={(height) =>
              setDraft((d) => fitMeasure(d.width, height, d.rim))
            }
          />
          <WheelColumn
            label="Rin"
            options={rims}
            value={draft.rim}
            onChange={(rim) => setDraft((d) => ({ ...d, rim }))}
          />
        </div>

        <button
          type="button"
          onClick={() => onConfirm(draft)}
          className={clsx(buttonClassName, "mt-6")}
        >
          Listo
        </button>
      </div>
    </div>,
    document.body
  );
}
