import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import Collections from "components/layout/search/collections";
import FilterList from "components/layout/search/filter";
import { defaultSort, sorting } from "lib/constants";
import { getProducts } from "lib/shopify";

export const metadata = {
  title: "Search",
  description: "Search for products in the store.",
};

export default async function SearchPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const { sort, q: searchValue } = (searchParams || {}) as {
    [key: string]: string | undefined;
  };
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  const products = await getProducts({ sortKey, reverse, query: searchValue });
  const resultsText = products.length > 1 ? "results" : "result";
  const hasProducts = products.length > 0;

  return (
    <div className="mx-auto w-full max-w-(--breakpoint-2xl) px-4 pb-10 text-black dark:text-white mt-10">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full flex-none lg:max-w-[240px]">
          <div className="space-y-8 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:sticky lg:top-24">
            <FilterList list={sorting} title="Sort by" />
            <Collections />
          </div>
        </aside>
        <div className="flex-1">
          {searchValue ? (
            <p className="mb-4 text-sm md:text-base">
              {hasProducts
                ? `Showing ${products.length} ${resultsText} for `
                : "There are no products that match "}
              <span className="font-semibold">&quot;{searchValue}&quot;</span>
            </p>
          ) : null}
          {hasProducts ? (
            <Grid className="grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <ProductGridItems products={products} />
            </Grid>
          ) : (
            <div className="flex min-h-[240px] items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-center text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
              <p>
                {searchValue
                  ? "Try adjusting your filters or search term to find what you're looking for."
                  : "We couldn't find any products to display right now."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
