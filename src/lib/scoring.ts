import type { Scores } from "./types";

export interface ResultadoFinal {
  total: number; // 0-40
  etiqueta: string;
  color: string; // hex
  descripcion: string;
}

export function calcularTotal(scores: Scores): number {
  const vals = [
    scores.diagnostico,
    scores.kilometraje,
    scores.mecanica,
    scores.carroceria,
  ];
  return vals.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
}

export function calcularResultado(scores: Scores): ResultadoFinal {
  const total = calcularTotal(scores);

  if (total >= 36) {
    return {
      total,
      etiqueta: "EXCELENTE",
      color: "#16a34a",
      descripcion: "Vehículo en excelente estado general. Compra recomendada.",
    };
  }
  if (total >= 30) {
    return {
      total,
      etiqueta: "MUY BUENO",
      color: "#65a30d",
      descripcion: "Vehículo en muy buen estado. Detalles menores a considerar.",
    };
  }
  if (total >= 20) {
    return {
      total,
      etiqueta: "CON OBSERVACIONES",
      color: "#f59e0b",
      descripcion:
        "Vehículo con observaciones. Revisar los puntos detallados antes de decidir.",
    };
  }
  return {
    total,
    etiqueta: "NO RECOMENDADO",
    color: "#dc2626",
    descripcion: "Vehículo con problemas relevantes. Compra no recomendada.",
  };
}

// Áreas puntuables (4 x 10 = 40)
export const AREAS_PUNTUABLES: { key: keyof Scores; label: string }[] = [
  { key: "diagnostico", label: "Diagnóstico Electrónico" },
  { key: "kilometraje", label: "Kilometraje" },
  { key: "mecanica", label: "Mecánica General" },
  { key: "carroceria", label: "Carrocería / Pintura" },
];
