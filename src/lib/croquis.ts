// Configuración del croquis: ilustraciones blueprint + lienzo de dibujo

export type VehicleType = "sedan" | "suv" | "pickup";

export const CROQUIS_TYPES: { id: VehicleType; label: string; src: string }[] = [
  { id: "sedan", label: "Sedán", src: "/croquis/sedan.png" },
  { id: "suv", label: "SUV", src: "/croquis/suv.png" },
  { id: "pickup", label: "Pickup", src: "/croquis/pickup.png" },
];

// Relación de aspecto fija del lienzo (~2.08:1). La imagen va con object-contain
// (sin distorsión) y el lienzo fijo asegura que el dibujo siga alineado al cambiar de tipo.
export const CROQUIS_W = 1000;
export const CROQUIS_H = 480;
export const CROQUIS_ASPECT = CROQUIS_W / CROQUIS_H;

export function croquisSrc(t: VehicleType): string {
  return CROQUIS_TYPES.find((x) => x.id === t)?.src ?? CROQUIS_TYPES[0].src;
}

export function croquisLabel(t: VehicleType): string {
  return CROQUIS_TYPES.find((x) => x.id === t)?.label ?? "";
}
