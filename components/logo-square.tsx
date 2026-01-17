import clsx from "clsx";

const LOGO_SRC = "/logo.svg";
const LOGO_SRC_WHITE = "/logo_blanco.svg";

type LogoSquareProps = {
  size?: "sm";
  variant?: "color" | "white";
};

export default function LogoSquare({ size, variant = "color" }: LogoSquareProps) {
  const storeName = process.env.SITE_NAME || "Tienda";
  const containerHeightClass = size === "sm" ? "h-6" : "h-8";
  const logoSrc = variant === "white" ? LOGO_SRC_WHITE : LOGO_SRC;

  return (
    <div
      className={clsx(
        "flex flex-none items-center justify-center",
        containerHeightClass,
      )}
    >
      <img
        src={logoSrc}
        alt={`${storeName} logotipo`}
        className="flex h-full w-auto object-contain"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}
