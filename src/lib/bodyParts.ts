import type { BodyColorKey } from "./types";

// Colores de marcado del croquis (estado de cada pieza)
export const BODY_COLORS: Record<
  BodyColorKey,
  { label: string; fill: string; descripcion: string }
> = {
  original: { label: "Original", fill: "#16a34a", descripcion: "Pintura original de fábrica" },
  repintado: { label: "Repintado", fill: "#facc15", descripcion: "Panel repintado" },
  reparacionMenor: { label: "Reparación menor", fill: "#f97316", descripcion: "Reparación menor / masilla leve" },
  reparacionImportante: { label: "Reparación importante", fill: "#dc2626", descripcion: "Reparación importante / rotura" },
};

export const BODY_COLOR_ORDER: BodyColorKey[] = [
  "original",
  "repintado",
  "reparacionMenor",
  "reparacionImportante",
];
