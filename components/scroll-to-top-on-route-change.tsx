"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

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
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [pathname]);

  return null;
}
