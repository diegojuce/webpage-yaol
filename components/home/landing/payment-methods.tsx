const METHODS = [
  { name: "Visa", file: "visa.svg" },
  { name: "Mastercard", file: "mastercard.svg" },
  { name: "American Express", file: "amex.svg" },
  { name: "Apple Pay", file: "applepay.svg" },
  { name: "Google Pay", file: "googlepay.svg" },
  { name: "OXXO", file: "oxxo.svg" },
  // TODO: reemplazar por el logo oficial de SPEI (public/images/payments/spei.svg)
  { name: "SPEI", file: null },
];

export function PaymentMethods({ className = "" }: { className?: string }) {
  return (
    <ul
      aria-label="Métodos de pago"
      className={`m-0 flex list-none flex-wrap items-center justify-center gap-1.5 p-0 md:gap-2 ${className}`}
    >
      {METHODS.map((m) => (
        <li
          key={m.name}
          className="flex h-6 w-10 items-center justify-center rounded-md bg-white px-1 py-1 md:h-7 md:w-12 md:px-1.5"
        >
          {m.file ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/images/payments/${m.file}`}
              alt={m.name}
              loading="lazy"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <span className="text-[10px] font-extrabold italic md:text-[11px] tracking-[0.02em] text-[#0F0F0F]">
              {m.name}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
