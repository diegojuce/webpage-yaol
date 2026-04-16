"use client";

import { Combobox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";

type SearchTab = "measure" | "vehicle";

const createRange = (start: number, end: number, step: number): string[] =>
  Array.from({ length: Math.floor((end - start) / step) + 1 }, (_, index) =>
    String(start + index * step),
  );

const MEASURE_WIDTH_OPTIONS = createRange(135, 325, 10);
const MEASURE_HEIGHT_OPTIONS = createRange(30, 90, 5);
const MEASURE_RIM_OPTIONS = createRange(13, 25, 1);

const CAR_BRAND_OPTIONS = ["Toyota", "Nissan", "Honda", "Mazda"];
const CAR_MODEL_OPTIONS = ["Corolla", "Sentra", "Civic", "Mazda 3"];
const CAR_YEAR_OPTIONS = createRange(2015, 2026, 1);
const COMBOBOX_DEFAULT_MAX_HEIGHT = 256;
const VIEWPORT_EDGE_PADDING = 12;

type SelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
};

function parseMeasure(query: string | null) {
  if (!query) return null;
  const match = query.match(
    /^\s*(\d{2,3})\s*\/\s*(\d{2})\s*[Rr]\s*(\d{1,2})\s*$/,
  );
  if (!match) return null;

  const width = match[1] ?? "";
  const height = match[2] ?? "";
  const rim = match[3] ?? "";

  if (!width || !height || !rim) return null;

  return { width, height, rim };
}

function SelectField({
  label,
  value,
  placeholder,
  options,
  onChange,
}: SelectFieldProps) {
  const [query, setQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [optionsMaxHeight, setOptionsMaxHeight] = useState(
    COMBOBOX_DEFAULT_MAX_HEIGHT,
  );
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);

  const updateDropdownPlacement = useCallback(() => {
    if (typeof window === "undefined" || !fieldRef.current) return;

    const rect = fieldRef.current.getBoundingClientRect();
    const spaceBelow = Math.max(
      0,
      window.innerHeight - rect.bottom - VIEWPORT_EDGE_PADDING,
    );
    const spaceAbove = Math.max(0, rect.top - VIEWPORT_EDGE_PADDING);
    const shouldOpenUpward =
      spaceBelow < COMBOBOX_DEFAULT_MAX_HEIGHT && spaceAbove > spaceBelow;
    const availableSpace = shouldOpenUpward ? spaceAbove : spaceBelow;

    setOpenUpward(shouldOpenUpward);
    setOptionsMaxHeight(
      Math.min(COMBOBOX_DEFAULT_MAX_HEIGHT, Math.floor(availableSpace)),
    );
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => {
      mediaQuery.removeEventListener("change", updateIsMobile);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleViewportChange = () => {
      updateDropdownPlacement();
    };

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [updateDropdownPlacement]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = normalizedQuery
    ? options.filter((option) => option.toLowerCase().includes(normalizedQuery))
    : options;

  const handleContainerClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    if (target.closest("[data-combobox-input='true']")) {
      return;
    }

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        {label}
      </label>
      <Combobox
        value={value}
        onChange={(selected: string | null) => {
          if (!selected) return;
          onChange(selected);
          setQuery("");
        }}
        onClose={() => setQuery("")}
        immediate
      >
        <div
          className="relative"
          ref={fieldRef}
          onMouseDownCapture={updateDropdownPlacement}
        >
          <div
            className="group flex w-full items-center justify-between gap-3 rounded-md border border-neutral-300 bg-white px-3 py-2 text-left text-sm hover:border-yellow-400"
            onClick={handleContainerClick}
          >
            <Combobox.Input
              ref={inputRef}
              data-combobox-input="true"
              className={clsx(
                "w-full appearance-none border-none bg-transparent text-sm text-black outline-none ring-0 ring-offset-0 placeholder:text-neutral-500 group-hover:placeholder:text-yellow-600 [box-shadow:none!important] focus:!border-none focus:!outline-none focus:!ring-0 focus:!ring-offset-0 focus:[box-shadow:none!important] focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0 focus-visible:[box-shadow:none!important]",
              )}
              displayValue={(selected: string) => selected || ""}
              onChange={(event) => {
                if (!isMobile) {
                  setQuery(event.target.value);
                }
              }}
              onFocus={updateDropdownPlacement}
              onClick={updateDropdownPlacement}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                  updateDropdownPlacement();
                }
              }}
              placeholder={placeholder}
              autoComplete="off"
              readOnly={isMobile}
              inputMode={isMobile ? "none" : undefined}
            />
            <Combobox.Button
              data-combobox-toggle="true"
              className="pointer-events-none flex items-center justify-center focus:!outline-none focus:!ring-0 md:pointer-events-auto"
            >
              <ChevronUpDownIcon className="h-4 w-4 text-neutral-400" />
            </Combobox.Button>
          </div>
          <Combobox.Options
            className={clsx(
              "absolute z-30 w-full overflow-auto rounded-xl border border-neutral-700 bg-neutral-900/95 shadow-[0_18px_40px_rgba(0,0,0,0.45)]",
              openUpward ? "bottom-full mb-2" : "top-full mt-2",
            )}
            style={{ maxHeight: `${optionsMaxHeight}px` }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <Combobox.Option
                  key={`${label}-${option}`}
                  value={option}
                  className={({ active, selected }) =>
                    clsx(
                      "cursor-pointer px-4 py-2 text-sm transition",
                      active ? "bg-yellow-400 text-black" : "text-white",
                      selected && "font-semibold",
                    )
                  }
                >
                  {option}
                </Combobox.Option>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-neutral-400">
                Sin coincidencias
              </div>
            )}
          </Combobox.Options>
        </div>
      </Combobox>
    </div>
  );
}

export default function PanelSearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<SearchTab>("measure");

  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [rim, setRim] = useState("");

  const [carBrand, setCarBrand] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carYear, setCarYear] = useState("");

  useEffect(() => {
    const parsed = parseMeasure(searchParams.get("q"));
    if (!parsed) {
      setWidth("");
      setHeight("");
      setRim("");
      return;
    }

    setActiveTab("measure");
    setWidth(parsed.width);
    setHeight(parsed.height);
    setRim(parsed.rim);
  }, [searchParams]);

  const canSearchByMeasure = Boolean(width && height && rim);
  const formattedMeasure = `${width}/${height} R${rim}`;

  const handleSearch = () => {
    if (activeTab !== "measure" || !canSearchByMeasure) return;

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("q", formattedMeasure);
    router.push(`/search?${nextParams.toString()}`);
  };

  return (
    <article className="mb-3 relative rounded-lg border border-neutral-200 bg-white px-3 pb-3 pt-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="absolute -top-4 left-3 right-3 z-10">
        <div className="inline-flex rounded-full border border-neutral-200 bg-white p-1 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <button
            type="button"
            onClick={() => setActiveTab("measure")}
            className={clsx(
              "rounded-full px-4 py-1 text-xs font-semibold transition",
              activeTab === "measure"
                ? "bg-yellow-500 text-black"
                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
            )}
          >
            Medida
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("vehicle")}
            className={clsx(
              "rounded-full px-4 py-1 text-xs font-semibold transition",
              activeTab === "vehicle"
                ? "bg-yellow-500 text-black"
                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
            )}
          >
            Auto
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {activeTab === "measure" ? (
          <>
            <SelectField
              label="Ancho"
              value={width}
              placeholder="Selecciona ancho"
              options={MEASURE_WIDTH_OPTIONS}
              onChange={setWidth}
            />
            <SelectField
              label="Alto"
              value={height}
              placeholder="Selecciona alto"
              options={MEASURE_HEIGHT_OPTIONS}
              onChange={setHeight}
            />
            <SelectField
              label="Rin"
              value={rim}
              placeholder="Selecciona rin"
              options={MEASURE_RIM_OPTIONS}
              onChange={setRim}
            />
          </>
        ) : (
          <>
            <SelectField
              label="Marca"
              value={carBrand}
              placeholder="Selecciona marca"
              options={CAR_BRAND_OPTIONS}
              onChange={setCarBrand}
            />
            <SelectField
              label="Modelo"
              value={carModel}
              placeholder="Selecciona modelo"
              options={CAR_MODEL_OPTIONS}
              onChange={setCarModel}
            />
            <SelectField
              label="Año"
              value={carYear}
              placeholder="Selecciona año"
              options={CAR_YEAR_OPTIONS}
              onChange={setCarYear}
            />
          </>
        )}
      </div>

      <div className="mt-4">
        {activeTab === "measure" ? (
          <button
            type="button"
            onClick={handleSearch}
            disabled={!canSearchByMeasure}
            className={clsx(
              "w-full rounded-md px-4 py-2 text-sm font-semibold transition",
              canSearchByMeasure
                ? "bg-yellow-500 text-white hover:bg-neutral-800 dark:bg-yellow-500 dark:text-black dark:hover:bg-neutral-200"
                : "cursor-not-allowed bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
            )}
          >
            Buscar
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-md bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
          >
            Buscar (próximamente por auto)
          </button>
        )}
      </div>
    </article>
  );
}
