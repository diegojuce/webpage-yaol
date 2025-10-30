"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import Search from "components/layout/navbar/search";
import { useCallback, useEffect, useId, useState } from "react";

type TireSearchCTAProps = {
  className?: string;
};

export default function TireSearchCTA({ className }: TireSearchCTAProps) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [closeModal, isOpen]);

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setIsOpen(true)}
      >
        BUSCAR LLANTAS
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70"
            aria-hidden="true"
            onClick={closeModal}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className="relative z-10 w-full max-w-xl rounded-3xl border border-neutral-700 bg-neutral-900/95 p-7 text-white shadow-[0_35px_80px_rgba(0,0,0,0.6)]"
          >
            <button
              type="button"
              onClick={closeModal}
              aria-label="Cerrar búsqueda de llantas"
              className="absolute right-4 top-4 rounded-full border border-neutral-700/60 p-1 text-neutral-400 transition hover:border-neutral-500 hover:text-white"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <div className="pr-8">
              <h3
                id={titleId}
                className="text-2xl font-black uppercase tracking-[0.25em] text-yellow-400"
              >
                BUSCAR LLANTAS
              </h3>
              <p id={descriptionId} className="mt-3 text-sm text-neutral-300">
                Encuentra la medida ideal ingresando el ancho, perfil y rin de
                tus llantas.
              </p>
            </div>

            <div className="mt-6">
              <Search className="w-full lg:w-full" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
