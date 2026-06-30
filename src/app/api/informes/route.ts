import { NextResponse } from "next/server";
import type { FormData, InformeResumen, StoredInforme } from "@/lib/types";
import { calcularResultado } from "@/lib/scoring";
import { getRedis, RK } from "@/lib/redis";

// No cachear: siempre datos frescos.
export const dynamic = "force-dynamic";

// Token público, corto y no adivinable, para la URL del informe.
function nuevoToken(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

// POST /api/informes  → guarda un informe nuevo y le asigna número de orden.
export async function POST(request: Request) {
  let body: { data?: FormData };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Solicitud inválida" },
      { status: 400 }
    );
  }

  const data = body.data;
  if (!data || typeof data !== "object") {
    return NextResponse.json(
      { ok: false, error: "Falta el informe" },
      { status: 400 }
    );
  }

  try {
    const redis = getRedis();

    // Número de orden ascendente y atómico.
    const orden = await redis.incr(RK.seq);
    const token = nuevoToken();
    const createdAt = new Date().toISOString();

    const stored: StoredInforme = { orden, token, createdAt, data };
    const resultado = calcularResultado(data.scores);

    const resumen: InformeResumen = {
      orden,
      token,
      createdAt,
      fecha: data.fecha ?? "",
      cliente: data.cliente ?? "",
      marcaModelo: data.marcaModelo ?? "",
      dominio: data.dominio ?? "",
      anio: data.anio ?? "",
      total: resultado.total,
      etiqueta: resultado.etiqueta,
      color: resultado.color,
    };

    // Guardar el informe completo + agregarlo al índice (más nuevo primero).
    await Promise.all([
      redis.set(RK.informe(token), stored),
      redis.lpush(RK.index, resumen),
    ]);

    return NextResponse.json({ ok: true, orden, token });
  } catch (e) {
    console.error("Error guardando informe:", e);
    return NextResponse.json(
      { ok: false, error: "No se pudo guardar el informe" },
      { status: 500 }
    );
  }
}

// GET /api/informes  → lista de resúmenes para el historial.
export async function GET() {
  try {
    const redis = getRedis();
    const items = await redis.lrange<InformeResumen>(RK.index, 0, -1);
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    console.error("Error listando informes:", e);
    return NextResponse.json(
      { ok: false, error: "No se pudo cargar el historial", items: [] },
      { status: 500 }
    );
  }
}
