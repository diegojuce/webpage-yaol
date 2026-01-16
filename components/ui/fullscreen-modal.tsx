"use client";

import clsx from "clsx";
import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

type FullscreenModalProps = {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
  className?: string;
};

const ANIMATION_MS = 300;

export function FullscreenModal({ open, onClose, children, className }: FullscreenModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      className={clsx(
        "fixed inset-0 z-[300] flex transition-[opacity,visibility] duration-[var(--modal-duration,400ms)] ease-out",
        open ? "visible opacity-100 pointer-events-auto" : "invisible opacity-70 pointer-events-none"
      )}
      style={{ ["--modal-duration" as string]: `${ANIMATION_MS}ms` }}
    >
      <div
        aria-hidden="true"
        className={clsx(
          "absolute inset-0 bg-black/40 transition-opacity duration-[var(--modal-duration,400ms)] ease-out",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <div
        className={clsx(
          "relative z-10 flex h-full w-full transition-transform duration-[var(--modal-duration,400ms)] ease-out",
          open ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <button
          type="button"
          aria-label="Cerrar modal"
          onClick={onClose}
          className="absolute right-6 top-6 z-20 rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm font-medium text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50"
        >
          Cerrar
        </button>
        <div
          className={clsx(
            "relative z-10 flex h-full w-full flex-col overflow-auto bg-white shadow-2xl",
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
