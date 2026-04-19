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
import { useRouter, useSearchParams } from "next/navigation";
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
    <div className="space-y-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#555]">
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
        <div
          className="relative"
          ref={fieldRef}
          onMouseDownCapture={updateDropdownPlacement}
        >
          <div
            className={clsx(
              "group flex w-full items-center justify-between gap-3 rounded-lg border border-[#222] bg-[#111] px-3 py-[9px] text-left text-[13px] text-white transition-colors hover:border-[#303030]",
              disabled &&
                "cursor-not-allowed border-[#1d1d1d] bg-[#0f0f0f] text-[#5b5b5b]",
            )}
            onClick={handleContainerClick}
          >
            <Combobox.Input
              ref={inputRef}
              data-combobox-input="true"
              className={clsx(
                "w-full appearance-none border-none bg-transparent text-[13px] text-white outline-none ring-0 ring-offset-0 placeholder:text-[#5b5b5b] group-hover:placeholder:text-[#7a7a7a] [box-shadow:none!important] focus:!border-none focus:!outline-none focus:!ring-0 focus:!ring-offset-0 focus:[box-shadow:none!important] focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0 focus-visible:[box-shadow:none!important]",
                disabled && "cursor-not-allowed text-[#5b5b5b]",
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
              className="pointer-events-none flex items-center justify-center focus:!outline-none focus:!ring-0 md:pointer-events-auto"
            >
              <ChevronUpDownIcon className="h-4 w-4 text-[#666]" />
            </Combobox.Button>
          </div>
          <Combobox.Options
            className={clsx(
              "absolute z-30 w-full overflow-auto rounded-xl border border-[#2a2a2a] bg-[#0f0f0f]/95 shadow-[0_18px_40px_rgba(0,0,0,0.45)]",
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
                      active ? "bg-[#ffd34a] text-[#0f0f0f]" : "text-[#efefef]",
                      selected && "font-semibold",
                    )
                  }
                >
                  {option.label}
                </Combobox.Option>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-[#777]">
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
  const initialBy = searchParams.get("by");
  const initialVehicleMake = searchParams.get("make");
  const initialVehicleModel = searchParams.get("model");
  const initialVehicleYear = searchParams.get("year");
  const hasInitialVehicleSelection = Boolean(
    initialBy === "vehicle" &&
      initialVehicleMake &&
      initialVehicleModel &&
      initialVehicleYear,
  );
  const initialParsedMeasure = parseMeasure(searchParams.get("q"));
  const [activeTab, setActiveTab] = useState<SearchTab>(
    hasInitialVehicleSelection ? "vehicle" : "measure",
  );

  const [width, setWidth] = useState(
    hasInitialVehicleSelection ? "" : (initialParsedMeasure?.width ?? ""),
  );
  const [height, setHeight] = useState(
    hasInitialVehicleSelection ? "" : (initialParsedMeasure?.height ?? ""),
  );
  const [rim, setRim] = useState(
    hasInitialVehicleSelection ? "" : (initialParsedMeasure?.rim ?? ""),
  );

  const [carBrand, setCarBrand] = useState(
    hasInitialVehicleSelection ? (initialVehicleMake ?? "") : "",
  );
  const [carModel, setCarModel] = useState(
    hasInitialVehicleSelection ? (initialVehicleModel ?? "") : "",
  );
  const [carYear, setCarYear] = useState(
    hasInitialVehicleSelection ? (initialVehicleYear ?? "") : "",
  );
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
  const [hasAttemptedModelsLoad, setHasAttemptedModelsLoad] = useState(false);
  const [hasAttemptedYearsLoad, setHasAttemptedYearsLoad] = useState(false);

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
    const by = searchParams.get("by");
    const vehicleMake = searchParams.get("make");
    const vehicleModel = searchParams.get("model");
    const vehicleYear = searchParams.get("year");

    if (by === "vehicle" && vehicleMake && vehicleModel && vehicleYear) {
      setActiveTab("vehicle");
      setCarBrand(vehicleMake);
      setCarModel(vehicleModel);
      setCarYear(vehicleYear);
      setWidth("");
      setHeight("");
      setRim("");
      return;
    }

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

  useEffect(() => {
    if (!carBrand) {
      setHasAttemptedModelsLoad(false);
      return;
    }

    setHasAttemptedModelsLoad(false);
  }, [carBrand]);

  useEffect(() => {
    if (activeTab !== "vehicle") return;
    if (
      !carBrand ||
      carModelOptions.length > 0 ||
      isLoadingModels ||
      hasAttemptedModelsLoad
    ) {
      return;
    }

    setHasAttemptedModelsLoad(true);
    void loadModels(carBrand, true);
  }, [
    activeTab,
    carBrand,
    carModelOptions.length,
    isLoadingModels,
    hasAttemptedModelsLoad,
    loadModels,
  ]);

  useEffect(() => {
    if (!carModel) {
      setHasAttemptedYearsLoad(false);
      return;
    }

    setHasAttemptedYearsLoad(false);
  }, [carModel]);

  useEffect(() => {
    if (activeTab !== "vehicle") return;
    if (
      !carBrand ||
      !carModel ||
      carYearOptions.length > 0 ||
      isLoadingYears ||
      hasAttemptedYearsLoad
    ) {
      return;
    }

    setHasAttemptedYearsLoad(true);
    void loadYears(carBrand, carModel, true);
  }, [
    activeTab,
    carBrand,
    carModel,
    carYearOptions.length,
    isLoadingYears,
    hasAttemptedYearsLoad,
    loadYears,
  ]);

  const handleCarBrandChange = useCallback(
    async (nextBrand: string) => {
      setCarBrand(nextBrand);
      setCarModel("");
      setCarYear("");
      setCarModelOptions([]);
      setCarYearOptions([]);
      setHasAttemptedModelsLoad(true);
      setHasAttemptedYearsLoad(false);
      await loadModels(nextBrand);
    },
    [loadModels],
  );

  const handleCarModelChange = useCallback(
    async (nextModel: string) => {
      setCarModel(nextModel);
      setCarYear("");
      setCarYearOptions([]);
      setHasAttemptedYearsLoad(true);
      await loadYears(carBrand, nextModel);
    },
    [carBrand, loadYears],
  );

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

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("q", formattedMeasure);
    nextParams.set("by", "measure");
    nextParams.delete("make");
    nextParams.delete("model");
    nextParams.delete("year");
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
          "No encontramos medidas de llanta para ese auto. Intenta con otra combinación.",
        );
        return;
      }

      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("q");
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

  return (
    <article className="hidden rounded-[14px] border border-[#1e1e1e] bg-[#161616] p-[18px] md:block">
      <div className="mb-[18px] flex gap-1.5">
        <button
          type="button"
          onClick={handleSetVehicleTab}
          className={clsx(
            "flex-1 rounded-[7px] px-2 py-[7px] text-xs font-semibold transition-colors",
            activeTab === "vehicle"
              ? "bg-[#ffd34a] text-[#0f0f0f]"
              : "bg-[#111] text-[#555] hover:text-[#8a8a8a]",
          )}
        >
          Auto
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("measure")}
          className={clsx(
            "flex-1 rounded-[7px] px-2 py-[7px] text-xs font-semibold transition-colors",
            activeTab === "measure"
              ? "bg-[#ffd34a] text-[#0f0f0f]"
              : "bg-[#111] text-[#555] hover:text-[#8a8a8a]",
          )}
        >
          Medida
        </button>
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
        <p className="mt-3 text-xs text-[#ff8b8b]">
          El buscador por auto necesita configuracion del servidor (falta
          `WHEEL_SIZE_API_KEY`).
        </p>
      ) : null}

      <div className="mt-4">
        {activeTab === "measure" ? (
          <button
            type="button"
            onClick={handleSearchByMeasure}
            disabled={!canSearchByMeasure}
            className={clsx(
              "w-full rounded-lg px-4 py-3 text-[13px] font-bold transition-colors",
              canSearchByMeasure
                ? "bg-[#ffd34a] text-[#0f0f0f] hover:bg-[#eec235]"
                : "cursor-not-allowed bg-[#2a2a2a] text-[#696969]",
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
              "w-full rounded-lg px-4 py-3 text-[13px] font-bold transition-colors",
              canSearchByVehicle && !isSearchingVehicle
                ? "bg-[#ffd34a] text-[#0f0f0f] hover:bg-[#eec235]"
                : "cursor-not-allowed bg-[#2a2a2a] text-[#696969]",
            )}
          >
            {isSearchingVehicle ? "Buscando..." : "Buscar por auto"}
          </button>
        )}
      </div>
    </article>
  );
}
