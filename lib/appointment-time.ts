// Fechas y horas de las citas, siempre en la zona de las sucursales
// (America/Mexico_City). Lo usan /agendar-cita y el checkout (/pago).

export const TIME_ZONE_CDMX = "America/Mexico_City";
const ARRAY_KEYS = ["data", "dates", "fechas", "items", "horarios"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function formatISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toHHMMInZone(value: string): string | null {
  const trimmed = value.trim();
  const looksLikeISO =
    trimmed.includes("T") ||
    /Z$/i.test(trimmed) ||
    /[+-]\d{2}:?\d{2}$/.test(trimmed) ||
    /^\d{4}-\d{2}-\d{2}/.test(trimmed);

  if (looksLikeISO) {
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      const formatter = new Intl.DateTimeFormat("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: TIME_ZONE_CDMX,
      });
      return formatter.format(parsed);
    }
  }

  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (ampmMatch) {
    let hours = Number(ampmMatch[1] ?? 0);
    const minutes = String(ampmMatch[2] ?? "00").padStart(2, "0");
    const meridiem = (ampmMatch[3] ?? "").toLowerCase();
    if (meridiem === "pm" && hours < 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  const hhmmMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (hhmmMatch) {
    const hh = hhmmMatch[1]?.padStart(2, "0") ?? "00";
    const mm = hhmmMatch[2] ?? "00";
    return `${hh}:${mm}`;
  }

  const parsedFallback = new Date(trimmed);
  if (Number.isNaN(parsedFallback.getTime())) return null;

  const fallbackFormatter = new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIME_ZONE_CDMX,
  });
  return fallbackFormatter.format(parsedFallback);
}

export function normalizeAvailableTimes(data: unknown): string[] {
  const rawArray = Array.isArray(data)
    ? data
    : isRecord(data)
      ? ARRAY_KEYS.flatMap((key) =>
          Array.isArray(data[key]) ? (data[key] as unknown[]) : [],
        )
      : [];

  if (!rawArray.length) return [];

  return rawArray
    .map((item) => {
      if (typeof item === "string") {
        return toHHMMInZone(item) ?? item.trim();
      }
      if (isRecord(item)) {
        const start =
          (item.start as string | undefined) ??
          (item.start_at as string | undefined);
        return start ? toHHMMInZone(start) : null;
      }
      return null;
    })
    .filter((value): value is string => Boolean(value));
}

function getTimeZoneOffsetMinutes(timeZone: string, date: Date): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const values = parts.reduce(
    (acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    },
    {} as Record<string, string>,
  );
  const year = Number(values.year);
  const month = Number(values.month);
  const day = Number(values.day);
  const hour = Number(values.hour);
  const minute = Number(values.minute);
  const second = Number(values.second);
  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    Number.isNaN(second)
  )
    return 0;
  const asUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  return (asUtc - date.getTime()) / 60000;
}

function formatOffsetMinutes(offsetMinutes: number): string {
  const rounded = Math.round(offsetMinutes);
  const sign = rounded >= 0 ? "+" : "-";
  const abs = Math.abs(rounded);
  const hours = String(Math.floor(abs / 60)).padStart(2, "0");
  const minutes = String(abs % 60).padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

export function buildStartAtInCdmx(date: string, hhmm: string): string {
  const [yearStr, monthStr, dayStr] = date.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const [hourStr, minuteStr] = hhmm.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
    return `${date}T${hhmm}:00`;
  }
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offset1 = getTimeZoneOffsetMinutes(TIME_ZONE_CDMX, utcGuess);
  let utcDate = new Date(utcGuess.getTime() - offset1 * 60000);
  const offset2 = getTimeZoneOffsetMinutes(TIME_ZONE_CDMX, utcDate);
  if (offset2 !== offset1) {
    utcDate = new Date(utcGuess.getTime() - offset2 * 60000);
  }
  const finalOffset = getTimeZoneOffsetMinutes(TIME_ZONE_CDMX, utcDate);
  return `${date}T${hhmm}:00${formatOffsetMinutes(finalOffset)}`;
}
