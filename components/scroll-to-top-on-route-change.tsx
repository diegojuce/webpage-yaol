"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const bloqueado = () => {
  const html = document.documentElement;
  return (
    getComputedStyle(html).overflow === "hidden" ||
    getComputedStyle(document.body).overflow === "hidden"
  );
};

// Sube al inicio con scroll suave. Si un Dialog (menú móvil, carrito) tiene
// bloqueado el scroll, espera a que se cierre: mientras está abierto el
// scrollTo no hace nada y al cerrarse restaura la posición anterior.
export function scrollAlInicio() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const subir = () =>
    requestAnimationFrame(() =>
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }),
    );

  if (!bloqueado()) {
    subir();
    return;
  }
  const observer = new MutationObserver(() => {
    if (bloqueado()) return;
    terminar();
    subir();
  });
  const limite = window.setTimeout(() => {
    terminar();
    subir();
  }, 1500);
  const terminar = () => {
    observer.disconnect();
    window.clearTimeout(limite);
  };
  const opciones = { attributes: true, attributeFilter: ["style", "class"] };
  observer.observe(document.documentElement, opciones);
  observer.observe(document.body, opciones);
}

// Regla general del sitio: al cambiar de página se sube al inicio con scroll
// suave. Sólo cuenta el pathname: cambiar filtros o variantes (search params)
// no mueve la página, y una liga con #ancla deja que el navegador la resuelva.
export function ScrollToTopOnRouteChange() {
  const pathname = usePathname();
  const previous = useRef(pathname);

  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    if (window.location.hash) return;
    scrollAlInicio();
  }, [pathname]);

  return null;
}
