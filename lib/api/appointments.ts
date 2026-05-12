"use client";

export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

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

// ============================================================
// Pre-registered customer data (used by /agendar-cita)
// ============================================================
export type RegisteredClient = {
  exists: boolean;
  paid: boolean;
  scheduled: boolean;
  scheduled_at?: string | null;
  client_name: string;
  phone: string;
  sucursal: string; // backend code (e.g. "NHS", "TEC", "BJZ", "CON", "REY", "MAN")
  branch_code: string;
};

export async function fetchRegisteredClient(
  quoteId?: string
): Promise<RegisteredClient> {
  if (!quoteId) {
    return {
      exists: false,
      paid: false,
      scheduled: false,
      scheduled_at: null,
      client_name: "",
      phone: "",
      sucursal: "",
      branch_code: "",
    };
  }
  const res = await fetch(
    buildUrl(
      `/bypass/yaol/registered-client?quote_id=${encodeURIComponent(quoteId)}`
    ),
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error("Error al obtener los datos del cliente");
  }
  const data = await res.json();
  return {
    exists: Boolean(data.exists),
    paid: Boolean(data.paid),
    scheduled: Boolean(data.scheduled),
    scheduled_at: data.scheduled_at ?? null,
    client_name: data.client_name ?? "",
    phone: data.phone ?? "",
    sucursal: data.sucursal ?? "",
    branch_code: data.branch_code ?? data.sucursal ?? "",
  };
}

// Lookup quote_id by Shopify cart_token. The orders/paid webhook stores
// payload.cart_token in shopify_orders.cart_token; the cartId cookie on
// shop-yaol contains that same token inside the cart GID. Used by
// /agendar-cita to resolve quote_id post-payment when the Order Status
// Page redirect can't carry query params (Shopify Basic plan).
export type CartTokenLookup = { exists: boolean; quote_id?: string };

export async function fetchQuoteByCartToken(
  cartToken: string
): Promise<CartTokenLookup> {
  const res = await fetch(
    buildUrl(
      `/bypass/yaol/quote-by-cart-token?cart_token=${encodeURIComponent(
        cartToken
      )}`
    ),
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error("Error al resolver el cart_token");
  }
  const data = await res.json();
  return {
    exists: Boolean(data.exists),
    quote_id: data.quote_id ? String(data.quote_id) : undefined,
  };
}

// Lookup quote_id by Shopify order_id. Backed by the shopify_orders bridge
// table populated by the orders/paid webhook. Used by /agendar-cita to
// resolve `?shopify_order_id=` from the Order Status Page redirect.
export type ShopifyOrderLookup = { exists: boolean; quote_id?: string };

export async function fetchQuoteByShopifyOrder(
  shopifyOrderId: string
): Promise<ShopifyOrderLookup> {
  const res = await fetch(
    buildUrl(
      `/bypass/yaol/quote-by-shopify-order?shopify_order_id=${encodeURIComponent(
        shopifyOrderId
      )}`
    ),
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error("Error al resolver la orden Shopify");
  }
  const data = await res.json();
  return {
    exists: Boolean(data.exists),
    quote_id: data.quote_id ? String(data.quote_id) : undefined,
  };
}

export type RegisteredQuote = {
  articulos: string;
  servicios: string;
  duracion: number;
};

export async function fetchClientServiceAndItems(
  quoteId?: string
): Promise<RegisteredQuote> {
  if (!quoteId) {
    return { articulos: "", servicios: "", duracion: 60 };
  }
  const res = await fetch(
    buildUrl(
      `/bypass/yaol/quote-summary?quote_id=${encodeURIComponent(quoteId)}`
    ),
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error("Error al obtener los servicios y artículos");
  }
  const data = await res.json();
  return {
    articulos: data.articulos ?? "",
    servicios: data.servicios ?? "",
    duracion: Number(data.duracion) || 60,
  };
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
    buildUrl(`/bypass/yaol/get/availability?${searchParams.toString()}`),
    { cache: "no-store" }
  );
  // console.log("Fetching times with params:", { mins, suc, date });
  const data = await res.clone().json();
  if (!res.ok) {
    throw new Error("Error al obtener horarios disponibles");
  }
  return data;
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

// Payload for the Save-and-Schedule endpoint
export type SaveAndSchedulePayload = {
  client_name: string;
  phone: string;
  sucursal: string; // e.g., "NHS", "TEC"
  quote_id?: string;
  additional_notes?: string;
  items?: Array<{
    merchandise_id?: string;
    product_id?: string;
    title?: string;
    variant_title?: string;
    quantity: number;
    unit_price?: number;
    total_price?: number;
    currency?: string;
    selected_options?: Array<{ name: string; value: string }>;
  }>;
  start_at: string; // ISO like 2025-01-31T09:00:00
  duration_minutes: number;
};

export async function saveAndSchedule(data: SaveAndSchedulePayload) {
  const res = await fetch(buildUrl("/bypass/yaol/save-and-schedule"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Error al guardar y programar la cita");
  }
  return res.json();
}
