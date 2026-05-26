"use client";

import NextImage, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

// Vercel's image optimizer returns HTTP 402 once the monthly optimization
// quota is exhausted, which leaves <Image> showing nothing. This wrapper falls
// back to the original (unoptimized) source so an image is always shown.
//
// Once a 402 is confirmed, optimization is skipped for the rest of the session
// so every remaining image doesn't first fire a request that's guaranteed to
// fail.
const FLAG_KEY = "next-image-optimization-disabled";

let optimizationDisabled = false;

function persistDisabled() {
  optimizationDisabled = true;
  try {
    window.sessionStorage.setItem(FLAG_KEY, "1");
  } catch {
    // sessionStorage unavailable (private mode, etc.) — in-memory flag still holds.
  }
}

function readPersistedFlag() {
  if (optimizationDisabled) return true;
  try {
    return window.sessionStorage.getItem(FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

export default function SafeImage({ onError, unoptimized, ...props }: ImageProps) {
  const [fallback, setFallback] = useState(false);

  // Read the session flag after mount to avoid an SSR/hydration mismatch.
  useEffect(() => {
    if (readPersistedFlag()) setFallback(true);
  }, []);

  return (
    <NextImage
      {...props}
      unoptimized={unoptimized || fallback}
      onError={(event) => {
        const failedSrc =
          event.currentTarget.currentSrc || event.currentTarget.src;

        // Only disable optimization session-wide when the failure is actually a
        // 402 from the optimizer, not a genuinely broken source image.
        if (failedSrc.includes("/_next/image")) {
          fetch(failedSrc)
            .then((res) => {
              if (res.status === 402) persistDisabled();
            })
            .catch(() => {});
        }

        // Always retry this image unoptimized so it still renders.
        setFallback(true);
        onError?.(event);
      }}
    />
  );
}
