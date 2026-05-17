import { Header } from "app/header/header";
import CartModal from "components/cart/modal";
import LogoSquare from "components/logo-square";
import { getMenu } from "lib/shopify";
import Link from "next/link";
import { Suspense } from "react";
import MobileMenu from "./mobile-menu";
import Search, { SearchSkeleton } from "./search";

const VEHICLE_LINKS = [
  { label: "SUV", value: "suv" },
  { label: "Sedan", value: "sedan" },
  { label: "Jeep", value: "jeep" },
  { label: "Pick-up", value: "pickup" },
];

const TYPE_LINKS = [
  { label: "Runflat", value: "runflat" },
  { label: "Off-road", value: "off-road" },
  { label: "Sport", value: "sport" },
  { label: "Carga", value: "carga" },
];

const RANGE_LINKS = [
  { label: "Alta", value: "alta" },
  { label: "Media", value: "media" },
  { label: "Económica", value: "economica" },
];

const SERVICE_LINKS = [
  { label: "Afinación", anchor: "afinacion" },
  { label: "Alineación 3D", anchor: "alineacion" },
  { label: "Montaje de llantas", anchor: "montaje" },
  { label: "Suspensión", anchor: "suspension" },
  { label: "Frenos", anchor: "frenos" },
  { label: "Balanceo y nitrógeno", anchor: "balanceo" },
];

export async function Navbar() {
  await getMenu("next-js-frontend-header-menu");

  return (
    <div className="fixed left-0 right-0 top-0 z-50">
      <Header />
      <nav className="flex flex-col gap-4 border-b border-[#ECECEC] bg-white p-3 shadow-md md:gap-0 md:p-0 md:px-10">
        {/* Mobile bar */}
        <div className="flex items-center justify-between md:hidden">
          <div className="flex items-center gap-0">
            <Suspense fallback={null}>
              <MobileMenu menu={[]} />
            </Suspense>
            <Link
              href="/"
              prefetch={true}
              className="flex items-center px-3"
              aria-label="Inicio"
            >
              <LogoSquare />
            </Link>
          </div>
          <CartModal />
        </div>

        {/* Desktop bar */}
        <div className="hidden h-[78px] w-full items-center justify-center gap-9 md:flex">
          <Link
            href="/"
            prefetch={true}
            className="flex items-center"
            aria-label="Inicio Yantissimo"
          >
            <LogoSquare />
          </Link>

          <ul className="flex items-center gap-7 text-[14px] font-medium text-[#0F0F0F]">
            <li>
              <NavItem href="/search" label="Llantas">
                <NavMegaMenu>
                  <NavColumn title="Buscar por Vehículo">
                    {VEHICLE_LINKS.map((i) => (
                      <NavLink
                        key={i.value}
                        href={`/search?kind=vehiculo&value=${i.value}`}
                        label={i.label}
                      />
                    ))}
                  </NavColumn>
                  <NavColumn title="Buscar por Tipo">
                    {TYPE_LINKS.map((i) => (
                      <NavLink
                        key={i.value}
                        href={`/search?kind=tipo&value=${i.value}`}
                        label={i.label}
                      />
                    ))}
                  </NavColumn>
                  <NavColumn title="Buscar por Gama">
                    {RANGE_LINKS.map((i) => (
                      <NavLink
                        key={i.value}
                        href={`/search?kind=gama&value=${i.value}`}
                        label={i.label}
                      />
                    ))}
                  </NavColumn>
                </NavMegaMenu>
              </NavItem>
            </li>
            <li>
              <NavItem href="/ubicaciones" label="Ubicaciones" />
            </li>
            <li>
              <NavItem href="/servicios" label="Servicios">
                <NavMegaMenu narrow>
                  <NavColumn title="Líneas de servicio">
                    {SERVICE_LINKS.map((i) => (
                      <NavLink
                        key={i.anchor}
                        href={`/servicios#${i.anchor}`}
                        label={i.label}
                      />
                    ))}
                  </NavColumn>
                </NavMegaMenu>
              </NavItem>
            </li>
            <li>
              <NavItem href="/contacto" label="Asistencia" />
            </li>
            <li>
              <NavItem href="/nosotros" label="¿Por qué Yantissimo?" />
            </li>
          </ul>

          <div className="ml-auto flex items-center gap-3.5">
            <div className="py-5">
              <Suspense fallback={<SearchSkeleton />}>
                <Search />
              </Suspense>
            </div>
            <CartModal />
          </div>
        </div>
      </nav>
    </div>
  );
}

function NavItem({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="group relative">
      <Link
        href={href}
        prefetch={true}
        className="block py-2 text-[14px] font-medium text-[#0F0F0F]"
      >
        {label}
      </Link>
      <span
        className="pointer-events-none absolute -bottom-[20px] left-0 h-[3px] w-full origin-center scale-x-0 bg-[#FFC600] transition-transform duration-300 ease-out group-hover:scale-x-100"
        aria-hidden="true"
      />
      {children ? (
        <span
          className="absolute left-0 top-full block h-10 w-full bg-transparent"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </div>
  );
}

function NavMegaMenu({
  children,
  narrow,
}: {
  children: React.ReactNode;
  narrow?: boolean;
}) {
  return (
    <div className="fixed left-0 right-0 top-[113px] z-30 hidden bg-white p-8 shadow-md group-hover:block">
      <div
        className={`mx-auto grid gap-8 ${narrow ? "w-1/4 grid-cols-1" : "w-1/3 grid-cols-3"}`}
      >
        {children}
      </div>
    </div>
  );
}

function NavColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-xs text-neutral-600">{title}</h4>
      <ul className="mt-5 space-y-2 text-sm text-black">{children}</ul>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <li className="font-semibold">
      <Link
        href={href}
        prefetch={true}
        className="block hover:text-blue-500"
      >
        {label}
      </Link>
    </li>
  );
}
