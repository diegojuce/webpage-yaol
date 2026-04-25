import { NextResponse } from "next/server";

type SurveyPayload = {
  comments?: string;
  nps: number;
  ratings: Record<string, number>;
  source?: string;
  submittedAt?: string;
};

export async function POST(request: Request) {
  let payload: SurveyPayload;

  try {
    payload = (await request.json()) as SurveyPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "El cuerpo de la petición no es JSON válido." },
      { status: 400 },
    );
  }

  const hasRatings =
    typeof payload.ratings === "object" && payload.ratings !== null;
  const hasValidNps =
    Number.isInteger(payload.nps) && payload.nps >= 0 && payload.nps <= 10;

  if (!hasRatings || !hasValidNps) {
    return NextResponse.json(
      { ok: false, error: "Datos incompletos o inválidos en la encuesta." },
      { status: 400 },
    );
  }

  // TODO: Aquí conecta tu base de datos (Supabase, Prisma, API externa, etc.)
  // Ejemplo de campos recibidos:
  // {
  //   ratings: { atencion: 5, tiempo: 4, calidad: 5, instalaciones: 4, confianza: 5 },
  //   nps: 9,
  //   comments: "Excelente servicio",
  //   submittedAt: "2026-04-22T18:00:00.000Z",
  //   source: "encuesta-web"
  // }
  // Sugerencia: persistir `payload` tal cual para no perder datos si cambian preguntas.

  return NextResponse.json({
    ok: true,
    receivedAt: new Date().toISOString(),
  });
}
