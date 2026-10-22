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

/**
 * Cada especificación jurídica contiene artículos concretos, dogmática y tipos penales/procesales.
 */
interface EspecificacionMateria {
  materia: string;
  perfil: string[];
  articulos: Array<{
    norma: string;
    articulo: string;
    subtema: string;
    textoSoporte: string;
    urlOficial: string;
    jurisprudencia?: { sentencia: string; organo: string; regla: string };
    preguntas: Array<{
      enunciado: string;
      correcta: string;
      distractores: [string, string, string];
      explicacion: string;
      tipo: TipoPregunta;
      dificultad: Dificultad;
    }>;
  }>;
}

// 7 Materias completas
import { MATERIA_CONSTITUCIONAL_ESPEC } from './scripts/materias/constitucionalEspec.js';
import { MATERIA_PENAL_ESPEC } from './scripts/materias/penalEspec.js';
import { MATERIA_ADOLESCENTES_ESPEC } from './scripts/materias/adolescentesEspec.js';
import { MATERIA_TRANSITO_ESPEC } from './scripts/materias/transitoEspec.js';
import { MATERIA_CONTRAVENCIONES_ESPEC } from './scripts/materias/contravencionesEspec.js';
import { MATERIA_VIOLENCIA_ESPEC } from './scripts/materias/violenciaEspec.js';
import { MATERIA_SEXUAL_ESPEC } from './scripts/materias/sexualEspec.js';

console.log('Compilador de Banco 3,000+ listo para ensamblaje.');
