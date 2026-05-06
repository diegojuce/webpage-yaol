const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

// Labels for the 30 service checklist items
const ITEM_LABELS: Record<string, string> = {
  item1: "Aceite del motor",
  item2: "Filtro de aceite",
  item3: "Filtro de aire",
  item4: "Filtro de cabina",
  item5: "Líquido de frenos",
  item6: "Líquido refrigerante",
  item7: "Líquido de dirección hidráulica",
  item8: "Líquido limpiaparabrisas",
  item9: "Batería",
  item10: "Frenos delanteros",
  item11: "Frenos traseros",
  item12: "Pastillas delanteras",
  item13: "Pastillas traseras",
  item14: "Discos delanteros",
  item15: "Discos traseros",
  item16: "Suspensión delantera",
  item17: "Suspensión trasera",
  item18: "Amortiguadores delanteros",
  item19: "Amortiguadores traseros",
  item20: "Dirección",
  item21: "Transmisión",
  item22: "Sistema de escape",
  item23: "Luces delanteras",
  item24: "Luces traseras",
  item25: "Limpiabrisas",
  item26: "Banda de distribución",
  item27: "Bujías",
  item28: "Cables de bujías",
  item29: "Correa serpentina",
  item30: "Sistema de A/C",
};

type RadioValue = "OK" | "Cambio" | "Preventivo" | string;

type PostCheck = {
  noteState: Record<string, string>;
  radioState: Record<string, RadioValue>;
  cotizacionPCK: number;
  tireDataState: Record<string, string>;
  tireRadioState: Record<string, string>;
};

type EventData = {
  client_name: string | null;
  id: string;
  quote_id: string | number | null;
  postcheck: PostCheck;
};

type RawEventData = {
  id?: string | number | null;
  quote_id?: string | number | null;
  client_name?: string | null;
  postcheck?: unknown;
  check_out?: unknown;
};

type FetchResult =
  | { ok: true; data: EventData }
  | { ok: false; status: number; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asStringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, String(item ?? "")]),
  );
}

function normalizePostCheck(value: unknown): PostCheck | null {
  if (!isRecord(value)) return null;

  return {
    noteState: asStringRecord(value.noteState),
    radioState: asStringRecord(value.radioState),
    cotizacionPCK: Number(value.cotizacionPCK) || 0,
    tireDataState: asStringRecord(value.tireDataState),
    tireRadioState: asStringRecord(value.tireRadioState),
  };
}

function normalizeEventData(value: unknown): EventData | null {
  if (!isRecord(value)) return null;

  const raw = value as RawEventData;
  const postcheck = normalizePostCheck(raw.postcheck ?? raw.check_out);

  if (!postcheck) return null;

  return {
    client_name: raw.client_name ?? null,
    id: String(raw.id ?? raw.quote_id ?? ""),
    quote_id: raw.quote_id ?? null,
    postcheck,
  };
}

async function fetchEvent(id: string): Promise<FetchResult> {
  try {
    const baseUrl = BACKEND_URL.trim().replace(/\/$/, "");

    if (!baseUrl) {
      return {
        ok: false,
        status: 0,
        message: "NEXT_PUBLIC_BACKEND_URL no está configurado",
      };
    }

    const res = await fetch(
      `${baseUrl}/bypass/yaol/postcheck/${encodeURIComponent(id)}`,
      {
        cache: "no-store",
      },
    );

    if (!res.ok) {
      let message = res.statusText;
      try {
        const errorBody = await res.json();
        if (isRecord(errorBody) && typeof errorBody.error === "string") {
          message = errorBody.error;
        }
      } catch {
        // Keep the HTTP status text when the backend does not return JSON.
      }
      return { ok: false, status: res.status, message };
    }

    const data = normalizeEventData(await res.json());

    if (!data) {
      return {
        ok: false,
        status: 404,
        message: "No hay reporte post-check para este folio",
      };
    }

    return { ok: true, data };
  } catch (e) {
    return { ok: false, status: 0, message: String(e) };
  }
}

function StatusBadge({ value }: { value: RadioValue }) {
  if (value === "OK") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 6l3 3 5-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        OK
      </span>
    );
  }
  if (value === "Cambio") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
          <path
            d="M6 2v4M6 8.5v.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        Cambio
      </span>
    );
  }
  if (value === "Preventivo") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
          <path
            d="M6 1L1 10h10L6 1zM6 5v2.5M6 9v.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Preventivo
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
      {value}
    </span>
  );
}

function TireRadioBadge({ value }: { value: string }) {
  const isOK = value === "OK";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
        isOK ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
      }`}
    >
      {value}
    </span>
  );
}

export default async function StatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await fetchEvent(id);

  if (!result.ok) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-gray-50 px-4 pt-28">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
          <p className="text-4xl font-bold text-gray-300">
            {result.status || "ERR"}
          </p>
          <p className="mt-2 font-semibold text-gray-700">
            No se pudo cargar el reporte
          </p>
          <p className="mt-1 text-sm text-gray-400">{result.message}</p>
        </div>
      </section>
    );
  }

  const { client_name, postcheck, quote_id } = result.data;
  const folio = quote_id ? String(quote_id) : id;
  const {
    noteState,
    radioState,
    cotizacionPCK,
    tireDataState,
    tireRadioState,
  } = postcheck;

  const serviceItems = Object.keys(ITEM_LABELS).map((key) => ({
    key,
    label: ITEM_LABELS[key]!,
    status: radioState[key] ?? "OK",
    note: noteState[key] ?? "",
  }));

  const tires = [1, 2, 3, 4].map((n) => ({
    number: n,
    dot: tireDataState[`tire${n}_dot`] ?? "—",
    llegar: tireDataState[`tire${n}_llegar`] ?? "—",
    entregar: tireDataState[`tire${n}_entregar`] ?? "—",
    status: tireRadioState[`tire${n}`] ?? "OK",
  }));

  const tire5 = {
    marca: tireDataState["tire5_marca"] ?? "—",
    medida: tireDataState["tire5_medida"] ?? "—",
    modelo: tireDataState["tire5_modelo"] ?? "—",
    status: tireRadioState["tire5"] ?? "OK",
  };

  const hasAlerts = serviceItems.some(
    (i) => i.status === "Cambio" || i.status === "Preventivo",
  );

  return (
    <section className="min-h-screen bg-gray-50 px-4 pb-16 pt-28 text-gray-900">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Reporte de servicio
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            {client_name ?? "Reporte post-check"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Folio: <span className="font-mono text-gray-700">{folio}</span>
          </p>
          {hasAlerts && (
            <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
              Se encontraron artículos que requieren atención. Revisa la lista a
              continuación.
            </div>
          )}
        </div>

        {/* Service Checklist */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Lista de revisión</h2>
          </div>
          <ul className="divide-y divide-gray-100">
            {serviceItems.map(({ key, label, status, note }) => (
              <li key={key} className="flex items-start gap-3 px-6 py-3">
                <span className="mt-0.5 flex-1 text-sm text-gray-700">
                  {label}
                </span>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge value={status} />
                  {note && (
                    <span className="max-w-[180px] text-right text-xs text-gray-500">
                      {note}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Tires */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Neumáticos</h2>
          </div>

          {/* 4 existing tires */}
          <div className="divide-y divide-gray-100">
            {tires.map(({ number, dot, llegar, entregar, status }) => (
              <div key={number} className="px-6 py-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Llanta {number}
                  </span>
                  <TireRadioBadge value={status} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                  <div>
                    <p className="font-medium text-gray-400">DOT</p>
                    <p className="font-mono text-gray-700">{dot}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-400">Al llegar</p>
                    <p className="text-gray-700">{llegar} PSI</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-400">Al entregar</p>
                    <p className="text-gray-700">{entregar} PSI</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tire 5 — new/spare */}
          {(tire5.marca !== "—" || tire5.medida !== "—") && (
            <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  Llanta nueva / adicional
                </span>
                <TireRadioBadge value={tire5.status} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                <div>
                  <p className="font-medium text-gray-400">Marca</p>
                  <p className="capitalize text-gray-700">{tire5.marca}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-400">Medida</p>
                  <p className="text-gray-700">{tire5.medida}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-400">Modelo</p>
                  <p className="capitalize text-gray-700">{tire5.modelo}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cotización */}
        {cotizacionPCK > 0 && (
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
            <div className="flex items-center justify-between px-6 py-5">
              <h2 className="font-semibold text-gray-900">Cotización</h2>
              <span className="text-xl font-bold text-gray-900">
                ${cotizacionPCK.toLocaleString("es-MX")}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
