// Alta pública al Club Yantissimo. Pega directo a backend-yssm
// (/public/club/*), que está montado antes de authMiddleware y cuyo CORS ya
// permite *.yantissimo.com.
//
// El paso del código por WhatsApp no es decorativo: el backend no lee ni
// escribe nada del cliente hasta que se prueba la posesión del teléfono, así
// que el código se pide siempre, sea cliente nuevo o de toda la vida.

const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "").replace(/\/$/, "");

export type Beneficio = {
  id: number | string;
  name: string;
  description?: string | null;
  yearly_quota?: number | null;
};

export type VehiculoClub = {
  id: number;
  plate?: string | null;
  brand?: string | null;
  model?: string | null;
  year?: number | string | null;
  por_definir?: boolean;
  membership_id?: number | null;
};

export type VehiculoNuevo = {
  placa?: string;
  marca?: string;
  modelo?: string;
  anio?: string;
};

// Mensajes del backend traducidos a copy de cliente. El backend responde
// códigos cortos a propósito (no filtran si el teléfono existe).
const ERRORES: Record<string, string> = {
  telefono_invalido: "Escribe un celular de 10 dígitos.",
  codigo_invalido: "El código no es correcto o ya venció. Pide uno nuevo.",
  demasiados_intentos: "Ya pediste varios códigos. Espera unos minutos.",
  sesion_invalida: "La sesión expiró. Vuelve a empezar.",
  vehiculo_no_encontrado: "No encontramos ese vehículo.",
  vehiculo_incompleto: "Necesitamos al menos la placa o la marca.",
  vehiculo_requerido: "Elige un vehículo para tu membresía.",
  membresia_duplicada: "Ese vehículo ya tiene una membresía activa.",
  CLUB_VIGENTE: "Ese vehículo ya tiene una membresía del Club vigente.",
  pago_no_disponible:
    "El pago en línea no está disponible por ahora. Puedes comprar tu membresía en cualquier sucursal.",
  membresia_por_definir_existente:
    "Ya tienes una membresía pendiente de asignar vehículo. Para inscribir otro auto, captura sus datos aquí o pásate a tu sucursal.",
  pase_no_disponible:
    "La tarjeta digital no está disponible en este momento. Pásala a recoger a tu sucursal.",
};

export class ClubError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "ClubError";
    this.code = code;
  }
}

export const soloDigitos = (v: unknown) => String(v ?? "").replace(/\D/g, "");

async function post<T>(path: string, body: unknown, token?: string | null) {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ClubError("No pudimos conectar. Revisa tu conexión.");
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    // 410 = pago en línea apagado. Un 401 sin código = token vencido (ojo:
    // /verificar también responde 401, con codigo_invalido).
    const code =
      res.status === 410
        ? "pago_no_disponible"
        : (((data?.code ?? data?.error) as string | undefined) ??
          (res.status === 401 ? "sesion_invalida" : undefined));
    throw new ClubError(
      (code && ERRORES[code]) || data?.error_message || "Algo salió mal.",
      code
    );
  }
  return data as T;
}

export async function fetchBeneficios(): Promise<Beneficio[]> {
  try {
    const res = await fetch(`${BASE}/public/club/beneficios`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.beneficios) ? data.beneficios : [];
  } catch (err) {
    console.error("[club] beneficios fetch error:", err);
    return [];
  }
}

export async function pedirCodigo(telefono: string) {
  const data = await post<{ ok?: boolean }>("/public/club/codigo", {
    telefono: soloDigitos(telefono),
  });
  // El backend contesta 200 con ok:false cuando WhatsApp rechazó el envío.
  if (data?.ok === false) {
    throw new ClubError(
      "No pudimos enviarte el mensaje de WhatsApp. Pide tu alta en cualquier sucursal Yantissimo."
    );
  }
}

export async function verificarCodigo(
  telefono: string,
  codigo: string,
  nombre?: string
) {
  const data = await post<{
    token: string;
    vehiculos?: VehiculoClub[];
    precio_club?: number | null;
  }>(
    "/public/club/verificar",
    {
      telefono: soloDigitos(telefono),
      codigo,
      nombre: nombre?.trim() || undefined,
    }
  );
  return {
    token: data.token,
    vehiculos: Array.isArray(data.vehiculos) ? data.vehiculos : [],
    // MXN con IVA; null = no se puede vender en línea.
    precio_club: typeof data.precio_club === "number" ? data.precio_club : null,
  };
}

// Compra en línea (la web ya no da altas gratis): el backend crea el documento
// con el CS1 y devuelve la liga del checkout nativo; el webhook activa la
// membresía al pagar. Idempotente: reintentar devuelve la misma liga.
export async function comprar(
  token: string,
  eleccion: string,
  nuevo: VehiculoNuevo
): Promise<{ payment_url: string; membership_number: string }> {
  let body: Record<string, unknown>;
  if (eleccion === "despues") {
    body = { sin_vehiculo: true };
  } else if (eleccion === "nuevo") {
    body = {
      vehiculo: {
        placa: nuevo.placa?.trim() || undefined,
        marca: nuevo.marca?.trim() || undefined,
        modelo: nuevo.modelo?.trim() || undefined,
        anio: nuevo.anio?.trim() || undefined,
      },
    };
  } else {
    body = { vehicle_id: Number(eleccion) };
  }
  return post("/public/club/comprar", body, token);
}

// El .pkpass viene como binario firmado, así que no pasa por post().
export async function descargarPase(token: string, membershipNumber: string) {
  let res: Response;
  try {
    res = await fetch(
      `${BASE}/public/club/pase/${encodeURIComponent(membershipNumber)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch {
    throw new ClubError("No se pudo generar tu tarjeta. Revisa tu conexión.");
  }

  if (!res.ok) {
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    const code = data?.error as string | undefined;
    throw new ClubError(
      (code && ERRORES[code]) || "No se pudo generar tu tarjeta.",
      code
    );
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "club-yantissimo.pkpass";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
