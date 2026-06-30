"use client";

import type { FormData } from "./types";
import { croquisSrc } from "./croquis";

async function urlToDataURL(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function nombreArchivo(data: FormData): string {
  const base =
    data.dominio?.trim() || data.informeNro?.trim() || "informe";
  return `RodrigoPaint_${base.replace(/[^a-zA-Z0-9_-]/g, "")}.pdf`;
}

export async function generarPdf(data: FormData): Promise<void> {
  const [{ pdf }, { default: ReportDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/pdf/ReportDocument"),
  ]);

  const [logoSrc, croquisBgSrc] = await Promise.all([
    urlToDataURL("/brand/logo-color.png"),
    urlToDataURL(croquisSrc(data.vehicleType)).catch(() => ""),
  ]);

  const blob = await pdf(
    <ReportDocument data={data} logoSrc={logoSrc} croquisBgSrc={croquisBgSrc} />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo(data);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
