"use client";

import { Combobox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import {
  fetchVehicleMakes,
  fetchVehicleModels,
  fetchVehicleTires,
  fetchVehicleYears,
  type VehicleMakeOption,
  type VehicleModelOption,
  type VehicleYearOption,
} from "lib/vehicle-fitment-client";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { toast } from "sonner";

type SearchTab = "measure" | "vehicle";

type SelectOption = {
  value: string;
  label: string;
};

const createRange = (start: number, end: number, step: number): string[] =>
  Array.from({ length: Math.floor((end - start) / step) + 1 }, (_, index) =>
    String(start + index * step),
  );

const toSelectOptions = (values: string[]): SelectOption[] =>
  values.map((value) => ({ value, label: value }));

const MEASURE_WIDTH_OPTIONS = toSelectOptions(createRange(135, 325, 10));
const MEASURE_HEIGHT_OPTIONS = toSelectOptions(createRange(30, 90, 5));
const MEASURE_RIM_OPTIONS = toSelectOptions(createRange(13, 25, 1));
const COMBOBOX_DEFAULT_MAX_HEIGHT = 256;
const VIEWPORT_EDGE_PADDING = 12;

type SelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
};

function SelectField({
  label,
  value,
  placeholder,
  options,
  onChange,
  disabled,
}: SelectFieldProps) {
  const [query, setQuery] = useState("");
  const [openUpward, setOpenUpward] = useState(false);
  const [optionsMaxHeight, setOptionsMaxHeight] = useState(
    COMBOBOX_DEFAULT_MAX_HEIGHT,
  );
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);

  const optionLabelByValue = useMemo(
    () => new Map(options.map((option) => [option.value, option.label])),
    [options],
  );

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
    ? options.filter((option) =>
        option.label.toLowerCase().includes(normalizedQuery),
      )
    : options;

  const handleContainerClick = (event: MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    const target = event.target as HTMLElement;

    if (target.closest("[data-combobox-input='true']")) {
      return;
    }

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
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
        disabled={disabled}
      >
        {() => (
          <div
            className="relative"
            ref={fieldRef}
            onMouseDownCapture={updateDropdownPlacement}
          >
            <div
              className={clsx(
                "group flex w-full items-center justify-between gap-3 rounded-2xl border bg-neutral-200 px-4 py-3 text-left text-sm text-white hover:border-yellow-400",
                disabled &&
                  "cursor-not-allowed bg-neutral-100 text-neutral-400",
              )}
              onClick={handleContainerClick}
            >
              <Combobox.Input
                ref={inputRef}
                data-combobox-input="true"
                className={clsx(
                  "w-full appearance-none border-none bg-transparent text-sm outline-none ring-0 group-hover:placeholder:text-yellow-600 focus:!border-none focus:!outline-none focus:!ring-0 focus:placeholder:text-neutral-600 focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0",
                  disabled
                    ? "cursor-not-allowed text-neutral-400"
                    : "text-black",
                )}
                displayValue={(selected: string) =>
                  optionLabelByValue.get(selected) ?? selected ?? ""
                }
                onChange={(event) => setQuery(event.target.value)}
                onFocus={updateDropdownPlacement}
                onClick={updateDropdownPlacement}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    updateDropdownPlacement();
                  }
                }}
                placeholder={placeholder}
                autoComplete="off"
                readOnly={Boolean(disabled)}
              />
              <Combobox.Button
                data-combobox-toggle="true"
                className="pointer-events-none flex items-center justify-center focus:!outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0 md:pointer-events-auto"
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
                    key={`${label}-${option.value}`}
                    value={option.value}
                    className={({ active, selected }) =>
                      clsx(
                        "cursor-pointer px-4 py-2 text-sm transition",
                        active ? "bg-yellow-400 text-black" : "text-white",
                        selected && "font-semibold",
                      )
                    }
                  >
                    {option.label}
                  </Combobox.Option>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-neutral-400">
                  Sin coincidencias
                </div>
              )}
            </Combobox.Options>
          </div>
        )}
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
  const [carBrandOptions, setCarBrandOptions] = useState<VehicleMakeOption[]>(
    [],
  );
  const [carModelOptions, setCarModelOptions] = useState<VehicleModelOption[]>(
    [],
  );
  const [carYearOptions, setCarYearOptions] = useState<VehicleYearOption[]>([]);

  const [isLoadingMakes, setIsLoadingMakes] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingYears, setIsLoadingYears] = useState(false);
  const [isSearchingVehicle, setIsSearchingVehicle] = useState(false);
  const [hasAttemptedMakesLoad, setHasAttemptedMakesLoad] = useState(false);

  const loadMakes = useCallback(async (silent = false) => {
    setIsLoadingMakes(true);

    try {
      const makes = await fetchVehicleMakes();
      setCarBrandOptions(makes);
    } catch (error) {
      if (!silent) {
        const message =
          error instanceof Error
            ? error.message
            : "No fue posible cargar las marcas.";
        toast.error(message);
      }
    } finally {
      setIsLoadingMakes(false);
    }
  }, []);

  const loadModels = useCallback(async (make: string, silent = false) => {
    if (!make) {
      setCarModelOptions([]);
      return;
    }

    setIsLoadingModels(true);

    try {
      const models = await fetchVehicleModels(make);
      setCarModelOptions(models);
    } catch (error) {
      setCarModelOptions([]);
      if (!silent) {
        const message =
          error instanceof Error
            ? error.message
            : "No fue posible cargar los modelos.";
        toast.error(message);
      }
    } finally {
      setIsLoadingModels(false);
    }
  }, []);

  const loadYears = useCallback(
    async (make: string, model: string, silent = false) => {
      if (!make || !model) {
        setCarYearOptions([]);
        return;
      }

      setIsLoadingYears(true);

      try {
        const years = await fetchVehicleYears(make, model);
        setCarYearOptions(years);
      } catch (error) {
        setCarYearOptions([]);
        if (!silent) {
          const message =
            error instanceof Error
              ? error.message
              : "No fue posible cargar los años.";
          toast.error(message);
        }
      } finally {
        setIsLoadingYears(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (activeTab !== "vehicle") return;
    if (carBrandOptions.length > 0 || isLoadingMakes || hasAttemptedMakesLoad) {
      return;
    }

    setHasAttemptedMakesLoad(true);
    void loadMakes(false);
  }, [
    activeTab,
    carBrandOptions.length,
    isLoadingMakes,
    hasAttemptedMakesLoad,
    loadMakes,
  ]);

  const handleSetVehicleTab = useCallback(() => {
    setActiveTab("vehicle");

    if (
      hasAttemptedMakesLoad &&
      !isLoadingMakes &&
      carBrandOptions.length === 0
    ) {
      setHasAttemptedMakesLoad(false);
    }
  }, [carBrandOptions.length, hasAttemptedMakesLoad, isLoadingMakes]);

  const handleCarBrandChange = useCallback(
    async (nextBrand: string) => {
      setCarBrand(nextBrand);
      setCarModel("");
      setCarYear("");
      setCarModelOptions([]);
      setCarYearOptions([]);
      await loadModels(nextBrand);
    },
    [loadModels],
  );

  const handleCarModelChange = useCallback(
    async (nextModel: string) => {
      setCarModel(nextModel);
      setCarYear("");
      setCarYearOptions([]);
      await loadYears(carBrand, nextModel);
    },
    [carBrand, loadYears],
  );

  const canSearchByMeasure = Boolean(width && height && rim);
  const canSearchByVehicle = Boolean(carBrand && carModel && carYear);
  const formattedMeasure = `${width}/${height} R${rim}`;
  const vehicleMakesUnavailable =
    activeTab === "vehicle" &&
    hasAttemptedMakesLoad &&
    !isLoadingMakes &&
    carBrandOptions.length === 0;

  const brandSelectOptions = useMemo<SelectOption[]>(
    () =>
      carBrandOptions.map((option) => ({
        value: option.slug,
        label: option.name,
      })),
    [carBrandOptions],
  );

  const modelSelectOptions = useMemo<SelectOption[]>(
    () =>
      carModelOptions.map((option) => ({
        value: option.slug,
        label: option.name,
      })),
    [carModelOptions],
  );

  const yearSelectOptions = useMemo<SelectOption[]>(
    () =>
      carYearOptions.map((option) => ({
        value: option.slug,
        label: option.name,
      })),
    [carYearOptions],
  );

  const handleSearchByMeasure = () => {
    if (!canSearchByMeasure) return;
    router.push(`/search?q=${encodeURIComponent(formattedMeasure)}`);
  };

  const handleSearchByVehicle = async () => {
    if (!canSearchByVehicle || isSearchingVehicle) return;

    setIsSearchingVehicle(true);

    try {
      const response = await fetchVehicleTires({
        make: carBrand,
        model: carModel,
        year: carYear,
      });

      if (!response.sizes?.length) {
        toast.error(
          "No encontramos medidas de llanta para ese auto. Intenta con otra combinación.",
        );
        return;
      }

      const nextParams = new URLSearchParams();
      nextParams.set("by", "vehicle");
      nextParams.set("make", carBrand);
      nextParams.set("model", carModel);
      nextParams.set("year", carYear);
      nextParams.set("sizes", response.sizes.join(","));
      router.push(`/search?${nextParams.toString()}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible completar la búsqueda por auto.";
      toast.error(message);
    } finally {
      setIsSearchingVehicle(false);
    }
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

      <section className="grid flex lg:flex-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
            Tipo de búsqueda
          </p>
          <div className="mt-4 flex flex-row lg:flex-col justify-between gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("measure")}
              className={clsx(
                "rounded-2xl w-full border px-4 py-3 text-left text-sm font-semibold transition",
                activeTab === "measure"
                  ? "border-yellow-500 bg-yellow-500 text-black"
                  : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400",
              )}
            >
              Medida
            </button>
            <button
              type="button"
              onClick={handleSetVehicleTab}
              className={clsx(
                "rounded-2xl w-full border px-4 py-3 text-left text-sm font-semibold transition",
                activeTab === "vehicle"
                  ? "border-yellow-500 bg-yellow-500 text-black"
                  : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400",
              )}
            >
              Auto
            </button>
          </div>
        </aside>

        <article className="flex flex-col md:w-1/3 rounded-2xl border border-neutral-200 bg-white p-5 pb-5 md:pb-5 shadow-sm">
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
                  placeholder={
                    isLoadingMakes
                      ? "Cargando marcas..."
                      : vehicleMakesUnavailable
                        ? "Configura WHEEL_SIZE_API_KEY"
                        : "Selecciona marca"
                  }
                  options={brandSelectOptions}
                  onChange={handleCarBrandChange}
                  disabled={isLoadingMakes || vehicleMakesUnavailable}
                />
                <SelectField
                  label="Modelo"
                  value={carModel}
                  placeholder={
                    !carBrand
                      ? "Selecciona marca primero"
                      : isLoadingModels
                        ? "Cargando modelos..."
                        : "Selecciona modelo"
                  }
                  options={modelSelectOptions}
                  onChange={handleCarModelChange}
                  disabled={!carBrand || isLoadingModels}
                />
                <SelectField
                  label="Año"
                  value={carYear}
                  placeholder={
                    !carModel
                      ? "Selecciona modelo primero"
                      : isLoadingYears
                        ? "Cargando años..."
                        : "Selecciona año"
                  }
                  options={yearSelectOptions}
                  onChange={setCarYear}
                  disabled={!carModel || isLoadingYears}
                />
              </>
            )}
          </div>

          {vehicleMakesUnavailable ? (
            <p className="mt-4 text-xs text-red-500">
              El buscador por auto necesita configuracion del servidor (falta
              `WHEEL_SIZE_API_KEY`).
            </p>
          ) : null}

          <div className="mt-10">
            {activeTab === "measure" ? (
              <button
                type="button"
                onClick={handleSearchByMeasure}
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
                onClick={handleSearchByVehicle}
                disabled={!canSearchByVehicle || isSearchingVehicle}
                className={clsx(
                  "w-full rounded-full px-6 py-3 text-sm font-semibold transition",
                  canSearchByVehicle && !isSearchingVehicle
                    ? "bg-black text-white hover:bg-neutral-800"
                    : "cursor-not-allowed bg-neutral-200 text-neutral-500",
                )}
              >
                {isSearchingVehicle ? "Buscando..." : "Buscar por auto"}
              </button>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
