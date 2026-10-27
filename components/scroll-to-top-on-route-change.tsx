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

// Sube al inicio: "instant" salta sin animación (cambio de página) y "smooth"
// se desliza (pasos del checkout). Si un Dialog (menú móvil, carrito) tiene
// bloqueado el scroll, espera a que se cierre: mientras está abierto el
// scrollTo no hace nada, y en iOS Headless UI regresa a la posición que tenía
// la página al abrirlo. Por eso el salto se repite un momento después.
export function scrollAlInicio(behavior: "instant" | "smooth" = "smooth") {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const modo = reduce ? "instant" : behavior;
  const subir = () => {
    window.scrollTo({ top: 0, behavior: modo });
    if (modo !== "instant") return;
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: modo }));
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: modo }), 120);
  };

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

// Regla general del sitio: al cambiar de página se carga desde arriba, sin
// animación. Sólo cuenta el pathname: cambiar filtros o variantes (search params)
// no mueve la página, y una liga con #ancla deja que el navegador la resuelva.
export function ScrollToTopOnRouteChange() {
  const pathname = usePathname();
  const previous = useRef(pathname);

  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    if (window.location.hash) return;
    scrollAlInicio("instant");
  }, [pathname]);

  return null;
}
