"use client";

import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import LoadingDots from "components/loading-dots";
import LogoSquare from "components/logo-square";
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

// Mismo lenguaje visual que el carrito y /pago.
const DISPLAY_FONT =
  "var(--font-staatliches), var(--font-fjalla), Impact, sans-serif";
const LABEL =
  "mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-white/55";
const BOTON =
  "inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FFC600] px-6 py-4 text-sm font-bold uppercase tracking-wider text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFD34A] hover:shadow-[0_18px_50px_rgba(255,211,74,0.25)] disabled:pointer-events-none disabled:bg-white/10 disabled:text-white/35";
const TAB =
  "rounded-full px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] transition-colors";
const tabClass = (activo: boolean) =>
  clsx(
    TAB,
    activo ? "bg-[#FFC600] text-black" : "text-white/55 hover:text-white"
  );

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
    <div>
      <label className={LABEL}>{label}</label>
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
                "group flex w-full items-center justify-between gap-2 rounded-xl border px-4 py-3.5 text-left text-[15px] transition-[border-color,box-shadow]",
                "border-white/15 bg-white/5 hover:border-white/30 focus-within:border-[#FFC600] focus-within:shadow-[0_0_0_3px_rgba(255,198,0,0.2)]",
                disabled &&
                  "cursor-not-allowed border-white/10 bg-white/[0.02] hover:border-white/10"
              )}
              onClick={handleContainerClick}
            >
              <Combobox.Input
                ref={inputRef}
                data-combobox-input="true"
                className={clsx(
                  "w-full min-w-0 appearance-none border-none bg-transparent p-0 text-[15px] font-semibold outline-none ring-0 placeholder:font-normal placeholder:text-white/35 focus:!border-none focus:!outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0",
                  disabled ? "cursor-not-allowed text-white/30" : "text-white"
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
                className="pointer-events-none flex shrink-0 items-center justify-center text-white/40 focus:!outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0 md:pointer-events-auto"
              >
                <ChevronUpDownIcon className="h-4 w-4" />
              </Combobox.Button>
            </div>
            <Combobox.Options
              className={clsx(
                "absolute z-30 w-full overflow-auto rounded-xl border border-white/10 bg-[#1a1a1b] p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.55)]",
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
                        "cursor-pointer rounded-lg px-3 py-2.5 text-sm transition-colors",
                        selected ? "font-semibold text-[#FFC600]" : "text-white/80",
                        active && "bg-white/10 text-white"
                      )
                    }
                  >
                    {option.label}
                  </Combobox.Option>
                ))
              ) : (
                <div className="px-3 py-2.5 text-sm text-white/40">
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

  const heading =
    activeTab === "vehicle" ? "Llantas para tu auto" : "Busca por medida";
  const subheading =
    activeTab === "vehicle"
      ? "Elige marca, modelo y año; te mostramos las llantas que le quedan."
      : "Ancho, alto y rin: vienen grabados en el costado de tu llanta (ej. 205/55 R16).";

  return (
    <div
      className="flex min-h-full w-full flex-col bg-[#0F0F10] text-white"
      style={{ fontFamily: "var(--font-geist-sans, system-ui)" }}
    >
      <div className="flex h-[76px] shrink-0 items-center border-b border-white/10 px-5">
        <LogoSquare variant="white" />
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 py-10 md:py-14">
        <header>
          <p className="m-0 text-[13px] font-bold uppercase tracking-[0.22em] text-[#FFC600]">
            Encuentra tus llantas
          </p>
          <h1
            className="m-0 mt-2 text-[clamp(2.4rem,7vw,3.4rem)] font-black uppercase leading-[0.9] tracking-[0.04em] text-white"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            {heading}
          </h1>
          <p className="m-0 mt-3 text-[14px] leading-relaxed text-white/55">
            {subheading}
          </p>
        </header>

        <section className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.03] p-5 sm:p-7">
          <div
            role="tablist"
            className="grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-black/40 p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "measure"}
              onClick={() => setActiveTab("measure")}
              className={tabClass(activeTab === "measure")}
            >
              Por medida
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "vehicle"}
              onClick={handleSetVehicleTab}
              className={tabClass(activeTab === "vehicle")}
            >
              Por auto
            </button>
          </div>

          {activeTab === "measure" ? (
            <div className="mt-6">
              <div className="grid grid-cols-3 gap-3">
                <SelectField
                  label="Ancho"
                  value={width}
                  placeholder="205"
                  options={MEASURE_WIDTH_OPTIONS}
                  onChange={setWidth}
                />
                <SelectField
                  label="Alto"
                  value={height}
                  placeholder="55"
                  options={MEASURE_HEIGHT_OPTIONS}
                  onChange={setHeight}
                />
                <SelectField
                  label="Rin"
                  value={rim}
                  placeholder="16"
                  options={MEASURE_RIM_OPTIONS}
                  onChange={setRim}
                />
              </div>

              <div className="mt-6">
                <p className={LABEL}>Medidas populares</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_MEASURES.map((measure) => {
                    const isSelected =
                      canSearchByMeasure && measure === formattedMeasure;
                    return (
                      <button
                        key={measure}
                        type="button"
                        onClick={() => handleApplyPopularMeasure(measure)}
                        className={clsx(
                          "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                          isSelected
                            ? "border-[#FFC600] bg-[#FFC600]/15 text-[#FFC600]"
                            : "border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10"
                        )}
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
                className={clsx(BOTON, "mt-7")}
              >
                {canSearchByMeasure
                  ? `Ver llantas ${formattedMeasure}`
                  : "Elige ancho, alto y rin"}
                {canSearchByMeasure ? <span aria-hidden>→</span> : null}
              </button>
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-5">
              <SelectField
                label="Marca"
                value={carBrand}
                placeholder={
                  isLoadingMakes
                    ? "Cargando marcas..."
                    : vehicleMakesUnavailable
                      ? "No disponible"
                      : "Ej. Nissan"
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
                    ? "Primero elige la marca"
                    : isLoadingModels
                      ? "Cargando modelos..."
                      : "Ej. Versa"
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
                    ? "Primero elige el modelo"
                    : isLoadingYears
                      ? "Cargando años..."
                      : "Ej. 2020"
                }
                options={yearSelectOptions}
                onChange={setCarYear}
                disabled={!carModel || isLoadingYears}
              />

              {vehicleMakesUnavailable ? (
                <p
                  role="alert"
                  className="m-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white/70"
                >
                  La búsqueda por auto no está disponible por ahora. Busca por
                  medida o escríbenos y te ayudamos.
                </p>
              ) : null}

              <button
                type="button"
                onClick={handleSearchByVehicle}
                disabled={!canSearchByVehicle || isSearchingVehicle}
                className={clsx(BOTON, "mt-2")}
              >
                {isSearchingVehicle ? (
                  <LoadingDots className="bg-black" />
                ) : canSearchByVehicle ? (
                  <>
                    Ver llantas para mi auto <span aria-hidden>→</span>
                  </>
                ) : (
                  "Elige marca, modelo y año"
                )}
              </button>
            </div>
          )}
        </section>

        <ul className="m-0 mt-8 flex list-none flex-wrap items-center justify-center gap-x-6 gap-y-2 p-0 text-[13px] text-white/55">
          {["Instalación o envío GRATIS", "Garantía de fabricante", "Pago seguro"].map(
            (t) => (
              <li key={t} className="flex items-center gap-1.5">
                <CheckIcon className="h-4 w-4 text-[#FFC600]" />
                {t}
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  );
}
