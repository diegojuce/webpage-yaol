"use client";

export const API_BASE_URL =
  process.env.SHOPIFY_BACKEND_URL || "http://localhost:3050";

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
  date: string;
  time: string;
  serviceId?: string;
};

export async function createAppointment(data: CreateAppointmentPayload) {
  const res = await fetch(buildUrl("/api/appointments"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Error al crear la cita");
  }
  return res.json();
}
