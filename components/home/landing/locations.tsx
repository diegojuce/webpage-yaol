"use client";

import Link from "next/link";
import { PhoneIcon, PinIcon } from "components/yantissimo/icons";
import { useState } from "react";
import { ArrowRightIcon } from "./icons";

type Branch = {
  id: string;
  name: string;
  city: string;
  cp: string;
  phone: string;
  x: number;
  y: number;
};

const BRANCHES: Branch[] = [
  { id: "tecnologico", name: "Tecnológico", city: "Villa de Álvarez", cp: "28980", phone: "312 119 7566", x: 520, y: 175 },
  { id: "benito-juarez", name: "Benito Juárez", city: "Villa de Álvarez", cp: "28980", phone: "312 103 6625", x: 560, y: 205 },
  { id: "constitucion", name: "Constitución", city: "Colima", cp: "28017", phone: "312 319 5414", x: 600, y: 255 },
  { id: "ninos-heroes", name: "Niños Héroes", city: "Colima", cp: "28017", phone: "312 385 6157", x: 640, y: 285 },
  { id: "colinas", name: "Colinas del Rey", city: "Colima", cp: "28017", phone: "312 229 7350", x: 625, y: 240 },
  { id: "manzanillo", name: "Manzanillo", city: "Manzanillo", cp: "28869", phone: "314 116 2978", x: 225, y: 380 },
];

export function Locations() {
  const [active, setActive] = useState(0);
  return (
    <section
      id="ubicaciones"
      className="bg-[#0F0F0F] px-6 pb-24 pt-20 text-white md:px-14"
    >
      <header className="mb-9 flex flex-wrap items-end gap-6">
        <div>
          <p className="m-0 text-[12px] font-bold uppercase tracking-[0.22em] text-[#FFD34A]">
            Ubicaciones · Colima y Manzanillo
          </p>
          <h2
            className="m-0 mt-2.5 font-black uppercase leading-[0.95] tracking-[0.04em]"
            style={{
              fontFamily: "'Staatliches','Fjalla One',sans-serif",
              fontSize: "clamp(44px,5vw,76px)",
            }}
          >
            Seis talleres,
            <br />
            <span className="text-[#FFC600]">una misma garantía.</span>
          </h2>
        </div>
        <Link
          href="/ubicaciones"
          prefetch={false}
          className="ml-auto inline-flex items-center gap-2.5 rounded-full bg-[#FFC600] px-5 py-3.5 text-[13px] font-extrabold uppercase tracking-[0.08em] text-[#0F0F0F]"
        >
          Ver todas las sucursales <ArrowRightIcon width={14} height={14} />
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative min-h-[460px] overflow-hidden rounded-[18px] border border-white/10 bg-[#141414]">
          <StylizedMap branches={BRANCHES} active={active} />
          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[rgba(15,15,15,0.78)] px-3 py-2 text-[11px] font-bold tracking-[0.06em] text-white backdrop-blur">
            <span className="block h-2 w-2 bg-[#FFC600]" />
            <span>Sucursal Yantissimo</span>
          </div>
          <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[rgba(15,15,15,0.78)] px-3 py-2 text-[11px] text-white/70">
            <PinIcon width={12} height={12} /> Colima, México · Estado natal desde 2016
          </div>
        </div>

        <aside className="flex flex-col gap-3.5 rounded-[18px] border border-white/10 bg-[#141414] p-5">
          <p className="m-0 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#FFD34A]">
            Selecciona una sucursal
          </p>
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
            {BRANCHES.map((b, i) => (
              <li
                key={b.id}
                onMouseEnter={() => setActive(i)}
                className="flex items-center gap-3 rounded-xl border px-3 py-2.5 transition"
                style={{
                  background: i === active ? "#1B1B1D" : "transparent",
                  borderColor: i === active ? "#2A2A2A" : "transparent",
                }}
              >
                <span
                  className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-lg font-black"
                  style={{
                    fontFamily: "'Staatliches','Fjalla One',sans-serif",
                    fontSize: 14,
                    background: i === active ? "#FFC600" : "#2A2A2A",
                    color: i === active ? "#0F0F0F" : "#FFC600",
                  }}
                >
                  {i + 1}
                </span>
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="text-[14px] font-bold text-white">{b.name}</span>
                  <span className="text-[11px] text-white/60">
                    {b.city} · CP {b.cp}
                  </span>
                </span>
                <a
                  href={`tel:+52${b.phone.replace(/\s/g, "")}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-[#FFC600]"
                >
                  <PhoneIcon className="h-3.5 w-3.5" />
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-1.5 flex flex-col gap-1.5 rounded-xl border border-white/10 bg-[#0F0F0F] p-3.5">
            <p className="m-0 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#FFD34A]">
              Horario en todas las sucursales
            </p>
            <Row label="Lunes a viernes" value="9:00 — 19:00" />
            <Row label="Sábado" value="9:00 — 14:00" />
            <Row label="Domingo" value="Cerrado" muted />
          </div>
        </aside>
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex justify-between text-[13px] text-white">
      <span>{label}</span>
      <span
        className={muted ? "text-[#9EA0A3]" : "font-bold text-[#FFD34A]"}
      >
        {value}
      </span>
    </div>
  );
}

function StylizedMap({
  branches,
  active,
}: {
  branches: Branch[];
  active: number;
}) {
  return (
    <svg
      viewBox="0 0 900 460"
      preserveAspectRatio="xMidYMid slice"
      className="block h-full w-full"
      aria-label="Mapa de Colima"
    >
      <rect width="900" height="460" fill="#141414" />
      <defs>
        <pattern id="dots-lo" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.5" fill="#1f1f1f" />
        </pattern>
      </defs>
      <rect width="900" height="460" fill="url(#dots-lo)" />
      <path d="M -20 360 Q 120 320 260 340 T 540 380 L 540 480 L -20 480 Z" fill="#1a1a1f" />
      <path d="M -20 360 Q 120 320 260 340 T 540 380" fill="none" stroke="#2a2a30" strokeWidth="1.5" />
      <path
        d="M 320 110 L 560 95 L 720 130 L 820 200 L 800 290 L 740 340 L 600 360 L 460 350 L 380 320 L 330 250 Z"
        fill="#1B1B1D"
        stroke="rgba(255,255,255,0.06)"
      />
      <path
        d="M 220 380 L 480 280 L 620 230 L 740 165"
        fill="none"
        stroke="#3a3a3a"
        strokeWidth="1.5"
        strokeDasharray="3 4"
      />
      <text
        x="560"
        y="160"
        fill="#FFD34A"
        fontSize="11"
        fontWeight="800"
        letterSpacing="2"
        fontFamily="'Staatliches', sans-serif"
      >
        VILLA DE ÁLVAREZ
      </text>
      <text
        x="630"
        y="305"
        fill="#FFD34A"
        fontSize="11"
        fontWeight="800"
        letterSpacing="2"
        fontFamily="'Staatliches', sans-serif"
      >
        COLIMA
      </text>
      <text
        x="170"
        y="400"
        fill="#FFD34A"
        fontSize="11"
        fontWeight="800"
        letterSpacing="2"
        fontFamily="'Staatliches', sans-serif"
      >
        MANZANILLO
      </text>
      <text x="430" y="240" fill="#9EA0A3" fontSize="9" letterSpacing="1.5">
        CARR. COLIMA–MANZANILLO
      </text>
      {branches.map((p, i) => (
        <g key={p.id} transform={`translate(${p.x}, ${p.y})`}>
          <circle r={i === active ? 22 : 16} fill="#FFC600" opacity={i === active ? 0.2 : 0.12} />
          <circle
            r="13"
            fill={i === active ? "#FFC600" : "#0F0F0F"}
            stroke="#FFC600"
            strokeWidth="2"
          />
          <text
            y="4"
            textAnchor="middle"
            fontSize="11"
            fontWeight="900"
            fill={i === active ? "#0F0F0F" : "#FFC600"}
          >
            {i + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}
