import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { StoredInforme } from "@/lib/types";
import { getRedis, RK } from "@/lib/redis";
import InformeView from "@/components/InformeView";

// Siempre datos frescos desde Redis.
export const dynamic = "force-dynamic";

async function getInforme(token: string): Promise<StoredInforme | null> {
  try {
    const redis = getRedis();
    return await redis.get<StoredInforme>(RK.informe(token));
  } catch (e) {
    console.error("Error leyendo informe:", e);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const informe = await getInforme(token);
  if (!informe) return { title: "Informe no encontrado · Rodrigo Paint" };
  const { data, orden } = informe;
  const vehiculo = [data.marcaModelo, data.anio].filter(Boolean).join(" ");
  return {
    title: `Informe N° ${orden}${vehiculo ? ` · ${vehiculo}` : ""} · Rodrigo Paint`,
    description: "Certificación de vehículo usado — Rodrigo Paint.",
    robots: { index: false, follow: false },
  };
}

export default async function InformePublicoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const informe = await getInforme(token);

  if (!informe) notFound();

  let fechaGuardado = "";
  try {
    fechaGuardado = new Date(informe.createdAt).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    /* ignore */
  }

  return (
    <InformeView
      data={informe.data}
      orden={informe.orden}
      fechaGuardado={fechaGuardado}
    />
  );
}
