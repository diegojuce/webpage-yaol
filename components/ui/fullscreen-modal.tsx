"use client";

import clsx from "clsx";
import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type FullscreenModalProps = {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
  className?: string;
};

const ANIMATION_MS = 300;
let scrollLockCount = 0;
let scrollLockState: {
  scrollY: number;
  bodyOverflow: string;
  bodyPosition: string;
  bodyTop: string;
  bodyWidth: string;
  bodyLeft: string;
  bodyRight: string;
  bodyOverscrollBehavior: string;
  htmlOverflow: string;
  htmlOverscrollBehavior: string;
} | null = null;

function lockPageScroll() {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  if (scrollLockCount === 0) {
    const { body, documentElement } = document;
    const scrollY = window.scrollY;

    scrollLockState = {
      scrollY,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyOverscrollBehavior: body.style.overscrollBehavior,
      htmlOverflow: documentElement.style.overflow,
      htmlOverscrollBehavior: documentElement.style.overscrollBehavior,
    };

    documentElement.style.overflow = "hidden";
    documentElement.style.overscrollBehavior = "none";

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.left = "0";
    body.style.right = "0";
    body.style.overscrollBehavior = "none";
  }

  scrollLockCount += 1;
}

function unlockPageScroll() {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  if (scrollLockCount === 0) return;

  scrollLockCount -= 1;

  if (scrollLockCount > 0 || !scrollLockState) return;

  const { body, documentElement } = document;
  const {
    scrollY,
    bodyOverflow,
    bodyPosition,
    bodyTop,
    bodyWidth,
    bodyLeft,
    bodyRight,
    bodyOverscrollBehavior,
    htmlOverflow,
    htmlOverscrollBehavior,
  } = scrollLockState;

  body.style.overflow = bodyOverflow;
  body.style.position = bodyPosition;
  body.style.top = bodyTop;
  body.style.width = bodyWidth;
  body.style.left = bodyLeft;
  body.style.right = bodyRight;
  body.style.overscrollBehavior = bodyOverscrollBehavior;
  documentElement.style.overflow = htmlOverflow;
  documentElement.style.overscrollBehavior = htmlOverscrollBehavior;

  scrollLockState = null;
  window.scrollTo(0, scrollY);
}

export function FullscreenModal({
  open,
  onClose,
  children,
  className,
}: FullscreenModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    lockPageScroll();
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      unlockPageScroll();
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!isMounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      className={clsx(
        "fixed inset-0 z-[300] flex transition-[opacity,visibility] duration-[var(--modal-duration,400ms)] ease-out",
        open
          ? "visible opacity-100 pointer-events-auto"
          : "invisible opacity-70 pointer-events-none",
      )}
      style={{ ["--modal-duration" as string]: `${ANIMATION_MS}ms` }}
    >
      <div
        aria-hidden="true"
        className={clsx(
          "absolute inset-0 bg-black/40 transition-opacity duration-[var(--modal-duration,400ms)] ease-out",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <div
        className={clsx(
          "relative z-10 flex h-full w-full transition-transform duration-[var(--modal-duration,400ms)] ease-out",
          open ? "translate-y-0" : "-translate-y-full",
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
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
