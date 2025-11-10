"use client";

import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment, useState } from "react";
import { AppointmentEmbedded } from "./agendar-cita";


type MerchandiseSearchParams = {
  [key: string]: string;
};

export default function ServiceModal() {
  const [isOpen, setIsOpen] = useState(false);
  const openService = () => setIsOpen(true);
  const closeService = () => setIsOpen(false);



  return (
    <>
      <button
        aria-label="Programar Cita"
        onClick={openService}
        className="block w-full mt-2 rounded-full bg-yellow-500 p-3 text-center text-sm font-medium text-white opacity-90 hover:opacity-100"
      >
        Programar
      </button>
      <Transition show={isOpen}>
        <Dialog onClose={closeService} className="relative z-[200]">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-[.5px]"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-[.5px]"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div
              className="fixed inset-0 z-[210] bg-black/30"
              aria-hidden="true"
            />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="fixed bottom-0 right-0 top-0 z-[220] flex h-full w-full flex-col border-l border-neutral-200 bg-white/80 p-6 text-black backdrop-blur-xl md:w-[80vw] dark:border-neutral-700 dark:bg-black/80 dark:text-white">
              <div className="flex items-center justify-between">
                {/* <p className="text-lg font-semibold">holahola</p> */}
                {/* <button aria-label="Cerrar" onClick={closeService}>
                  <CloseCart />
                </button> */}
              </div>
              <div className="flex h-full flex-col overflow-hidden p-1">
                <AppointmentEmbedded onClose={closeService} />
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}

function CloseCart({ className }: { className?: string }) {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center bg-white dark:bg-black rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white">
      <XMarkIcon
        className={clsx(
          "h-6 transition-all ease-in-out hover:scale-110",
          className,
        )}
      />
    </div>
  );
}
