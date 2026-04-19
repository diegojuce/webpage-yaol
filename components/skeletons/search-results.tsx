import Grid from "components/grid";

export default function SearchResultsSkeleton() {
  return (
    <div className="mx-auto mt-35 w-full max-w-(--breakpoint-2xl) px-4 pb-10 text-black dark:text-white">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full flex-none lg:max-w-[240px]">
          <div className="mb-3 mt-15 hidden rounded-lg border border-neutral-200 bg-white px-3 pb-3 pt-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 md:block">
            <div className="space-y-3">
              <div className="h-4 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-10 w-full animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-10 w-full animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-10 w-full animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-10 w-full animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
          <div className="hidden space-y-8 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 md:block">
            <div className="space-y-3">
              <div className="h-3 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-3 w-36 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-3 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
            <div className="space-y-3">
              <div className="h-3 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-3 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-3 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
        </aside>
        <div className="flex-1">
          <div className="mb-4 h-5 w-72 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="mb-5 flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-8 w-24 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800"
              />
            ))}
          </div>
          <Grid className="grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-3">
            {Array.from({ length: 12 }).map((_, index) => (
              <Grid.Item
                key={index}
                className="aspect-[3/4] animate-pulse bg-neutral-100 dark:bg-neutral-800"
              />
            ))}
          </Grid>
        </div>
      </div>
    </div>
  );
}
