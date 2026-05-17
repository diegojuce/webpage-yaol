const BRANDS = [
  "MICHELIN",
  "GOODYEAR",
  "BRIDGESTONE",
  "PIRELLI",
  "CONTINENTAL",
  "YOKOHAMA",
  "HANKOOK",
  "BFGOODRICH",
  "COOPER",
  "NEXEN",
  "TOYO",
  "KUMHO",
];

export function Brands() {
  return (
    <section className="overflow-hidden border-t border-[#1A1A1A] bg-[#0F0F0F] pb-6 pt-14 text-white">
      <div className="flex items-center gap-3.5 px-6 pb-5 md:px-14">
        <p className="m-0 text-[11px] font-bold uppercase tracking-[0.22em] text-[#FFD34A]">
          Marcas oficiales
        </p>
        <span className="block h-px w-7 bg-white/20" />
        <span className="text-[13px] text-white/60">
          Garantía directa de fabricante en cada llanta que vendemos.
        </span>
      </div>
      <div className="w-full overflow-hidden border-y border-[#1A1A1A] py-5">
        <div
          className="flex flex-nowrap gap-16 whitespace-nowrap"
          style={{ animation: "yt-marquee 38s linear infinite" }}
        >
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <span
              key={`${b}-${i}`}
              className="shrink-0 text-[34px] tracking-[0.06em] text-white/70"
              style={{ fontFamily: "'Staatliches','Fjalla One',sans-serif" }}
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
