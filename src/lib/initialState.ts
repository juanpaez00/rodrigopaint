import type { FormData, InspeccionItem } from "./types";

const emptyItem = (): InspeccionItem => ({ status: null, obs: "" });

export const EQUIPAMIENTO_ITEMS: { key: string; label: string }[] = [
  { key: "airbags", label: "Airbags OK" },
  { key: "abs", label: "ABS OK" },
  { key: "aire", label: "Aire Acond." },
  { key: "calefaccion", label: "Calefacción" },
  { key: "audio", label: "Audio / LCD" },
  { key: "segundaLlave", label: "2da Llave" },
  { key: "gatoLlave", label: "Gato / Llave R." },
  { key: "matafuego", label: "Matafuego" },
  { key: "balizas", label: "Balizas" },
  { key: "auxilio", label: "Auxilio OK" },
  { key: "alarma", label: "Alarma" },
  { key: "escaneo", label: "Escaneo OK" },
];

export function createEmptyForm(): FormData {
  return {
    informeNro: "",
    fecha: "",
    inspector: "",
    cliente: "",
    marcaModelo: "",
    anio: "",
    dominio: "",
    vin: "",
    kilometraje: "",

    mecanica: {
      motorCaja: emptyItem(),
      transmisionDiferencial: emptyItem(),
      trenDelanteroDireccion: emptyItem(),
      electronicaEscaner: emptyItem(),
      estadoBateria: emptyItem(),
      correasDist: "",
      serviceMotor: "",
      serviceCaja: "",
      aportesPropietario: "",
    },

    seguridad: {
      suspension: emptyItem(),
      frenos: emptyItem(),
      chapaPintura: emptyItem(),
      tapiceria: emptyItem(),
      vidrios: emptyItem(),
      neumaticos: {
        delIzq: { marca: "", anio: "" },
        delDer: { marca: "", anio: "" },
        traseroIzq: { marca: "", anio: "" },
        traseroDer: { marca: "", anio: "" },
      },
      obsNeumaticos: "",
    },

    equipamiento: Object.fromEntries(
      EQUIPAMIENTO_ITEMS.map((i) => [i.key, false])
    ),

    diagnostico: {
      modulosAnalizados: "",
      fallasDetectadas: "",
      fallasBorradas: "",
      obs: "",
    },

    kilometrajeCheck: {
      kmTablero: "",
      consistente: true,
      obs: "",
    },

    vehicleType: "sedan",
    croquisDibujo: "",
    resumenPintura: "",

    fotos: {
      tablero: [],
      scanner: [],
      pintura: [],
      carroceria: [],
      observaciones: [],
    },

    valoracion: {
      precioRevista: "",
      gastosEstimados: "",
      precioMercado: "",
      precioToma: "",
      rangoMin: "",
      rangoMax: "",
      nivelRiesgo: "",
    },

    scores: {
      diagnostico: 0,
      kilometraje: 0,
      mecanica: 0,
      carroceria: 0,
    },

    firma: {
      dataUrl: "",
      aclaracion: "",
      responsable: "",
    },
  };
}

// Genera un número de informe tipo RP-AAAAMMDD-XXXX
export function generarInformeNro(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RP-${y}${m}${d}-${rand}`;
}

export function hoyISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
