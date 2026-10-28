"use client";

import { CheckIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import LoadingDots from "components/loading-dots";
import { measureSearchUrl, vehicleSearchUrl } from "lib/search-urls";
import {
  fetchVehicleMakes,
  fetchVehicleModels,
  fetchVehicleTires,
  fetchVehicleYears,
} from "lib/vehicle-fitment-client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BottomSheet } from "./bottom-sheet";
import {
  DEFAULT_MEASURE,
  fitMeasure,
  MeasureWheels,
  type Measure,
} from "./measure-wheel-picker";

// Buscador de celular: panel inferior con dos modos (medida con ruedas tipo
// iOS, o auto por pasos). En computadora se usa WelcomeModalContent.

export type SearchMode = "measure" | "vehicle";

type Option = { slug: string; name: string };
type VehicleStep = "make" | "model" | "year";

export type VehicleSlugs = { make?: string; model?: string; year?: string };

type MobileSearchSheetProps = {
  open: boolean;
  onClose: () => void;
  initialMode?: SearchMode;
  initialMeasure?: Partial<Measure>;
  initialVehicle?: VehicleSlugs;
};

const BOTON =
  "inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FFC600] px-6 py-4 text-sm font-bold uppercase tracking-wider text-black transition-colors active:bg-[#FFD34A] disabled:pointer-events-none disabled:bg-white/10 disabled:text-white/35";
// Mismo alto para ambos modos, para que el panel no brinque al cambiar.
const BODY_HEIGHT = 244;

const STEP_LABELS: Record<VehicleStep, string> = {
  make: "Marca",
  model: "Modelo",
  year: "Año",
};

export function MobileSearchSheet({
  open,
  onClose,
  initialMode = "measure",
  initialMeasure,
  initialVehicle,
}: MobileSearchSheetProps) {
  const router = useRouter();
  const [mode, setMode] = useState<SearchMode>(initialMode);
  const [measure, setMeasure] = useState<Measure>(DEFAULT_MEASURE);

  const [makes, setMakes] = useState<Option[]>([]);
  const [models, setModels] = useState<Option[]>([]);
  const [years, setYears] = useState<Option[]>([]);
  const [make, setMake] = useState<Option | null>(null);
  const [model, setModel] = useState<Option | null>(null);
  const [year, setYear] = useState<Option | null>(null);
  const [step, setStep] = useState<VehicleStep>("make");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  // Ignora respuestas viejas si el usuario cambió de opción a medio camino.
  const requestId = useRef(0);

  // Al abrir, parte de lo que ya estaba buscado (o de la medida más común).
  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    setMeasure(
      fitMeasure(
        initialMeasure?.width ?? DEFAULT_MEASURE.width,
        initialMeasure?.height ?? DEFAULT_MEASURE.height,
        initialMeasure?.rim ?? DEFAULT_MEASURE.rim
      )
    );
    if (initialMode === "vehicle") void restoreVehicle(initialVehicle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const run = async <T,>(task: () => Promise<T>): Promise<T | undefined> => {
    const id = ++requestId.current;
    setLoading(true);
    setLoadError("");
    try {
      const result = await task();
      return id === requestId.current ? result : undefined;
    } catch {
      if (id === requestId.current) {
        setLoadError("No pudimos cargar las opciones. Intenta de nuevo.");
      }
      return undefined;
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  };

  const ensureMakes = async () => {
    if (makes.length > 0) return makes;
    const result = await run(fetchVehicleMakes);
    if (result) setMakes(result);
    return result ?? [];
  };

  // Desde resultados: deja seleccionado el auto que se buscó.
  const restoreVehicle = async (slugs?: VehicleSlugs) => {
    const allMakes = await ensureMakes();
    const foundMake = allMakes.find((m) => m.slug === slugs?.make);
    if (!foundMake || !slugs?.model) return;
    setMake(foundMake);
    const allModels = await run(() => fetchVehicleModels(foundMake.slug));
    if (!allModels) return;
    setModels(allModels);
    const foundModel = allModels.find((m) => m.slug === slugs.model);
    if (!foundModel) return setStep("model");
    setModel(foundModel);
    const allYears = await run(() =>
      fetchVehicleYears(foundMake.slug, foundModel.slug)
    );
    if (!allYears) return;
    setYears(allYears);
    setYear(allYears.find((y) => y.slug === slugs.year) ?? null);
    setStep("year");
  };

  const switchToVehicle = () => {
    setMode("vehicle");
    void ensureMakes();
  };

  const selectMake = async (option: Option) => {
    setMake(option);
    setModel(null);
    setYear(null);
    setModels([]);
    setYears([]);
    setStep("model");
    const result = await run(() => fetchVehicleModels(option.slug));
    if (result) setModels(result);
  };

  const selectModel = async (option: Option) => {
    if (!make) return;
    setModel(option);
    setYear(null);
    setYears([]);
    setStep("year");
    const result = await run(() => fetchVehicleYears(make.slug, option.slug));
    if (result) setYears(result);
  };

  const searchMeasure = () => {
    onClose();
    router.push(
      measureSearchUrl(`${measure.width}/${measure.height} R${measure.rim}`)
    );
  };

  const searchVehicle = async () => {
    if (!make || !model || !year || isSearching) return;
    setIsSearching(true);
    try {
      const response = await fetchVehicleTires({
        make: make.slug,
        model: model.slug,
        year: year.slug,
      });
      if (!response.sizes?.length) {
        toast.error(
          "No encontramos medidas de llanta para ese auto. Intenta con otra combinación."
        );
        return;
      }
      onClose();
      router.push(
        vehicleSearchUrl({
          make: make.slug,
          model: model.slug,
          year: year.slug,
          sizes: response.sizes,
        })
      );
    } catch {
      toast.error("No fue posible completar la búsqueda por auto.");
    } finally {
      setIsSearching(false);
    }
  };

  const stepOptions =
    step === "make" ? makes : step === "model" ? models : years;
  const stepValue = step === "make" ? make : step === "model" ? model : year;
  const canOpenStep = (target: VehicleStep) =>
    target === "make" || (target === "model" ? Boolean(make) : Boolean(model));

  const vehicleTitle = [make?.name, model?.name, year?.name]
    .filter(Boolean)
    .join(" · ");

  const header = (
    <p className="m-0 truncate text-center text-[17px] font-bold tabular-nums text-[#FFC600]">
      {mode === "measure"
        ? `${measure.width}/${measure.height} R${measure.rim}`
        : vehicleTitle || "Elige tu auto"}
    </p>
  );

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      label={mode === "measure" ? "Busca por medida" : "Busca por auto"}
      header={header}
    >
      <div className="mt-4" style={{ height: BODY_HEIGHT }}>
        {mode === "measure" ? (
          <MeasureWheels value={measure} onChange={setMeasure} />
        ) : (
          <div className="flex h-full flex-col">
            <div className="grid grid-cols-3 gap-1 rounded-full border border-white/10 bg-black/40 p-1">
              {(Object.keys(STEP_LABELS) as VehicleStep[]).map((target) => (
                <button
                  key={target}
                  type="button"
                  disabled={!canOpenStep(target)}
                  onClick={() => setStep(target)}
                  className={clsx(
                    "rounded-full py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors disabled:text-white/20",
                    step === target ? "bg-[#FFC600] text-black" : "text-white/55"
                  )}
                >
                  {STEP_LABELS[target]}
                </button>
              ))}
            </div>

            <div className="relative mt-2 min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <LoadingDots className="bg-white" />
                </div>
              ) : loadError ? (
                <p className="m-0 flex h-full items-center justify-center px-4 text-center text-[13px] text-white/60">
                  {loadError}
                </p>
              ) : stepOptions.length === 0 ? (
                <p className="m-0 flex h-full items-center justify-center px-4 text-center text-[13px] text-white/60">
                  No hay opciones disponibles.
                </p>
              ) : (
                <ul className="m-0 list-none p-0">
                  {stepOptions.map((option) => {
                    const selected = stepValue?.slug === option.slug;
                    return (
                      <li key={option.slug}>
                        <button
                          type="button"
                          onClick={() =>
                            step === "make"
                              ? void selectMake(option)
                              : step === "model"
                                ? void selectModel(option)
                                : setYear(option)
                          }
                          className={clsx(
                            "flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-[16px] transition-colors active:bg-white/10",
                            selected
                              ? "font-semibold text-[#FFC600]"
                              : "text-white/85"
                          )}
                        >
                          {option.name}
                          {selected ? <CheckIcon className="h-4 w-4" /> : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {mode === "measure" ? (
        <button type="button" onClick={searchMeasure} className={clsx(BOTON, "mt-6")}>
          Listo
        </button>
      ) : (
        <button
          type="button"
          onClick={searchVehicle}
          disabled={!year || isSearching}
          className={clsx(BOTON, "mt-6")}
        >
          {isSearching ? (
            <LoadingDots className="bg-black" />
          ) : year ? (
            "Ver llantas para mi auto"
          ) : (
            `Elige ${STEP_LABELS[step].toLowerCase()}`
          )}
        </button>
      )}

      <button
        type="button"
        onClick={() => (mode === "measure" ? switchToVehicle() : setMode("measure"))}
        className="mt-4 w-full text-center text-[13px] font-semibold text-white/55"
      >
        {mode === "measure" ? "¿No sabes tu medida? " : "¿Ya sabes tu medida? "}
        <span className="text-[#FFC600] underline underline-offset-4">
          {mode === "measure" ? "Busca por auto" : "Busca por medida"}
        </span>
      </button>
    </BottomSheet>
  );
}
