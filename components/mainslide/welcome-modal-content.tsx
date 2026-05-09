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

const toSelectOptions = (
  values: readonly (number | string)[]
): SelectOption[] =>
  values.map((value) => ({ value: String(value), label: String(value) }));

const REAL_TIRE_WIDTHS = [
  135, 145, 155, 165, 175, 185, 195, 205, 215, 225, 235, 245, 255, 265, 275,
  285, 295, 305, 315, 325,
] as const;

const REAL_TIRE_ASPECT_RATIOS = [
  25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85,
] as const;

const REAL_TIRE_RIM_SIZES = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22] as const;

const MEASURE_WIDTH_OPTIONS = toSelectOptions(REAL_TIRE_WIDTHS);
const MEASURE_HEIGHT_OPTIONS = toSelectOptions(REAL_TIRE_ASPECT_RATIOS);
const MEASURE_RIM_OPTIONS = toSelectOptions(REAL_TIRE_RIM_SIZES);

const POPULAR_MEASURES = [
  "205/55 R16",
  "195/65 R15",
  "225/45 R17",
  "185/65 R15",
  "215/60 R16",
  "235/45 R18",
];

const COMBOBOX_DEFAULT_MAX_HEIGHT = 256;
const VIEWPORT_EDGE_PADDING = 12;

const BRAND_YELLOW = "#FFCA28";

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
    COMBOBOX_DEFAULT_MAX_HEIGHT
  );
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);

  const optionLabelByValue = useMemo(
    () => new Map(options.map((option) => [option.value, option.label])),
    [options]
  );

  const updateDropdownPlacement = useCallback(() => {
    if (typeof window === "undefined" || !fieldRef.current) return;

    const rect = fieldRef.current.getBoundingClientRect();
    const spaceBelow = Math.max(
      0,
      window.innerHeight - rect.bottom - VIEWPORT_EDGE_PADDING
    );
    const spaceAbove = Math.max(0, rect.top - VIEWPORT_EDGE_PADDING);
    const shouldOpenUpward =
      spaceBelow < COMBOBOX_DEFAULT_MAX_HEIGHT && spaceAbove > spaceBelow;
    const availableSpace = shouldOpenUpward ? spaceAbove : spaceBelow;

    setOpenUpward(shouldOpenUpward);
    setOptionsMaxHeight(
      Math.min(COMBOBOX_DEFAULT_MAX_HEIGHT, Math.floor(availableSpace))
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
        option.label.toLowerCase().includes(normalizedQuery)
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
      <label className="block text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-500">
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
                "group flex w-full items-center justify-between gap-3 rounded-2xl border bg-neutral-900/60 px-5 py-3 text-left text-base transition-colors",
                "border-neutral-700 hover:border-neutral-500",
                disabled &&
                  "cursor-not-allowed border-neutral-800 bg-neutral-900/30"
              )}
              onClick={handleContainerClick}
            >
              <Combobox.Input
                ref={inputRef}
                data-combobox-input="true"
                className={clsx(
                  "w-full appearance-none border-none bg-transparent text-base font-medium outline-none ring-0 placeholder:text-neutral-500 focus:!border-none focus:!outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0",
                  disabled
                    ? "cursor-not-allowed text-neutral-600"
                    : "text-white"
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
              ></Combobox.Button>
            </div>
            <Combobox.Options
              className={clsx(
                "absolute z-30 w-full overflow-auto rounded-xl border border-neutral-700 bg-neutral-900 p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.45)]",
                openUpward ? "bottom-full mb-2" : "top-full mt-2"
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
                        "cursor-pointer rounded-lg px-4 py-3 text-sm transition",
                        selected && "font-semibold",
                        active
                          ? "bg-[#FFCA28] text-neutral-900"
                          : selected
                            ? "bg-neutral-800 text-white"
                            : "text-neutral-300"
                      )
                    }
                  >
                    {option.label}
                  </Combobox.Option>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-neutral-500">
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

type WelcomeModalContentProps = {
  initialTab?: SearchTab;
};

export function WelcomeModalContent({
  initialTab = "vehicle",
}: WelcomeModalContentProps = {}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SearchTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [rim, setRim] = useState("");

  const [carBrand, setCarBrand] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carYear, setCarYear] = useState("");
  const [carBrandOptions, setCarBrandOptions] = useState<VehicleMakeOption[]>(
    []
  );
  const [carModelOptions, setCarModelOptions] = useState<VehicleModelOption[]>(
    []
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
    []
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
    [loadModels]
  );

  const handleCarModelChange = useCallback(
    async (nextModel: string) => {
      setCarModel(nextModel);
      setCarYear("");
      setCarYearOptions([]);
      await loadYears(carBrand, nextModel);
    },
    [carBrand, loadYears]
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
    [carBrandOptions]
  );

  const modelSelectOptions = useMemo<SelectOption[]>(
    () =>
      carModelOptions.map((option) => ({
        value: option.slug,
        label: option.name,
      })),
    [carModelOptions]
  );

  const yearSelectOptions = useMemo<SelectOption[]>(
    () =>
      carYearOptions.map((option) => ({
        value: option.slug,
        label: option.name,
      })),
    [carYearOptions]
  );

  const handleApplyPopularMeasure = (value: string) => {
    const match = value.match(/(\d+)\/(\d+)\s*R(\d+)/);
    if (!match || !match[1] || !match[2] || !match[3]) return;
    setWidth(match[1]);
    setHeight(match[2]);
    setRim(match[3]);
  };

  const handleSearchByMeasure = () => {
    if (!canSearchByMeasure) return;
    const nextParams = new URLSearchParams();
    nextParams.set("q", formattedMeasure);
    nextParams.set("by", "measure");
    nextParams.set("sizes", formattedMeasure);
    nextParams.set("availableSizes", formattedMeasure);
    router.push(`/search?${nextParams.toString()}`);
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
          "No encontramos medidas de llanta para ese auto. Intenta con otra combinación."
        );
        return;
      }

      const nextParams = new URLSearchParams();
      nextParams.set("by", "vehicle");
      nextParams.set("make", carBrand);
      nextParams.set("model", carModel);
      nextParams.set("year", carYear);
      nextParams.set("sizes", response.sizes.join(","));
      nextParams.set("availableSizes", response.sizes.join(","));
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

  const eyebrow =
    activeTab === "vehicle" ? "Búsqueda por vehículo" : "Búsqueda por medida";
  const heading =
    activeTab === "vehicle"
      ? "Encuentra las llantas perfectas para tu auto."
      : "Encuentra las llantas por la medida exacta.";
  const subheading =
    activeTab === "vehicle"
      ? "Selecciona tu vehículo y te mostramos los mejores resultados."
      : "Ingresa los tres números grabados en el costado de tu llanta.";

  return (
    <div className="flex h-full w-full flex-col bg-black px-6 py-12 text-white md:px-12 md:py-16">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
        <header className="text-center">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.32em]"
            style={{ color: BRAND_YELLOW }}
          >
            {eyebrow}
          </p>
          <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-[56px]">
            {heading}
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-neutral-400 md:text-base">
            {subheading}
          </p>
        </header>

        <section className="mx-auto mt-10 w-full rounded-3xl border border-neutral-800 bg-neutral-900/40 p-5 md:p-8">
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-neutral-900/80 p-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("measure")}
              className={clsx(
                "rounded-xl px-4 py-3 text-sm font-bold tracking-tight transition",
                activeTab === "measure"
                  ? "text-neutral-900 shadow-sm"
                  : "text-neutral-400 hover:text-white"
              )}
              style={
                activeTab === "measure"
                  ? { backgroundColor: BRAND_YELLOW }
                  : undefined
              }
            >
              Por medida
            </button>
            <button
              type="button"
              onClick={handleSetVehicleTab}
              className={clsx(
                "rounded-xl px-4 py-3 text-sm font-bold tracking-tight transition",
                activeTab === "vehicle"
                  ? "text-neutral-900 shadow-sm"
                  : "text-neutral-400 hover:text-white"
              )}
              style={
                activeTab === "vehicle"
                  ? { backgroundColor: BRAND_YELLOW }
                  : undefined
              }
            >
              Por auto
            </button>
          </div>

          {activeTab === "measure" ? (
            <div className="mt-6 space-y-8">
              <div className="grid grid-cols-3 gap-3">
                <SelectField
                  label="Ancho"
                  value={width}
                  placeholder="—"
                  options={MEASURE_WIDTH_OPTIONS}
                  onChange={setWidth}
                />
                <SelectField
                  label="Alto"
                  value={height}
                  placeholder="—"
                  options={MEASURE_HEIGHT_OPTIONS}
                  onChange={setHeight}
                />
                <SelectField
                  label="Rin"
                  value={rim}
                  placeholder="—"
                  options={MEASURE_RIM_OPTIONS}
                  onChange={setRim}
                />
              </div>

              <div className="my-6">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-500">
                  Medidas populares
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {POPULAR_MEASURES.map((measure) => {
                    const isSelected =
                      canSearchByMeasure && measure === formattedMeasure;
                    return (
                      <button
                        key={measure}
                        type="button"
                        onClick={() => handleApplyPopularMeasure(measure)}
                        className={clsx(
                          "rounded-full border px-5 py-2 text-sm font-medium transition",
                          isSelected
                            ? "border-transparent text-neutral-900"
                            : "border-neutral-700 bg-neutral-900/60 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-800 hover:text-white",
                        )}
                        style={
                          isSelected
                            ? { backgroundColor: BRAND_YELLOW }
                            : undefined
                        }
                      >
                        {measure}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSearchByMeasure}
                disabled={!canSearchByMeasure}
                className={clsx(
                  "mt-2 flex w-full items-center justify-center gap-2.5 rounded-2xl px-5 py-4 text-[15px] font-extrabold tracking-tight transition",
                  canSearchByMeasure
                    ? "bg-white text-neutral-900 hover:bg-neutral-200"
                    : "cursor-not-allowed border border-neutral-800 bg-neutral-900/40 text-neutral-600"
                )}
              >
                {canSearchByMeasure ? (
                  <>
                    <span>Ver llantas para {formattedMeasure}</span>
                    <span aria-hidden>→</span>
                  </>
                ) : (
                  <span>Buscar llantas</span>
                )}
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-8">
              <SelectField
                label="Marca"
                value={carBrand}
                placeholder={
                  isLoadingMakes
                    ? "Cargando marcas..."
                    : vehicleMakesUnavailable
                      ? "Configura WHEEL_SIZE_API_KEY"
                      : "Seleccionar marca"
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
                    ? "Seleccionar modelo"
                    : isLoadingModels
                      ? "Cargando modelos..."
                      : "Seleccionar modelo"
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
                    ? "Seleccionar año"
                    : isLoadingYears
                      ? "Cargando años..."
                      : "Seleccionar año"
                }
                options={yearSelectOptions}
                onChange={setCarYear}
                disabled={!carModel || isLoadingYears}
              />

              {vehicleMakesUnavailable ? (
                <p className="text-xs text-red-400">
                  El buscador por auto necesita configuración del servidor
                  (falta `WHEEL_SIZE_API_KEY`).
                </p>
              ) : null}

              <button
                type="button"
                onClick={handleSearchByVehicle}
                disabled={!canSearchByVehicle || isSearchingVehicle}
                className={clsx(
                  "mt-2 flex w-full items-center justify-center gap-2.5 rounded-2xl px-5 py-4 text-[15px] font-extrabold tracking-tight transition",
                  canSearchByVehicle && !isSearchingVehicle
                    ? "bg-white text-neutral-900 hover:bg-neutral-200"
                    : "cursor-not-allowed border border-neutral-800 bg-neutral-900/40 text-neutral-600"
                )}
              >
                {isSearchingVehicle ? (
                  <span>Buscando...</span>
                ) : (
                  <span>Buscar llantas</span>
                )}
              </button>
            </div>
          )}
        </section>

        <div className="mx-auto mt-10 flex w-full max-w-2xl flex-wrap items-center justify-center gap-x-10 gap-y-3 text-[13px] text-neutral-400">
          <span>✓ Envío a todo México</span>
          <span>✓ Instalación disponible</span>
          <span>✓ Garantía incluida</span>
        </div>
      </div>
    </div>
  );
}
