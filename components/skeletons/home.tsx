const pulseBlock =
  "animate-pulse rounded-xl bg-neutral-800/70 dark:bg-neutral-800/60";

export function WelcomeSkeleton() {
  const offset = "7rem";

  return (
    <section
      aria-hidden="true"
      className="relative isolate w-full overflow-hidden bg-neutral-900"
      style={{
        marginTop: `var(--masthead-offset, ${offset})`,
        height: `calc(100dvh - var(--masthead-offset, ${offset}))`,
        maxHeight: `calc(100dvh - var(--masthead-offset, ${offset}))`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-800 via-neutral-900 to-black animate-pulse" />
      <div className="relative z-10 flex h-full flex-col items-center justify-end gap-6 px-6 pb-12 md:px-16">
        <div className="flex w-full flex-col items-center gap-6">
          <div className="flex items-center justify-center gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`welcome-pill-${index}`}
                className="h-3 w-16 overflow-hidden rounded-full bg-neutral-800/80"
              >
                <div className="h-full w-full animate-pulse bg-neutral-700/80" />
              </div>
            ))}
            <div className="ml-2 h-8 w-8 rounded-full bg-neutral-800/80 animate-pulse" />
          </div>
          <div className="flex w-full max-w-4xl justify-center">
            <div className="h-14 w-full rounded-full bg-neutral-800/80 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}

function GridCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/80 via-neutral-950/60 to-black/70 animate-pulse" />
      <div className="relative flex h-full flex-col justify-end gap-3 p-6">
        <div className="h-8 w-2/3 rounded-lg bg-neutral-800/80 animate-pulse" />
        <div className="h-4 w-3/4 rounded bg-neutral-800/80 animate-pulse" />
        <div className="mt-1 h-4 w-1/2 rounded bg-neutral-800/60 animate-pulse" />
        <div className="mt-4 flex items-center gap-2">
          <div className="h-9 w-28 rounded-full bg-neutral-800/80 animate-pulse" />
          <div className="h-9 w-9 rounded-full bg-neutral-800/80 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function RelevantesSkeleton() {
  return (
    <section className="flex w-full justify-center bg-[#0f0f0f]">
      <div className="my-20 grid w-full grid-cols-2 grid-rows-3 gap-4 px-5 md:px-16 lg:grid-cols-4">
        <GridCardSkeleton className="min-h-[12rem]" />
        <GridCardSkeleton className="min-h-[12rem]" />
        <GridCardSkeleton className="col-span-2 row-span-2 min-h-[24rem]" />
        <GridCardSkeleton className="col-span-2 min-h-[12rem]" />
        <GridCardSkeleton className="min-h-[12rem]" />
        <GridCardSkeleton className="min-h-[12rem]" />
        <GridCardSkeleton className="min-h-[12rem]" />
        <GridCardSkeleton className="min-h-[12rem]" />
      </div>
    </section>
  );
}

export function FooterSkeleton() {
  return (
    <footer className="text-sm text-neutral-500 dark:text-neutral-400">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 border-t border-neutral-800 px-6 py-12 md:flex-row md:gap-12 md:px-4 min-[1320px]:px-0">
        <div className={`h-12 w-12 ${pulseBlock}`} />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`footer-line-${index}`}
              className="h-4 w-40 rounded bg-neutral-800/80 animate-pulse"
            />
          ))}
        </div>
      </div>
      <div className="border-t border-neutral-800 py-6 text-sm">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 px-4 md:flex-row md:gap-0 md:px-4 min-[1320px]:px-0">
          <div className="h-4 w-64 rounded bg-neutral-800/80 animate-pulse" />
          <hr className="mx-4 hidden h-4 w-[1px] border-l border-neutral-700 md:inline-block" />
          <div className="h-4 w-56 rounded bg-neutral-800/80 animate-pulse" />
          <div className="md:ml-auto h-4 w-48 rounded bg-neutral-800/80 animate-pulse" />
        </div>
      </div>
    </footer>
  );
}
