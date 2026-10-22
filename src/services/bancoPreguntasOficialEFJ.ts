import { Pregunta } from '../types';
import BANCO_CONST_JR from '../data/bancoConstitucionalJR.json';
import BANCO_PEN_JR from '../data/bancoPenalJR.json';
import BANCO_PROC_PEN_JR from '../data/bancoProcedimientosPenalesJR.json';
import BANCO_CONTRAV_JR from '../data/bancoContravencionesJR.json';
import BANCO_VIOLENCIA_JR_JSON from '../data/bancoViolenciaJR.json';
import BANCO_TRANSITO_JR_JSON from '../data/bancoTransitoJR.json';
import BANCO_OFICIAL_COMBINADO from '../data/bancoOficialJR.json';

/**
 * Banco oficial de preguntas facilitado por el usuario:
 * - CUESTIONARIO CONSTITUCIONAL: 105 preguntas
 * - CUESTIONARIO PENAL: 63 preguntas
 * - CUESTIONARIO PROCEDIMIENTOS PENALES: 48 preguntas
 * - CUESTIONARIO CONTRAVENCIONES (COIP Y COFJ): 60 preguntas
 * - CUESTIONARIO VIOLENCIA CONTRA LA MUJER E INTEGRIDAD SEXUAL: 63 preguntas
 * - CUESTIONARIO TRÁNSITO, DELITOS Y CONTRAVENCIONES: 63 preguntas
 * Total: 402 preguntas oficiales con 4 alternativas (A, B, C, D) y respuesta correcta indubitada.
 */
export const BANCO_CONSTITUCIONAL_JR: Pregunta[] = (BANCO_CONST_JR as unknown as Pregunta[]) || [];
export const BANCO_PENAL_JR: Pregunta[] = (BANCO_PEN_JR as unknown as Pregunta[]) || [];
export const BANCO_PROCEDIMIENTOS_PENALES_JR: Pregunta[] = (BANCO_PROC_PEN_JR as unknown as Pregunta[]) || [];
export const BANCO_CONTRAVENCIONES_JR: Pregunta[] = (BANCO_CONTRAV_JR as unknown as Pregunta[]) || [];
export const BANCO_VIOLENCIA_JR: Pregunta[] = (BANCO_VIOLENCIA_JR_JSON as unknown as Pregunta[]) || [];
export const BANCO_TRANSITO_JR: Pregunta[] = (BANCO_TRANSITO_JR_JSON as unknown as Pregunta[]) || [];
export const BANCO_OFICIAL_JR: Pregunta[] = (BANCO_OFICIAL_COMBINADO as unknown as Pregunta[]) || [];

export const BANCO_OFICIAL_EFJ: Pregunta[] = BANCO_OFICIAL_JR;
export const BANCO_COMPLETO_EFJ_110: Pregunta[] = BANCO_OFICIAL_JR;
export const BANCO_BASE_EFJ_210: Pregunta[] = BANCO_OFICIAL_JR;
export const BANCO_COMPLETO_EFJ_3000: Pregunta[] = BANCO_OFICIAL_JR;


