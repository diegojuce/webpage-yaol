"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, MouseEvent, useEffect, useRef, useState } from "react";

type SearchProps = {
  className?: string;
};

export default function Search({ className }: SearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState(
    () => Boolean(searchParams?.get("q")),
  );

  useEffect(() => {
    if (searchParams?.get("q")) {
      setExpanded(true);
    }
  }, [searchParams]);

  const handleIconClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!expanded) {
      event.preventDefault();
      setExpanded(true);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const handleBlur = () => {
    const query = inputRef.current?.value.trim();

    if (!query) {
      setExpanded(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const value = formData.get("q");
    const query = typeof value === "string" ? value.trim() : "";

    if (!query) {
      router.push("/search");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx(
        "relative w-full lg:w-80 xl:w-full",
        className,
      )}
    >
      <div
        className={clsx(
          "hidden md:flex relative ml-auto  h-10 items-center overflow-hidden rounded-lg border-2 bg-white transition-[width] duration-200 dark:border-neutral-800 dark:bg-transparent",
          expanded ? "w-full" : "w-10",
        )}
      >
        <input
          key={searchParams?.get("q")}
          type="text"
          name="q"
          placeholder="Escribe tu medida"
          autoComplete="off"
          enterKeyHint="search"
          defaultValue={searchParams?.get("q") || ""}
          ref={inputRef}
          onBlur={handleBlur}
          onFocus={() => setExpanded(true)}
          className={clsx(
            "h-full bg-transparent text-sm text-black placeholder:text-neutral-500 md:text-sm border-none appearance-none focus:outline-none focus:ring-0 transition-[width,opacity,padding] duration-200 dark:text-black dark:placeholder:text-black",
            expanded
              ? "w-full px-4 pr-10 opacity-100"
              : "pointer-events-none w-0 px-0 opacity-0",
          )}
        />
        <button
          type="submit"
          aria-label="Buscar"
          onClick={handleIconClick}
          className="absolute right-0 top-0 flex h-full w-10 items-center justify-center rounded-r-lg text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
          aria-expanded={expanded}
        >
          <MagnifyingGlassIcon className="text-black h-4" />
        </button>
      </div>
    </form>
  );
}

type SearchSkeletonProps = {
  className?: string;
};

export function SearchSkeleton({ className }: SearchSkeletonProps) {
  return (
    <form
      className={clsx(
        "relative w-full lg:w-80 xl:w-full",
        className,
      )}
    >
      <div className="relative ml-auto flex h-10 w-10 items-center rounded-lg border-2 bg-white opacity-70 dark:border-neutral-800 dark:bg-transparent">
        <div className="absolute right-0 top-0 flex h-full w-10 items-center justify-center">
          <MagnifyingGlassIcon className="h-4" />
        </div>
      </div>
    </form>
  );
}
