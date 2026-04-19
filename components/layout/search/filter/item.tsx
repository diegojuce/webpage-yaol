"use client";

import clsx from "clsx";
import type { SortFilterItem } from "lib/constants";
import { createUrl } from "lib/utils";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ListItem, PathFilterItem } from ".";

const getItemClassName = (active: boolean) =>
  clsx(
    "block w-full rounded-md py-1 text-left text-[13px] transition-colors",
    active
      ? "font-semibold text-[#ffd34a]"
      : "font-normal text-[#777] hover:text-[#b8b8b8]",
  );

const getItemLabel = (title: string, active: boolean) =>
  `${active ? "· " : ""}${title}`;

function PathFilterItem({ item }: { item: PathFilterItem }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = pathname === item.path;
  const newParams = new URLSearchParams(searchParams.toString());

  newParams.delete("q");

  return (
    <li className="flex" key={item.title}>
      {active ? (
        <p className={getItemClassName(true)}>
          {getItemLabel(item.title, true)}
        </p>
      ) : (
        <Link
          href={createUrl(item.path, newParams)}
          className={getItemClassName(false)}
        >
          {getItemLabel(item.title, false)}
        </Link>
      )}
    </li>
  );
}

function SortFilterItem({ item }: { item: SortFilterItem }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("sort") === item.slug;
  const nextParams = new URLSearchParams(searchParams.toString());

  if (item.slug && item.slug.length) {
    nextParams.set("sort", item.slug);
  } else {
    nextParams.delete("sort");
  }

  const href = createUrl(pathname, nextParams);

  return (
    <li className="flex" key={item.title}>
      {active ? (
        <p className={getItemClassName(true)}>
          {getItemLabel(item.title, true)}
        </p>
      ) : (
        <Link prefetch={false} href={href} className={getItemClassName(false)}>
          {getItemLabel(item.title, false)}
        </Link>
      )}
    </li>
  );
}

export function FilterItem({ item }: { item: ListItem }) {
  return "path" in item ? (
    <PathFilterItem item={item} />
  ) : (
    <SortFilterItem item={item} />
  );
}
