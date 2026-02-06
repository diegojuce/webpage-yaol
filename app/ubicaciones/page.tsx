import { ScrollToTopOnMount } from "components/scroll-to-top-on-mount";
import Image from "next/image";

export const metadata = {
  title: "Ubicaciones",
  description: "Encuentra nuestras sucursales y horarios de atención.",
};

const LOCATIONS = [
  {
    name: "Sucursal Tecnologico",
    address: "Av. Lorem Ipsum 123, Col. Dolor Sit, Ciudad",
    schedule: "Lun - Sáb: 8:00 - 20:00",
    phone: "(000) 123 4567",
    image: "/images/ubicaciones/sucursal-centro.jpg", // cámbiala por tu foto
  },
  {
    name: "Sucursal Benito Juarez",
    address: "Calle Amet 456, Parque Consectetur, Ciudad",
    schedule: "Lun - Vie: 9:00 - 19:00 | Sáb: 9:00 - 15:00",
    phone: "(000) 987 6543",
    image: "/images/ubicaciones/sucursal-norte.jpg", // cámbiala por tu foto
  },
  {
    name: "Sucursal Constitución",
    address: "Blvd. Adipiscing 789, Plaza Elit, Ciudad",
    schedule: "Lun - Dom: 7:00 - 22:00",
    phone: "(000) 555 0000",
    image: "/images/ubicaciones/sucursal-express.jpg", // cámbiala por tu foto
  },
  {
    name: "Sucursal Niños Heroes",
    address: "Blvd. Adipiscing 789, Plaza Elit, Ciudad",
    schedule: "Lun - Dom: 7:00 - 22:00",
    phone: "(000) 555 0000",
    image: "/images/ubicaciones/sucursal-express.jpg", // cámbiala por tu foto
  },
  {
    name: "Sucursal Comala",
    address: "Blvd. Adipiscing 789, Plaza Elit, Ciudad",
    schedule: "Lun - Dom: 7:00 - 22:00",
    phone: "(000) 555 0000",
    image: "/images/ubicaciones/sucursal-express.jpg", // cámbiala por tu foto
  },
  {
    name: "Sucursal Manzanillo BLVD",
    address: "Blvd. Adipiscing 789, Plaza Elit, Ciudad",
    schedule: "Lun - Dom: 7:00 - 22:00",
    phone: "(000) 555 0000",
    image: "/images/ubicaciones/sucursal-express.jpg", // cámbiala por tu foto
  },
  {
    name: "Sucursal Manzanillo Tapeixtles",
    address: "Blvd. Adipiscing 789, Plaza Elit, Ciudad",
    schedule: "Lun - Dom: 7:00 - 22:00",
    phone: "(000) 555 0000",
    image: "/images/ubicaciones/sucursal-express.jpg", // cámbiala por tu foto
  },
];

export default function UbicacionesPage() {
  return (
    <div className="mt-28 min-h-screen bg-[#0f0f10] text-white">
      <ScrollToTopOnMount behavior="auto" />
      <section className="relative overflow-hidden  px-6 py-16 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-center">
          <div className="flex-1 space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
              Estamos cerca de ti
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Ubicaciones y centros de servicio
            </h1>
            <p className="max-w-2xl text-lg text-neutral-300">
              Conoce nuestras sucursales, Hablanos o agenda una cita en linea en cuestión de segundos.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                className="rounded-full bg-yellow-400 px-5 py-3 text-black transition hover:-translate-y-0.5 hover:bg-yellow-300"
                href="#sucursales"
              >
                Ver sucursales
              </a>
              <a
                className="rounded-full border border-white/20 px-5 py-3 text-white transition hover:-translate-y-0.5 hover:border-white/40"
                href="#contacto"
              >
                Agendar cita
              </a>
            </div>
          </div>
          <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-white/5 shadow-xl md:h-80 md:w-1/2">
            <Image
              src="/images/ubicaciones/hero.jpg" // cámbiala por tu foto
              alt="Taller y sala de espera"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f10] via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-black">
              Sucursales certificadas
            </div>
          </div>
        </div>
      </section>

      <section
        id="sucursales"
        className="mx-auto max-w-6xl space-y-8 px-6 py-16 md:px-12"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
              Todas nuestras sucursales
            </p>
            <h2 className="text-3xl font-bold md:text-4xl">
              Elige la más conveniente
            </h2>
            <p className="mt-2 max-w-2xl text-neutral-400">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
              pharetra, arcu quis consequat luctus, mi libero aliquet felis,
              vitae luctus arcu lorem a mi.
            </p>
          </div>
          <a
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/40"
            href="#mapa"
          >
            Ver mapa
            <span aria-hidden>→</span>
          </a>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {LOCATIONS.map((location) => (
            <article
              key={location.name}
              className="group rounded-2xl border border-white/10 bg-white/5 shadow-lg transition hover:-translate-y-1 hover:border-white/25"
            >
              <div className="relative h-48 overflow-hidden rounded-t-2xl">
                <Image
                  src={location.image}
                  alt={location.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="space-y-2 p-5">
                <h3 className="text-xl font-semibold">{location.name}</h3>
                <p className="text-sm text-neutral-300">{location.address}</p>
                <p className="text-sm text-neutral-400">{location.schedule}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-yellow-400">
                    {location.phone}
                  </span>
                  <button className="rounded-full border border-white/15 px-4 py-2 text-sm text-white transition hover:border-white/40 hover:bg-white/5">
                    Ver detalles
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="mapa"
        className="bg-white/5 px-6 py-16 shadow-inner backdrop-blur md:px-12"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-center">
          <div className="flex-1 space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
              Cómo llegar
            </p>
            <h2 className="text-3xl font-bold md:text-4xl">
              Mapa y rutas sugeridas
            </h2>
            <p className="text-neutral-300">
              Elige o compara las mejores rutas para llegar a nuestras sucursales
            </p>
            <ul className="space-y-2 text-neutral-300">
              <li>• Estacionamiento gratis en todas las sucursales.</li>
              <li>• Ubicación ideal.</li>
              <li>• Áreas de espera con Aire acondicionado, Wi-Fi y café.</li>
            </ul>
          </div>
          <div className="relative h-[320px] w-full flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-lg">
            {/* Reemplaza este div por un iframe de mapa (Google Maps, Mapbox, etc.) */}
            <div className="absolute inset-0 flex items-center justify-center text-center text-neutral-400">
              Inserta aquí tu mapa embebido
            </div>
          </div>
        </div>
      </section>

      <section
        id="contacto"
        className="mx-auto max-w-6xl px-6 py-16 md:px-12"
      >
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-yellow-400/20 via-white/10 to-blue-500/20 px-8 py-10 shadow-xl md:px-12 md:py-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
                Agenda una visita
              </p>
              <h3 className="text-2xl font-bold md:text-3xl">
                ¿Necesitas soporte inmediato?
              </h3>
              <p className="max-w-2xl text-neutral-200">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis
                suscipit, nibh non volutpat sagittis, justo velit mattis ante,
                nec convallis ex ipsum sit amet purus.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <a
                className="rounded-full bg-yellow-400 px-5 py-3 text-center font-semibold text-black transition hover:-translate-y-0.5 hover:bg-yellow-300"
                href="tel:0001234567"
              >
                Llamar ahora
              </a>
              <a
                className="rounded-full border border-white/20 px-5 py-3 text-center text-white transition hover:border-white/40"
                href="mailto:contacto@taller.com"
              >
                Enviar correo
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
