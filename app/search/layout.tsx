import Footer from "components/layout/footer";
import SearchResultsSkeleton from "components/skeletons/search-results";
import { Suspense } from "react";

import ChildrenWrapper from "./children-wrapper";

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<SearchResultsSkeleton />}>
        <ChildrenWrapper>{children}</ChildrenWrapper>
      </Suspense>
      <Footer />
    </>
  );
}
