"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef } from "react";

type SearchProps = {
  className?: string;
};

export default function Search({ className }: SearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
      ref={formRef}
      onSubmit={handleSubmit}
      className={clsx("relative", className)}
    >
      <label
        className="group flex h-11 w-full cursor-text items-center gap-2.5 rounded-full border border-transparent bg-[#F5F5F5] pl-4.5 pr-2 transition-colors focus-within:border-[#0F0F0F] focus-within:bg-white hover:border-[#E5E5E5] md:w-[300px]"
      >
        <button
          type="submit"
          aria-label="Buscar"
          className="flex h-7 w-7 shrink-0 items-center justify-center text-[#9EA0A3]"
        >
          <MagnifyingGlassIcon className="h-4 w-4" />
        </button>
        <input
          key={searchParams?.get("q")}
          ref={inputRef}
          type="text"
          name="q"
          placeholder="Escribe tu medida"
          autoComplete="off"
          enterKeyHint="search"
          defaultValue={searchParams?.get("q") || ""}
          className="yt-search-input h-full w-full appearance-none border-none bg-transparent text-[13px] text-[#0F0F0F] placeholder:text-[#525252]"
        />
        <kbd
          aria-hidden="true"
          className="hidden shrink-0 items-center rounded-md border border-[#E5E5E5] bg-white px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-[#9EA0A3] md:inline-flex"
        >
          ⌘ K
        </kbd>
      </label>
    </form>
  );
}

type SearchSkeletonProps = {
  className?: string;
};

export function SearchSkeleton({ className }: SearchSkeletonProps) {
  return (
    <div
      className={clsx(
        "relative h-11 w-full animate-pulse rounded-full bg-[#F5F5F5] md:w-[300px]",
        className,
      )}
    />
  );
}
