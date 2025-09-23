'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'next/navigation';

export default function Search() {
  const searchParams = useSearchParams();

  return (
    <form action="/search" method="GET" className="w-max-[550px] relative w-full lg:w-80 xl:w-full">
      <input
        key={searchParams?.get('q')}
        type="text"
        name="q"
        placeholder="Escribe tu medida. Ej. 205/55 R16"
        autoComplete="off"
        defaultValue={searchParams?.get('q') || ''}
        className="text-md w-full rounded-lg border border-yellow-500 bg-white px-4 py-2 text-yellow-500 placeholder:text-yellow-400 md:text-sm dark:border-yellow-300 dark:bg-transparent dark:text-yellow-300 dark:placeholder:text-yellow-200"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="absolute right-0 top-0 mr-3 flex h-full items-center text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
      >
        <MagnifyingGlassIcon className="h-4" />
      </button>
    </form>
  );
}

export function SearchSkeleton() {
  return (
    <form className="w-max-[550px] relative w-full lg:w-80 xl:w-full">
      <input
        placeholder="Search for products..."
        className="w-full rounded-lg border border-yellow-500 bg-white px-4 py-2 text-sm text-yellow-500 placeholder:text-yellow-400 dark:border-yellow-300 dark:bg-transparent dark:text-yellow-300 dark:placeholder:text-yellow-200"
      />
      <div className="absolute right-0 top-0 mr-3 flex h-full items-center">
        <MagnifyingGlassIcon className="h-4" />
      </div>
    </form>
  );
}
