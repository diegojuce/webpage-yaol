"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import CartModal from "components/cart/modal";
import LogoSquare from "components/logo-square";
import { Menu } from "lib/shopify/types";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";

const LLANTAS_TAGS = [
  { label: "SUV", href: "/search?kind=vehiculo&value=suv" },
  { label: "Sedán", href: "/search?kind=vehiculo&value=sedan" },
  { label: "Jeep", href: "/search?kind=vehiculo&value=jeep" },
  { label: "Pick-up", href: "/search?kind=vehiculo&value=pickup" },
  { label: "Runflat", href: "/search?kind=tipo&value=runflat" },
  { label: "Off-road", href: "/search?kind=tipo&value=off-road" },
  { label: "Sport", href: "/search?kind=tipo&value=sport" },
  { label: "Carga", href: "/search?kind=tipo&value=carga" },
  { label: "Gama Alta", href: "/search?kind=gama&value=alta" },
  { label: "Gama Media", href: "/search?kind=gama&value=media" },
  { label: "Económica", href: "/search?kind=gama&value=economica" },
];

const PRIMARY_LINKS = [
  { label: "Ubicaciones", href: "/ubicaciones" },
  { label: "Servicios", href: "/servicios" },
  { label: "Asistencia", href: "/contacto" },
  { label: "¿Por qué Yantissimo?", href: "/nosotros" },
];

export default function MobileMenu({ menu }: { menu: Menu[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const openMobileMenu = () => setIsOpen(true);
  const closeMobileMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, searchParams]);

  return (
    <>
      <button
        onClick={openMobileMenu}
        aria-label="Abrir menú móvil"
        className="flex h-11 w-11 items-center justify-center rounded-md text-black transition-colors md:hidden"
      >
        <Bars3Icon className="h-5" />
      </button>
      <Transition show={isOpen}>
        <Dialog onClose={closeMobileMenu} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-[2px]"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-[2px]"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="translate-x-[-100%]"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-[-100%]"
          >
            <Dialog.Panel
              className="fixed inset-0 flex h-full w-full flex-col bg-[#0F0F10] text-white"
              style={{ fontFamily: "var(--font-geist-sans, system-ui)" }}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <button
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-[#FFC600] hover:text-[#FFC600]"
                  onClick={closeMobileMenu}
                  aria-label="Cerrar menú móvil"
                >
                  <XMarkIcon className="h-5" />
                </button>
                <LogoSquare variant="white" />
                <CartModal isWhite={true} />
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-10 pt-6">
                <p
                  className="mb-6 text-xs font-semibold uppercase text-[#FFC600]"
                  style={{ letterSpacing: "0.20em" }}
                >
                  Tu mejor opción
                </p>

                <section className="border-b border-white/10 pb-6">
                  <Link
                    href="/search"
                    onClick={closeMobileMenu}
                    className="group flex items-center justify-between"
                  >
                    <h2
                      className="text-4xl font-black uppercase leading-[1.05] text-white transition-colors group-hover:text-[#FFC600]"
                      style={{
                        fontFamily:
                          "var(--font-staatliches), var(--font-fjalla), Impact, sans-serif",
                        letterSpacing: "0.04em",
                      }}
                    >
                      Llantas
                    </h2>
                    <span
                      className="text-2xl text-[#FFC600] transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </Link>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {LLANTAS_TAGS.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={closeMobileMenu}
                          className="inline-flex rounded-full border border-white/10 px-3 py-1.5 text-xs uppercase tracking-wider text-neutral-300 transition-colors hover:border-[#FFC600]/60 hover:bg-[#FFC600]/10 hover:text-[#FFC600]"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>

                <nav className="mt-2 flex flex-col">
                  {PRIMARY_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className="group flex items-center justify-between border-b border-white/10 py-5"
                    >
                      <h2
                        className="text-3xl font-black uppercase leading-[1.05] text-white transition-colors group-hover:text-[#FFC600]"
                        style={{
                          fontFamily:
                            "var(--font-staatliches), var(--font-fjalla), Impact, sans-serif",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {item.label}
                      </h2>
                      <span
                        className="text-2xl text-neutral-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#FFC600]"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </Link>
                  ))}
                </nav>

                {menu.length ? (
                  <ul className="mt-2 flex flex-col">
                    {menu.map((item: Menu) => (
                      <li key={item.title}>
                        <Link
                          href={item.path}
                          prefetch={true}
                          onClick={closeMobileMenu}
                          className="group flex items-center justify-between border-b border-white/10 py-5"
                        >
                          <h2
                            className="text-3xl font-black uppercase leading-[1.05] text-white transition-colors group-hover:text-[#FFC600]"
                            style={{
                              fontFamily:
                                "var(--font-staatliches), var(--font-fjalla), Impact, sans-serif",
                              letterSpacing: "0.04em",
                            }}
                          >
                            {item.title}
                          </h2>
                          <span
                            className="text-2xl text-neutral-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#FFC600]"
                            aria-hidden="true"
                          >
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <Link
                  href="/agendar-cita"
                  onClick={closeMobileMenu}
                  className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FFC600] px-6 py-4 text-sm font-bold uppercase tracking-wider text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFD34A] hover:shadow-[0_18px_50px_rgba(255,211,74,0.35)]"
                >
                  Agendar cita
                  <span aria-hidden="true">→</span>
                </Link>

                <div className="mt-8 space-y-1 text-sm text-neutral-400">
                  <p
                    className="text-xs font-semibold uppercase text-[#FFC600]"
                    style={{ letterSpacing: "0.20em" }}
                  >
                    Hablemos
                  </p>
                  <a
                    href="https://wa.me/523122220099"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMobileMenu}
                    className="block text-white transition-colors hover:text-[#FFC600]"
                  >
                    WhatsApp · 312 222 0099
                  </a>
                  <p>Lun - Vie · 9:00 a 19:00</p>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
