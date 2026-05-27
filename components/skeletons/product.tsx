export default function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-(--breakpoint-2xl) mt-5 pt-20">
      <div className="flex flex-col border border-neutral-200 bg-white p-8 text-black md:p-12 lg:flex-row lg:gap-8 dark:border-neutral-200 dark:bg-white">
        <div className="h-full w-full basis-full lg:basis-3/6">
          <div className="relative aspect-square h-full max-h-[550px] w-full animate-pulse overflow-hidden rounded-lg bg-neutral-200" />
          <div className="mt-3 flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-16 w-16 flex-none animate-pulse rounded-lg bg-neutral-200"
              />
            ))}
          </div>
        </div>

        <div className="basis-full lg:basis-3/6">
          <div className="mb-6 flex flex-col border-b border-neutral-200 pb-6">
            <div className="h-7 w-3/4 animate-pulse rounded bg-neutral-200" />
            <div className="mt-4 h-10 w-32 animate-pulse rounded-full bg-neutral-200" />
          </div>

          <div className="mb-8 space-y-4">
            <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-10 w-20 animate-pulse rounded-full bg-neutral-200"
                />
              ))}
            </div>
          </div>

          <div className="mb-6 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-neutral-200" />
            <div className="h-3 w-full animate-pulse rounded bg-neutral-200" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-200" />
          </div>

          <div className="h-12 w-full animate-pulse rounded-full bg-neutral-200" />
        </div>
      </div>

      <div className="py-8">
        <div className="mb-4 h-7 w-56 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <ul className="flex w-full gap-4 overflow-x-auto pt-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <li
              key={index}
              className="aspect-square w-full flex-none min-[475px]:w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
            >
              <div className="h-full w-full animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
