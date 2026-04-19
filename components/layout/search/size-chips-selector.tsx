"use client";

import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
  const selectedSet = new Set(selectedSizes);

  const handleToggle = (size: string) => {
    if (selectedSet.has(size)) return;

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("by", mode);
    nextParams.set("sizes", size);
    nextParams.set("availableSizes", availableSizes.join(","));

    if (mode === "measure") {
      nextParams.set("q", size);
    } else {
      nextParams.delete("q");
    }

    const nextQuery = nextParams.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {availableSizes.map((size) => {
          const isSelected = selectedSet.has(size);
          return (
            <button
              key={size}
              type="button"
              onClick={() => handleToggle(size)}
              aria-pressed={isSelected}
              className={clsx(
                "rounded-full border px-3 py-1 text-xs font-semibold transition md:text-sm",
                isSelected
                  ? "border-yellow-500 bg-yellow-500 text-black"
                  : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-500",
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
