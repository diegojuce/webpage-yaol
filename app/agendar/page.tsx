"use client";

import { setCartIdFromParam } from "components/cart/actions";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type AgendarViewState = "loading" | "ready";

export default function AgendarPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasStartedSync = useRef(false);
  const [viewState, setViewState] = useState<AgendarViewState>("loading");

  useEffect(() => {
    if (hasStartedSync.current) {
      return;
    }
    hasStartedSync.current = true;

    const cartParam = searchParams.get("cart");
    if (!cartParam) {
      setViewState("ready");
      return;
    }

    let cancelled = false;

    const syncCartFromUrl = async () => {
      const result = await setCartIdFromParam(cartParam);

      if (cancelled) {
        return;
      }

      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("cart");
      nextParams.set("agendar", "1");
      const nextQuery = nextParams.toString();

      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });

      if (result.ok) {
        router.refresh();
      }
// timeout de 2 segundos para mostrar el loading mientras se sincroniza el carrito
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setViewState("ready");
    };

    void syncCartFromUrl();

    return () => {
      cancelled = true;
    };
  }, [pathname, router, searchParams]);

  return (
    <section className="flex min-h-screen items-center justify-center bg-white px-6 pt-28 text-black">
      {viewState === "loading" ? (
        <div className="flex flex-col items-center gap-5">
          <span
            aria-hidden="true"
            className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900"
          />
          <p className="text-sm font-semibold tracking-[0.2em]">
            cargando tu pedido
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5">
          <Image src="/logo.svg" alt="Yantissimo" width={220} height={64} priority />
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.2em] underline-offset-4 hover:underline"
          >
            volver a inicio
          </Link>
        </div>
      )}
    </section>
  );
}
