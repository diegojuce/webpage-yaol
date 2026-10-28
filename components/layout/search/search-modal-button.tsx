"use client";

import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { useModal } from "components/hooks/use-modal";
import { WelcomeModalContent } from "components/mainslide/welcome-modal-content";
import { FullscreenModal } from "components/ui/fullscreen-modal";

// Reabre el buscador por medida / auto desde los resultados. Al buscar, la
// página se vuelve a montar (ChildrenWrapper) y el modal queda cerrado.
export default function SearchModalButton({
  initialTab = "measure",
}: {
  initialTab?: "measure" | "vehicle";
}) {
  const { isOpen, open, close } = useModal();

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:border-[#FFC600] hover:text-[#FFC600]"
      >
        <AdjustmentsHorizontalIcon className="h-4 w-4" />
        {initialTab === "vehicle" ? "Cambiar auto" : "Cambiar medida"}
      </button>
      <FullscreenModal open={isOpen} onClose={close}>
        <WelcomeModalContent initialTab={initialTab} />
      </FullscreenModal>
    </>
  );
}
