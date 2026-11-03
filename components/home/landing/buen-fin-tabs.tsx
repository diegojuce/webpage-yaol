"use client";

import clsx from "clsx";
import Link from "next/link";
import { useId, useRef, useState, type ReactNode } from "react";

type Tab = { value: string; label: string; seeMore: string; href: string };

// Pestañas del Buen Fin. Los carruseles llegan ya renderizados desde el
// servidor; aquí solo se elige cuál se ve y se mueven con las flechas.
export function BuenFinTabs({
  tabs,
  panels,
}: {
  tabs: Tab[];
  panels: ReactNode[];
}) {
  const [active, setActive] = useState(0);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const baseId = useId();
  const current = tabs[active] ?? tabs[0]!;

  const scrollBy = (direction: 1 | -1) => {
    const list = panelRefs.current[active]?.querySelector("ul");
    if (!list) return;
    list.scrollBy({ left: direction * list.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Tipo de vehículo"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((tab, i) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.value}`}
              aria-selected={i === active}
              aria-controls={`${baseId}-panel-${tab.value}`}
              onClick={() => setActive(i)}
              className={clsx(
                "shrink-0 rounded-full border px-5 py-2 text-sm font-extrabold uppercase tracking-[0.06em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd34a]",
                i === active
                  ? "border-[#ffd34a] bg-[#ffd34a] text-[#0f0f0f]"
                  : "border-[#3a3a3a] bg-transparent text-[#e5e5e5] hover:border-[#ffd34a]",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ArrowButton label="Anteriores" onClick={() => scrollBy(-1)}>
            ←
          </ArrowButton>
          <ArrowButton label="Siguientes" onClick={() => scrollBy(1)}>
            →
          </ArrowButton>
          <Link
            href={current.href}
            prefetch={false}
            className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#ffd34a] underline-offset-4 hover:underline focus-visible:underline"
          >
            {current.seeMore}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {panels.map((panel, i) => {
        const tab = tabs[i]!;
        return (
          <div
            key={tab.value}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            role="tabpanel"
            id={`${baseId}-panel-${tab.value}`}
            aria-labelledby={`${baseId}-tab-${tab.value}`}
            hidden={i !== active}
          >
            {panel}
          </div>
        );
      })}
    </div>
  );
}

function ArrowButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="hidden h-10 w-10 items-center justify-center rounded-full border border-[#3a3a3a] text-lg font-bold text-white transition-colors hover:border-[#ffd34a] hover:text-[#ffd34a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd34a] md:inline-flex"
    >
      {children}
    </button>
  );
}
