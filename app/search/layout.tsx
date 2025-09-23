import Footer from 'components/layout/footer';
import Collections from 'components/layout/search/collections';
import FilterList from 'components/layout/search/filter';
import { sorting } from 'lib/constants';
import ChildrenWrapper from './children-wrapper';
import { Suspense } from 'react';

export default function SearchLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mx-auto flex max-w-(--breakpoint-2xl) flex-col gap-6 px-4 pb-4 text-black dark:text-white">
        <div className="flex flex-col gap-4 md:items-center md:gap-6">
          <div className="w-full md:w-auto md:max-w-[220px] md:self-end">
            <FilterList list={sorting} title="Sort by" />
          </div>
        </div>
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="order-first w-full flex-none md:max-w-[180px]">
            <Collections />
          </div>
          <div className="min-h-screen w-full md:flex-1">
            <Suspense fallback={null}>
              <ChildrenWrapper>{children}</ChildrenWrapper>
            </Suspense>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
