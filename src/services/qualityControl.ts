import { Pregunta } from '../types';

export type FiltroCalidadJuridica =
  | 'todas'
  | 'sin_fuente'
  | 'fuente_no_oficial'
  | 'sin_fecha_consulta'
  | 'posiblemente_desactualizadas'
  | 'sin_explicacion'
  | 'mas_de_una_respuesta_defendible'
  | 'nunca_revisadas_persona';

/**
 * Dominios web considerados fuentes oficiales del Estado Ecuatoriano
 */
const DOMINIOS_OFICIALES_ECUADOR = [
  '.gob.ec',
  'corteconstitucional.gob.ec',
  'asambleanacional.gob.ec',
  'registroficial.gob.ec',
  'funcionjudicial.gob.ec',
  'fiscalia.gob.ec',
  'defensoria.gob.ec',
  'cj.gob.ec',
  'derechoecuador.com/registro-oficial',
];

/**
 * Determina si la URL aportada pertenece a una fuente oficial del Ecuador
 */
export function esUrlFuenteOficial(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim().toLowerCase();
  if (clean === '' || clean.includes('ejemplo.invalid') || clean.includes('example.com')) {
    return false;
  }
  return DOMINIOS_OFICIALES_ECUADOR.some((dom) => clean.includes(dom));
}

/**
 * Predicado para preguntas sin fuente jurídica
 */
export function esPreguntaSinFuente(p: Pregunta): boolean {
  if (!p.fuente) return true;
  const norma = (p.fuente.norma || '').trim();
  const art = (p.fuente.articulo || '').trim();
  return norma.length === 0 || art.length === 0;
}

/**
 * Predicado para preguntas con fuente no oficial
 */
export function esPreguntaConFuenteNoOficial(p: Pregunta): boolean {
  if (!p.fuente || !p.fuente.urlOficial) return true;
  return !esUrlFuenteOficial(p.fuente.urlOficial);
}

/**
 * Predicado para preguntas sin fecha de consulta
 */
export function esPreguntaSinFechaConsulta(p: Pregunta): boolean {
  return !p.fuente || !p.fuente.fechaConsulta || p.fuente.fechaConsulta.trim() === '';
}

/**
 * Predicado para preguntas posiblemente desactualizadas
 */
export function esPreguntaPosiblementeDesactualizada(p: Pregunta): boolean {
  if (p.estado === 'desactualizada') return true;
  if (!p.fuente) return true;
  if (p.fuente.vigenciaVerificada === false) return true;
  // Advertencias de desactualización registradas
  if (p.observaciones && p.observaciones.toLowerCase().includes('desactualiz')) return true;
  if (p.posiblesAmbiguedades?.some((a) => a.toLowerCase().includes('desactualiz') || a.toLowerCase().includes('derog'))) {
    return true;
  }
  return false;
}

/**
 * Predicado para preguntas sin explicación sustantiva
 */
export function esPreguntaSinExplicacion(p: Pregunta): boolean {
  return !p.explicacion || p.explicacion.trim().length < 5;
}

/**
 * Predicado para preguntas con más de una respuesta defendible (ambiguas)
 */
export function esPreguntaConMasDeUnaRespuestaDefendible(p: Pregunta): boolean {
  if (p.posiblesAmbiguedades && p.posiblesAmbiguedades.length > 0) return true;
  const obs = (p.observaciones || '').toLowerCase();
  return (
    obs.includes('ambigüed') ||
    obs.includes('ambigua') ||
    obs.includes('más de una respuesta') ||
    obs.includes('dos respuestas defendibles') ||
    obs.includes('controversia')
  );
}

/**
 * Predicado para preguntas nunca revisadas por una persona
 */
export function esPreguntaNuncaRevisadaPorPersona(p: Pregunta): boolean {
  return p.revisadaPorHumano !== true || !p.ultimaRevision;
}

/**
 * Detección de posibles duplicados en el banco
 */
export function detectarDuplicadosPregunta(pregunta: Pregunta, todas: Pregunta[]): string[] {
  const duplicados: string[] = [];
  const normalizar = (txt: string) =>
    txt
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const textoA = normalizar(pregunta.enunciado || '');
  if (textoA.length < 10) return duplicados;

  const palabrasA = new Set(textoA.split(' ').filter((w) => w.length > 3));

  for (const otra of todas) {
    if (otra.id === pregunta.id) continue;
    const textoB = normalizar(otra.enunciado || '');
    if (textoA === textoB) {
      duplicados.push(otra.id);
      continue;
    }

    const palabrasB = new Set(textoB.split(' ').filter((w) => w.length > 3));
    let comunes = 0;
    for (const w of palabrasA) {
      if (palabrasB.has(w)) comunes++;
    }
    const union = new Set([...palabrasA, ...palabrasB]).size;
    if (union > 0 && comunes / union >= 0.70) {
      duplicados.push(otra.id);
    }
  }

  return duplicados;
}

/**
 * Filtra el banco según el filtro de calidad seleccionado
 */
export function filtrarPreguntasPorCalidad(
  preguntas: Pregunta[],
  filtro: FiltroCalidadJuridica
): Pregunta[] {
  switch (filtro) {
    case 'sin_fuente':
      return preguntas.filter(esPreguntaSinFuente);
    case 'fuente_no_oficial':
      return preguntas.filter(esPreguntaConFuenteNoOficial);
    case 'sin_fecha_consulta':
      return preguntas.filter(esPreguntaSinFechaConsulta);
    case 'posiblemente_desactualizadas':
      return preguntas.filter(esPreguntaPosiblementeDesactualizada);
    case 'sin_explicacion':
      return preguntas.filter(esPreguntaSinExplicacion);
    case 'mas_de_una_respuesta_defendible':
      return preguntas.filter(esPreguntaConMasDeUnaRespuestaDefendible);
    case 'nunca_revisadas_persona':
      return preguntas.filter(esPreguntaNuncaRevisadaPorPersona);
    case 'todas':
    default:
      return preguntas;
  }
}
