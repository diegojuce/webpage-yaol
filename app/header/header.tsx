import { WhatsappIcon } from "components/yantissimo/icons";
import Link from "next/link";

const UTILITY_LINKS = [
  { label: "Auto", href: "/search?kind=vehiculo&value=sedan", active: true },
  { label: "Camión", href: "/search?kind=vehiculo&value=pickup", active: false },
  { label: "Flotillas", href: "/contacto", active: false },
];

export async function Header() {
  return (
    <div className="flex w-full flex-row items-center gap-2 bg-[#1D1D1D] px-4 py-2 text-white md:px-10">
      <div className="flex flex-row items-center gap-4">
        {UTILITY_LINKS.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            prefetch={false}
            className="text-[12px] transition-colors"
            style={{
              color: l.active ? "#FFC600" : "rgba(255,255,255,0.7)",
              fontWeight: l.active ? 700 : 400,
            }}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <div className="ml-auto flex flex-row items-center gap-3.5">
        <span className="border-r border-white/20 pr-3.5 text-[12px] text-white/70">
          MX
        </span>
        <a
          href="https://wa.me/523122220099"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[12px]"
        >
          <WhatsappIcon className="h-3 w-3 text-[#25D366]" />
          <span className="hidden text-white/70 sm:inline">WhatsApp</span>
          <span className="font-semibold text-white">312 222 0099</span>
        </a>
      </div>
    </div>
  );
}
