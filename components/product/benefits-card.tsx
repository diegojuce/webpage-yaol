// Lo que incluye la compra, en una sola tarjeta: la instalación o el envío se
// eligen después, en el checkout (/pago).
import { LocalShipping, TireRepair } from "@mui/icons-material";
import AirIcon from "@mui/icons-material/Air";
import BuildIcon from "@mui/icons-material/Build";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const BENEFITS = [
  { Icon: BuildIcon, label: "Instalación GRATIS" },
  { Icon: TireRepair, label: "Balanceo GRATIS" },
  { Icon: AirIcon, label: "Nitrógeno & válvula GRATIS" },
  { Icon: CalendarMonthIcon, label: "Agenda tu cita ONLINE" },
  { Icon: LocalShipping, label: "Envío a domicilio GRATIS: 2-5 días" },
];

export function BenefitsCard() {
  return (
    <div className="mt-6 w-full rounded-2xl bg-white px-4 py-3 text-sm text-[#5D4418] shadow-sm">
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {BENEFITS.map(({ Icon, label }) => (
          <li key={label} className="flex items-center gap-2">
            <Icon fontSize="medium" />
            <span>{label}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 border-t border-[#5D4418]/10 pt-2 text-xs text-[#5D4418]/70">
        Eliges instalar en sucursal o envío a domicilio al completar tu pago.
      </p>
    </div>
  );
}
