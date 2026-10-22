import { AIAssistantResponse, AlternativaId, Dificultad } from '../types';

/**
 * Validador estricto del Asistente de Elaboración Jurídica (Gemini en el servidor).
 * Aplica las reglas absolutas:
 * - Trabajar solo con el documento proporcionado;
 * - No usar conocimiento externo;
 * - No inventar normas, artículos, sentencias o respuestas;
 * - Devolver FUENTE INSUFICIENTE cuando falte respaldo;
 * - Guardar siempre como borrador;
 * - Exigir aprobación humana;
 * - Registrar advertencias de ambigüedad o posible desactualización.
 */
export function validarYSanitizarSalidaAsistente(
  raw: any,
  documentoTexto: string
): AIAssistantResponse {
  const advertencias: string[] = [];
  const posiblesAmbiguedades: string[] = [];
  let posibleDesactualizacion = false;

  const docNorm = (documentoTexto || '').trim();

  // 1. Regla: Trabajar solo con el documento. Si el documento no tiene sustancia suficiente:
  if (!docNorm || docNorm.length < 25) {
    return {
      resultado: 'FUENTE_INSUFICIENTE',
      pregunta: null,
      justificacion:
        'FUENTE INSUFICIENTE: El documento proporcionado carece de texto normativo suficiente para formular un reactivo jurídicamente sustentado.',
      fuenteInsuficiente: true,
      exigeAprobacionHumana: true,
      advertencias: ['Documento de sustento ausente o inferior al umbral mínimo de análisis (25 caracteres).'],
    };
  }

  // 2. Si el modelo declaró explícitamente FUENTE_INSUFICIENTE
  if (
    !raw ||
    raw.resultado === 'FUENTE_INSUFICIENTE' ||
    (typeof raw.justificacion === 'string' &&
      raw.justificacion.toUpperCase().includes('FUENTE INSUFICIENTE'))
  ) {
    return {
      resultado: 'FUENTE_INSUFICIENTE',
      pregunta: null,
      justificacion:
        raw?.justificacion ||
        'FUENTE INSUFICIENTE: La fuente jurídica no contiene elementos suficientes para respaldar la pregunta sin recurrir a conocimiento externo.',
      fuenteInsuficiente: true,
      exigeAprobacionHumana: true,
      advertencias: ['La fuente proporcionada no ofrece respaldo suficiente para generar un reactivo unívoco.'],
    };
  }

  const p = raw.pregunta;
  if (!p || typeof p !== 'object') {
    return {
      resultado: 'FUENTE_INSUFICIENTE',
      pregunta: null,
      justificacion: 'FUENTE INSUFICIENTE: No se pudo estructurar un reactivo con sustento en el texto proporcionado.',
      fuenteInsuficiente: true,
      exigeAprobacionHumana: true,
      advertencias: ['Falta estructura de pregunta en la respuesta del modelo.'],
    };
  }

  // 3. Regla: no inventar normas ni artículos. Comprobación de anclaje con el documento:
  const docLower = docNorm.toLowerCase();
  const articuloReclamado = (p.articulo || '').trim();
  const normaReclamada = (p.norma || '').trim();

  // Si cita un artículo específico, verificar que dicho número o mención exista en el documento
  if (articuloReclamado) {
    const digitosArticulo = articuloReclamado.match(/\d+/g);
    if (digitosArticulo && digitosArticulo.length > 0) {
      const artExiste = digitosArticulo.some((num: string) => docLower.includes(num));
      if (!artExiste) {
        // El modelo inventó un artículo no mencionado en el documento
        return {
          resultado: 'FUENTE_INSUFICIENTE',
          pregunta: null,
          justificacion: `FUENTE INSUFICIENTE: El artículo citado (${articuloReclamado}) no se encuentra referenciado en el documento provisto. Se rechaza la invención normativa externa.`,
          fuenteInsuficiente: true,
          exigeAprobacionHumana: true,
          advertencias: [`Artículo ${articuloReclamado} no respaldado en el texto fuente.`],
        };
      }
    }
  }

  // 4. Validar enunciado
  const enunciado = (p.enunciado || '').trim();
  if (enunciado.length < 15) {
    return {
      resultado: 'FUENTE_INSUFICIENTE',
      pregunta: null,
      justificacion: 'FUENTE INSUFICIENTE: El enunciado generado no posee la extensión y claridad requerida.',
      fuenteInsuficiente: true,
      exigeAprobacionHumana: true,
      advertencias: ['Enunciado menor a 15 caracteres.'],
    };
  }

  // 5. Validar alternativas: exactamente 4 (A, B, C, D)
  const alternativasBrutas = Array.isArray(p.alternativas) ? p.alternativas : [];
  if (alternativasBrutas.length !== 4) {
    return {
      resultado: 'FUENTE_INSUFICIENTE',
      pregunta: null,
      justificacion: 'FUENTE INSUFICIENTE: Se requieren exactamente 4 opciones de respuesta (A, B, C, D).',
      fuenteInsuficiente: true,
      exigeAprobacionHumana: true,
      advertencias: [`El modelo devolvió ${alternativasBrutas.length} alternativas en lugar de 4.`],
    };
  }

  const idsEsperados: AlternativaId[] = ['A', 'B', 'C', 'D'];
  const alternativasValidadas: { id: AlternativaId; texto: string }[] = [];
  const textosAlternativas = new Set<string>();

  for (let i = 0; i < 4; i++) {
    const alt = alternativasBrutas[i];
    const id = idsEsperados[i];
    const texto = (alt?.texto || '').trim();

    if (!texto) {
      return {
        resultado: 'FUENTE_INSUFICIENTE',
        pregunta: null,
        justificacion: `FUENTE INSUFICIENTE: La alternativa ${id} está vacía.`,
        fuenteInsuficiente: true,
        exigeAprobacionHumana: true,
        advertencias: [`Alternativa ${id} carece de contenido.`],
      };
    }

    const tLower = texto.toLowerCase();
    if (
      tLower.includes('todas las anteriores') ||
      tLower.includes('ninguna de las anteriores') ||
      tLower.includes('todas son correctas') ||
      tLower.includes('ninguna es correcta')
    ) {
      return {
        resultado: 'FUENTE_INSUFICIENTE',
        pregunta: null,
        justificacion: `FUENTE INSUFICIENTE: La alternativa ${id} emplea frases prohibidas como "todas las anteriores".`,
        fuenteInsuficiente: true,
        exigeAprobacionHumana: true,
        advertencias: [`Uso de fórmulas prohibidas en opción ${id}.`],
      };
    }

    if (textosAlternativas.has(tLower)) {
      posiblesAmbiguedades.push(`Alternativa ${id} contiene texto repetido con otra opción.`);
    }
    textosAlternativas.add(tLower);

    alternativasValidadas.push({ id, texto });
  }

  // 6. Validar respuesta correcta única
  const respCorrecta = (p.respuestaCorrecta || '').toUpperCase() as AlternativaId;
  if (!idsEsperados.includes(respCorrecta)) {
    return {
      resultado: 'FUENTE_INSUFICIENTE',
      pregunta: null,
      justificacion: 'FUENTE INSUFICIENTE: Respuesta correcta no especificada unívocamente (debe ser A, B, C o D).',
      fuenteInsuficiente: true,
      exigeAprobacionHumana: true,
      advertencias: ['Respuesta correcta inválida o ambigua.'],
    };
  }

  // 7. Registro de advertencias de ambigüedad
  if (Array.isArray(p.advertencias)) {
    for (const adv of p.advertencias) {
      if (typeof adv === 'string' && adv.trim()) {
        advertencias.push(adv.trim());
        const advLower = adv.toLowerCase();
        if (
          advLower.includes('ambig') ||
          advLower.includes('defendible') ||
          advLower.includes('contrad') ||
          advLower.includes('doble')
        ) {
          posiblesAmbiguedades.push(adv.trim());
        }
        if (
          advLower.includes('desactualiz') ||
          advLower.includes('derog') ||
          advLower.includes('reforma') ||
          advLower.includes('vigencia')
        ) {
          posibleDesactualizacion = true;
        }
      }
    }
  }

  // Detectar ambigüedades en justificación
  const justificacionStr = (raw.justificacion || '').toLowerCase();
  if (
    justificacionStr.includes('ambigüed') ||
    justificacionStr.includes('ambigua') ||
    justificacionStr.includes('más de una respuesta') ||
    justificacionStr.includes('dos opciones defendibles')
  ) {
    posiblesAmbiguedades.push('La justificación advierte posibles interpretaciones encontradas.');
  }

  if (
    justificacionStr.includes('posible desactualización') ||
    justificacionStr.includes('norma derogada') ||
    justificacionStr.includes('reforma posterior')
  ) {
    posibleDesactualizacion = true;
    advertencias.push('Posible desactualización normativa referida en la fuente.');
  }

  // Determinar resultado final
  let resultadoFinal: AIAssistantResponse['resultado'] = 'PROPUESTA_GENERADA';
  if (raw.resultado === 'PREGUNTA_AMBIGUA' || posiblesAmbiguedades.length > 0) {
    resultadoFinal = 'PREGUNTA_AMBIGUA';
  } else if (raw.resultado === 'POSIBLE_DESACTUALIZACION' || posibleDesactualizacion) {
    resultadoFinal = 'POSIBLE_DESACTUALIZACION';
  }

  // 8. Reglas absolutas:
  // - Guardar siempre como borrador;
  // - Exigir aprobación humana.
  return {
    resultado: resultadoFinal,
    pregunta: {
      materia: p.materia || 'Derecho Constitucional',
      subtema: p.subtema || 'General',
      dificultad: (p.dificultad || 'media') as Dificultad,
      enunciado,
      alternativas: alternativasValidadas,
      respuestaCorrecta: respCorrecta,
      explicacion: p.explicacion || 'Explicación sustentada en el documento aportado.',
      norma: normaReclamada || 'Documento analizado',
      articulo: articuloReclamado || 'Soporte textual',
      textoSoporte: p.textoSoporte || docNorm.slice(0, 300),
      advertencias,
      posiblesAmbiguedades: posiblesAmbiguedades.length > 0 ? posiblesAmbiguedades : undefined,
      posibleDesactualizacion,
      estado: 'borrador', // SIEMPRE BORRADOR
      revisadaPorHumano: false, // NUNCA AUTO-VALIDADA
      exigeAprobacionHumana: true, // EXIGE APROBACIÓN HUMANA
    },
    justificacion:
      raw.justificacion ||
      'Pregunta generada estrictamente a partir del documento aportado. Pendiente de aprobación humana.',
    advertencias: advertencias.length > 0 ? advertencias : undefined,
    fuenteInsuficiente: false,
    exigeAprobacionHumana: true,
  };
}
