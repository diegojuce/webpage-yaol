import Link from "next/link";
import { ArrowRightIcon } from "./icons";

const ITEMS = [
  { n: "10+", l: "AÑOS EN COLIMA", s: "Desde octubre de 2016, atendiendo Colima y Manzanillo." },
  { n: "7", l: "SUCURSALES", s: "En Colima, Villa de Álvarez y Manzanillo. Misma garantía." },
  { n: "25k+", l: "SERVICIOS / AÑO", s: "Citas y walk-in atendidos por técnicos certificados." },
  { n: "4.5", l: "★ GOOGLE MAPS", s: "Promedio entre las 6 sucursales según reseñas reales." },
];

export function Stats() {
  return (
    <section className="bg-[#FFC600] px-6 py-24 text-[#0F0F0F] md:px-14">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <header className="flex flex-col gap-4">
          <p className="m-0 text-[13px] font-bold uppercase tracking-[0.22em] text-[rgba(15,15,15,0.7)]">
            Por qué Yantissimo
          </p>
          <h2
            className="m-0 font-black uppercase leading-[0.92] tracking-[0.04em]"
            style={{
              fontFamily: "'Staatliches','Fjalla One',sans-serif",
              fontSize: "clamp(56px,6vw,92px)",
            }}
          >
            Más de <span className="text-white">10 años</span>
            <br />
            de experiencia.
          </h2>
          <p className="m-0 mt-2 max-w-[480px] text-[17px] leading-[1.6] text-[rgba(15,15,15,0.78)]">
            Nacimos en Colima en octubre de 2016 como un pequeño taller familiar
            y hoy somos{" "}
            <strong className="text-[#0F0F0F]">
              el especialista de llantas y servicio
            </strong>{" "}
            de la región. Cada cliente vuelve porque cumplimos lo que
            prometemos: producto bueno, instalación correcta, atención humana.
          </p>
          <div className="mt-3.5 flex flex-wrap gap-3">
            <Link
              href="/nosotros"
              prefetch={false}
              className="inline-flex items-center gap-2.5 rounded-full bg-[#0F0F0F] px-5 py-3.5 text-[13px] font-extrabold uppercase tracking-[0.08em] text-[#FFC600]"
            >
              Conoce a Yantissimo <ArrowRightIcon width={14} height={14} />
            </Link>
            <Link
              href="/nosotros"
              prefetch={false}
              className="inline-flex items-center rounded-full border-[1.5px] border-[#0F0F0F] px-5 py-3.5 text-[13px] font-bold text-[#0F0F0F]"
            >
              Ver el equipo
            </Link>
          </div>
        </header>
        <div className="grid grid-cols-2 gap-0">
          {ITEMS.map((it) => (
            <div
              key={it.l}
              className="relative flex flex-col gap-2 border-t-2 border-[#0F0F0F] px-6 py-5"
            >
              <span
                className="text-[#0F0F0F]"
                style={{
                  fontFamily: "'Staatliches','Fjalla One',sans-serif",
                  fontSize: 78,
                  lineHeight: 0.9,
                  letterSpacing: "0.02em",
                  fontWeight: 900,
                }}
              >
                {it.n}
              </span>
              <span className="text-[13px] font-extrabold uppercase tracking-[0.18em] text-[#0F0F0F]">
                {it.l}
              </span>
              <span className="text-[13px] leading-[1.5] text-[rgba(15,15,15,0.7)]">
                {it.s}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
