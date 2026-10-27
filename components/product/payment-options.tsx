// Meses sin intereses (Fase 5): Stripe ofrece 3 MSI con tarjeta de crédito
// participante en pedidos de 2 llantas o más (el backend apaga las cuotas en
// los demás). La comisión la absorbe Yantissimo: el precio no cambia.
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { Product } from "lib/commerce/types";

const MSI_MESES = 3;
const MSI_EJEMPLOS = [2, 4];

const formatCurrency = (value: number, currencyCode: string) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
  }).format(value);

export function PaymentOptions({ product }: { product: Product }) {
  const { amount, currencyCode } = product.priceRange.minVariantPrice;
  const unitPrice = parseFloat(amount);
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) return null;

  return (
    <div className="mt-6 w-full rounded-2xl bg-white px-4 py-3 text-sm text-[#5D4418] shadow-sm">
      <p className="flex items-center gap-2 font-semibold">
        <CreditCardIcon fontSize="medium" />
        {MSI_MESES} meses sin intereses desde 2 llantas
      </p>
      <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
        {MSI_EJEMPLOS.map((llantas) => (
          <li key={llantas}>
            {llantas} llantas: {MSI_MESES} pagos de{" "}
            <span className="font-semibold">
              {formatCurrency(
                (unitPrice * llantas) / MSI_MESES,
                currencyCode || "MXN",
              )}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 border-t border-[#5D4418]/10 pt-2 text-xs text-[#5D4418]/70">
        Con tarjeta de crédito participante, capturándola en el pago. No
        aplica con Apple Pay ni Google Pay.
      </p>
    </div>
  );
}
