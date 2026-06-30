/* eslint-disable jsx-a11y/alt-text */
"use client";

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { FormData, ItemStatus } from "@/lib/types";
import { calcularResultado, AREAS_PUNTUABLES } from "@/lib/scoring";
import { BODY_COLORS, BODY_COLOR_ORDER } from "@/lib/bodyParts";
import { croquisLabel, CROQUIS_W, CROQUIS_H } from "@/lib/croquis";
import { EQUIPAMIENTO_ITEMS } from "@/lib/initialState";

const RED = "#e11414";
const DARK = "#111111";
const GRAY = "#6b7280";
const LINE = "#e5e7eb";

const s = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 46,
    paddingHorizontal: 28,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: RED,
    paddingBottom: 8,
    marginBottom: 12,
  },
  logo: { width: 130 },
  headerRight: { alignItems: "flex-end" },
  headerTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: DARK },
  headerSub: { fontSize: 8, color: GRAY, marginTop: 2 },
  // Result banner
  banner: {
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: LINE,
    marginBottom: 12,
    overflow: "hidden",
  },
  bannerLeft: {
    width: 120,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerScore: { fontSize: 30, fontFamily: "Helvetica-Bold", color: "#fff" },
  bannerScoreSub: { fontSize: 8, color: "#fff", marginTop: 2 },
  bannerRight: { flex: 1, padding: 10, justifyContent: "center" },
  bannerLabel: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  bannerDesc: { fontSize: 8, color: GRAY, marginTop: 3 },
  areasRow: { flexDirection: "row", marginTop: 8, gap: 6 },
  areaPill: {
    flex: 1,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 5,
    padding: 5,
    alignItems: "center",
  },
  areaLabel: { fontSize: 6.5, color: GRAY, textAlign: "center", marginBottom: 2 },
  areaScore: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  // Sections
  section: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#fff",
    backgroundColor: DARK,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  // Field grid
  fieldRow: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 },
  field: { paddingHorizontal: 4, marginBottom: 8 },
  fieldLabel: {
    fontSize: 6.5,
    color: GRAY,
    textTransform: "uppercase",
    marginBottom: 2,
    fontFamily: "Helvetica-Bold",
  },
  fieldValue: {
    fontSize: 9,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: "#f9fafb",
    minHeight: 18,
  },
  // Inspection item
  item: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 5,
    padding: 6,
    marginBottom: 6,
  },
  itemHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  itemName: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  statusBadge: {
    fontSize: 6.5,
    color: "#fff",
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 3,
    fontFamily: "Helvetica-Bold",
  },
  itemObs: { fontSize: 8, color: "#374151", lineHeight: 1.3 },
  // two columns
  cols: { flexDirection: "row", gap: 10 },
  col: { flex: 1 },
  // equip
  equipRow: { flexDirection: "row", flexWrap: "wrap" },
  equipItem: {
    width: "25%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  checkbox: {
    width: 9,
    height: 9,
    borderWidth: 1,
    borderColor: "#9ca3af",
    borderRadius: 2,
    marginRight: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  checkOn: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  checkMark: { fontSize: 7, color: "#fff", fontFamily: "Helvetica-Bold" },
  equipLabel: { fontSize: 8 },
  // legend
  legendItem: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  // photos
  photoGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -3 },
  photoWrap: { width: "25%", padding: 3 },
  photo: {
    width: "100%",
    height: 80,
    objectFit: "cover",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: LINE,
  },
  photoCat: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: GRAY,
    marginTop: 4,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  // signature
  sigBox: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 5,
    padding: 8,
    width: 220,
  },
  sigImg: { height: 60, objectFit: "contain" },
  sigLine: { borderTopWidth: 1, borderTopColor: "#9ca3af", marginTop: 4, paddingTop: 3 },
  // footer
  footer: {
    position: "absolute",
    bottom: 18,
    left: 28,
    right: 28,
    borderTopWidth: 1,
    borderTopColor: LINE,
    paddingTop: 6,
  },
  footerText: { fontSize: 6.5, color: GRAY, textAlign: "center", lineHeight: 1.3 },
  pageNum: { position: "absolute", bottom: 6, right: 28, fontSize: 6.5, color: GRAY },
});

const STATUS_INFO: Record<Exclude<ItemStatus, null>, { label: string; color: string }> = {
  ok: { label: "BIEN", color: "#16a34a" },
  observacion: { label: "OBSERVACIÓN", color: "#f59e0b" },
  critico: { label: "CRÍTICO", color: "#dc2626" },
};

function Field({ label, value, width }: { label: string; value?: string; width: string }) {
  return (
    <View style={[s.field, { width }]}>
      <Text style={s.fieldLabel}>{label}</Text>
      <Text style={s.fieldValue}>{value || "—"}</Text>
    </View>
  );
}

function InspItem({ name, status, obs }: { name: string; status: ItemStatus; obs: string }) {
  const info = status ? STATUS_INFO[status] : null;
  return (
    <View style={s.item} wrap={false}>
      <View style={s.itemHead}>
        <Text style={s.itemName}>{name}</Text>
        {info && (
          <Text style={[s.statusBadge, { backgroundColor: info.color }]}>{info.label}</Text>
        )}
      </View>
      {obs ? <Text style={s.itemObs}>{obs}</Text> : <Text style={[s.itemObs, { color: "#9ca3af" }]}>Sin observaciones.</Text>}
    </View>
  );
}

function money(v?: string) {
  if (!v) return "—";
  return `$ ${v}`;
}

// Croquis (ilustración blueprint + dibujo a mano) para el PDF
function PdfCroquis({
  bgSrc,
  dibujo,
  width,
}: {
  bgSrc: string;
  dibujo: string;
  width: number;
}) {
  const height = (CROQUIS_H / CROQUIS_W) * width;
  return (
    <View style={{ width, height, alignSelf: "center", position: "relative" }}>
      {bgSrc ? (
        <Image
          src={bgSrc}
          style={{ position: "absolute", top: 0, left: 0, width, height, objectFit: "contain" }}
        />
      ) : null}
      {dibujo ? (
        <Image
          src={dibujo}
          style={{ position: "absolute", top: 0, left: 0, width, height, objectFit: "contain" }}
        />
      ) : null}
    </View>
  );
}

export default function ReportDocument({
  data,
  logoSrc,
  croquisBgSrc,
}: {
  data: FormData;
  logoSrc: string;
  croquisBgSrc: string;
}) {
  const resultado = calcularResultado(data.scores);
  const tipoLabel = croquisLabel(data.vehicleType);
  const fotoCats: { key: keyof FormData["fotos"]; label: string }[] = [
    { key: "tablero", label: "Tablero" },
    { key: "scanner", label: "Scanner" },
    { key: "pintura", label: "Medición de pintura" },
    { key: "carroceria", label: "Carrocería" },
    { key: "observaciones", label: "Observaciones" },
  ];
  const hayFotos = fotoCats.some((c) => data.fotos[c.key].length > 0);

  return (
    <Document
      title={`Informe ${data.informeNro || ""}`}
      author="Rodrigo Paint"
      subject="Certificación de vehículo usado"
    >
      <Page size="A4" style={s.page}>
        {/* Header (fijo en todas las páginas) */}
        <View style={s.header} fixed>
          <Image src={logoSrc} style={s.logo} />
          <View style={s.headerRight}>
            <Text style={s.headerTitle}>REVISIÓN Y CERTIFICACIÓN DE USADOS</Text>
            <Text style={s.headerSub}>
              Informe N° {data.informeNro || "—"}  ·  Fecha: {data.fecha || "—"}
            </Text>
            <Text style={s.headerSub}>Inspector: {data.inspector || "—"}</Text>
          </View>
        </View>

        {/* Banner de resultado */}
        <View style={s.banner}>
          <View style={[s.bannerLeft, { backgroundColor: resultado.color }]}>
            <Text style={s.bannerScore}>{resultado.total}</Text>
            <Text style={s.bannerScoreSub}>/ 40 puntos</Text>
          </View>
          <View style={s.bannerRight}>
            <Text style={[s.bannerLabel, { color: resultado.color }]}>{resultado.etiqueta}</Text>
            <Text style={s.bannerDesc}>{resultado.descripcion}</Text>
            <View style={s.areasRow}>
              {AREAS_PUNTUABLES.map((a) => (
                <View key={a.key} style={s.areaPill}>
                  <Text style={s.areaLabel}>{a.label}</Text>
                  <Text style={s.areaScore}>{data.scores[a.key]}/10</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 1. Identificación */}
        <View style={s.section} wrap={false}>
          <Text style={s.sectionTitle}>1. IDENTIFICACIÓN DEL VEHÍCULO</Text>
          <View style={s.fieldRow}>
            <Field label="Marca / Modelo / Versión" value={data.marcaModelo} width="50%" />
            <Field label="Año" value={data.anio} width="16%" />
            <Field label="Dominio (Patente)" value={data.dominio} width="17%" />
            <Field label="Kilometraje" value={data.kilometraje} width="17%" />
            <Field label="Cliente" value={data.cliente} width="40%" />
            <Field label="VIN / N° de Chasis" value={data.vin} width="35%" />
            <Field label="Fecha" value={data.fecha} width="25%" />
          </View>
        </View>

        {/* 2 y 3 en dos columnas */}
        <View style={s.cols}>
          <View style={s.col}>
            <Text style={s.sectionTitle}>2. MECÁNICA, CAJA & ELECTRÓNICA</Text>
            <InspItem name="Motor & Caja" status={data.mecanica.motorCaja.status} obs={data.mecanica.motorCaja.obs} />
            <InspItem name="Transmisión / Diferencial" status={data.mecanica.transmisionDiferencial.status} obs={data.mecanica.transmisionDiferencial.obs} />
            <InspItem name="Tren delantero & Dirección" status={data.mecanica.trenDelanteroDireccion.status} obs={data.mecanica.trenDelanteroDireccion.obs} />
            <InspItem name="Electrónica & Escáner" status={data.mecanica.electronicaEscaner.status} obs={data.mecanica.electronicaEscaner.obs} />
            <InspItem name="Estado de batería" status={data.mecanica.estadoBateria.status} obs={data.mecanica.estadoBateria.obs} />
            <View style={s.item}>
              <Text style={[s.itemName, { marginBottom: 4 }]}>Historial de mantenimiento (declarado)</Text>
              <View style={s.fieldRow}>
                <Field label="Correas / Dist." value={data.mecanica.correasDist} width="100%" />
                <Field label="Service motor" value={data.mecanica.serviceMotor} width="50%" />
                <Field label="Service caja" value={data.mecanica.serviceCaja} width="50%" />
                <Field label="Aportes del propietario anterior" value={data.mecanica.aportesPropietario} width="100%" />
              </View>
            </View>
          </View>

          <View style={s.col}>
            <Text style={s.sectionTitle}>3. SEGURIDAD, CHAPA & TREN</Text>
            <InspItem name="Suspensión / Amortiguación" status={data.seguridad.suspension.status} obs={data.seguridad.suspension.obs} />
            <InspItem name="Frenos (discos/pastillas)" status={data.seguridad.frenos.status} obs={data.seguridad.frenos.obs} />
            <InspItem name="Chapa & Pintura" status={data.seguridad.chapaPintura.status} obs={data.seguridad.chapaPintura.obs} />
            <InspItem name="Tapicería e interior" status={data.seguridad.tapiceria.status} obs={data.seguridad.tapiceria.obs} />
            <InspItem name="Vidrios & Cristales" status={data.seguridad.vidrios.status} obs={data.seguridad.vidrios.obs} />
            <View style={s.item}>
              <Text style={[s.itemName, { marginBottom: 4 }]}>Estado de neumáticos (Marca / Año)</Text>
              <View style={s.fieldRow}>
                <Field label="Del. izq." value={`${data.seguridad.neumaticos.delIzq.marca} ${data.seguridad.neumaticos.delIzq.anio}`.trim()} width="50%" />
                <Field label="Del. der." value={`${data.seguridad.neumaticos.delDer.marca} ${data.seguridad.neumaticos.delDer.anio}`.trim()} width="50%" />
                <Field label="Tras. izq." value={`${data.seguridad.neumaticos.traseroIzq.marca} ${data.seguridad.neumaticos.traseroIzq.anio}`.trim()} width="50%" />
                <Field label="Tras. der." value={`${data.seguridad.neumaticos.traseroDer.marca} ${data.seguridad.neumaticos.traseroDer.anio}`.trim()} width="50%" />
                <Field label="Observaciones neumáticos / auxilio" value={data.seguridad.obsNeumaticos} width="100%" />
              </View>
            </View>
          </View>
        </View>

        {/* 4. Equipamiento */}
        <View style={s.section} wrap={false}>
          <Text style={s.sectionTitle}>4. EQUIPAMIENTO & SEGURIDAD</Text>
          <View style={s.equipRow}>
            {EQUIPAMIENTO_ITEMS.map((it) => {
              const on = data.equipamiento[it.key];
              return (
                <View key={it.key} style={s.equipItem}>
                  <View style={[s.checkbox, on ? s.checkOn : {}]}>
                    {on && <Text style={s.checkMark}>✓</Text>}
                  </View>
                  <Text style={s.equipLabel}>{it.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Diagnóstico + Kilometraje */}
        <View style={s.cols} wrap={false}>
          <View style={s.col}>
            <Text style={s.sectionTitle}>DIAGNÓSTICO ELECTRÓNICO</Text>
            <View style={s.fieldRow}>
              <Field label="Módulos analizados" value={data.diagnostico.modulosAnalizados} width="50%" />
              <Field label="Fallas detectadas" value={data.diagnostico.fallasDetectadas} width="50%" />
              <Field label="Fallas borradas" value={data.diagnostico.fallasBorradas} width="100%" />
              <Field label="Observaciones" value={data.diagnostico.obs} width="100%" />
            </View>
          </View>
          <View style={s.col}>
            <Text style={s.sectionTitle}>VERIFICACIÓN DE KILOMETRAJE</Text>
            <View style={s.fieldRow}>
              <Field label="KM en tablero" value={data.kilometrajeCheck.kmTablero} width="50%" />
              <Field label="Consistencia" value={data.kilometrajeCheck.consistente ? "Consistente" : "Inconsistente"} width="50%" />
              <Field label="Observaciones" value={data.kilometrajeCheck.obs} width="100%" />
            </View>
          </View>
        </View>

        {/* 5. Mapeo de carrocería */}
        <View style={s.section} break>
          <Text style={s.sectionTitle}>5. MAPEO DE CARROCERÍA · {tipoLabel}</Text>

          {/* Referencias */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 4 }}>
            {BODY_COLOR_ORDER.map((k) => (
              <View key={k} style={[s.legendItem, { marginRight: 12 }]}>
                <View style={[s.dot, { backgroundColor: BODY_COLORS[k].fill }]} />
                <Text style={{ fontSize: 7.5 }}>
                  {BODY_COLORS[k].label} — {BODY_COLORS[k].descripcion}
                </Text>
              </View>
            ))}
          </View>

          {/* Ilustración + marcado a mano */}
          <PdfCroquis bgSrc={croquisBgSrc} dibujo={data.croquisDibujo} width={460} />

          {/* Resumen */}
          <View style={{ marginTop: 6 }}>
            <Text style={[s.fieldLabel, { marginTop: 2 }]}>Resumen de pintura</Text>
            <Text style={s.fieldValue}>{data.resumenPintura || "—"}</Text>
          </View>
        </View>

        {/* 6. Valoración comercial */}
        <View style={s.section} wrap={false}>
          <Text style={s.sectionTitle}>6. VALORACIÓN COMERCIAL</Text>
          <View style={s.fieldRow}>
            <Field label="Precio de revista" value={money(data.valoracion.precioRevista)} width="33.3%" />
            <Field label="Gastos estimados (mec/est)" value={money(data.valoracion.gastosEstimados)} width="33.3%" />
            <Field label="Precio mercado (Tucumán)" value={money(data.valoracion.precioMercado)} width="33.3%" />
            <Field label="Precio de toma" value={money(data.valoracion.precioToma)} width="33.3%" />
            <Field label="Rango de mercado" value={data.valoracion.rangoMin || data.valoracion.rangoMax ? `$ ${data.valoracion.rangoMin} - $ ${data.valoracion.rangoMax}` : "—"} width="33.3%" />
            <Field label="Nivel de riesgo operativo" value={data.valoracion.nivelRiesgo} width="33.3%" />
          </View>
        </View>

        {/* Fotos */}
        {hayFotos && (
          <View style={s.section} break>
            <Text style={s.sectionTitle}>REGISTRO FOTOGRÁFICO</Text>
            {fotoCats.map((c) =>
              data.fotos[c.key].length > 0 ? (
                <View key={c.key} wrap={false}>
                  <Text style={s.photoCat}>{c.label}</Text>
                  <View style={s.photoGrid}>
                    {data.fotos[c.key].map((src, i) => (
                      <View key={i} style={s.photoWrap}>
                        <Image src={src} style={s.photo} />
                      </View>
                    ))}
                  </View>
                </View>
              ) : null
            )}
          </View>
        )}

        {/* Firma */}
        <View style={s.section} wrap={false}>
          <Text style={s.sectionTitle}>FIRMA DEL INSPECTOR</Text>
          <View style={s.sigBox}>
            {data.firma.dataUrl ? (
              <Image src={data.firma.dataUrl} style={s.sigImg} />
            ) : (
              <View style={{ height: 60 }} />
            )}
            <View style={s.sigLine}>
              <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>
                {data.firma.aclaracion || data.inspector || "—"}
              </Text>
              {data.firma.responsable ? (
                <Text style={{ fontSize: 7, color: GRAY }}>{data.firma.responsable}</Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Footer fijo */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            El informe de inspección ayuda a minimizar riesgos en la compra; no elimina vicios ocultos no inspeccionables.
          </Text>
          <Text style={s.footerText}>
            RODRIGO PAINT · Santa Fe 2137, San Miguel de Tucumán · WhatsApp 381 624 2542 · @rodrigo.paint
          </Text>
        </View>
        <Text
          style={s.pageNum}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}
