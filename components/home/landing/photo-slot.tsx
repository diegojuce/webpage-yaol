import Image from "next/image";

type Scene =
  | "shop"
  | "tire"
  | "tread"
  | "car"
  | "tech"
  | "storefront"
  | "engine";

type Props = {
  src?: string;
  alt?: string;
  hue?: number;
  scene?: Scene;
  dense?: boolean;
  dark?: boolean;
  priority?: boolean;
  sizes?: string;
};

export function PhotoSlot({
  src,
  alt = "",
  hue = 22,
  scene = "shop",
  dense = false,
  dark = true,
  priority = false,
  sizes = "(min-width: 1024px) 33vw, 100vw",
}: Props) {
  if (src) {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  const back = dark
    ? `oklch(0.18 0.025 ${hue})`
    : `oklch(0.92 0.02 ${hue})`;
  const fore = dark
    ? `oklch(0.30 0.045 ${hue + 18})`
    : `oklch(0.78 0.04 ${hue + 12})`;
  const accent = dark ? "#FFC600" : "#0F0F0F";

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: back }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: fore,
          clipPath: "polygon(0 0, 100% 0, 100% 64%, 0 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          opacity: dark ? 0.07 : 0.1,
          backgroundImage: `repeating-linear-gradient(135deg, ${dark ? "#fff" : "#000"} 0 1px, transparent 1px 9px)`,
        }}
      />
      <SceneSilhouette scene={scene} dark={dark} />
      <svg
        className="absolute right-3 top-3 opacity-60"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M0 4V0H4M14 4V0H10M0 10V14H4M14 10V14H10"
          stroke={accent}
          strokeWidth="1.2"
        />
      </svg>
      {!dense && (
        <div
          className="absolute left-3 top-3 text-[9px] uppercase tracking-[0.2em]"
          style={{
            color: dark ? "rgba(255,255,255,.32)" : "rgba(15,15,15,.36)",
          }}
        >
          placeholder
        </div>
      )}
    </div>
  );
}

function SceneSilhouette({ scene, dark }: { scene: Scene; dark: boolean }) {
  const stroke = dark ? "rgba(255,255,255,.10)" : "rgba(0,0,0,.10)";
  const fill = dark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.05)";
  const baseProps = {
    className: "absolute inset-0 h-full w-full",
    viewBox: "0 0 400 280",
    preserveAspectRatio: "xMidYMid slice" as const,
    "aria-hidden": true,
  };
  switch (scene) {
    case "tire":
      return (
        <svg {...baseProps}>
          <circle cx="320" cy="170" r="135" fill={fill} stroke={stroke} strokeWidth="2" />
          <circle cx="320" cy="170" r="100" fill="none" stroke={stroke} strokeWidth="2" />
          <circle cx="320" cy="170" r="60" fill={fill} stroke={stroke} strokeWidth="2" />
          <circle cx="320" cy="170" r="20" fill={fill} />
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
            return (
              <circle
                key={i}
                cx={320 + Math.cos(a) * 40}
                cy={170 + Math.sin(a) * 40}
                r="4"
                fill={dark ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.18)"}
              />
            );
          })}
        </svg>
      );
    case "shop":
      return (
        <svg {...baseProps}>
          <path d="M0 30 L400 30 L400 50 L0 50Z" fill={fill} />
          <path
            d="M40 50 L40 200 M120 50 L120 200 M200 50 L200 200 M280 50 L280 200 M360 50 L360 200"
            stroke={stroke}
            strokeWidth="1.5"
          />
          <rect x="120" y="170" width="160" height="14" fill={fill} stroke={stroke} />
          <rect x="150" y="120" width="100" height="50" fill={fill} stroke={stroke} rx="3" />
        </svg>
      );
    case "car":
      return (
        <svg {...baseProps}>
          <path
            d="M40 200 Q60 150 130 145 L170 110 Q200 95 250 100 L310 145 Q360 150 370 200 L370 220 L40 220 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="2"
          />
          <circle cx="120" cy="220" r="28" fill={fill} stroke={stroke} strokeWidth="2" />
          <circle cx="290" cy="220" r="28" fill={fill} stroke={stroke} strokeWidth="2" />
          <path d="M150 142 L180 115 L240 110 L275 142" stroke={stroke} strokeWidth="1.5" fill="none" />
        </svg>
      );
    case "tech":
      return (
        <svg {...baseProps}>
          <circle cx="160" cy="80" r="22" fill={fill} stroke={stroke} strokeWidth="2" />
          <path
            d="M120 200 L120 130 Q120 110 160 110 Q200 110 200 130 L200 200"
            fill={fill}
            stroke={stroke}
            strokeWidth="2"
          />
          <path
            d="M200 130 L260 160 L280 150 M280 150 L300 160 L295 175 L275 165 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="2"
          />
        </svg>
      );
    case "storefront":
      return (
        <svg {...baseProps}>
          <path d="M20 90 L380 90 L380 230 L20 230Z" fill={fill} stroke={stroke} />
          <path d="M50 90 L50 30 L350 30 L350 90" fill={fill} stroke={stroke} />
          <rect x="80" y="130" width="60" height="100" fill={dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"} />
          <rect x="170" y="130" width="60" height="100" fill={dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"} />
          <rect x="260" y="130" width="60" height="100" fill={dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"} />
        </svg>
      );
    case "tread":
      return (
        <svg {...baseProps}>
          {[40, 90, 140, 190, 240, 290, 340].map((x) => (
            <rect key={x} x={x} y="60" width="32" height="180" fill={fill} stroke={stroke} rx="3" />
          ))}
          {[40, 90, 140, 190, 240, 290, 340].map((x) => (
            <rect key={`${x}-b`} x={x} y="110" width="32" height="20" fill={stroke} />
          ))}
        </svg>
      );
    case "engine":
      return (
        <svg {...baseProps}>
          <rect x="80" y="80" width="240" height="140" fill={fill} stroke={stroke} strokeWidth="2" rx="6" />
          <rect x="120" y="60" width="40" height="20" fill={fill} stroke={stroke} />
          <rect x="240" y="60" width="40" height="20" fill={fill} stroke={stroke} />
          <circle cx="140" cy="150" r="18" fill={fill} stroke={stroke} strokeWidth="2" />
          <circle cx="200" cy="150" r="18" fill={fill} stroke={stroke} strokeWidth="2" />
          <circle cx="260" cy="150" r="18" fill={fill} stroke={stroke} strokeWidth="2" />
        </svg>
      );
    default:
      return null;
  }
}

