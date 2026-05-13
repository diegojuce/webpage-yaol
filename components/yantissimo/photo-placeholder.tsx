type Props = {
  hue?: number;
  label?: string;
  dense?: boolean;
};

export function PhotoPlaceholder({ hue = 22, label = "Foto del taller", dense = false }: Props) {
  const a = `oklch(0.28 0.04 ${hue + 20})`;
  const b = `oklch(0.18 0.03 ${hue})`;
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: b }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: a,
          clipPath: "polygon(0 0, 100% 0, 100% 62%, 0 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #fff 0 1px, transparent 1px 8px)",
        }}
      />
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">
        <span className="block h-px w-[18px] bg-white/40" />
        {label}
      </div>
      {!dense && (
        <div className="absolute right-2.5 top-2.5 text-[9px] uppercase tracking-[0.2em] text-white/30">
          placeholder
        </div>
      )}
    </div>
  );
}
