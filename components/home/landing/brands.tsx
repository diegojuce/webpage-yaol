const BRANDS = [
  { name: "Michelin", file: "michelin.svg" },
  { name: "Goodyear", file: "goodyear.svg" },
  { name: "Bridgestone", file: "bridgestone.svg" },
  { name: "Pirelli", file: "pirelli.svg" },
  { name: "Continental", file: "continental.svg" },
  { name: "Yokohama", file: "yokohama.svg" },
  { name: "Hankook", file: "hankook.svg" },
  { name: "BFGoodrich", file: "bfgoodrich.svg" },
  { name: "Cooper Tires", file: "cooper.svg" },
  { name: "Nexen Tire", file: "nexen.svg" },
  { name: "Toyo Tires", file: "toyo.svg" },
  { name: "Kumho Tire", file: "kumho.svg" },
];

export function Brands() {
  return (
    <section className="overflow-hidden bg-white text-[#0F0F0F]">
      <div className="w-full overflow-hidden border-y border-black/10 py-6">
        <div
          className="flex w-max flex-nowrap items-center"
          style={{ animation: "yt-marquee 38s linear infinite" }}
        >
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <div
              key={`${b.file}-${i}`}
              className="flex h-12 w-[180px] shrink-0 items-center justify-center px-6 md:w-[220px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/images/brands/${b.file}`}
                alt={i < BRANDS.length ? b.name : ""}
                aria-hidden={i >= BRANDS.length}
                loading="lazy"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
