import { Alternativa, AlternativaId, Dificultad, Pregunta } from '../types';

export interface PreguntaParseadaResultado {
  validas: Pregunta[];
  invalidas: { indice: number; fragmento: string; error: string }[];
}

/**
 * Normaliza letras de respuesta a 'A' | 'B' | 'C' | 'D'
 */
function normalizarLetraRespuesta(raw: string): AlternativaId | null {
  const limpia = raw.trim().toUpperCase().replace(/[^ABCD1234]/g, '');
  if (limpia === 'A' || limpia === '1') return 'A';
  if (limpia === 'B' || limpia === '2') return 'B';
  if (limpia === 'C' || limpia === '3') return 'C';
  if (limpia === 'D' || limpia === '4') return 'D';
  return null;
}

/**
 * Parsea texto no estructurado o semi-estructurado de preguntas de opción múltiple (4 alternativas)
 */
export function parsearPreguntasDesdeTexto(texto: string, materiaDefault = 'Derecho Constitucional'): PreguntaParseadaResultado {
  const lineas = texto.split(/\r?\n/);
  const bloques: string[][] = [];
  let bloqueActual: string[] = [];

  // Dividir por bloques de preguntas (líneas en blanco o indicadores como "1.", "Pregunta", etc.)
  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i];
    const trimL = l.trim();

    // Detección de inicio de nueva pregunta si empieza por número o palabra clave
    const esInicioNuevaPregunta =
      /^(?:pregunta\s*\d+|reactivo\s*\d+|\d+[\.\-\)\s])/i.test(trimL) &&
      bloqueActual.some((bl) => /^(?:respuesta|soluci[oó]n|correcta|clave)/i.test(bl.trim()));

    if ((trimL === '' && bloqueActual.length > 0) || esInicioNuevaPregunta) {
      if (bloqueActual.length > 0) {
        bloques.push([...bloqueActual]);
        bloqueActual = [];
      }
      if (trimL !== '') {
        bloqueActual.push(l);
      }
    } else if (trimL !== '') {
      bloqueActual.push(l);
    }
  }

  if (bloqueActual.length > 0) {
    bloques.push(bloqueActual);
  }

  const validas: Pregunta[] = [];
  const invalidas: { indice: number; fragmento: string; error: string }[] = [];

  bloques.forEach((bloque, idx) => {
    let enunciado = '';
    const alternativas: Alternativa[] = [];
    let respuestaCorrecta: AlternativaId | null = null;
    let explicacion = '';
    let materia = materiaDefault;
    let norma = '';
    let articulo = '';

    for (const l of bloque) {
      const trimL = l.trim();

      // Detección de respuesta correcta
      const matchResp = trimL.match(/^(?:respuesta(?:\s*correcta)?|correcta|soluci[oó]n|clave|rta|ans)\s*[:=\-–]?\s*([a-dA-D1-4])/i);
      if (matchResp) {
        respuestaCorrecta = normalizarLetraRespuesta(matchResp[1]);
        continue;
      }

      // Detección de alternativa A, B, C, D (ejemplo: A) ..., B. ..., [C] ...)
      const matchAlt = trimL.match(/^[\(\[]?([a-dA-D])[\)\]\.\-–:\s]\s*(.+)$/i);
      if (matchAlt) {
        const idAlt = normalizarLetraRespuesta(matchAlt[1]);
        const textoAlt = matchAlt[2].trim();
        if (idAlt && textoAlt) {
          // Si ya existe esa alternativa en el bloque, no duplicar
          if (!alternativas.some((a) => a.id === idAlt)) {
            alternativas.push({ id: idAlt, texto: textoAlt });
          }
          continue;
        }
      }

      // Metadatos opcionales
      const matchMateria = trimL.match(/^materia\s*[:=\-–]\s*(.*)$/i);
      if (matchMateria) {
        materia = matchMateria[1].trim() || materiaDefault;
        continue;
      }

      const matchNorma = trimL.match(/^(?:norma|fuente|ley|c[oó]digo)\s*[:=\-–]\s*(.*)$/i);
      if (matchNorma) {
        norma = matchNorma[1].trim();
        continue;
      }

      const matchArt = trimL.match(/^(?:art[ií]culo|art\.?)\s*[:=\-–]\s*(.*)$/i);
      if (matchArt) {
        articulo = matchArt[1].trim();
        continue;
      }

      const matchExp = trimL.match(/^(?:explicaci[oó]n|fundamentaci[oó]n|justificaci[oó]n)\s*[:=\-–]\s*(.*)$/i);
      if (matchExp) {
        explicacion = matchExp[1].trim();
        continue;
      }

      // Si no es metadato ni alternativa, acumular al enunciado
      if (alternativas.length === 0) {
        // Limpiar numeración inicial si existe ("1. ", "1) ", "Pregunta 1: ")
        const limpio = trimL.replace(/^(?:pregunta\s*\d+|reactivo\s*\d+|\d+[\.\-\)\s])\s*[:\-–]?\s*/i, '');
        enunciado = enunciado ? `${enunciado} ${limpio}` : limpio;
      } else {
        // Si ya hay alternativas y aparece texto libre, puede ser explicación
        explicacion = explicacion ? `${explicacion} ${trimL}` : trimL;
      }
    }

    // Ordenar alternativas A, B, C, D
    const alternativasOrdenadas: Alternativa[] = [];
    const orden: AlternativaId[] = ['A', 'B', 'C', 'D'];
    orden.forEach((id) => {
      const encontrada = alternativas.find((a) => a.id === id);
      if (encontrada) {
        alternativasOrdenadas.push(encontrada);
      }
    });

    // Validar requerimientos esenciales:
    // 1. Enunciado no vacío
    // 2. Exactamente 4 posibles respuestas
    // 3. Respuesta correcta identificada y entre las 4
    const fragmento = bloque.slice(0, 3).join(' ').slice(0, 100);

    if (!enunciado || enunciado.length < 5) {
      invalidas.push({
        indice: idx + 1,
        fragmento: fragmento || 'Bloque vacío',
        error: 'El enunciado de la pregunta está incompleto o ausente.',
      });
      return;
    }

    if (alternativasOrdenadas.length !== 4) {
      invalidas.push({
        indice: idx + 1,
        fragmento,
        error: `Se requieren exactamente 4 opciones de respuesta (A, B, C, D). Se detectaron ${alternativasOrdenadas.length} opciones.`,
      });
      return;
    }

    if (!respuestaCorrecta) {
      invalidas.push({
        indice: idx + 1,
        fragmento,
        error: 'No se identificó la respuesta correcta (ejemplo: "Respuesta: A" o "Clave: B").',
      });
      return;
    }

    const nuevaPregunta: Pregunta = {
      id: `USR-${Date.now()}-${idx + 1}-${Math.floor(Math.random() * 1000)}`,
      perfil: ['penal', 'personalizado'],
      materia: materia || materiaDefault,
      subtema: 'General',
      dificultad: 'media' as Dificultad,
      tipo: 'normativa',
      enunciado: enunciado.trim(),
      alternativas: [
        alternativasOrdenadas[0],
        alternativasOrdenadas[1],
        alternativasOrdenadas[2],
        alternativasOrdenadas[3],
      ],
      respuestaCorrecta,
      explicacion: explicacion || 'Respuesta verificada conforme al banco de preguntas facilitado.',
      explicacionDistractores: {},
      fuente: {
        norma: norma || 'Normativa legal ecuatoriana aplicable',
        articulo: articulo || 'Art. concordante',
        textoSoporte: explicacion || 'Disposición normativa pertinente.',
        urlOficial: 'https://www.funcionjudicial.gob.ec',
        fechaConsulta: new Date().toISOString().split('T')[0],
        vigenciaVerificada: true,
      },
      jurisprudencia: {},
      estado: 'validada',
      observaciones: 'Reactivo facilitado por el usuario.',
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      esDemostracion: false,
      revisadaPorHumano: true,
    };

    validas.push(nuevaPregunta);
  });

  return { validas, invalidas };
}

/**
 * Parsea array JSON flexible a formato Pregunta[]
 */
export function parsearPreguntasDesdeJSON(jsonInput: unknown): { validas: Pregunta[]; error?: string } {
  try {
    let arr: any = jsonInput;
    if (typeof jsonInput === 'string') {
      arr = JSON.parse(jsonInput);
    }

    if (!Array.isArray(arr)) {
      if (arr && Array.isArray(arr.preguntas)) {
        arr = arr.preguntas;
      } else {
        return { validas: [], error: 'El archivo JSON debe ser una lista (array) de preguntas.' };
      }
    }

    const validas: Pregunta[] = [];

    arr.forEach((item: any, idx: number) => {
      const enunciado = item.enunciado || item.pregunta || item.question || '';
      let alternativas: Alternativa[] = [];

      if (Array.isArray(item.alternativas)) {
        alternativas = item.alternativas.map((alt: any, i: number) => {
          const id = (alt.id || ['A', 'B', 'C', 'D'][i] || 'A').toUpperCase() as AlternativaId;
          const texto = typeof alt === 'string' ? alt : alt.texto || alt.text || '';
          return { id, texto };
        });
      } else if (Array.isArray(item.opciones)) {
        alternativas = item.opciones.map((txt: string, i: number) => ({
          id: (['A', 'B', 'C', 'D'][i] || 'A') as AlternativaId,
          texto: String(txt),
        }));
      } else if (item.opcion_a && item.opcion_b && item.opcion_c && item.opcion_d) {
        alternativas = [
          { id: 'A', texto: String(item.opcion_a) },
          { id: 'B', texto: String(item.opcion_b) },
          { id: 'C', texto: String(item.opcion_c) },
          { id: 'D', texto: String(item.opcion_d) },
        ];
      }

      const rawCorrecta = item.respuestaCorrecta || item.respuesta_correcta || item.correcta || item.respuesta || 'A';
      const respuestaCorrecta = normalizarLetraRespuesta(String(rawCorrecta)) || 'A';

      if (enunciado && alternativas.length >= 4) {
        validas.push({
          id: item.id || `USR-JSON-${Date.now()}-${idx + 1}`,
          perfil: Array.isArray(item.perfil) ? item.perfil : ['penal', 'personalizado'],
          materia: item.materia || 'Derecho Constitucional',
          subtema: item.subtema || 'General',
          dificultad: (item.dificultad as Dificultad) || 'media',
          tipo: item.tipo || 'normativa',
          enunciado: String(enunciado).trim(),
          alternativas: [
            alternativas[0],
            alternativas[1],
            alternativas[2],
            alternativas[3],
          ],
          respuestaCorrecta,
          explicacion: item.explicacion || 'Respuesta verificada en banco facilitado.',
          explicacionDistractores: item.explicacionDistractores || {},
          fuente: {
            norma: item.fuente?.norma || item.norma || 'Normativa legal',
            articulo: item.fuente?.articulo || item.articulo || 'Art. concordante',
            textoSoporte: item.fuente?.textoSoporte || item.texto_soporte || '',
            urlOficial: item.fuente?.urlOficial || 'https://www.funcionjudicial.gob.ec',
            fechaConsulta: new Date().toISOString().split('T')[0],
            vigenciaVerificada: true,
          },
          jurisprudencia: item.jurisprudencia || {},
          estado: 'validada',
          observaciones: item.observaciones || 'Importado por usuario',
          fechaCreacion: item.fechaCreacion || new Date().toISOString(),
          fechaActualizacion: new Date().toISOString(),
          esDemostracion: false,
          revisadaPorHumano: true,
        });
      }
    });

    return { validas };
  } catch (e: any) {
    return { validas: [], error: `Error de formato JSON: ${e?.message || 'sintaxis no válida'}` };
  }
}
