"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type HideOnPathPrefixesProps = {
  children: ReactNode;
  prefixes: string[];
};

export function HideOnPathPrefixes({
  children,
  prefixes,
}: HideOnPathPrefixesProps) {
  const pathname = usePathname();

  const shouldHide = !!pathname
    ? prefixes.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
      )
    : false;

  if (shouldHide) {
    return null;
  }

  return <>{children}</>;
}
