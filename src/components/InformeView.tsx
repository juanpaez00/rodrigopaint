// Vista HTML del informe (server component, sin hooks).
// Se usa en la página pública del QR. Por defecto NO muestra la valoración
// comercial (precios) — eso es solo para el PDF/uso interno.

import type { FormData, ItemStatus } from "@/lib/types";
import { calcularResultado, AREAS_PUNTUABLES } from "@/lib/scoring";
import { EQUIPAMIENTO_ITEMS } from "@/lib/initialState";
import { croquisSrc, croquisLabel, CROQUIS_W, CROQUIS_H } from "@/lib/croquis";
import { BODY_COLORS, BODY_COLOR_ORDER } from "@/lib/bodyParts";

const STATUS_INFO: Record<
  Exclude<ItemStatus, null>,
  { label: string; color: string }
> = {
  ok: { label: "BIEN", color: "#16a34a" },
  observacion: { label: "OBSERVACIÓN", color: "#f59e0b" },
  critico: { label: "CRÍTICO", color: "#dc2626" },
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5">
      <h2 className="mb-3 rounded-md bg-rp-black px-3 py-1.5 text-sm font-bold text-white">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase text-gray-400">{label}</div>
      <div className="mt-0.5 min-h-[34px] rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-gray-800">
        {value?.trim() || "—"}
      </div>
    </div>
  );
}

function InspItem({
  name,
  status,
  obs,
}: {
  name: string;
  status: ItemStatus;
  obs: string;
}) {
  const info = status ? STATUS_INFO[status] : null;
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-800">{name}</span>
        {info && (
          <span
            className="rounded px-2 py-0.5 text-[10px] font-bold text-white"
            style={{ backgroundColor: info.color }}
          >
            {info.label}
          </span>
        )}
      </div>
      <p className={`mt-1 text-xs ${obs ? "text-gray-600" : "text-gray-400"}`}>
        {obs || "Sin observaciones."}
      </p>
    </div>
  );
}

function PhotoGrid({ label, fotos }: { label: string; fotos: string[] }) {
  if (fotos.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="mb-1.5 text-[11px] font-bold uppercase text-gray-400">
        {label}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {fotos.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt={`${label} ${i + 1}`}
            className="aspect-square w-full rounded-lg border border-gray-200 object-cover"
          />
        ))}
      </div>
    </div>
  );
}

export default function InformeView({
  data,
  orden,
  fechaGuardado,
}: {
  data: FormData;
  orden: number;
  fechaGuardado?: string;
}) {
  const resultado = calcularResultado(data.scores);
  const croquisRatio = `${CROQUIS_W} / ${CROQUIS_H}`;

  const fotoCats: { key: keyof FormData["fotos"]; label: string }[] = [
    { key: "tablero", label: "Tablero" },
    { key: "scanner", label: "Scanner" },
    { key: "pintura", label: "Medición de pintura" },
    { key: "carroceria", label: "Carrocería" },
    { key: "observaciones", label: "Observaciones" },
  ];
  const hayFotos = fotoCats.some((c) => data.fotos[c.key].length > 0);

  const neumaticos: [string, { marca: string; anio: string }][] = [
    ["Del. izq.", data.seguridad.neumaticos.delIzq],
    ["Del. der.", data.seguridad.neumaticos.delDer],
    ["Tras. izq.", data.seguridad.neumaticos.traseroIzq],
    ["Tras. der.", data.seguridad.neumaticos.traseroDer],
  ];

  return (
    <main className="min-h-screen bg-slate-100 pb-12">
      {/* Header */}
      <header className="border-b-2 border-rp-red bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-color.png"
            alt="Rodrigo Paint"
            className="h-10 w-auto"
          />
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase text-gray-700">
              Revisión y certificación de usados
            </p>
            <p className="text-[11px] text-gray-500">
              Orden N° {orden}
              {data.fecha ? ` · ${data.fecha}` : ""}
            </p>
            {data.inspector && (
              <p className="text-[11px] text-gray-500">
                Inspector: {data.inspector}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4">
        {/* Banner resultado */}
        <div className="mt-5 flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white sm:flex-row">
          <div
            className="flex flex-col items-center justify-center px-6 py-4 text-white sm:w-40"
            style={{ background: resultado.color }}
          >
            <span className="text-4xl font-extrabold">{resultado.total}</span>
            <span className="text-xs opacity-90">/ 40 puntos</span>
          </div>
          <div className="flex-1 p-4">
            <span
              className="text-lg font-extrabold"
              style={{ color: resultado.color }}
            >
              {resultado.etiqueta}
            </span>
            <p className="mt-1 text-sm text-gray-500">{resultado.descripcion}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {AREAS_PUNTUABLES.map((a) => (
                <div
                  key={a.key}
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-center"
                >
                  <div className="text-[10px] uppercase text-gray-400">
                    {a.label}
                  </div>
                  <div className="text-sm font-bold text-gray-800">
                    {data.scores[a.key]}/10
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 1. Identificación */}
        <Section title="1. Identificación del Vehículo">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="col-span-2">
              <Field label="Marca / Modelo / Versión" value={data.marcaModelo} />
            </div>
            <Field label="Año" value={data.anio} />
            <Field label="Dominio" value={data.dominio} />
            <div className="col-span-2">
              <Field label="Cliente" value={data.cliente} />
            </div>
            <div className="col-span-2">
              <Field label="VIN / N° de Chasis" value={data.vin} />
            </div>
            <Field label="Kilometraje" value={data.kilometraje} />
            <Field label="Fecha" value={data.fecha} />
          </div>
        </Section>

        {/* 2. Mecánica */}
        <Section title="2. Mecánica, Caja & Electrónica">
          <div className="space-y-2">
            <InspItem name="Motor & Caja" status={data.mecanica.motorCaja.status} obs={data.mecanica.motorCaja.obs} />
            <InspItem name="Transmisión / Diferencial" status={data.mecanica.transmisionDiferencial.status} obs={data.mecanica.transmisionDiferencial.obs} />
            <InspItem name="Tren delantero & Dirección" status={data.mecanica.trenDelanteroDireccion.status} obs={data.mecanica.trenDelanteroDireccion.obs} />
            <InspItem name="Electrónica & Escáner" status={data.mecanica.electronicaEscaner.status} obs={data.mecanica.electronicaEscaner.obs} />
            <InspItem name="Estado de batería" status={data.mecanica.estadoBateria.status} obs={data.mecanica.estadoBateria.obs} />
          </div>
          <div className="mt-3 rounded-xl border border-gray-200 p-3">
            <h3 className="mb-3 text-xs font-bold uppercase text-gray-500">
              Historial de mantenimiento (declarado)
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Correas / Dist." value={data.mecanica.correasDist} />
              <Field label="Service motor" value={data.mecanica.serviceMotor} />
              <Field label="Service caja" value={data.mecanica.serviceCaja} />
            </div>
            {data.mecanica.aportesPropietario && (
              <div className="mt-3">
                <Field
                  label="Aportes del propietario anterior"
                  value={data.mecanica.aportesPropietario}
                />
              </div>
            )}
          </div>
        </Section>

        {/* 3. Seguridad */}
        <Section title="3. Seguridad, Chapa & Tren">
          <div className="space-y-2">
            <InspItem name="Suspensión / Amortiguación" status={data.seguridad.suspension.status} obs={data.seguridad.suspension.obs} />
            <InspItem name="Frenos (discos/pastillas)" status={data.seguridad.frenos.status} obs={data.seguridad.frenos.obs} />
            <InspItem name="Chapa & Pintura" status={data.seguridad.chapaPintura.status} obs={data.seguridad.chapaPintura.obs} />
            <InspItem name="Tapicería e interior" status={data.seguridad.tapiceria.status} obs={data.seguridad.tapiceria.obs} />
            <InspItem name="Vidrios & Cristales" status={data.seguridad.vidrios.status} obs={data.seguridad.vidrios.obs} />
          </div>
          <div className="mt-3 rounded-xl border border-gray-200 p-3">
            <h3 className="mb-3 text-xs font-bold uppercase text-gray-500">
              Estado de neumáticos (Marca / Año)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {neumaticos.map(([label, n]) => (
                <Field
                  key={label}
                  label={label}
                  value={`${n.marca} ${n.anio}`.trim()}
                />
              ))}
            </div>
            {data.seguridad.obsNeumaticos && (
              <div className="mt-3">
                <Field
                  label="Observaciones neumáticos / auxilio"
                  value={data.seguridad.obsNeumaticos}
                />
              </div>
            )}
          </div>
        </Section>

        {/* 4. Equipamiento */}
        <Section title="4. Equipamiento & Seguridad">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {EQUIPAMIENTO_ITEMS.map((it) => {
              const on = data.equipamiento[it.key];
              return (
                <div
                  key={it.key}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                    on
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                      on
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {on ? "✓" : ""}
                  </span>
                  {it.label}
                </div>
              );
            })}
          </div>
        </Section>

        {/* Diagnóstico + Kilometraje */}
        <Section title="Diagnóstico Electrónico & Kilometraje">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Módulos analizados" value={data.diagnostico.modulosAnalizados} />
              <Field label="Fallas detectadas" value={data.diagnostico.fallasDetectadas} />
              <div className="col-span-2">
                <Field label="Fallas borradas" value={data.diagnostico.fallasBorradas} />
              </div>
              {data.diagnostico.obs && (
                <div className="col-span-2">
                  <Field label="Observaciones" value={data.diagnostico.obs} />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="KM en tablero" value={data.kilometrajeCheck.kmTablero} />
              <Field
                label="Consistencia"
                value={data.kilometrajeCheck.consistente ? "Consistente" : "Inconsistente"}
              />
              {data.kilometrajeCheck.obs && (
                <div className="col-span-2">
                  <Field label="Observaciones" value={data.kilometrajeCheck.obs} />
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* 5. Carrocería */}
        <Section title={`5. Mapeo de Carrocería · ${croquisLabel(data.vehicleType)}`}>
          <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1">
            {BODY_COLOR_ORDER.map((k) => (
              <div key={k} className="flex items-center gap-1.5">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: BODY_COLORS[k].fill }}
                />
                <span className="text-[11px] text-gray-600">
                  {BODY_COLORS[k].label} — {BODY_COLORS[k].descripcion}
                </span>
              </div>
            ))}
          </div>
          <div
            className="relative mx-auto w-full max-w-xl"
            style={{ aspectRatio: croquisRatio }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={croquisSrc(data.vehicleType)}
              alt="Croquis"
              className="absolute inset-0 h-full w-full object-contain"
            />
            {data.croquisDibujo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.croquisDibujo}
                alt="Marcado"
                className="absolute inset-0 h-full w-full object-contain"
              />
            )}
          </div>
          {data.resumenPintura && (
            <div className="mt-3">
              <Field label="Resumen de pintura" value={data.resumenPintura} />
            </div>
          )}
        </Section>

        {/* Fotos */}
        {hayFotos && (
          <Section title="Registro Fotográfico">
            {fotoCats.map((c) => (
              <PhotoGrid key={c.key} label={c.label} fotos={data.fotos[c.key]} />
            ))}
          </Section>
        )}

        {/* Firma */}
        <Section title="Firma del Inspector">
          <div className="w-full max-w-xs rounded-lg border border-gray-200 p-3">
            {data.firma.dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.firma.dataUrl}
                alt="Firma"
                className="h-16 w-full object-contain"
              />
            ) : (
              <div className="h-16" />
            )}
            <div className="mt-1 border-t border-gray-300 pt-2">
              <p className="text-sm font-bold text-gray-800">
                {data.firma.aclaracion || data.inspector || "—"}
              </p>
              {data.firma.responsable && (
                <p className="text-xs text-gray-500">{data.firma.responsable}</p>
              )}
            </div>
          </div>
        </Section>

        {/* Footer */}
        <footer className="mt-8 border-t border-gray-200 pt-4 text-center text-[11px] leading-relaxed text-gray-400">
          <p>
            El informe de inspección ayuda a minimizar riesgos en la compra; no
            elimina vicios ocultos no inspeccionables.
          </p>
          <p className="mt-1">
            RODRIGO PAINT · Santa Fe 2137, San Miguel de Tucumán · WhatsApp 381
            624 2542 · @rodrigo.paint
          </p>
          {fechaGuardado && (
            <p className="mt-1 text-gray-300">Emitido: {fechaGuardado}</p>
          )}
        </footer>
      </div>
    </main>
  );
}
