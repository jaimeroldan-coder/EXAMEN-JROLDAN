import { AlternativaId, Dificultad, EstadoPregunta, Pregunta, TipoPregunta } from '../types';
import { validarPreguntaParaAprobacion } from './validator';

export interface CSVFilaParseada {
  filaNumero: number;
  datosBrutos: Record<string, string>;
  pregunta?: Pregunta;
  esValida: boolean;
  errores: string[];
  advertencias: string[];
}

export const CSV_CABECERAS = [
  'id',
  'perfil',
  'materia',
  'subtema',
  'dificultad',
  'tipo',
  'enunciado',
  'opcion_a',
  'opcion_b',
  'opcion_c',
  'opcion_d',
  'respuesta_correcta',
  'explicacion',
  'norma',
  'articulo',
  'texto_soporte',
  'url_oficial',
  'fecha_consulta',
  'vigencia_verificada',
  'numero_sentencia',
  'regla_jurisprudencial',
  'estado',
  'observaciones',
];

export function generarPlantillaCSV(): string {
  const lineas = [
    CSV_CABECERAS.join(','),
    'DEMO-001,"penal,personalizado","Adolescentes infractores","Medidas socioeducativas",media,normativa,"En el juzgamiento de adolescentes infractores, ¿cuál es el principio rector fundamental aplicable a las medidas privativas de la libertad?","Constituye la regla general sin excepción","Se aplicará únicamente como medida de último recurso y por el tiempo más breve que proceda","Queda a discrecionalidad absoluta del acusador fiscal","No requiere motivación judicial","B","Conforme al Art. 306 del Código de la Niñez y Adolescencia, el internamiento es de último recurso.","Código de la Niñez y Adolescencia","Art. 306","La privación de libertad se aplicará como medida de último recurso y por el período mínimo necesario.","https://www.funcionjudicial.gob.ec",2026-03-01,true,"","","borrador","Ejemplo referencial de plantilla"',
  ];
  return lineas.join('\n');
}

/**
 * Parser de CSV compatible con comillas dobles, saltos de línea dentro de campos y comas
 */
export function parseCSV(texto: string): string[][] {
  const lineas: string[][] = [];
  let filaActual: string[] = [];
  let campoActual = '';
  let dentroDeComillas = false;

  for (let i = 0; i < texto.length; i++) {
    const char = texto[i];
    const siguienteChar = texto[i + 1];

    if (char === '"') {
      if (dentroDeComillas && siguienteChar === '"') {
        campoActual += '"';
        i++; // saltar comilla escapada
      } else {
        dentroDeComillas = !dentroDeComillas;
      }
    } else if (char === ',' && !dentroDeComillas) {
      filaActual.push(campoActual);
      campoActual = '';
    } else if ((char === '\r' || char === '\n') && !dentroDeComillas) {
      if (char === '\r' && siguienteChar === '\n') {
        i++;
      }
      filaActual.push(campoActual);
      if (filaActual.some((f) => f.trim() !== '')) {
        lineas.push(filaActual);
      }
      filaActual = [];
      campoActual = '';
    } else {
      campoActual += char;
    }
  }

  if (campoActual !== '' || filaActual.length > 0) {
    filaActual.push(campoActual);
    if (filaActual.some((f) => f.trim() !== '')) {
      lineas.push(filaActual);
    }
  }

  return lineas;
}

export function procesarFilasCSV(
  textoCsv: string,
  preguntasExistentes: Pregunta[] = []
): { filas: CSVFilaParseada[]; totalValidas: number; totalConErrores: number } {
  const matriz = parseCSV(textoCsv);
  if (matriz.length === 0) {
    return { filas: [], totalValidas: 0, totalConErrores: 0 };
  }

  const cabeceras = matriz[0].map((c) => c.trim().toLowerCase());
  const filasResultado: CSVFilaParseada[] = [];
  const idsProcesadosEnLote = new Set<string>();

  for (let f = 1; f < matriz.length; f++) {
    const valores = matriz[f];
    const filaNumero = f + 1;
    const datosBrutos: Record<string, string> = {};

    cabeceras.forEach((col, idx) => {
      datosBrutos[col] = valores[idx]?.trim() ?? '';
    });

    const errores: string[] = [];
    const advertencias: string[] = [];

    const id = datosBrutos['id'] || `IMP-${Date.now()}-${f}`;
    if (idsProcesadosEnLote.has(id)) {
      errores.push(`ID duplicado en el mismo archivo CSV: ${id}`);
    } else {
      idsProcesadosEnLote.add(id);
    }

    if (preguntasExistentes.some((p) => p.id === id)) {
      advertencias.push(`El ID '${id}' ya existe en el banco actual. Si se importa, se actualizará o duplicará según su decisión.`);
    }

    const perfilesRaw = datosBrutos['perfil'] || 'penal,personalizado';
    const perfil = perfilesRaw.split(',').map((p) => p.trim());

    const materia = datosBrutos['materia'] || '';
    const subtema = datosBrutos['subtema'] || '';
    const dificultad = (datosBrutos['dificultad']?.toLowerCase() || 'media') as Dificultad;
    const tipo = (datosBrutos['tipo']?.toLowerCase() || 'normativa') as TipoPregunta;
    const enunciado = datosBrutos['enunciado'] || '';

    const opA = datosBrutos['opcion_a'] || '';
    const opB = datosBrutos['opcion_b'] || '';
    const opC = datosBrutos['opcion_c'] || '';
    const opD = datosBrutos['opcion_d'] || '';

    const respCorrecta = (datosBrutos['respuesta_correcta']?.toUpperCase() || 'A') as AlternativaId;
    const explicacion = datosBrutos['explicacion'] || '';
    const norma = datosBrutos['norma'] || '';
    const articulo = datosBrutos['articulo'] || '';
    const textoSoporte = datosBrutos['texto_soporte'] || '';
    const urlOficial = datosBrutos['url_oficial'] || '';
    const fechaConsulta = datosBrutos['fecha_consulta'] || new Date().toISOString().split('T')[0];
    const vigenciaVerificada = datosBrutos['vigencia_verificada']?.toLowerCase() === 'true';

    const estadoSolicitado = (datosBrutos['estado']?.toLowerCase() || 'borrador') as EstadoPregunta;
    const observaciones = datosBrutos['observaciones'] || '';

    const preguntaObj: Pregunta = {
      id,
      perfil,
      materia,
      subtema,
      dificultad: ['baja', 'media', 'alta'].includes(dificultad) ? dificultad : 'media',
      tipo: ['normativa', 'jurisprudencial', 'caso_practico', 'doctrinaria'].includes(tipo)
        ? tipo
        : 'normativa',
      enunciado,
      alternativas: [
        { id: 'A', texto: opA },
        { id: 'B', texto: opB },
        { id: 'C', texto: opC },
        { id: 'D', texto: opD },
      ],
      respuestaCorrecta: respCorrecta,
      explicacion,
      explicacionDistractores: {},
      fuente: {
        norma,
        articulo,
        textoSoporte,
        urlOficial,
        fechaConsulta,
        vigenciaVerificada,
      },
      jurisprudencia: {
        numeroSentencia: datosBrutos['numero_sentencia'] || '',
        reglaJurisprudencial: datosBrutos['regla_jurisprudencial'] || '',
      },
      estado: estadoSolicitado,
      observaciones,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
    };

    // Validar con validador institucional
    const resVal = validarPreguntaParaAprobacion(preguntaObj, preguntasExistentes);
    if (!resVal.esValida) {
      if (estadoSolicitado === 'validada') {
        errores.push(
          `La fila no cumple los requisitos para estado 'validada': ${resVal.errores.join('; ')}`
        );
      } else {
        advertencias.push(...resVal.errores);
      }
    }
    advertencias.push(...resVal.advertencias);

    filasResultado.push({
      filaNumero,
      datosBrutos,
      pregunta: preguntaObj,
      esValida: errores.length === 0,
      errores,
      advertencias,
    });
  }

  const totalValidas = filasResultado.filter((f) => f.esValida).length;
  const totalConErrores = filasResultado.filter((f) => !f.esValida).length;

  return { filas: filasResultado, totalValidas, totalConErrores };
}

export function exportarPreguntasACSV(preguntas: Pregunta[]): string {
  const escapeCampo = (valor: string | number | boolean | undefined | null) => {
    if (valor === undefined || valor === null) return '""';
    const s = String(valor).replace(/"/g, '""');
    return `"${s}"`;
  };

  const lineas: string[] = [];
  lineas.push(CSV_CABECERAS.join(','));

  for (const p of preguntas) {
    const fila = [
      escapeCampo(p.id),
      escapeCampo(p.perfil.join(',')),
      escapeCampo(p.materia),
      escapeCampo(p.subtema),
      escapeCampo(p.dificultad),
      escapeCampo(p.tipo),
      escapeCampo(p.enunciado),
      escapeCampo(p.alternativas.find((a) => a.id === 'A')?.texto || ''),
      escapeCampo(p.alternativas.find((a) => a.id === 'B')?.texto || ''),
      escapeCampo(p.alternativas.find((a) => a.id === 'C')?.texto || ''),
      escapeCampo(p.alternativas.find((a) => a.id === 'D')?.texto || ''),
      escapeCampo(p.respuestaCorrecta),
      escapeCampo(p.explicacion),
      escapeCampo(p.fuente.norma),
      escapeCampo(p.fuente.articulo),
      escapeCampo(p.fuente.textoSoporte),
      escapeCampo(p.fuente.urlOficial),
      escapeCampo(p.fuente.fechaConsulta),
      escapeCampo(p.fuente.vigenciaVerificada),
      escapeCampo(p.jurisprudencia?.numeroSentencia || ''),
      escapeCampo(p.jurisprudencia?.reglaJurisprudencial || ''),
      escapeCampo(p.estado),
      escapeCampo(p.observaciones),
    ];
    lineas.push(fila.join(','));
  }

  return lineas.join('\n');
}
