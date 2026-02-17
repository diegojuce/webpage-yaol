"use client";

import { Combobox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

type SelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
};

function SelectField({
  label,
  value,
  placeholder,
  options,
  onChange,
}: SelectFieldProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = normalizedQuery
    ? options.filter((option) => option.toLowerCase().includes(normalizedQuery))
    : options;

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
        {label}
      </label>
      <Combobox
        value={value}
        onChange={(selected: string) => {
          onChange(selected);
          setQuery("");
        }}
        immediate
      >
        <div className="relative">
          <div className="group flex w-full items-center justify-between gap-3 rounded-2xl border  bg-neutral-200 px-4 py-3 text-left text-sm text-white hover:border-yellow-400">
            <Combobox.Input
              className={clsx(
                "w-full appearance-none group-hover:placeholder:text-yellow-600 focus:placeholder:text-neutral-600 border-none bg-transparent text-sm outline-none ring-0 focus:!border-none focus:!outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0",
                value ? "text-black" : "text-black",
              )}
              displayValue={(selected: string) => selected || ""}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
              autoComplete="off"
            />
            <Combobox.Button className="flex items-center justify-center focus:!outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0">
              <ChevronUpDownIcon className="h-4 w-4 text-neutral-400" />
            </Combobox.Button>
          </div>
          <Combobox.Options className="absolute  top-full mt-2  z-30 max-h-64 w-full overflow-auto rounded-xl  border border-neutral-700  bg-neutral-900/95 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
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

export function WelcomeModalContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SearchTab>("measure");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [rim, setRim] = useState("");

  const [carBrand, setCarBrand] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carYear, setCarYear] = useState("");

  const canSearchByMeasure = Boolean(width && height && rim);
  const formattedMeasure = `${width}/${height} R${rim}`;

  const handleSearch = () => {
    if (activeTab !== "measure" || !canSearchByMeasure) return;
    router.push(`/search?q=${encodeURIComponent(formattedMeasure)}`);
  };

  return (
    <div className="flex h-full w-full flex-col gap-8 px-6 py-10 md:px-12 lg:px-20">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-neutral-500">
          Busca tus llantas
        </p>
        <h1 className="text-xl md:text-3xl font-bold leading-tight text-neutral-900 md:text-4xl">
          Encuentra rápido por medida o por modelo de auto
        </h1>
      </header>

      <section className="grid flex-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
            Tipo de búsqueda
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("measure")}
              className={clsx(
                "rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition",
                activeTab === "measure"
                  ? "border-yellow-500 bg-yellow-500 text-black"
                  : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400",
              )}
            >
              Buscar por medida
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("vehicle")}
              className={clsx(
                "rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition",
                activeTab === "vehicle"
                  ? "border-yellow-500 bg-yellow-500 text-black"
                  : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400",
              )}
            >
              Buscar por modelo de auto
            </button>
          </div>
        </aside>

        <article className="flex flex-col md:w-1/3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-rows-3">
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

          <div className="mt-auto pt-8">
            {activeTab === "measure" ? (
              <button
                type="button"
                onClick={handleSearch}
                disabled={!canSearchByMeasure}
                className={clsx(
                  "w-full rounded-full px-6 py-3 text-sm font-semibold transition",
                  canSearchByMeasure
                    ? "bg-black text-white hover:bg-neutral-800"
                    : "cursor-not-allowed bg-neutral-200 text-neutral-500",
                )}
              >
                Buscar
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-full bg-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-500"
              >
                Buscar (próximamente por auto)
              </button>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
