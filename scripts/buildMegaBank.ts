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

export interface NormaBloque {
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
  items: Array<{
    tipo: TipoPregunta;
    dificultad: Dificultad;
    enunciado: string;
    correcta: string;
    distractores: [string, string, string];
    explicacion: string;
  }>;
}

// Cargar las 210 preguntas base
const baseQuestions: Pregunta[] = [
  ...PREGUNTAS_CONSTITUCIONAL,
  ...PREGUNTAS_PENAL,
  ...PREGUNTAS_ADOLESCENTES,
  ...PREGUNTAS_TRANSITO,
  ...PREGUNTAS_CONTRAVENCIONES,
  ...PREGUNTAS_VIOLENCIA,
  ...PREGUNTAS_SEXUAL,
];

console.log(`Reactivos base: ${baseQuestions.length}`);
