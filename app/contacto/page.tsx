import { ScrollToTopOnMount } from "components/scroll-to-top-on-mount";
import Image from "next/image";

export const metadata = {
  title: "Contacto",
  description: "Ponte en contacto con nuestro equipo para agendar, cotizar o resolver dudas.",
};

const CONTACT_METHODS = [
  {
    title: "Llamada inmediata",
    value: "(000) 123 4567",
    href: "tel:0001234567",
    note: "Lun - Sáb · 8:00 a 20:00",
  },
  {
    title: "Correo",
    value: "contacto@tuempresa.com",
    href: "mailto:contacto@tuempresa.com",
    note: "Respondemos en menos de 24 h",
  },
  {
    title: "WhatsApp",
    value: "+52 00 0000 0000",
    href: "https://wa.me/520000000000",
    note: "Soporte rápido y cotizaciones",
  },
];

const FAQS = [
  {
    q: "¿Necesito cita previa?",
    a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer eget metus vitae orci tristique efficitur.",
  },
  {
    q: "¿Aceptan pagos en línea?",
    a: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
  },
  {
    q: "¿Tienen garantía en servicios?",
    a: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
];

export default function ContactoPage() {
  return (
    <div className="mt-28 min-h-screen bg-[#0f0f10] text-white">
      <ScrollToTopOnMount />

      <section className="relative overflow-hidden px-6 py-16 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-center">
          <div className="flex-1 space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
              Hablemos
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Estamos listos para ayudarte
            </h1>
            <p className="max-w-2xl text-lg text-neutral-300">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam
              sit amet sapien sit amet justo fringilla suscipit. Integer
              facilisis neque vitae justo tincidunt, in tempus sapien egestas.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                className="rounded-full bg-yellow-400 px-5 py-3 text-black transition hover:-translate-y-0.5 hover:bg-yellow-300"
                href="#formulario"
              >
                Enviar mensaje
              </a>
              <a
                className="rounded-full border border-white/20 px-5 py-3 text-white transition hover:-translate-y-0.5 hover:border-white/40"
                href="#info"
              >
                Ver datos de contacto
              </a>
            </div>
          </div>
          <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-white/5 shadow-xl md:h-80 md:w-1/2">
            <Image
              src="/images/contacto/hero.jpg" // reemplaza con tu imagen
              alt="Equipo de atención al cliente"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f10] via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-black">
              Respuesta rápida
            </div>
          </div>
        </div>
      </section>

      <section
        id="info"
        className="mx-auto max-w-6xl space-y-8 px-6 py-16 md:px-12"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
              Contacto directo
            </p>
            <h2 className="text-3xl font-bold md:text-4xl">Escríbenos o llama</h2>
            <p className="mt-2 max-w-2xl text-neutral-300">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
              pharetra, arcu quis consequat luctus, mi libero aliquet felis,
              vitae luctus arcu lorem a mi.
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {CONTACT_METHODS.map((method) => (
            <article
              key={method.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg transition hover:-translate-y-1 hover:border-white/25"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-yellow-400">
                {method.title}
              </p>
              <a
                className="mt-2 block text-xl font-semibold text-white hover:underline"
                href={method.href}
              >
                {method.value}
              </a>
              <p className="mt-1 text-sm text-neutral-400">{method.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="formulario"
        className="bg-white/5 px-6 py-16 shadow-inner backdrop-blur md:px-12"
      >
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
              Envíanos un mensaje
            </p>
            <h2 className="text-3xl font-bold md:text-4xl">
              Cuéntanos qué necesitas
            </h2>
            <p className="text-neutral-300">
              Quis autem vel eum iure reprehenderit qui in ea voluptate velit
              esse quam nihil molestiae consequatur.
            </p>
            <form className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-neutral-300">Nombre completo</label>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-[#0f0f10] px-4 py-3 text-white outline-none transition focus:border-yellow-400/60"
                    placeholder="Jane Doe"
                    type="text"
                    name="nombre"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-neutral-300">Correo</label>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-[#0f0f10] px-4 py-3 text-white outline-none transition focus:border-yellow-400/60"
                    placeholder="correo@ejemplo.com"
                    type="email"
                    name="correo"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-neutral-300">Teléfono</label>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-[#0f0f10] px-4 py-3 text-white outline-none transition focus:border-yellow-400/60"
                    placeholder="+52 00 0000 0000"
                    type="tel"
                    name="telefono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-neutral-300">Asunto</label>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-[#0f0f10] px-4 py-3 text-white outline-none transition focus:border-yellow-400/60"
                    placeholder="Cotización, cita, soporte..."
                    type="text"
                    name="asunto"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-neutral-300">Mensaje</label>
                <textarea
                  className="h-32 w-full rounded-xl border border-white/10 bg-[#0f0f10] px-4 py-3 text-white outline-none transition focus:border-yellow-400/60"
                  placeholder="Cuéntanos los detalles de tu solicitud."
                  name="mensaje"
                />
              </div>
              <button
                className="rounded-full bg-yellow-400 px-6 py-3 font-semibold text-black transition hover:-translate-y-0.5 hover:bg-yellow-300"
                type="submit"
              >
                Enviar mensaje
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#0f0f10] p-6 shadow-lg">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
                Sucursales
              </p>
              <h3 className="mt-2 text-xl font-semibold">Encuéntranos</h3>
              <p className="mt-2 text-sm text-neutral-300">
                Blvd. Lorem 123, Col. Ipsum, Ciudad · Lun - Sáb: 8:00 - 20:00
              </p>
              <p className="mt-1 text-sm text-neutral-300">
                Calle Dolor 456, Plaza Sit, Ciudad · Lun - Vie: 9:00 - 19:00
              </p>
            </div>

            <div className="relative h-64 overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-lg">
              {/* Reemplaza este bloque por un iframe de tu mapa */}
              <div className="absolute inset-0 flex items-center justify-center text-center text-neutral-400">
                Inserta aquí tu mapa embebido
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
              FAQ
            </p>
            <h2 className="text-3xl font-bold md:text-4xl">
              Preguntas frecuentes
            </h2>
            <p className="mt-2 max-w-2xl text-neutral-300">
              Temporibus autem quibusdam et aut officiis debitis aut rerum
              necessitatibus saepe eveniet.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {FAQS.map((faq) => (
            <article
              key={faq.q}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold">{faq.q}</h3>
              <p className="mt-2 text-sm text-neutral-300">{faq.a}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
