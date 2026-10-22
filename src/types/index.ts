export type Dificultad = 'baja' | 'media' | 'alta';
export type TipoPregunta = 'normativa' | 'jurisprudencial' | 'caso_practico' | 'doctrinaria';

export type EstadoPregunta =
  | 'borrador'
  | 'pendiente_revision'
  | 'observada'
  | 'validada'
  | 'inactiva'
  | 'desactualizada';

export type AlternativaId = 'A' | 'B' | 'C' | 'D';

export interface Alternativa {
  id: AlternativaId;
  texto: string;
}

export interface FuenteJuridica {
  norma: string;
  articulo: string;
  textoSoporte: string;
  urlOficial: string;
  fechaConsulta: string;
  vigenciaVerificada: boolean;
}

export interface JurisprudenciaSoporte {
  numeroSentencia?: string;
  organo?: string;
  reglaJurisprudencial?: string;
  urlOficial?: string;
}

export interface Pregunta {
  id: string;
  perfil: string[]; // e.g. ['penal', 'personalizado']
  materia: string;
  subtema: string;
  dificultad: Dificultad;
  tipo: TipoPregunta;
  enunciado: string;
  alternativas: [Alternativa, Alternativa, Alternativa, Alternativa] | Alternativa[];
  respuestaCorrecta: AlternativaId;
  explicacion: string;
  explicacionDistractores: Record<string, string>;
  fuente: FuenteJuridica;
  jurisprudencia: JurisprudenciaSoporte;
  estado: EstadoPregunta;
  observaciones: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  esDemostracion?: boolean;
  // Campos para Control de Calidad Jurídica
  posiblesAmbiguedades?: string[];
  posiblesDuplicados?: string[];
  ultimaRevision?: string;
  revisadaPorHumano?: boolean;
  revisadoPor?: string;
  exigeAprobacionHumana?: boolean;
}

export type ModalidadSimulacro =
  | 'oficial_aleatorio'
  | 'equilibrado'
  | 'practica_personalizada';

export interface ExamenConfig {
  modalidad: ModalidadSimulacro;
  perfilId: 'penal_completo' | 'personalizado_usuario';
  numeroPreguntas: number; // 100 para oficial
  duracionMinutos: number; // 60 para oficial
  mostrarMateriaDuranteExamen: boolean;
  materiasSeleccionadas?: string[];
  filtroDificultad?: Dificultad | 'todas';
  soloFalladas?: boolean;
  soloMarcadas?: boolean;
  soloNoDominadas?: boolean;
}

export interface PreguntaSnapshot {
  preguntaOriginalId: string;
  materia: string;
  subtema: string;
  dificultad: Dificultad;
  tipo?: TipoPregunta;
  enunciado: string;
  alternativas: Alternativa[]; // orden específico en este examen
  respuestaCorrecta: AlternativaId;
  explicacion: string;
  explicacionDistractores: Record<string, string>;
  fuente: FuenteJuridica;
  jurisprudencia: JurisprudenciaSoporte;
  esDemostracion?: boolean;
}

export interface IntentoExamen {
  id: string;
  fechaInicio: string;
  fechaFin?: string;
  modalidad: ModalidadSimulacro;
  perfilId: string;
  config: ExamenConfig;
  duracionSegundosUtilizados: number;
  entregado: boolean;
  entregadoAutomaticamentePorTiempo: boolean;
  totalPreguntas: number;
  puntajeMaximo: number; // 50
  puntajeMinimoAprobacion: number; // 40
  respuestasUsuario: Record<number, AlternativaId | null>; // index -> choice
  preguntasMarcadasParaRevision: Record<number, boolean>;
  preguntasSnapshot: PreguntaSnapshot[]; // snapshot inmutable
  // Resultados calculados tras entrega
  correctas?: number;
  incorrectas?: number;
  noContestadas?: number;
  puntajeObtenido?: number; // correctas * 0.50
  porcentajeAcierto?: number;
  aprobado?: boolean;
  interrupcionesDetectadas?: number;
}

export interface EstadisticasMateria {
  materia: string;
  totalPreguntas: number;
  correctas: number;
  incorrectas: number;
  noContestadas: number;
  porcentaje: number;
}

export interface RepasoEspaciadoItem {
  preguntaId: string;
  nivel: number; // 0 a 5
  aciertosConsecutivos: number;
  fallosConsecutivos: number;
  proximaRevision: string; // ISO Date
  ultimaRevision: string;
}

export interface ValidacionResultado {
  esValida: boolean;
  errores: string[];
  advertencias: string[];
}

export interface AIAssistantResponse {
  resultado:
    | 'PROPUESTA_GENERADA'
    | 'FUENTE_INSUFICIENTE'
    | 'PREGUNTA_AMBIGUA'
    | 'POSIBLE_DESACTUALIZACION';
  pregunta: {
    materia: string;
    subtema: string;
    dificultad: Dificultad;
    enunciado: string;
    alternativas: { id: AlternativaId; texto: string }[];
    respuestaCorrecta: AlternativaId;
    explicacion: string;
    norma: string;
    articulo: string;
    textoSoporte: string;
    advertencias: string[];
    posiblesAmbiguedades?: string[];
    posibleDesactualizacion?: boolean;
    estado?: EstadoPregunta;
    revisadaPorHumano?: boolean;
    exigeAprobacionHumana?: boolean;
  } | null;
  justificacion: string;
  advertencias?: string[];
  fuenteInsuficiente?: boolean;
  exigeAprobacionHumana?: boolean;
}
