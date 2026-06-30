// Tipos de datos del informe de inspección Rodrigo Paint

export type ItemStatus = "ok" | "observacion" | "critico" | null;

export interface InspeccionItem {
  status: ItemStatus;
  obs: string;
}

export interface Neumatico {
  marca: string;
  anio: string;
}

// Clave de color para el mapeo de carrocería
export type BodyColorKey =
  | "original"
  | "repintado"
  | "reparacionMenor"
  | "reparacionImportante";

export type BodyMap = Record<string, BodyColorKey>;

export interface Fotos {
  tablero: string[];
  scanner: string[];
  pintura: string[];
  carroceria: string[];
  observaciones: string[];
}

export interface Scores {
  diagnostico: number; // 0-10
  kilometraje: number; // 0-10
  mecanica: number; // 0-10
  carroceria: number; // 0-10
}

export interface FormData {
  // 1. Identificación
  informeNro: string;
  fecha: string;
  inspector: string;
  cliente: string;
  marcaModelo: string;
  anio: string;
  dominio: string;
  vin: string;
  kilometraje: string;

  // 2. Mecánica, Caja & Electrónica
  mecanica: {
    motorCaja: InspeccionItem;
    transmisionDiferencial: InspeccionItem;
    trenDelanteroDireccion: InspeccionItem;
    electronicaEscaner: InspeccionItem;
    estadoBateria: InspeccionItem;
    correasDist: string;
    serviceMotor: string;
    serviceCaja: string;
    aportesPropietario: string;
  };

  // 3. Seguridad, Chapa & Tren
  seguridad: {
    suspension: InspeccionItem;
    frenos: InspeccionItem;
    chapaPintura: InspeccionItem;
    tapiceria: InspeccionItem;
    vidrios: InspeccionItem;
    neumaticos: {
      delIzq: Neumatico;
      delDer: Neumatico;
      traseroIzq: Neumatico;
      traseroDer: Neumatico;
    };
    obsNeumaticos: string;
  };

  // 4. Equipamiento & Seguridad
  equipamiento: Record<string, boolean>;

  // Diagnóstico electrónico (área puntuable)
  diagnostico: {
    modulosAnalizados: string;
    fallasDetectadas: string;
    fallasBorradas: string;
    obs: string;
  };

  // Kilometraje (área puntuable)
  kilometrajeCheck: {
    kmTablero: string;
    consistente: boolean;
    obs: string;
  };

  // 5. Mapeo de carrocería
  vehicleType: "sedan" | "suv" | "pickup";
  croquisDibujo: string; // PNG transparente con el marcado a mano alzada
  resumenPintura: string;

  // Fotos
  fotos: Fotos;

  // 6. Valoración comercial
  valoracion: {
    precioRevista: string;
    gastosEstimados: string;
    precioMercado: string;
    precioToma: string;
    rangoMin: string;
    rangoMax: string;
    nivelRiesgo: string;
  };

  // Puntuación (4 áreas, 0-10 c/u)
  scores: Scores;

  // Firma del inspector
  firma: {
    dataUrl: string;
    aclaracion: string;
    responsable: string;
  };
}

export interface Usuario {
  usuario: string;
  nombre: string;
  rolInspector: string;
}

// ── Persistencia en Redis ────────────────────────────────────────────────

// Informe guardado: el formulario completo + metadatos de orden/fecha.
export interface StoredInforme {
  orden: number; // número de orden ascendente (1, 2, 3, …)
  token: string; // identificador aleatorio usado en la URL pública
  createdAt: string; // ISO timestamp de cuándo se guardó
  data: FormData; // el informe completo (con fotos web-optimizadas)
}

// Entrada liviana del historial (sin fotos, para listar rápido).
export interface InformeResumen {
  orden: number;
  token: string;
  createdAt: string;
  fecha: string;
  cliente: string;
  marcaModelo: string;
  dominio: string;
  anio: string;
  total: number; // puntaje 0-40
  etiqueta: string; // EXCELENTE / MUY BUENO / …
  color: string;
}
