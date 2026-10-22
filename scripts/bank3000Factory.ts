/**
 * Generador masivo de 3,000+ reactivos jurídicos únicos para la Escuela de la Función Judicial del Ecuador
 * Cubre:
 * 1. Derecho Constitucional (CRE, LOGJCC, Sentencias CC)
 * 2. Derecho Penal (COIP Libro I & II, COFJ, Dogmática)
 * 3. Adolescentes Infractores (CONA Libro IV, COIP, COFJ)
 * 4. Tránsito (COIP Arts 376-392, COFJ Art 229, LOTTTSV)
 * 5. Contravenciones COIP y COFJ (COIP Arts 393-397, COFJ Art 231)
 * 6. Violencia contra la mujer / miembros del núcleo familiar (COIP Arts 155-159, LOIPEVCM, COFJ Art 232)
 * 7. Infracciones contra la integridad sexual y reproductiva (COIP Arts 166-175, COFJ Art 232)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { PREGUNTAS_CONSTITUCIONAL } from './src/services/questions/constitucionalQuestions.js';
import { PREGUNTAS_PENAL } from './src/services/questions/penalQuestions.js';
import { PREGUNTAS_ADOLESCENTES } from './src/services/questions/adolescentesQuestions.js';
import { PREGUNTAS_TRANSITO } from './src/services/questions/transitoQuestions.js';
import { PREGUNTAS_CONTRAVENCIONES } from './src/services/questions/contravencionesQuestions.js';
import { PREGUNTAS_VIOLENCIA } from './src/services/questions/violenciaQuestions.js';
import { PREGUNTAS_SEXUAL } from './src/services/questions/sexualQuestions.js';
import { Pregunta, AlternativaId, Dificultad, TipoPregunta } from './src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function normalizarEnunciado(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

interface NormaItemSpec {
  materia: string;
  perfil: string[];
  subtema: string;
  norma: string;
  articulo: string;
  textoSoporte: string;
  urlOficial: string;
  sentencia?: string;
  organo?: string;
  reglaJurisprudencial?: string;
  baseQuestions: Array<{
    tipo: TipoPregunta;
    dificultad: Dificultad;
    plantilla: (param: {
      sujeto: string;
      contexto: string;
      infraccion: string;
      sancion: string;
      elemento: string;
      idVar: number;
    }) => {
      enunciado: string;
      correcta: string;
      distractores: [string, string, string];
      explicacion: string;
    };
  }>;
  variaciones: Array<{
    sujeto: string;
    contexto: string;
    infraccion: string;
    sancion: string;
    elemento: string;
  }>;
}

// Catálogo sistemático de normas
export const ESPECIFICACIONES_LEGALES: NormaItemSpec[] = [
  // =========================================================================
  // 1. DERECHO CONSTITUCIONAL (450+ reactivos proyectados)
  // =========================================================================
  {
    materia: 'Derecho Constitucional',
    perfil: ['penal', 'personalizado'],
    subtema: 'Garantías Jurisdiccionales y Principios Procesales',
    norma: 'Constitución de la República del Ecuador',
    articulo: 'Art. 86 numeral 2 y LOGJCC Art. 4',
    textoSoporte: 'El procedimiento será sencillo, rápido y eficaz, oral en todas sus fases e instancias, y serán hábiles todos los días y horas.',
    urlOficial: 'https://www.corteconstitucional.gob.ec',
    sentencia: '102-13-SEP-CC',
    organo: 'Corte Constitucional del Ecuador',
    reglaJurisprudencial: 'El principio de informalidad y celeridad impide dilaciones ritualistas en la sustanciación de garantías constitucionales.',
    baseQuestions: [
      {
        tipo: 'normativa',
        dificultad: 'media',
        plantilla: ({ sujeto, contexto, infraccion, elemento, idVar }) => ({
          enunciado: `En el marco de ${contexto}, ${sujeto} alega vulneración flagrante de derechos fundamentales. Según el Art. 86.2 de la CRE, ¿cuál es la regla procesal rectora para sustanciar dicha petición sobre ${elemento}?`,
          correcta: `El procedimiento constitucional es sencillo, rápido y eficaz, oral en todas sus fases, y son hábiles todos los días y horas para tramitar la causa de ${elemento}.`,
          distractores: [
            `Se requiere forzosamente término probatorio ordinario de 30 días hábiles conforme al Código Orgánico General de Procesos para ${elemento}.`,
            `El juzgador debe suspender las actuaciones durante fines de semana y feriados obligatorios al tramitar ${elemento}.`,
            `La audiencia debe realizarse por escrito en memoriales cerrados sin contradicción directa respecto a ${elemento}.`
          ],
          explicacion: `El Art. 86 numeral 2 de la Constitución consagra la sencillez, rapidez, oralidad y habilitación de todos los días y horas sin excepciones rituales.`
        })
      },
      {
        tipo: 'caso_practico',
        dificultad: 'alta',
        plantilla: ({ sujeto, contexto, infraccion, elemento, idVar }) => ({
          enunciado: `Caso Práctico: ${sujeto} comparece un día domingo en la noche a una Unidad Judicial en el contexto de ${contexto} reclamando tutela urgente por ${infraccion}. La secretaría judicial se rehúsa a recibir el memorial alegando que no es horario laboral ni día hábil. ¿Cómo debe proceder el juzgador de turno?`,
          correcta: `Disponer la recepción inmediata del trámite y calificar la petición, puesto que en garantías constitucionales todos los días y horas son plenamente hábiles.`,
          distractores: [
            `Confirmar la negativa de recepción y remitir a la parte al primer día laborable a las 08h00.`,
            `Sancionar a la parte peticionaria con multa pecuniaria por abuso de derecho y desacato de horarios.`,
            `Exigir que primero obtenga una autorización especial del Consejo de la Judicatura para tramitar en feriado.`
          ],
          explicacion: `La habilitación de todos los días y horas es un mandato constitucional directo e imperativo del Art. 86.2 CRE para garantizar tutela judicial efectiva.`
        })
      }
    ],
    variaciones: [
      { sujeto: 'una persona privada de la libertad', contexto: 'un recinto penitenciario de máxima seguridad', infraccion: 'falta de atención médica de urgencia', sancion: 'tutela inmediata', elemento: 'la integridad personal' },
      { sujeto: 'una madre lactante', contexto: 'un hospital público cantonal', infraccion: 'la negación arbitraria de medicamentos oncológicos', sancion: 'medidas cautelares', elemento: 'el derecho prioritario a la salud' },
      { sujeto: 'un docente universitario cesado', contexto: 'una universidad del Estado', infraccion: 'la vulneración del debido proceso administrativo', sancion: 'reparación integral', elemento: 'la estabilidad laboral' },
      { sujeto: 'un representante de una comuna ancestral', contexto: 'un territorio protegido', infraccion: 'la consulta previa ambiental omitida', sancion: 'suspensión de actividades', elemento: 'los derechos de la naturaleza' },
      { sujeto: 'un adulto mayor pensionista', contexto: 'un instituto de seguridad social', infraccion: 'la retención indebida de su pensión jubilar', sancion: 'devolución y reparación', elemento: 'el mínimo vital de subsistencia' },
      { sujeto: 'un defensor de derechos humanos', contexto: 'una manifestación pacífica', infraccion: 'una orden de clausura emitida de noche', sancion: 'medida cautelar autónoma', elemento: 'la libertad de expresión' },
      { sujeto: 'un paciente con insuficiencia renal', contexto: 'una clínica de diálisis intervenida', infraccion: 'la suspensión de tratamiento vital', sancion: 'tutela de urgencia', elemento: 'el derecho a la vida' },
      { sujeto: 'una mujer en estado de gestación', contexto: 'una institución educativa pública', infraccion: 'la expulsión académica por embarazo', sancion: 'reincorporación inmediata', elemento: 'el derecho a la educación' },
      { sujeto: 'un ciudadano extranjero refugiado', contexto: 'un puesto de control migratorio', infraccion: 'una orden de devolución sumaria sin audiencia', sancion: 'hábeas corpus preventivo', elemento: 'el principio de no devolución' },
      { sujeto: 'una niña con discapacidad severa', contexto: 'un centro educativo fiscal', infraccion: 'la negativa de matrícula inclusiva', sancion: 'admisión y ajustes razonables', elemento: 'el interés superior de la niñez' }
    ]
  }
];

console.log('Spec catalog ready');
