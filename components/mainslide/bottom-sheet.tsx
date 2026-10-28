"use client";

import clsx from "clsx";
import { lockPageScroll, unlockPageScroll } from "components/ui/fullscreen-modal";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

// Arrastre hacia abajo para cerrar: distancia o velocidad mínimas.
const DISMISS_DISTANCE = 90;
const DISMISS_VELOCITY = 0.5; // px/ms

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  label: string;
  /** Va junto a la barra: también sirve para arrastrar y cerrar. */
  header?: ReactNode;
  children: ReactNode;
};

/** Panel que sube desde abajo (celular). Se cierra deslizando la barra o tocando fuera. */
export function BottomSheet({
  open,
  onClose,
  label,
  header,
  children,
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [dragY, setDragY] = useState(0);
  const drag = useRef<{ startY: number; startTime: number } | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    lockPageScroll();
    return unlockPageScroll;
  }, [open]);

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
        aria-label={label}
        className={clsx(
          "relative w-full rounded-t-[24px] border-t border-white/10 bg-[#161617] px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] text-white ease-out",
          dragY === 0 && "transition-transform duration-300",
          open ? "translate-y-0" : "translate-y-full"
        )}
        style={{
          fontFamily: "var(--font-geist-sans, system-ui)",
          ...(dragY > 0 ? { transform: `translateY(${dragY}px)` } : {}),
        }}
      >
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
          {header ? <div className="mt-4">{header}</div> : null}
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
