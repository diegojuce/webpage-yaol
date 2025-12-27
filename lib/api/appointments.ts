"use client";

export const API_BASE_URL = "https://stg-back.yantissimo.com";

export type Branch = {
  id: string;
  name: string;
  address?: string;
};

export type Service = {
  id: string;
  name: string;
  duration: number;
};

function buildUrl(path: string) {
  const base = API_BASE_URL?.replace(/\/$/, "") ?? "";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export async function fetchBranches() {
  const res = await fetch(buildUrl("/api/branches"), { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Error al obtener sucursales");
  }
  return res.json();
}

export async function fetchAvailableDates(branchId: string) {
  const res = await fetch(
    buildUrl(
      `/bypass/availability/dates?branchId=${encodeURIComponent(branchId)}`
    ),
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error("Error al obtener fechas disponibles");
  }
  return res.json();
}

export async function fetchAvailableTimes(
  mins: string,
  suc: string,
  date: string
) {
  const searchParams = new URLSearchParams({
    mins,
    suc,
    date,
  });

  const res = await fetch(
    buildUrl(
      `/bypass/calendar/get/availability/day?${searchParams.toString()}`
    ),
    { cache: "no-store" }
  );
  // console.log("Fetching times with params:", { mins, suc, date });
  // const data = await res.clone().json();
  // console.log("Response data:", data);
  if (!res.ok) {
    throw new Error("Error al obtener horarios disponibles");
  }
  return res.json();
}

export async function fetchServices() {
  const res = await fetch(buildUrl("/api/services"), { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Error al obtener servicios");
  }
  return res.json();
}

export type CreateAppointmentPayload = {
  branchId: string;
  branchName: string;
  date: string;
  time: string;
  serviceId?: string;
  customerName: string;
  customerPhone: string;
  durationMinutes?: number;
  items?: unknown;
  additionalNotes?: string;
};

export async function createAppointment(data: CreateAppointmentPayload) {
  const startAt = buildStartAtISO(data.date, data.time);
  const durationMinutes =
    typeof data.durationMinutes === "number" && data.durationMinutes > 0
      ? data.durationMinutes
      : 60;

  if (!startAt) {
    throw new Error("No se pudo interpretar la fecha y hora seleccionadas.");
  }

  const saveBody = {
    client_name: data.customerName,
    client_type: "PUBLICO",
    phone: data.customerPhone,
    sucursal: data.branchName,
    channel: "online",
    seller: "Yaol",
    additional_notes: data.additionalNotes ?? "",
    items: data.items,
  };

  const saveRes = await fetch(buildUrl("/bypass/calendar/save"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(saveBody),
  });

  if (!saveRes.ok) {
    throw new Error("Error al guardar la cotización de la cita");
  }

  const quoteData = await saveRes.json();
  const quoteId = quoteData?.id ?? quoteData?.quote_id;

  if (!quoteId) {
    throw new Error("No se pudo obtener el ID de la cotización");
  }

  const scheduleBody = {
    quote_id: quoteId,
    sucursal: data.branchName,
    type: "scheduled",
    start_at: startAt,
    duration_minutes: durationMinutes,
  };

  const scheduleRes = await fetch(buildUrl("/bypass/calendar/schedule"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(scheduleBody),
  });

  if (!scheduleRes.ok) {
    throw new Error("Error al agendar la cita");
  }

  const appointmentData = await scheduleRes.json();

  return {
    quote: quoteData,
    appointment: appointmentData,
  };
}

function buildStartAtISO(date: string, time: string): string | null {
  const trimmedTime = time?.trim();
  if (!date || !trimmedTime) {
    return null;
  }

  // Attempt to construct directly (covers HH:mm / HH:mm:ss).
  const directDate = new Date(`${date}T${trimmedTime}`);
  if (!Number.isNaN(directDate.getTime())) {
    return directDate.toISOString();
  }

  const timeMatch = trimmedTime.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i
  );

  if (!timeMatch) {
    const fallback = new Date(trimmedTime);
    return Number.isNaN(fallback.getTime()) ? null : fallback.toISOString();
  }

  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const seconds = Number(timeMatch[3] ?? 0);
  const meridiem = timeMatch[4]?.toLowerCase();

  if (meridiem) {
    if (hours === 12) {
      hours = 0;
    }
    if (meridiem === "pm") {
      hours += 12;
    }
  }

  const [yearStr, monthStr, dayStr] = date.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (!year || !month || !day) {
    return null;
  }

  const localDate = new Date(year, month - 1, day, hours, minutes, seconds);
  return Number.isNaN(localDate.getTime()) ? null : localDate.toISOString();
}
