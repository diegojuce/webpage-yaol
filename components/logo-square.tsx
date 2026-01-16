import clsx from "clsx";

const LOGO_SRC = "/logo.svg";

export default function LogoSquare({ size }: { size?: "sm" | undefined }) {
  const storeName = process.env.SITE_NAME || "Tienda";
  const containerHeightClass = size === "sm" ? "h-6" : "h-8";

  return (
    <div
      className={clsx(
        "flex flex-none items-center justify-center",
        containerHeightClass,
      )}
    >
      <img
        src={LOGO_SRC}
        alt={`${storeName} logotipo`}
        className="flex h-full w-auto object-contain"
        loading="eager"
      />
    </div>
  );
}
