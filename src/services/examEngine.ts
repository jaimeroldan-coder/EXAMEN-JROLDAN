import {
  Alternativa,
  AlternativaId,
  ExamenConfig,
  IntentoExamen,
  Pregunta,
  PreguntaSnapshot,
} from '../types';

export const PUNTAJE_POR_ACIERTO = 0.50;
export const PUNTAJE_MAXIMO_OFICIAL = 50.0;
export const PUNTAJE_MINIMO_APROBACION = 40.0;
export const ACIERTOS_MINIMOS_APROBACION = 80;
export const DURACION_OFICIAL_MINUTOS = 60;
export const TOTAL_PREGUNTAS_OFICIAL = 100;
export const META_PEDAGOGICA_SEGURIDAD_ACIERTOS = 88;

/**
 * Normaliza el enunciado para comparación rigurosa anti-duplicados:
 * convierte a minúsculas, remueve acentos, signos de puntuación y espacios redundantes.
 */
export function normalizarEnunciado(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Mezcla aleatoriamente un array (Fisher-Yates)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Prepara una instantánea (snapshot) de una pregunta,
 * aleatorizando las alternativas y remapeando la respuesta correcta.
 */
export function crearSnapshotAleatorizado(pregunta: Pregunta): PreguntaSnapshot {
  const originalAlts = pregunta.alternativas;
  const originalCorrecta = pregunta.respuestaCorrecta;
  const textoRespuestaCorrecta = originalAlts.find((a) => a.id === originalCorrecta)?.texto || '';

  // Mezclar alternativas
  const shuffledTexts = shuffleArray(originalAlts.map((a) => a.texto));

  const nuevasAlternativas: Alternativa[] = [
    { id: 'A', texto: shuffledTexts[0] },
    { id: 'B', texto: shuffledTexts[1] },
    { id: 'C', texto: shuffledTexts[2] },
    { id: 'D', texto: shuffledTexts[3] },
  ];

  // Encontrar nueva letra de la respuesta correcta
  const nuevaCorrecta = nuevasAlternativas.find(
    (a) => a.texto === textoRespuestaCorrecta
  )?.id || 'A';

  return {
    preguntaOriginalId: pregunta.id,
    materia: pregunta.materia,
    subtema: pregunta.subtema,
    dificultad: pregunta.dificultad,
    tipo: pregunta.tipo,
    enunciado: pregunta.enunciado,
    alternativas: nuevasAlternativas,
    respuestaCorrecta: nuevaCorrecta,
    explicacion: pregunta.explicacion,
    explicacionDistractores: pregunta.explicacionDistractores,
    fuente: { ...pregunta.fuente },
    jurisprudencia: { ...pregunta.jurisprudencia },
    esDemostracion: pregunta.esDemostracion,
  };
}

/**
 * Filtra y selecciona preguntas según la modalidad y configuración
 */
export function seleccionarPreguntasParaExamen(
  banco: Pregunta[],
  config: ExamenConfig,
  preguntasFalladasIds?: Set<string>,
  preguntasMarcadasIds?: Set<string>,
  preguntasDominadasIds?: Set<string>
): { preguntas: PreguntaSnapshot[]; error?: string } {
  // Solo preguntas validadas para simulacro oficial
  // Si no hay banco real y solo hay demo, se debe advertir
  let pool = banco.filter((p) => p.estado === 'validada');

  // Si hay materias seleccionadas, filtrar
  if (config.materiasSeleccionadas && config.materiasSeleccionadas.length > 0) {
    const materiasSet = new Set(config.materiasSeleccionadas);
    pool = pool.filter((p) => materiasSet.has(p.materia));
  }

  // Filtros de práctica personalizada
  if (config.modalidad === 'practica_personalizada') {
    if (config.filtroDificultad && config.filtroDificultad !== 'todas') {
      pool = pool.filter((p) => p.dificultad === config.filtroDificultad);
    }
    if (config.soloFalladas && preguntasFalladasIds) {
      pool = pool.filter((p) => preguntasFalladasIds.has(p.id));
    }
    if (config.soloMarcadas && preguntasMarcadasIds) {
      pool = pool.filter((p) => preguntasMarcadasIds.has(p.id));
    }
    if (config.soloNoDominadas && preguntasDominadasIds) {
      pool = pool.filter((p) => !preguntasDominadasIds.has(p.id));
    }
  }

  // Evitar duplicados por id y por enunciado normalizado
  const poolUnicoMap = new Map<string, Pregunta>();
  const stemsVistos = new Set<string>();

  for (const p of pool) {
    const stemNorm = normalizarEnunciado(p.enunciado);
    if (!poolUnicoMap.has(p.id) && !stemsVistos.has(stemNorm)) {
      poolUnicoMap.set(p.id, p);
      stemsVistos.add(stemNorm);
    }
  }
  const poolUnico = Array.from(poolUnicoMap.values());

  const cantidadRequerida = config.numeroPreguntas;

  if (poolUnico.length < cantidadRequerida) {
    return {
      preguntas: [],
      error: `El banco de preguntas solo cuenta con ${poolUnico.length} preguntas validadas disponibles para los criterios seleccionados. Se requieren ${cantidadRequerida}. Conforme a las reglas del simulador, no se permite repetir preguntas artificialmente. Ingrese más preguntas al banco antes de iniciar.`,
    };
  }

  const seleccionadas: Pregunta[] = [];
  const seleccionadasIds = new Set<string>();
  const seleccionadasStems = new Set<string>();

  const agregarSiNoExiste = (p: Pregunta) => {
    const st = normalizarEnunciado(p.enunciado);
    if (!seleccionadasIds.has(p.id) && !seleccionadasStems.has(st)) {
      seleccionadas.push(p);
      seleccionadasIds.add(p.id);
      seleccionadasStems.add(st);
      return true;
    }
    return false;
  };

  if (config.modalidad === 'equilibrado' && config.materiasSeleccionadas && config.materiasSeleccionadas.length > 0) {
    // Distribución proporcional entre materias seleccionadas (didáctica)
    const porMateria: Record<string, Pregunta[]> = {};
    for (const m of config.materiasSeleccionadas) {
      porMateria[m] = poolUnico.filter((p) => p.materia === m);
    }

    const nMaterias = config.materiasSeleccionadas.length;
    const basePorMateria = Math.floor(cantidadRequerida / nMaterias);
    let sobrantes = cantidadRequerida % nMaterias;

    for (const m of config.materiasSeleccionadas) {
      const cuota = basePorMateria + (sobrantes > 0 ? 1 : 0);
      if (sobrantes > 0) sobrantes--;

      const disponibles = shuffleArray(porMateria[m] || []);
      for (const p of disponibles) {
        if (seleccionadas.length >= cantidadRequerida) break;
        if (agregarSiNoExiste(p)) {
          if (seleccionadas.filter((x) => x.materia === m).length >= cuota) {
            break;
          }
        }
      }
    }

    // Si por cuotas faltaron por disponibilidad en alguna materia, completar con el resto aleatorio sin repetición
    if (seleccionadas.length < cantidadRequerida) {
      const restantes = shuffleArray(poolUnico);
      for (const p of restantes) {
        if (seleccionadas.length >= cantidadRequerida) break;
        agregarSiNoExiste(p);
      }
    }
  } else {
    // "oficial_aleatorio" o "practica_personalizada" aleatoria
    const barajadas = shuffleArray(poolUnico);
    for (const p of barajadas) {
      if (seleccionadas.length >= cantidadRequerida) break;
      agregarSiNoExiste(p);
    }
  }

  // Aleatorizar el orden final de las preguntas seleccionadas para cada intento
  const ordenFinal = shuffleArray(seleccionadas);

  // Crear snapshots inmutables con alternativas aleatorizadas
  const snapshots = ordenFinal.map((p) => crearSnapshotAleatorizado(p));

  // Verificación adversarial de garantía cero repetición:
  const idsFinales = new Set(snapshots.map((s) => s.preguntaOriginalId));
  const stemsFinales = new Set(snapshots.map((s) => normalizarEnunciado(s.enunciado)));
  if (idsFinales.size !== snapshots.length || stemsFinales.size !== snapshots.length) {
    const filtradas: PreguntaSnapshot[] = [];
    const vIds = new Set<string>();
    const vStems = new Set<string>();
    for (const s of snapshots) {
      const st = normalizarEnunciado(s.enunciado);
      if (!vIds.has(s.preguntaOriginalId) && !vStems.has(st)) {
        vIds.add(s.preguntaOriginalId);
        vStems.add(st);
        filtradas.push(s);
      }
    }
    return { preguntas: filtradas };
  }

  return { preguntas: snapshots };
}

/**
 * Califica un intento de examen y calcula resultados finales
 */
export function calificarIntento(intento: IntentoExamen): IntentoExamen {
  let correctas = 0;
  let incorrectas = 0;
  let noContestadas = 0;

  intento.preguntasSnapshot.forEach((pregunta, index) => {
    const respuestaUsuario = intento.respuestasUsuario[index];
    if (!respuestaUsuario) {
      noContestadas++;
    } else if (respuestaUsuario === pregunta.respuestaCorrecta) {
      correctas++;
    } else {
      incorrectas++;
    }
  });

  const totalPreguntas = intento.preguntasSnapshot.length;
  // Cada acierto vale exactamente 0.50 puntos
  const puntajeObtenido = Number((correctas * PUNTAJE_POR_ACIERTO).toFixed(2));
  const porcentajeAcierto = totalPreguntas > 0 ? Number(((correctas / totalPreguntas) * 100).toFixed(2)) : 0;
  const puntajeMinimo = intento.puntajeMinimoAprobacion ?? PUNTAJE_MINIMO_APROBACION;
  const aprobado = puntajeObtenido >= puntajeMinimo;

  return {
    ...intento,
    entregado: true,
    fechaFin: new Date().toISOString(),
    correctas,
    incorrectas,
    noContestadas,
    puntajeObtenido,
    porcentajeAcierto,
    aprobado,
  };
}
