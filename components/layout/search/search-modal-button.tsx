"use client";

import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { useModal } from "components/hooks/use-modal";
import type { Measure } from "components/mainslide/measure-wheel-picker";
import {
  MobileSearchSheet,
  type VehicleSlugs,
} from "components/mainslide/mobile-search-sheet";
import { WelcomeModalContent } from "components/mainslide/welcome-modal-content";
import { FullscreenModal } from "components/ui/fullscreen-modal";
import { isMobileViewport } from "lib/search-urls";
import { useState } from "react";

// Reabre el buscador por medida / auto desde los resultados: en celular el
// panel inferior, en computadora el buscador completo. Al buscar, la página se
// vuelve a montar (ChildrenWrapper) y ambos quedan cerrados.
export default function SearchModalButton({
  initialTab = "measure",
  measure,
  vehicle,
}: {
  initialTab?: "measure" | "vehicle";
  measure?: Partial<Measure>;
  vehicle?: VehicleSlugs;
}) {
  const { isOpen, open, close } = useModal();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => (isMobileViewport() ? setIsSheetOpen(true) : open())}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:border-[#FFC600] hover:text-[#FFC600]"
      >
        <AdjustmentsHorizontalIcon className="h-4 w-4" />
        {initialTab === "vehicle" ? "Cambiar auto" : "Cambiar medida"}
      </button>
      <FullscreenModal open={isOpen} onClose={close}>
        <WelcomeModalContent initialTab={initialTab} />
      </FullscreenModal>
      <MobileSearchSheet
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        initialMode={initialTab}
        initialMeasure={measure}
        initialVehicle={vehicle}
      />
    </>
  );
}
