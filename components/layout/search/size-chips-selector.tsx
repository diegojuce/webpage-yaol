"use client";

import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type SizeChipsSelectorProps = {
  mode: "vehicle" | "measure";
  selectedSizes: string[];
  availableSizes: string[];
  className?: string;
};

export default function SizeChipsSelector({
  mode,
  selectedSizes,
  availableSizes,
  className,
}: SizeChipsSelectorProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const selectedSet = new Set(selectedSizes);

  const orderedSelected = availableSizes.filter((size) =>
    selectedSet.has(size),
  );

  const handleToggle = (size: string) => {
    const isSelected = selectedSet.has(size);
    if (isSelected && orderedSelected.length <= 1) return;

    const nextSelectedSet = new Set(orderedSelected);

    if (isSelected) {
      nextSelectedSet.delete(size);
    } else {
      nextSelectedSet.add(size);
    }

    const nextSelected = availableSizes.filter((item) =>
      nextSelectedSet.has(item),
    );

    if (nextSelected.length === 0) return;

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("by", mode);
    nextParams.set("sizes", nextSelected.join(","));
    nextParams.set("availableSizes", availableSizes.join(","));

    if (mode === "measure") {
      nextParams.set("q", nextSelected[0] ?? "");
    } else {
      nextParams.delete("q");
    }

    const nextQuery = nextParams.toString();
    startTransition(() => {
      router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    });
  };

  return (
    <div
      className={clsx(
        "relative transition-opacity duration-200",
        isPending && "opacity-70",
        className,
      )}
      aria-busy={isPending}
    >
      {isPending ? (
        <div className="pointer-events-none absolute right-0 top-0 z-10 flex items-center gap-1 rounded-full bg-white/85 px-2 py-1 text-[11px] text-neutral-600 shadow-sm dark:bg-neutral-900/85 dark:text-neutral-300">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-300 border-t-yellow-500 dark:border-neutral-600 dark:border-t-yellow-500" />
          Actualizando
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {availableSizes.map((size) => {
          const isSelected = selectedSet.has(size);
          return (
            <button
              key={size}
              type="button"
              onClick={() => handleToggle(size)}
              disabled={isPending}
              aria-pressed={isSelected}
              className={clsx(
                "rounded-full border px-3 py-1 text-xs font-semibold transition md:text-sm",
                isSelected
                  ? "border-yellow-500 bg-yellow-500 text-black"
                  : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 disabled:cursor-not-allowed dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-500",
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
