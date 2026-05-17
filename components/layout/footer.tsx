import {
  FacebookIcon,
  InstagramIcon,
  TiktokIcon,
  WhatsappIcon,
} from "components/yantissimo/icons";
import Link from "next/link";

type Col = {
  h: string;
  items: { label: string; href: string }[];
};

const COLS: Col[] = [
  {
    h: "Empresa",
    items: [
      { label: "Nosotros", href: "/nosotros" },
      { label: "Sucursales", href: "/ubicaciones" },
      { label: "Contacto", href: "/contacto" },
      { label: "Asistencia", href: "/contacto" },
      { label: "Trabaja con nosotros", href: "/contacto" },
    ],
  },
  {
    h: "Llantas",
    items: [
      { label: "Auto", href: "/search?kind=vehiculo&value=sedan" },
      { label: "SUV", href: "/search?kind=vehiculo&value=suv" },
      { label: "Camión", href: "/search?kind=vehiculo&value=pickup" },
      { label: "Off-road", href: "/search?kind=tipo&value=off-road" },
      { label: "Por medida", href: "/search" },
      { label: "Por marca", href: "/search" },
    ],
  },
  {
    h: "Servicios",
    items: [
      { label: "Afinación", href: "/servicios#afinacion" },
      { label: "Alineación 3D", href: "/servicios#alineacion" },
      { label: "Frenos", href: "/servicios#frenos" },
      { label: "Nitrógeno", href: "/servicios#balanceo" },
      { label: "Balanceo", href: "/servicios#balanceo" },
      { label: "Suspensión", href: "/servicios#suspension" },
    ],
  },
  {
    h: "Ayuda",
    items: [
      { label: "Guía de llantas", href: "/contacto" },
      { label: "Garantías", href: "/contacto" },
      { label: "Política de privacidad", href: "/privacy-advice" },
      { label: "Devoluciones", href: "/contacto" },
      { label: "FAQ", href: "/contacto" },
    ],
  },
];

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-[#0A0A0A] text-[#9EA0A3]">
      <div className="bg-[#FFC600] text-[#0F0F0F]">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-4 px-6 py-4 md:px-10">
          <img
            src="/logo.svg"
            alt="Yantissimo"
            className="h-[30px] w-auto"
          />
          <span className="block h-5 w-px bg-black/25" />
          <span className="flex-1 text-[13px] font-medium text-[#0F0F0F]">
            Compra llantas y agenda servicios en línea con Yantissimo, tu mejor
            opción.
          </span>
          <a
            href="https://wa.me/523122220099"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#0F0F0F] px-4 py-2.5 text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#FFC600]"
          >
            <WhatsappIcon className="h-3.5 w-3.5" /> WhatsApp · 312 222 0099
          </a>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-12 px-6 pb-14 pt-16 md:grid-cols-[1.4fr_repeat(4,1fr)] md:px-10">
        <div className="flex flex-col gap-3.5">
          <p className="m-0 text-[11px] font-bold uppercase tracking-[0.22em] text-[#FFD34A]">
            YAOL · Yantissimo Online
          </p>
          <h3 className="m-0 text-[24px] font-extrabold leading-[1.3] tracking-[-0.005em] text-white">
            Tienda oficial.
            <br />
            Garantía válida en las 6 sucursales.
          </h3>
          <div className="mt-3.5 flex gap-2.5">
            <a
              href="https://www.facebook.com/Yantissimo"
              aria-label="Facebook"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-[12px] font-semibold text-white"
            >
              <FacebookIcon className="h-3.5 w-3.5" /> Facebook
            </a>
            <a
              href="https://www.instagram.com/yantisimomkt/"
              aria-label="Instagram"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-[12px] font-semibold text-white"
            >
              <InstagramIcon className="h-3.5 w-3.5" /> Instagram
            </a>
            <a
              href="https://www.tiktok.com/@yantissimo_oficial"
              aria-label="TikTok"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-[12px] font-semibold text-white"
            >
              <TiktokIcon className="h-3.5 w-3.5" /> TikTok
            </a>
          </div>
        </div>
        {COLS.map((c) => (
          <div key={c.h}>
            <h4 className="m-0 mb-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white">
              {c.h}
            </h4>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {c.items.map((i) => (
                <li key={i.label}>
                  <Link
                    href={i.href}
                    prefetch={false}
                    className="text-[13px] text-[#9EA0A3] no-underline transition-colors hover:text-white"
                  >
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-3.5 border-t border-white/10 px-6 py-5 text-[12px] text-[#525252] md:px-10">
        <span>
          © 2016–{currentYear} Yantissimo. Todos los derechos reservados.
        </span>
        <span className="ml-auto">Creado por Yaol (Yantissimo Online)</span>
      </div>
    </footer>
  );
}
