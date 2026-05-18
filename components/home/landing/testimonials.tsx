import Link from "next/link";
import { ArrowRightIcon, QuoteIcon, StarIcon } from "./icons";

type Review = {
  name: string;
  city: string;
  text: string;
  rating: number;
  badge: string;
};

const REVIEWS: Review[] = [
  {
    name: "Juan Adame Gonzalez",
    city: "Tecnologico",
    text: "Compre 4 llantas bf goodrich y me salio en una promoción y más baratas que en guadalajara. Además el servicio y trato de los trabajadores fue muy bueno. Cada que voy a checar mis llantas siempre me atienden con muy buen servicio",
    rating: 5,
    badge: "Cliente desde 2023",
  },
  {
    name: "Veronica Jimenez",
    city: "Tecnologico",
    text: "Buen servicio, rápido, cotize en agencia, mercado libre y muy por debajo de todas estas partes. Aproximadamente 1000 pesos. Me trajeron la misma llanta de un día para otro., Quedé encantada , en precio y servicio",
    rating: 5,
    badge: "Cliente desde 2020",
  },
  {
    name: "Jairo Valle",
    city: "Constitución",
    text: "Es un buen lugar y confiable para realizar diferentes servicios a tu vehículo, aún que el costo está un poco alto, ofrecen garantía y varias opciones de pago.",
    rating: 4,
    badge: "Cliente desde 2022",
  },
];

export function Testimonials() {
  return (
    <section className="bg-[#FAFAFA] px-6 pb-20 pt-24 text-[#0F0F0F] md:px-14">
      <header className="mx-auto mb-12 flex max-w-[760px] flex-col items-center gap-3 text-center">
        <p className="m-0 text-[13px] font-bold uppercase tracking-[0.22em] text-[#D19D00]">
          Nuestras reseñas
        </p>
        <h2
          className="m-0 font-black uppercase leading-[0.95] tracking-[0.04em]"
          style={{
            fontFamily: "'Staatliches','Fjalla One',sans-serif",
            fontSize: "clamp(44px,5vw,76px)",
          }}
        >
          4.5 ★ en Google,
          <br />
          <span className="text-[#D19D00]">en promedio.</span>
        </h2>
        <p className="m-0 max-w-[540px] text-[16px] leading-[1.5] text-[#525252]">
        Esto es lo que dicen
          nuestros clientes.
        </p>
      </header>
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-5 md:grid-cols-3">
        {REVIEWS.map((r) => (
          <ReviewCard key={r.name} r={r} />
        ))}
      </div>
      <div className="mt-9 text-center">
        <Link
          href="/nosotros"
          prefetch={false}
          className="inline-flex items-center gap-2.5 rounded-full border-[1.5px] border-[#0F0F0F] bg-white px-5 py-3.5 text-[13px] font-bold uppercase tracking-[0.06em] text-[#0F0F0F]"
        >
          Ver todas las reseñas en Google <ArrowRightIcon width={14} height={14} />
        </Link>
      </div>
    </section>
  );
}

function ReviewCard({ r }: { r: Review }) {
  return (
    <article className="flex flex-col gap-4.5 rounded-[18px] border border-[#ECECEC] bg-white p-6.5">
      <QuoteIcon width={36} height={36} style={{ color: "#FFC600" }} />
      <p className="m-0 flex-1 text-[15px] leading-[1.6] text-[#0F0F0F]">
        "{r.text}"
      </p>
      <div className="flex items-center gap-3.5 border-t border-[#ECECEC] pt-4.5">
        <span
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0F0F0F] text-[13px] font-extrabold tracking-[0.04em] text-[#FFC600]"
        >
          {r.name
            .split(" ")
            .map((s) => s[0])
            .slice(0, 2)
            .join("")}
        </span>
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="text-[13px] font-bold text-[#0F0F0F]">{r.name}</span>
          <span className="text-[11px] text-[#9EA0A3]">
            {r.city} · {r.badge}
          </span>
        </div>
        <span className="inline-flex gap-px">
          {Array.from({ length: r.rating }).map((_, i) => (
            <StarIcon key={i} width={12} height={12} style={{ color: "#FFC600" }} />
          ))}
        </span>
      </div>
    </article>
  );
}
