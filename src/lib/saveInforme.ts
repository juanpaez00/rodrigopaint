"use client";

import type { FormData } from "./types";
import { optimizarParaWeb } from "./webOptimize";

export interface InformeGuardado {
  orden: number;
  token: string;
  url: string; // URL pública absoluta del informe
}

// Tamaño máximo de payload que aceptan las funciones de Vercel (~4.5 MB).
const LIMITE_BYTES = 4_300_000;

// Optimiza las fotos, envía el informe al servidor y devuelve el número de
// orden + la URL pública. Lanza un Error con mensaje claro si algo falla.
export async function guardarInforme(data: FormData): Promise<InformeGuardado> {
  const optimizado = await optimizarParaWeb(data);
  const payload = JSON.stringify({ data: optimizado });

  // Estimación de bytes (las fotos base64 son ASCII, 1 char ≈ 1 byte).
  if (payload.length > LIMITE_BYTES) {
    throw new Error(
      "El informe tiene demasiadas fotos para guardarlo en la web. " +
        "Quitá algunas fotos y volvé a generar. (El PDF igual se descargó.)"
    );
  }

  const res = await fetch("/api/informes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    throw new Error(json?.error || "No se pudo guardar el informe en la web.");
  }

  const url = `${window.location.origin}/informe/${json.token}`;
  return { orden: json.orden, token: json.token, url };
}
