import { Pregunta, ValidacionResultado } from '../types';

export function validarPreguntaParaAprobacion(
  pregunta: Partial<Pregunta>,
  preguntasExistentes: Pregunta[] = []
): ValidacionResultado {
  const errores: string[] = [];
  const advertencias: string[] = [];

  // 1. Enunciado
  if (!pregunta.enunciado || pregunta.enunciado.trim().length < 15) {
    errores.push('El enunciado debe ser claro, autosuficiente y contener al menos 15 caracteres.');
  }

  // 2. Alternativas: exactamente 4
  if (!pregunta.alternativas || pregunta.alternativas.length !== 4) {
    errores.push('La pregunta debe contener exactamente cuatro alternativas (A, B, C, D).');
  } else {
    const idsValidos = ['A', 'B', 'C', 'D'];
    const textos = new Set<string>();

    for (let i = 0; i < pregunta.alternativas.length; i++) {
      const alt = pregunta.alternativas[i];
      if (!alt || !idsValidos.includes(alt.id)) {
        errores.push(`La alternativa en posición ${i + 1} tiene un identificador inválido.`);
      }
      if (!alt.texto || alt.texto.trim() === '') {
        errores.push(`La alternativa ${alt?.id || i + 1} está vacía.`);
      } else {
        const textoNorm = alt.texto.trim().toLowerCase();
        if (textos.has(textoNorm)) {
          errores.push(`Las alternativas deben ser diferentes entre sí. Se detectó texto duplicado en alternativa ${alt.id}.`);
        }
        textos.add(textoNorm);

        // Prohibir "todas las anteriores" o "ninguna de las anteriores"
        if (
          textoNorm.includes('todas las anteriores') ||
          textoNorm.includes('ninguna de las anteriores') ||
          textoNorm.includes('todas son correctas') ||
          textoNorm.includes('ninguna es correcta')
        ) {
          errores.push(
            `La alternativa ${alt.id} usa expresiones prohibidas como "todas las anteriores" o "ninguna de las anteriores".`
          );
        }
      }
    }
  }

  // 3. Respuesta correcta única
  const idsPermitidos = ['A', 'B', 'C', 'D'];
  if (!pregunta.respuestaCorrecta || !idsPermitidos.includes(pregunta.respuestaCorrecta)) {
    errores.push('Debe existir una sola respuesta correcta válida seleccionada (A, B, C o D).');
  }

  // 4. Preguntas negativas y resaltado
  if (pregunta.enunciado) {
    const enunciadoLower = pregunta.enunciado.toLowerCase();
    const contieneNegativa =
      enunciadoLower.includes('no ') ||
      enunciadoLower.includes('excepto') ||
      enunciadoLower.includes('incorrecta') ||
      enunciadoLower.includes('falsa');

    if (contieneNegativa) {
      const tieneResaltado =
        pregunta.enunciado.includes('NO') ||
        pregunta.enunciado.includes('EXCEPTO') ||
        pregunta.enunciado.includes('INCORRECTA') ||
        pregunta.enunciado.includes('FALSA') ||
        pregunta.enunciado.includes('**NO**') ||
        pregunta.enunciado.includes('**EXCEPTO**') ||
        pregunta.enunciado.includes('**INCORRECTA**');

      if (!tieneResaltado) {
        errores.push(
          'Si la formulación contiene términos negativos (NO, EXCEPTO, INCORRECTA, FALSA), dichas palabras deben aparecer destacadas en mayúsculas.'
        );
      } else {
        advertencias.push('La formulación contiene términos negativos. Verifique que exista justificación metodológica.');
      }
    }
  }

  // 5. Soporte de Fuente Jurídica
  if (!pregunta.fuente) {
    errores.push('Se requiere registrar la fuente jurídica de sustento.');
  } else {
    if (!pregunta.fuente.norma || pregunta.fuente.norma.trim().length < 3) {
      errores.push('Debe registrarse el código, ley o norma jurídica aplicable.');
    }
    if (!pregunta.fuente.articulo || pregunta.fuente.articulo.trim().length < 1) {
      errores.push('Debe registrarse el artículo o inciso específico de sustento.');
    }
    if (!pregunta.fuente.fechaConsulta || pregunta.fuente.fechaConsulta.trim() === '') {
      errores.push('Debe registrarse la fecha de consulta de la fuente (AAAA-MM-DD).');
    }
    if (pregunta.fuente.vigenciaVerificada !== true) {
      errores.push('La fuente debe estar expresamente verificada como vigente para poder validar la pregunta.');
    }
    if (!pregunta.fuente.textoSoporte || pregunta.fuente.textoSoporte.trim().length < 10) {
      advertencias.push('Se recomienda transcribir el fragmento de texto legal de soporte estrictamente necesario.');
    }
  }

  // 6. Materia y subtema
  if (!pregunta.materia || pregunta.materia.trim().length < 3) {
    errores.push('Debe asignarse una materia jurídica válida.');
  }
  if (!pregunta.subtema || pregunta.subtema.trim().length < 3) {
    errores.push('Debe asignarse un subtema específico.');
  }

  // 7. Detección de duplicados o excesivamente parecidos
  if (pregunta.enunciado && preguntasExistentes.length > 0) {
    const enunciadoActualNorm = normalizarTextoParaComparacion(pregunta.enunciado);
    for (const otra of preguntasExistentes) {
      if (otra.id === pregunta.id) continue;
      const otraNorm = normalizarTextoParaComparacion(otra.enunciado);
      if (enunciadoActualNorm === otraNorm) {
        errores.push(`Se detectó una pregunta con enunciado exactamente duplicado (ID: ${otra.id}).`);
        break;
      } else if (calcularSimilitudJaccard(enunciadoActualNorm, otraNorm) > 0.85) {
        advertencias.push(`El enunciado es sumamente similar a la pregunta ${otra.id}. Revise posible duplicidad.`);
      }
    }
  }

  // 8. Detección básica de datos personales o confidenciales
  if (pregunta.enunciado) {
    const textoCompleto = `${pregunta.enunciado} ${pregunta.explicacion || ''}`;
    // Cédula ecuatoriana típica (10 dígitos seguidos)
    if (/\b\d{10}\b/.test(textoCompleto)) {
      advertencias.push('Verifique que no se incluyan números de cédula reales ni datos protegidos por confidencialidad.');
    }
  }

  return {
    esValida: errores.length === 0,
    errores,
    advertencias,
  };
}

function normalizarTextoParaComparacion(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function calcularSimilitudJaccard(s1: string, s2: string): number {
  const set1 = new Set(s1.split(' ').filter((w) => w.length > 3));
  const set2 = new Set(s2.split(' ').filter((w) => w.length > 3));
  if (set1.size === 0 || set2.size === 0) return 0;
  let interseccion = 0;
  for (const item of set1) {
    if (set2.has(item)) interseccion++;
  }
  const union = new Set([...set1, ...set2]).size;
  return union === 0 ? 0 : interseccion / union;
}
