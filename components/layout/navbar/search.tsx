"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent } from "react";

type SearchProps = {
  className?: string;
};

export default function Search({ className }: SearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

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
        "w-max-[550px] relative w-full lg:w-80 xl:w-full",
        className,
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
        className="text-sm w-full rounded-lg border-2 bg-white px-4 py-2 text-black placeholder:text-neutral-500 md:text-sm focus:!border-white dark:focus:!border-black focus:outline-none focus:ring-0 transition-colors duration-150 dark:border-neutral-800 dark:bg-transparent dark:text-black dark:placeholder:text-black"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="absolute right-0 top-0 mr-3 flex h-full items-center text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
      >
        <MagnifyingGlassIcon className="text-black h-4" />
      </button>
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
        "w-max-[550px] relative w-full lg:w-80 xl:w-full",
        className,
      )}
    >
      <input
        placeholder="Buscar productos..."
        className="w-full rounded-lg border bg-white px-4 py-2 text-sm text-black placeholder:text-neutral-500 focus:!border-white dark:focus:!border-white focus:outline-none focus:ring-0 transition-colors duration-150 dark:border-neutral-800 dark:bg-transparent dark:text-white dark:placeholder:text-neutral-400"
      />
      <div className="absolute right-0 top-0 mr-3 flex h-full items-center">
        <MagnifyingGlassIcon className="h-4" />
      </div>
    </form>
  );
}
