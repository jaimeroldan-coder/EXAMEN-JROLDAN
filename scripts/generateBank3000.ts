import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import existing 210 questions
import { PREGUNTAS_CONSTITUCIONAL } from './src/services/questions/constitucionalQuestions.js';
import { PREGUNTAS_PENAL } from './src/services/questions/penalQuestions.js';
import { PREGUNTAS_ADOLESCENTES } from './src/services/questions/adolescentesQuestions.js';
import { PREGUNTAS_TRANSITO } from './src/services/questions/transitoQuestions.js';
import { PREGUNTAS_CONTRAVENCIONES } from './src/services/questions/contravencionesQuestions.js';
import { PREGUNTAS_VIOLENCIA } from './src/services/questions/violenciaQuestions.js';
import { PREGUNTAS_SEXUAL } from './src/services/questions/sexualQuestions.js';

interface RawNormTemplate {
  materia: string;
  perfil: string[];
  subtema: string;
  norma: string;
  articulo: string;
  urlOficial: string;
  jurisprudencia?: {
    numeroSentencia: string;
    organo: string;
    reglaJurisprudencial: string;
  };
  scenarios: Array<{
    dificultad: 'baja' | 'media' | 'alta';
    tipo: 'normativa' | 'jurisprudencial' | 'caso_practico' | 'doctrinaria';
    enunciadoFmt: string; // formatting function or string
    correcta: string;
    distractores: [string, string, string];
    explicacion: string;
    distractoresExpl: [string, string, string];
    variacionesCaso?: Array<{
      contexto: string;
      sujeto: string;
      elementoDistintivo: string;
    }>;
  }>;
}

export function normalizarEnunciado(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

console.log('Script scaffold ready');
