"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { obtenerSesion, cerrarSesion } from "@/lib/session";
import type { FormData, InspeccionItem, Usuario } from "@/lib/types";
import {
  createEmptyForm,
  generarInformeNro,
  hoyISO,
  EQUIPAMIENTO_ITEMS,
} from "@/lib/initialState";
import { calcularResultado, AREAS_PUNTUABLES } from "@/lib/scoring";
import { generarPdf } from "@/lib/generatePdf";
import { SectionCard, TextInput, TextArea } from "@/components/Fields";
import InspectionItemRow from "@/components/InspectionItemRow";
import ScoreSlider from "@/components/ScoreSlider";
import PhotoUpload from "@/components/PhotoUpload";
import Croquis from "@/components/Croquis";
import SignaturePad from "@/components/SignaturePad";

const STORAGE_KEY = "rp_form_v1";

export default function Home() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState<FormData>(createEmptyForm);
  const [generating, setGenerating] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Auth guard + carga de borrador (inicialización en mount: requiere localStorage)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const sesion = obtenerSesion();
    if (!sesion) {
      router.replace("/login");
      return;
    }
    setUsuario(sesion);

    let loaded = createEmptyForm();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) loaded = { ...loaded, ...(JSON.parse(raw) as FormData) };
    } catch {
      /* ignore */
    }
    if (!loaded.informeNro) loaded.informeNro = generarInformeNro();
    if (!loaded.fecha) loaded.fecha = hoyISO();
    if (!loaded.inspector) loaded.inspector = sesion.nombre;
    if (!loaded.firma.responsable)
      loaded.firma.responsable = `${sesion.nombre} · ${sesion.rolInspector}`;
    setForm(loaded);
    setReady(true);
  }, [router]);

  // Persistir borrador
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      setSaveMsg(
        "⚠ No se pudo guardar el borrador localmente (muchas fotos). El PDF igual se genera bien."
      );
    }
  }, [form, ready]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateItem(
    group: "mecanica" | "seguridad",
    key: string,
    patch: Partial<InspeccionItem>
  ) {
    setForm((f) => ({
      ...f,
      [group]: {
        ...f[group],
        // @ts-expect-error acceso dinámico controlado
        [key]: { ...f[group][key], ...patch },
      },
    }));
  }

  function logout() {
    cerrarSesion();
    router.replace("/login");
  }

  function nuevoInforme() {
    if (!confirm("¿Empezar un informe nuevo? Se borrarán los datos actuales.")) return;
    const fresh = createEmptyForm();
    fresh.informeNro = generarInformeNro();
    fresh.fecha = hoyISO();
    fresh.inspector = usuario?.nombre ?? "";
    fresh.firma.responsable = usuario
      ? `${usuario.nombre} · ${usuario.rolInspector}`
      : "";
    setForm(fresh);
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      await generarPdf(form);
    } catch (e) {
      console.error(e);
      alert("Ocurrió un error al generar el PDF. Revisá la consola.");
    } finally {
      setGenerating(false);
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-400">
        Cargando…
      </div>
    );
  }

  const resultado = calcularResultado(form.scores);

  return (
    <div className="min-h-screen bg-slate-100 pb-28">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-gray-800 bg-rp-black">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Image
            src="/brand/logo-dark.png"
            alt="Rodrigo Paint"
            width={200}
            height={71}
            priority
            className="h-9 w-auto"
          />
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-gray-300 sm:block">
              {usuario?.nombre}
            </span>
            <button
              onClick={nuevoInforme}
              className="rounded-lg border border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-200 transition hover:border-rp-red hover:text-white"
            >
              Nuevo
            </button>
            <button
              onClick={logout}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-400 transition hover:text-white"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-5 px-4 py-5">
        {saveMsg && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            {saveMsg}
          </p>
        )}

        {/* Banner resultado */}
        <div className="rp-card flex flex-col items-stretch overflow-hidden sm:flex-row">
          <div
            className="flex flex-col items-center justify-center px-6 py-4 text-white sm:w-44"
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
                  <div className="text-[10px] uppercase text-gray-400">{a.label}</div>
                  <div className="text-sm font-bold text-gray-800">
                    {form.scores[a.key]}/10
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 1. Identificación */}
        <SectionCard num="1" title="Identificación del Vehículo">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <TextInput
              label="Informe N°"
              value={form.informeNro}
              onChange={(v) => set("informeNro", v)}
            />
            <TextInput
              label="Fecha"
              type="date"
              value={form.fecha}
              onChange={(v) => set("fecha", v)}
            />
            <TextInput
              label="Inspector"
              value={form.inspector}
              onChange={(v) => set("inspector", v)}
              className="col-span-2"
            />
            <TextInput
              label="Marca / Modelo / Versión"
              value={form.marcaModelo}
              onChange={(v) => set("marcaModelo", v)}
              className="col-span-2"
              placeholder="Ej: Toyota Etios XLS 1.5"
            />
            <TextInput
              label="Año"
              value={form.anio}
              onChange={(v) => set("anio", v)}
              inputMode="numeric"
            />
            <TextInput
              label="Dominio (Patente)"
              value={form.dominio}
              onChange={(v) => set("dominio", v)}
              placeholder="AE316NT"
            />
            <TextInput
              label="Cliente"
              value={form.cliente}
              onChange={(v) => set("cliente", v)}
              className="col-span-2"
            />
            <TextInput
              label="VIN / N° de Chasis"
              value={form.vin}
              onChange={(v) => set("vin", v)}
              className="col-span-2"
            />
            <TextInput
              label="Kilometraje"
              value={form.kilometraje}
              onChange={(v) => set("kilometraje", v)}
              inputMode="numeric"
              className="col-span-2"
            />
          </div>
        </SectionCard>

        {/* 2. Mecánica */}
        <SectionCard num="2" title="Mecánica, Caja & Electrónica">
          <div className="space-y-3">
            <InspectionItemRow name="Motor & Caja" item={form.mecanica.motorCaja} onChange={(p) => updateItem("mecanica", "motorCaja", p)} />
            <InspectionItemRow name="Transmisión / Diferencial" item={form.mecanica.transmisionDiferencial} onChange={(p) => updateItem("mecanica", "transmisionDiferencial", p)} />
            <InspectionItemRow name="Tren delantero & Dirección" item={form.mecanica.trenDelanteroDireccion} onChange={(p) => updateItem("mecanica", "trenDelanteroDireccion", p)} />
            <InspectionItemRow name="Electrónica & Escáner" item={form.mecanica.electronicaEscaner} onChange={(p) => updateItem("mecanica", "electronicaEscaner", p)} />
            <InspectionItemRow name="Estado de batería" item={form.mecanica.estadoBateria} onChange={(p) => updateItem("mecanica", "estadoBateria", p)} />
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 p-3">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
              Historial de mantenimiento (declarado)
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <TextInput label="Correas / Dist." value={form.mecanica.correasDist} onChange={(v) => setForm((f) => ({ ...f, mecanica: { ...f.mecanica, correasDist: v } }))} placeholder="KM / Fecha" />
              <TextInput label="Service motor" value={form.mecanica.serviceMotor} onChange={(v) => setForm((f) => ({ ...f, mecanica: { ...f.mecanica, serviceMotor: v } }))} placeholder="KM / Fecha" />
              <TextInput label="Service caja" value={form.mecanica.serviceCaja} onChange={(v) => setForm((f) => ({ ...f, mecanica: { ...f.mecanica, serviceCaja: v } }))} placeholder="KM / Fecha" />
            </div>
            <TextArea label="Aportes del propietario anterior" value={form.mecanica.aportesPropietario} onChange={(v) => setForm((f) => ({ ...f, mecanica: { ...f.mecanica, aportesPropietario: v } }))} className="mt-4" />
          </div>
        </SectionCard>

        {/* 3. Seguridad */}
        <SectionCard num="3" title="Seguridad, Chapa & Tren">
          <div className="space-y-3">
            <InspectionItemRow name="Suspensión / Amortiguación" item={form.seguridad.suspension} onChange={(p) => updateItem("seguridad", "suspension", p)} />
            <InspectionItemRow name="Frenos (discos/pastillas)" item={form.seguridad.frenos} onChange={(p) => updateItem("seguridad", "frenos", p)} />
            <InspectionItemRow name="Chapa & Pintura" item={form.seguridad.chapaPintura} onChange={(p) => updateItem("seguridad", "chapaPintura", p)} />
            <InspectionItemRow name="Tapicería e interior" item={form.seguridad.tapiceria} onChange={(p) => updateItem("seguridad", "tapiceria", p)} />
            <InspectionItemRow name="Vidrios & Cristales" item={form.seguridad.vidrios} onChange={(p) => updateItem("seguridad", "vidrios", p)} />
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 p-3">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
              Estado de neumáticos (Marca / Año)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {(
                [
                  ["delIzq", "Del. izquierdo"],
                  ["delDer", "Del. derecho"],
                  ["traseroIzq", "Tras. izquierdo"],
                  ["traseroDer", "Tras. derecho"],
                ] as const
              ).map(([k, label]) => (
                <div key={k} className="rounded-lg border border-gray-100 bg-gray-50 p-2">
                  <p className="mb-2 text-[11px] font-semibold text-gray-500">{label}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="rp-input"
                      placeholder="Marca"
                      value={form.seguridad.neumaticos[k].marca}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          seguridad: {
                            ...f.seguridad,
                            neumaticos: {
                              ...f.seguridad.neumaticos,
                              [k]: { ...f.seguridad.neumaticos[k], marca: e.target.value },
                            },
                          },
                        }))
                      }
                    />
                    <input
                      className="rp-input"
                      placeholder="Año"
                      inputMode="numeric"
                      value={form.seguridad.neumaticos[k].anio}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          seguridad: {
                            ...f.seguridad,
                            neumaticos: {
                              ...f.seguridad.neumaticos,
                              [k]: { ...f.seguridad.neumaticos[k], anio: e.target.value },
                            },
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            <TextArea
              label="Observaciones técnicas neumáticos / auxilio"
              value={form.seguridad.obsNeumaticos}
              onChange={(v) => setForm((f) => ({ ...f, seguridad: { ...f.seguridad, obsNeumaticos: v } }))}
              className="mt-4"
            />
          </div>
        </SectionCard>

        {/* 4. Equipamiento */}
        <SectionCard num="4" title="Equipamiento & Seguridad">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {EQUIPAMIENTO_ITEMS.map((it) => {
              const on = form.equipamiento[it.key];
              return (
                <button
                  key={it.key}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      equipamiento: { ...f.equipamiento, [it.key]: !on },
                    }))
                  }
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                    on
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 bg-white text-gray-500"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                      on ? "border-green-500 bg-green-500 text-white" : "border-gray-300"
                    }`}
                  >
                    {on ? "✓" : ""}
                  </span>
                  {it.label}
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* Diagnóstico electrónico */}
        <SectionCard title="Diagnóstico Electrónico">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput label="Módulos analizados" value={form.diagnostico.modulosAnalizados} onChange={(v) => setForm((f) => ({ ...f, diagnostico: { ...f.diagnostico, modulosAnalizados: v } }))} inputMode="numeric" placeholder="Ej: 18" />
            <TextInput label="Fallas detectadas" value={form.diagnostico.fallasDetectadas} onChange={(v) => setForm((f) => ({ ...f, diagnostico: { ...f.diagnostico, fallasDetectadas: v } }))} placeholder="Ej: Sin fallas / 2 códigos" />
            <TextInput label="Fallas borradas" value={form.diagnostico.fallasBorradas} onChange={(v) => setForm((f) => ({ ...f, diagnostico: { ...f.diagnostico, fallasBorradas: v } }))} className="sm:col-span-2" />
            <TextArea label="Observaciones" value={form.diagnostico.obs} onChange={(v) => setForm((f) => ({ ...f, diagnostico: { ...f.diagnostico, obs: v } }))} className="sm:col-span-2" />
          </div>
        </SectionCard>

        {/* Kilometraje */}
        <SectionCard title="Verificación de Kilometraje">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput label="KM en tablero" value={form.kilometrajeCheck.kmTablero} onChange={(v) => setForm((f) => ({ ...f, kilometrajeCheck: { ...f.kilometrajeCheck, kmTablero: v } }))} inputMode="numeric" />
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, kilometrajeCheck: { ...f.kilometrajeCheck, consistente: !f.kilometrajeCheck.consistente } }))}
                className={`w-full rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  form.kilometrajeCheck.consistente
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-red-400 bg-red-50 text-rp-red"
                }`}
              >
                {form.kilometrajeCheck.consistente ? "✓ Kilometraje consistente" : "✕ Kilometraje inconsistente"}
              </button>
            </div>
            <TextArea label="Observaciones" value={form.kilometrajeCheck.obs} onChange={(v) => setForm((f) => ({ ...f, kilometrajeCheck: { ...f.kilometrajeCheck, obs: v } }))} className="sm:col-span-2" />
          </div>
        </SectionCard>

        {/* 5. Mapeo de carrocería */}
        <SectionCard num="5" title="Mapeo de Carrocería">
          <Croquis
            vehicleType={form.vehicleType}
            onChangeType={(t) => set("vehicleType", t)}
            dibujo={form.croquisDibujo}
            onChange={(v) => set("croquisDibujo", v)}
          />
          <TextArea
            label="Resumen de pintura"
            value={form.resumenPintura}
            onChange={(v) => set("resumenPintura", v)}
            className="mt-4"
            placeholder="Ej: Pintura original, sin repintado ni óxido visible."
          />
        </SectionCard>

        {/* Fotos */}
        <SectionCard title="Registro Fotográfico">
          <div className="space-y-5">
            <PhotoUpload label="Tablero" fotos={form.fotos.tablero} onChange={(v) => setForm((f) => ({ ...f, fotos: { ...f.fotos, tablero: v } }))} />
            <PhotoUpload label="Scanner" fotos={form.fotos.scanner} onChange={(v) => setForm((f) => ({ ...f, fotos: { ...f.fotos, scanner: v } }))} />
            <PhotoUpload label="Medición de pintura" fotos={form.fotos.pintura} onChange={(v) => setForm((f) => ({ ...f, fotos: { ...f.fotos, pintura: v } }))} />
            <PhotoUpload label="Carrocería" fotos={form.fotos.carroceria} onChange={(v) => setForm((f) => ({ ...f, fotos: { ...f.fotos, carroceria: v } }))} max={8} />
            <PhotoUpload label="Observaciones" fotos={form.fotos.observaciones} onChange={(v) => setForm((f) => ({ ...f, fotos: { ...f.fotos, observaciones: v } }))} />
          </div>
        </SectionCard>

        {/* 6. Valoración comercial */}
        <SectionCard num="6" title="Valoración Comercial">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextInput label="Precio de revista ($)" value={form.valoracion.precioRevista} onChange={(v) => setForm((f) => ({ ...f, valoracion: { ...f.valoracion, precioRevista: v } }))} inputMode="numeric" />
            <TextInput label="Gastos estimados ($)" value={form.valoracion.gastosEstimados} onChange={(v) => setForm((f) => ({ ...f, valoracion: { ...f.valoracion, gastosEstimados: v } }))} inputMode="numeric" />
            <TextInput label="Precio mercado Tucumán ($)" value={form.valoracion.precioMercado} onChange={(v) => setForm((f) => ({ ...f, valoracion: { ...f.valoracion, precioMercado: v } }))} inputMode="numeric" />
            <TextInput label="Precio de toma ($)" value={form.valoracion.precioToma} onChange={(v) => setForm((f) => ({ ...f, valoracion: { ...f.valoracion, precioToma: v } }))} inputMode="numeric" />
            <TextInput label="Rango mercado mín. ($)" value={form.valoracion.rangoMin} onChange={(v) => setForm((f) => ({ ...f, valoracion: { ...f.valoracion, rangoMin: v } }))} inputMode="numeric" />
            <TextInput label="Rango mercado máx. ($)" value={form.valoracion.rangoMax} onChange={(v) => setForm((f) => ({ ...f, valoracion: { ...f.valoracion, rangoMax: v } }))} inputMode="numeric" />
            <TextInput label="Nivel de riesgo operativo" value={form.valoracion.nivelRiesgo} onChange={(v) => setForm((f) => ({ ...f, valoracion: { ...f.valoracion, nivelRiesgo: v } }))} className="sm:col-span-3" placeholder="Ej: Bajo - Compra inteligente" />
          </div>
        </SectionCard>

        {/* Puntuación */}
        <SectionCard title="Puntuación Final (suma sobre 40)">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {AREAS_PUNTUABLES.map((a) => (
              <ScoreSlider
                key={a.key}
                label={a.label}
                value={form.scores[a.key]}
                onChange={(v) =>
                  setForm((f) => ({ ...f, scores: { ...f.scores, [a.key]: v } }))
                }
              />
            ))}
          </div>
          <div
            className="mt-4 flex items-center justify-between rounded-xl px-4 py-3 text-white"
            style={{ background: resultado.color }}
          >
            <span className="text-sm font-semibold">{resultado.etiqueta}</span>
            <span className="text-2xl font-extrabold">{resultado.total} / 40</span>
          </div>
        </SectionCard>

        {/* Firma */}
        <SectionCard title="Firma del Inspector">
          <SignaturePad
            value={form.firma.dataUrl}
            onChange={(v) => setForm((f) => ({ ...f, firma: { ...f.firma, dataUrl: v } }))}
          />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput label="Aclaración" value={form.firma.aclaracion} onChange={(v) => setForm((f) => ({ ...f, firma: { ...f.firma, aclaracion: v } }))} placeholder="Nombre y apellido" />
            <TextInput label="Responsable técnico" value={form.firma.responsable} onChange={(v) => setForm((f) => ({ ...f, firma: { ...f.firma, responsable: v } }))} />
          </div>
        </SectionCard>
      </main>

      {/* Barra inferior fija */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <div className="text-sm">
            <span className="text-gray-400">Puntaje:</span>{" "}
            <span className="font-bold" style={{ color: resultado.color }}>
              {resultado.total}/40 · {resultado.etiqueta}
            </span>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-xl bg-rp-red px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-(--rp-red-dark) disabled:opacity-60"
          >
            {generating ? "Generando PDF…" : "📄 Generar PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
