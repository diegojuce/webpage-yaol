import { ScrollToTopOnMount } from "components/scroll-to-top-on-mount";
import Image from "next/image";

export const metadata = {
  title: "Nosotros",
  description: "Conoce nuestra historia, valores y equipo.",
};

const VALUES = [
  {
    title: "Confianza primero",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer non justo nec mauris.",
    icon: "🤝",
  },
  {
    title: "Servicio experto",
    description:
      "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
    icon: "🛠️",
  },
  {
    title: "Innovación constante",
    description:
      "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    icon: "⚡",
  },
];

const MILESTONES = [
  {
    year: "2005",
    title: "Primer taller",
    copy: "Abrimos nuestras puertas con un equipo de 3 personas y muchas ganas de servir.",
  },
  {
    year: "2012",
    title: "Certificaciones clave",
    copy: "Logramos certificaciones en diagnóstico y montaje para ofrecer mayor seguridad.",
  },
  {
    year: "2020",
    title: "Expansión digital",
    copy: "Lanzamos nuestra plataforma en línea para agendar y comprar sin complicaciones.",
  },
];

const TEAM = [
  {
    name: "Alexandra Pérez",
    role: "Directora General",
    bio: "Lidera la estrategia y cultura de servicio. 15 años en la industria automotriz.",
    photo: "/images/nosotros/team-alexandra.jpg", // reemplaza con tu foto
  },
  {
    name: "Miguel Torres",
    role: "Jefe de Operaciones",
    bio: "Optimiza procesos en taller y atención. Apasionado de la mejora continua.",
    photo: "/images/nosotros/team-miguel.jpg", // reemplaza con tu foto
  },
  {
    name: "Rocío Sánchez",
    role: "Experiencia del Cliente",
    bio: "Diseña experiencias memorables en sucursal y en línea.",
    photo: "/images/nosotros/team-rocio.jpg", // reemplaza con tu foto
  },
];

export default function NosotrosPage() {
  return (
    <div className="mt-28 min-h-screen bg-[#0f0f10] text-white">
      <ScrollToTopOnMount />

      <section className="relative overflow-hidden  px-6 py-16 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-center">
          <div className="flex-1 space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
              Nuestro origen
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Más de una década cuidando tu camino
            </h1>
            <p className="max-w-2xl text-lg text-neutral-300">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam
              sit amet sapien sit amet justo fringilla suscipit. Integer
              facilisis neque vitae justo tincidunt, in tempus sapien egestas.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                className="rounded-full bg-yellow-400 px-5 py-3 text-black transition hover:-translate-y-0.5 hover:bg-yellow-300"
                href="#historia"
              >
                Conoce nuestra historia
              </a>
              <a
                className="rounded-full border border-white/20 px-5 py-3 text-white transition hover:-translate-y-0.5 hover:border-white/40"
                href="#equipo"
              >
                Ver equipo
              </a>
            </div>
          </div>
          <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-white/5 shadow-xl md:h-80 md:w-1/2">
            <Image
              src="/images/nosotros/hero.jpg" // reemplaza con tu imagen
              alt="Equipo en el taller"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f10] via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-black">
              Servicio certificado
            </div>
          </div>
        </div>
      </section>

      <section
        id="historia"
        className="mx-auto max-w-6xl space-y-10 px-6 py-16 md:px-12"
      >
        <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
              Quiénes somos
            </p>
            <h2 className="text-3xl font-bold md:text-4xl">
              Nuestra historia en movimiento
            </h2>
            <p className="text-neutral-300">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
              pharetra, arcu quis consequat luctus, mi libero aliquet felis,
              vitae luctus arcu lorem a mi. Integer eget metus vitae orci
              tristique efficitur id sit amet metus.
            </p>
            <p className="text-neutral-300">
              Vivamus feugiat, tellus non scelerisque dictum, odio justo
              ullamcorper metus, ut condimentum felis justo eu libero. Etiam
              dapibus, leo sed cursus pulvinar, purus lorem lacinia lacus, a
              volutpat sem sapien sed turpis.
            </p>
          </div>
          <div className="relative h-72 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg">
            <Image
              src="/images/nosotros/history.jpg" // reemplaza con tu imagen
              alt="Línea del tiempo del taller"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f10] via-transparent to-transparent" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {MILESTONES.map((item) => (
            <article
              key={item.year}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg"
            >
              <p className="text-sm font-semibold text-yellow-400">
                {item.year}
              </p>
              <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-neutral-300">{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white/5 px-6 py-16 shadow-inner backdrop-blur md:px-12">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
                Valores
              </p>
              <h2 className="text-3xl font-bold md:text-4xl">
                Lo que nos mueve
              </h2>
              <p className="mt-2 max-w-2xl text-neutral-300">
                Quis autem vel eum iure reprehenderit qui in ea voluptate velit
                esse quam nihil molestiae consequatur.
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {VALUES.map((value) => (
              <article
                key={value.title}
                className="rounded-2xl border border-white/10 bg-[#0f0f10] p-6 shadow-lg"
              >
                <div className="text-3xl">{value.icon}</div>
                <h3 className="mt-3 text-xl font-semibold">{value.title}</h3>
                <p className="mt-2 text-sm text-neutral-300">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="equipo"
        className="mx-auto max-w-6xl space-y-10 px-6 py-16 md:px-12"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
              Nuestro equipo
            </p>
            <h2 className="text-3xl font-bold md:text-4xl">
              Las personas detrás del servicio
            </h2>
            <p className="mt-2 max-w-2xl text-neutral-300">
              Temporibus autem quibusdam et aut officiis debitis aut rerum
              necessitatibus saepe eveniet.
            </p>
          </div>
          <a
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/40"
            href="#contacto-nosotros"
          >
            Contactar
            <span aria-hidden>→</span>
          </a>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((member) => (
            <article
              key={member.name}
              className="group rounded-2xl border border-white/10 bg-white/5 shadow-lg transition hover:-translate-y-1 hover:border-white/25"
            >
              <div className="relative h-56 overflow-hidden rounded-t-2xl">
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="space-y-2 p-5">
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-sm text-yellow-400">{member.role}</p>
                <p className="text-sm text-neutral-300">{member.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="contacto-nosotros"
        className="mx-auto max-w-6xl px-6 pb-20 md:px-12"
      >
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-yellow-400/20 via-white/10 to-blue-500/20 px-8 py-10 shadow-xl md:px-12 md:py-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
                Hablemos
              </p>
              <h3 className="text-2xl font-bold md:text-3xl">
                ¿Colaboramos en tu siguiente proyecto?
              </h3>
              <p className="max-w-2xl text-neutral-200">
                Enim ad minima veniam, quis nostrum exercitationem ullam corporis
                suscipit laboriosam nisi ut aliquid ex ea commodi consequatur.
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
                href="mailto:hola@tuempresa.com"
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
