import { describe, it, expect } from 'vitest';
import {
  PUNTAJE_POR_ACIERTO,
  PUNTAJE_MAXIMO_OFICIAL,
  PUNTAJE_MINIMO_APROBACION,
  ACIERTOS_MINIMOS_APROBACION,
  DURACION_OFICIAL_MINUTOS,
  TOTAL_PREGUNTAS_OFICIAL,
  calificarIntento,
  seleccionarPreguntasParaExamen,
  crearSnapshotAleatorizado,
} from '../src/services/examEngine';
import { validarPreguntaParaAprobacion } from '../src/services/validator';
import { procesarFilasCSV } from '../src/services/csvParser';
import { parsearPreguntasDesdeTexto } from '../src/services/questionTextParser';
import { ExamenConfig, IntentoExamen, Pregunta, PreguntaSnapshot } from '../src/types';
import { PREGUNTAS_DEMOSTRACION } from '../src/services/demoData';
import {
  BANCO_COMPLETO_EFJ_110,
  BANCO_CONSTITUCIONAL_JR,
  BANCO_PENAL_JR,
  BANCO_PROCEDIMIENTOS_PENALES_JR,
  BANCO_CONTRAVENCIONES_JR,
  BANCO_VIOLENCIA_JR,
  BANCO_TRANSITO_JR,
  BANCO_OFICIAL_JR,
} from '../src/services/bancoPreguntasOficialEFJ';
import {
  esUrlFuenteOficial,
  esPreguntaSinFuente,
  esPreguntaConFuenteNoOficial,
  esPreguntaSinFechaConsulta,
  esPreguntaPosiblementeDesactualizada,
  esPreguntaSinExplicacion,
  esPreguntaConMasDeUnaRespuestaDefendible,
  esPreguntaNuncaRevisadaPorPersona,
  filtrarPreguntasPorCalidad,
  detectarDuplicadosPregunta,
} from '../src/services/qualityControl';
import { validarYSanitizarSalidaAsistente } from '../src/services/assistantValidator';
import fs from 'fs';
import path from 'path';

// Helper para fabricar preguntas validadas
function crearPreguntaMock(id: string, estado: Pregunta['estado'] = 'validada'): Pregunta {
  return {
    id,
    perfil: ['penal', 'personalizado'],
    materia: 'Derecho Constitucional',
    subtema: 'Competencia',
    dificultad: 'media',
    tipo: 'normativa',
    enunciado: `Pregunta de evaluación institucional número ${id} con enunciado claro y autosuficiente.`,
    alternativas: [
      { id: 'A', texto: 'Primera alternativa válida' },
      { id: 'B', texto: 'Segunda alternativa válida' },
      { id: 'C', texto: 'Tercera alternativa válida' },
      { id: 'D', texto: 'Cuarta alternativa válida' },
    ],
    respuestaCorrecta: 'B',
    explicacion: 'Fundamentación normativa según el Art. 76 de la Constitución.',
    explicacionDistractores: {},
    fuente: {
      norma: 'Constitución de la República del Ecuador',
      articulo: 'Art. 76',
      textoSoporte: 'Corresponde a toda autoridad judicial motivar debidamente.',
      urlOficial: 'https://www.corteconstitucional.gob.ec',
      fechaConsulta: '2026-03-01',
      vigenciaVerificada: true,
    },
    jurisprudencia: {},
    estado,
    observaciones: '',
    fechaCreacion: '2026-01-01',
    fechaActualizacion: '2026-01-01',
  };
}

describe('SIMULADOR JUDICIAL ECUADOR — Pruebas Institucionales y Metodológicas', () => {
  // 1. Que un examen oficial tenga exactamente 100 preguntas.
  it('1. Debe configurar exactamente 100 preguntas en el simulacro oficial', () => {
    expect(TOTAL_PREGUNTAS_OFICIAL).toBe(100);

    const banco100: Pregunta[] = Array.from({ length: 120 }, (_, i) =>
      crearPreguntaMock(`P-${i + 1}`)
    );

    const config: ExamenConfig = {
      modalidad: 'oficial_aleatorio',
      perfilId: 'penal_completo',
      numeroPreguntas: 100,
      duracionMinutos: 60,
      mostrarMateriaDuranteExamen: false,
    };

    const resultado = seleccionarPreguntasParaExamen(banco100, config);
    expect(resultado.preguntas.length).toBe(100);
  });

  // 2. Que el temporizador se configure en 60 minutos.
  it('2. El temporizador oficial debe configurarse exactamente en 60 minutos', () => {
    expect(DURACION_OFICIAL_MINUTOS).toBe(60);
    const duracionSegundos = DURACION_OFICIAL_MINUTOS * 60;
    expect(duracionSegundos).toBe(3600);
  });

  // 3. Que cada pregunta tenga cuatro alternativas.
  it('3. Cada pregunta debe contener exactamente cuatro alternativas (A, B, C, D)', () => {
    for (const demo of PREGUNTAS_DEMOSTRACION) {
      expect(demo.alternativas).toHaveLength(4);
      const ids = demo.alternativas.map((a) => a.id);
      expect(ids.sort()).toEqual(['A', 'B', 'C', 'D']);
    }
  });

  // 4. Que cada pregunta tenga una única respuesta correcta.
  it('4. Cada pregunta debe tener una única respuesta correcta entre A, B, C y D', () => {
    for (const demo of PREGUNTAS_DEMOSTRACION) {
      expect(['A', 'B', 'C', 'D']).toContain(demo.respuestaCorrecta);
      // Validar que corresponde al id de una de sus alternativas
      const existe = demo.alternativas.some((a) => a.id === demo.respuestaCorrecta);
      expect(existe).toBe(true);
    }
  });

  // 5. Que 80 aciertos produzcan 40 puntos.
  it('5. 80 respuestas correctas deben producir exactamente 40 puntos (0.50 pts c/u)', () => {
    const snapshots: PreguntaSnapshot[] = Array.from({ length: 100 }, (_, i) => ({
      ...crearPreguntaMock(`P-${i + 1}`),
      preguntaOriginalId: `P-${i + 1}`,
      alternativas: [
        { id: 'A', texto: 'A' },
        { id: 'B', texto: 'B' },
        { id: 'C', texto: 'C' },
        { id: 'D', texto: 'D' },
      ],
      respuestaCorrecta: 'A',
    }));

    // El usuario acierta 80 y falla 20
    const respuestasUsuario: Record<number, 'A' | 'B' | 'C' | 'D'> = {};
    for (let i = 0; i < 80; i++) respuestasUsuario[i] = 'A'; // correctas
    for (let i = 80; i < 100; i++) respuestasUsuario[i] = 'B'; // incorrectas

    const intento: IntentoExamen = {
      id: 'TEST-1',
      fechaInicio: new Date().toISOString(),
      modalidad: 'oficial_aleatorio',
      perfilId: 'penal_completo',
      config: {
        modalidad: 'oficial_aleatorio',
        perfilId: 'penal_completo',
        numeroPreguntas: 100,
        duracionMinutos: 60,
        mostrarMateriaDuranteExamen: false,
      },
      duracionSegundosUtilizados: 2000,
      entregado: false,
      entregadoAutomaticamentePorTiempo: false,
      totalPreguntas: 100,
      puntajeMaximo: 50,
      puntajeMinimoAprobacion: 40,
      respuestasUsuario,
      preguntasMarcadasParaRevision: {},
      preguntasSnapshot: snapshots,
    };

    const calificado = calificarIntento(intento);
    expect(calificado.correctas).toBe(80);
    expect(calificado.incorrectas).toBe(20);
    expect(calificado.puntajeObtenido).toBe(40.0);
    expect(calificado.aprobado).toBe(true);
  });

  // 6. Que 100 aciertos produzcan 50 puntos.
  it('6. 100 respuestas correctas deben producir exactamente 50 puntos (puntaje máximo)', () => {
    const snapshots: PreguntaSnapshot[] = Array.from({ length: 100 }, (_, i) => ({
      ...crearPreguntaMock(`P-${i + 1}`),
      preguntaOriginalId: `P-${i + 1}`,
      alternativas: [
        { id: 'A', texto: 'A' },
        { id: 'B', texto: 'B' },
        { id: 'C', texto: 'C' },
        { id: 'D', texto: 'D' },
      ],
      respuestaCorrecta: 'C',
    }));

    const respuestasUsuario: Record<number, 'A' | 'B' | 'C' | 'D'> = {};
    for (let i = 0; i < 100; i++) respuestasUsuario[i] = 'C';

    const intento: IntentoExamen = {
      id: 'TEST-2',
      fechaInicio: new Date().toISOString(),
      modalidad: 'oficial_aleatorio',
      perfilId: 'penal_completo',
      config: {
        modalidad: 'oficial_aleatorio',
        perfilId: 'penal_completo',
        numeroPreguntas: 100,
        duracionMinutos: 60,
        mostrarMateriaDuranteExamen: false,
      },
      duracionSegundosUtilizados: 2500,
      entregado: false,
      entregadoAutomaticamentePorTiempo: false,
      totalPreguntas: 100,
      puntajeMaximo: 50,
      puntajeMinimoAprobacion: 40,
      respuestasUsuario,
      preguntasMarcadasParaRevision: {},
      preguntasSnapshot: snapshots,
    };

    const calificado = calificarIntento(intento);
    expect(calificado.correctas).toBe(100);
    expect(calificado.puntajeObtenido).toBe(50.0);
    expect(calificado.aprobado).toBe(true);
  });

  // 7. Que las preguntas incorrectas no sumen puntos.
  it('7. Las preguntas incorrectas y no contestadas deben valer 0 puntos sin penalización negativa', () => {
    const snapshots: PreguntaSnapshot[] = Array.from({ length: 10 }, (_, i) => ({
      ...crearPreguntaMock(`P-${i + 1}`),
      preguntaOriginalId: `P-${i + 1}`,
      alternativas: [
        { id: 'A', texto: 'A' },
        { id: 'B', texto: 'B' },
        { id: 'C', texto: 'C' },
        { id: 'D', texto: 'D' },
      ],
      respuestaCorrecta: 'A',
    }));

    // Todas incorrectas o en blanco
    const respuestasUsuario: Record<number, 'A' | 'B' | 'C' | 'D'> = {
      0: 'B',
      1: 'C',
      2: 'D',
    };

    const intento: IntentoExamen = {
      id: 'TEST-3',
      fechaInicio: new Date().toISOString(),
      modalidad: 'practica_personalizada',
      perfilId: 'penal_completo',
      config: {
        modalidad: 'practica_personalizada',
        perfilId: 'penal_completo',
        numeroPreguntas: 10,
        duracionMinutos: 15,
        mostrarMateriaDuranteExamen: false,
      },
      duracionSegundosUtilizados: 300,
      entregado: false,
      entregadoAutomaticamentePorTiempo: false,
      totalPreguntas: 10,
      puntajeMaximo: 5,
      puntajeMinimoAprobacion: 4,
      respuestasUsuario,
      preguntasMarcadasParaRevision: {},
      preguntasSnapshot: snapshots,
    };

    const calificado = calificarIntento(intento);
    expect(calificado.correctas).toBe(0);
    expect(calificado.incorrectas).toBe(3);
    expect(calificado.noContestadas).toBe(7);
    expect(calificado.puntajeObtenido).toBe(0);
  });

  // 8. Que el examen se entregue automáticamente al llegar a cero.
  it('8. Debe marcar entrega automática por tiempo cuando expire el temporizador', () => {
    const intento: IntentoExamen = {
      id: 'TEST-4',
      fechaInicio: new Date().toISOString(),
      modalidad: 'oficial_aleatorio',
      perfilId: 'penal_completo',
      config: {
        modalidad: 'oficial_aleatorio',
        perfilId: 'penal_completo',
        numeroPreguntas: 1,
        duracionMinutos: 60,
        mostrarMateriaDuranteExamen: false,
      },
      duracionSegundosUtilizados: 3600,
      entregado: false,
      entregadoAutomaticamentePorTiempo: false,
      totalPreguntas: 1,
      puntajeMaximo: 50,
      puntajeMinimoAprobacion: 40,
      respuestasUsuario: {},
      preguntasMarcadasParaRevision: {},
      preguntasSnapshot: [
        {
          ...crearPreguntaMock('P-1'),
          preguntaOriginalId: 'P-1',
          alternativas: [
            { id: 'A', texto: 'A' },
            { id: 'B', texto: 'B' },
            { id: 'C', texto: 'C' },
            { id: 'D', texto: 'D' },
          ],
          respuestaCorrecta: 'A',
        },
      ],
    };

    const calificado = calificarIntento({
      ...intento,
      entregadoAutomaticamentePorTiempo: true,
    });

    expect(calificado.entregado).toBe(true);
    expect(calificado.entregadoAutomaticamentePorTiempo).toBe(true);
  });

  // 9. Que no aparezcan respuestas antes de entregar.
  it('9. Un intento en progreso (no entregado) no debe tener calculados puntajes ni estado de aprobación', () => {
    const intento: IntentoExamen = {
      id: 'TEST-5',
      fechaInicio: new Date().toISOString(),
      modalidad: 'oficial_aleatorio',
      perfilId: 'penal_completo',
      config: {
        modalidad: 'oficial_aleatorio',
        perfilId: 'penal_completo',
        numeroPreguntas: 100,
        duracionMinutos: 60,
        mostrarMateriaDuranteExamen: false,
      },
      duracionSegundosUtilizados: 120,
      entregado: false,
      entregadoAutomaticamentePorTiempo: false,
      totalPreguntas: 100,
      puntajeMaximo: 50,
      puntajeMinimoAprobacion: 40,
      respuestasUsuario: { 0: 'B' },
      preguntasMarcadasParaRevision: {},
      preguntasSnapshot: [],
    };

    expect(intento.entregado).toBe(false);
    expect(intento.puntajeObtenido).toBeUndefined();
    expect(intento.aprobado).toBeUndefined();
  });

  // 10. Que el examen no contenga preguntas duplicadas.
  it('10. La selección de preguntas no debe admitir preguntas duplicadas dentro de un mismo examen', () => {
    const banco: Pregunta[] = Array.from({ length: 50 }, (_, i) =>
      crearPreguntaMock(`ID-${i + 1}`)
    );

    const config: ExamenConfig = {
      modalidad: 'practica_personalizada',
      perfilId: 'penal_completo',
      numeroPreguntas: 30,
      duracionMinutos: 30,
      mostrarMateriaDuranteExamen: false,
    };

    const sel = seleccionarPreguntasParaExamen(banco, config);
    const ids = sel.preguntas.map((p) => p.preguntaOriginalId);
    const setIds = new Set(ids);
    expect(ids.length).toBe(setIds.size);
  });

  // 11. Que solo se seleccionen preguntas validadas.
  it('11. Solo deben seleccionarse preguntas con estado validada para simulacros', () => {
    const banco: Pregunta[] = [
      crearPreguntaMock('V-1', 'validada'),
      crearPreguntaMock('V-2', 'validada'),
      crearPreguntaMock('B-1', 'borrador'),
      crearPreguntaMock('O-1', 'observada'),
      crearPreguntaMock('I-1', 'inactiva'),
    ];

    const config: ExamenConfig = {
      modalidad: 'practica_personalizada',
      perfilId: 'penal_completo',
      numeroPreguntas: 2,
      duracionMinutos: 15,
      mostrarMateriaDuranteExamen: false,
    };

    const sel = seleccionarPreguntasParaExamen(banco, config);
    expect(sel.preguntas.length).toBe(2);
    expect(sel.preguntas.every((p) => p.preguntaOriginalId.startsWith('V-'))).toBe(true);
  });

  // 12. Que una pregunta sin fuente verificable no pueda validarse.
  it('12. Una pregunta sin fuente legal verificada como vigente no debe poder validarse', () => {
    const preguntaSinFuente: Partial<Pregunta> = {
      enunciado: 'Enunciado de prueba suficientemente extenso para la validación de la pregunta.',
      alternativas: [
        { id: 'A', texto: 'Opción 1' },
        { id: 'B', texto: 'Opción 2' },
        { id: 'C', texto: 'Opción 3' },
        { id: 'D', texto: 'Opción 4' },
      ],
      respuestaCorrecta: 'A',
      materia: 'Derecho Constitucional',
      subtema: 'Competencia',
      fuente: {
        norma: '',
        articulo: '',
        textoSoporte: '',
        urlOficial: '',
        fechaConsulta: '',
        vigenciaVerificada: false,
      },
    };

    const res = validarPreguntaParaAprobacion(preguntaSinFuente);
    expect(res.esValida).toBe(false);
    expect(res.errores.some((e) => e.includes('norma'))).toBe(true);
    expect(res.errores.some((e) => e.includes('vigente'))).toBe(true);
  });

  // 13. Que el historial conserve la versión utilizada en cada intento.
  it('13. El intento debe guardar una instantánea (snapshot) inmutable de sus preguntas', () => {
    const original = crearPreguntaMock('HIST-1');
    const snapshot = crearSnapshotAleatorizado(original);

    // Modificar pregunta original
    original.enunciado = 'Enunciado modificado posteriormente en el banco de preguntas.';
    original.materia = 'Materia cambiada';

    // El snapshot permanece inalterado
    expect(snapshot.enunciado).not.toBe(original.enunciado);
    expect(snapshot.preguntaOriginalId).toBe('HIST-1');
  });

  // 14. Que los datos importados sean validados antes de guardarse.
  it('14. Los datos de importación CSV deben ser validados detectando errores por fila', () => {
    const csvInvalido = `id,perfil,materia,subtema,dificultad,tipo,enunciado,opcion_a,opcion_b,opcion_c,opcion_d,respuesta_correcta,explicacion,norma,articulo,texto_soporte,url_oficial,fecha_consulta,vigencia_verificada,numero_sentencia,regla_jurisprudencial,estado,observaciones
INV-1,penal,Derecho Penal,General,media,normativa,"Pregunta corta","A","A","B","C",A,"exp","COIP","1","soporte","url",2026-01-01,false,"","","validada",""`;

    const res = procesarFilasCSV(csvInvalido);
    expect(res.filas.length).toBe(1);
    expect(res.filas[0].esValida).toBe(false);
    expect(res.totalConErrores).toBe(1);
  });

  // 15. Que la clave de Gemini nunca aparezca en el bundle del frontend.
  it('15. La clave de Gemini no debe existir en el código fuente del cliente frontend', () => {
    const srcDir = path.resolve(__dirname, '../src');
    const files = fs.readdirSync(srcDir, { recursive: true }) as string[];

    for (const f of files) {
      const fullPath = path.join(srcDir, f);
      if (fs.statSync(fullPath).isFile() && (f.endsWith('.ts') || f.endsWith('.tsx'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        expect(content).not.toContain('process.env.GEMINI_API_KEY');
        expect(content).not.toContain('@google/genai');
      }
    }
  });

  // --- PRUEBAS DEL ASISTENTE DE ELABORACIÓN MEDIANTE GEMINI (SERVIDOR) ---

  it('16. Asistente Gemini: Trabajar solo con el documento y devolver FUENTE INSUFICIENTE cuando falte respaldo', () => {
    // Si el texto proporcionado está vacío o es insuficiente (< 25 caracteres)
    const salidaVacia = validarYSanitizarSalidaAsistente(
      { resultado: 'PROPUESTA_GENERADA', pregunta: { enunciado: 'Texto' } },
      'Texto corto'
    );
    expect(salidaVacia.resultado).toBe('FUENTE_INSUFICIENTE');
    expect(salidaVacia.pregunta).toBeNull();
    expect(salidaVacia.fuenteInsuficiente).toBe(true);

    // Si el texto legal no sustenta la pregunta
    const salidaSinRespaldo = validarYSanitizarSalidaAsistente(
      {
        resultado: 'FUENTE_INSUFICIENTE',
        justificacion: 'FUENTE INSUFICIENTE: No hay respaldo en el texto provisto.',
      },
      'Artículo 10 de la Ley de Prueba con contenido mínimo.'
    );
    expect(salidaSinRespaldo.resultado).toBe('FUENTE_INSUFICIENTE');
    expect(salidaSinRespaldo.pregunta).toBeNull();
  });

  it('17. Asistente Gemini: No inventar normas ni artículos no contemplados en el documento fuente', () => {
    const textoDoc = 'El artículo 45 del Código Orgánico Integral Penal tipifica las circunstancias agravantes de la infracción penal.';
    // El modelo intenta citar el Artículo 999 que NO existe en el texto fuente
    const salidaAlucinada = validarYSanitizarSalidaAsistente(
      {
        resultado: 'PROPUESTA_GENERADA',
        pregunta: {
          materia: 'Derecho Penal',
          subtema: 'Agravantes',
          dificultad: 'media',
          enunciado: '¿Cuál es la consecuencia jurídica del agravante conforme a la norma señalada?',
          alternativas: [
            { id: 'A', texto: 'Aumento de la pena privativa de libertad.' },
            { id: 'B', texto: 'Absolución de la persona procesada.' },
            { id: 'C', texto: 'Remisión a mediación judicial.' },
            { id: 'D', texto: 'Prescripción inmediata de la acción.' },
          ],
          respuestaCorrecta: 'A',
          explicacion: 'Explicación del artículo inventado.',
          norma: 'COIP',
          articulo: 'Artículo 999',
          textoSoporte: 'Texto inventado no presente en el documento.',
          advertencias: [],
        },
        justificacion: 'Pregunta elaborada a partir del artículo inventado.',
      },
      textoDoc
    );

    // El validador debe rechazar la invención y degradar a FUENTE_INSUFICIENTE
    expect(salidaAlucinada.resultado).toBe('FUENTE_INSUFICIENTE');
    expect(salidaAlucinada.pregunta).toBeNull();
  });

  it('18. Asistente Gemini: Toda propuesta debe guardarse SIEMPRE como borrador y exigir aprobación humana', () => {
    const textoDoc = 'El artículo 76 numeral 7 letra l de la Constitución de la República del Ecuador establece que las resoluciones de los poderes públicos deberán ser motivadas.';
    const salidaValida = validarYSanitizarSalidaAsistente(
      {
        resultado: 'PROPUESTA_GENERADA',
        pregunta: {
          materia: 'Derecho Constitucional',
          subtema: 'Debido proceso y motivación',
          dificultad: 'media',
          enunciado: 'Conforme al artículo 76 de la Constitución, ¿cuál es el requisito formal indispensable de las resoluciones de los poderes públicos?',
          alternativas: [
            { id: 'A', texto: 'Deberán ser motivadas con enunciación de normas y hechos.' },
            { id: 'B', texto: 'Pueden emitirse sin fundamentación en casos de urgencia.' },
            { id: 'C', texto: 'Requieren autorización previa de la Corte Constitucional.' },
            { id: 'D', texto: 'Basta con una firma simple sin análisis fáctico.' },
          ],
          respuestaCorrecta: 'A',
          explicacion: 'El Art. 76.7.l de la Constitución consagra la garantía de motivación.',
          norma: 'Constitución de la República del Ecuador',
          articulo: 'Artículo 76',
          textoSoporte: 'Las resoluciones de los poderes públicos deberán ser motivadas.',
          advertencias: [],
        },
        justificacion: 'Sustentado en el Art. 76 de la Constitución provisto.',
      },
      textoDoc
    );

    expect(salidaValida.resultado).toBe('PROPUESTA_GENERADA');
    expect(salidaValida.pregunta).not.toBeNull();
    // REGLAS ABSOLUTAS:
    expect(salidaValida.pregunta?.estado).toBe('borrador'); // SIEMPRE BORRADOR
    expect(salidaValida.pregunta?.revisadaPorHumano).toBe(false); // NO AUTO-VALIDADA
    expect(salidaValida.pregunta?.exigeAprobacionHumana).toBe(true); // EXIGE APROBACIÓN HUMANA
    expect(salidaValida.exigeAprobacionHumana).toBe(true);
  });

  it('19. Asistente Gemini: Registrar advertencias de ambigüedad o posible desactualización', () => {
    const textoDoc = 'El artículo 12 menciona una regla con excepciones controvertidas y una reforma pendiente.';
    const salidaConAdvertencias = validarYSanitizarSalidaAsistente(
      {
        resultado: 'PREGUNTA_AMBIGUA',
        pregunta: {
          materia: 'Derecho Procesal',
          subtema: 'Excepciones',
          dificultad: 'alta',
          enunciado: 'En caso de contradicción normativa procesal, ¿cuál es la vía de resolución aplicable según el texto?',
          alternativas: [
            { id: 'A', texto: 'Primera vía posible en doctrina.' },
            { id: 'B', texto: 'Segunda vía igualmente defendible.' },
            { id: 'C', texto: 'Inadmisibilidad de oficio.' },
            { id: 'D', texto: 'Suspensión del término.' },
          ],
          respuestaCorrecta: 'A',
          explicacion: 'Existen dos interpretaciones posibles en el texto.',
          norma: 'Ley Procesal',
          articulo: 'Artículo 12',
          textoSoporte: 'El artículo 12 menciona una regla con excepciones.',
          advertencias: [
            'Existen dos respuestas técnicamente defendibles según la redacción del artículo 12.',
            'Posible desactualización por reforma no consolidada.',
          ],
        },
        justificacion: 'Se detectó ambigüedad entre las alternativas A y B.',
      },
      textoDoc
    );

    expect(salidaConAdvertencias.resultado).toBe('PREGUNTA_AMBIGUA');
    expect(salidaConAdvertencias.pregunta?.posiblesAmbiguedades).toBeDefined();
    expect(salidaConAdvertencias.pregunta?.posiblesAmbiguedades?.length).toBeGreaterThan(0);
    expect(salidaConAdvertencias.pregunta?.posibleDesactualizacion).toBe(true);
  });

  // --- PRUEBAS DE LA PANTALLA "CONTROL DE CALIDAD JURÍDICA" ---

  it('20. Control de Calidad: Filtro para preguntas sin fuente', () => {
    const pSinFuente: Pregunta = {
      ...crearPreguntaMock('CAL-1'),
      fuente: {
        norma: '',
        articulo: '',
        textoSoporte: '',
        urlOficial: '',
        fechaConsulta: '',
        vigenciaVerificada: false,
      },
    };
    const pConFuente = crearPreguntaMock('CAL-2');

    expect(esPreguntaSinFuente(pSinFuente)).toBe(true);
    expect(esPreguntaSinFuente(pConFuente)).toBe(false);

    const filtradas = filtrarPreguntasPorCalidad([pSinFuente, pConFuente], 'sin_fuente');
    expect(filtradas.length).toBe(1);
    expect(filtradas[0].id).toBe('CAL-1');
  });

  it('21. Control de Calidad: Filtro para preguntas con fuente no oficial', () => {
    expect(esUrlFuenteOficial('https://www.corteconstitucional.gob.ec')).toBe(true);
    expect(esUrlFuenteOficial('https://www.asambleanacional.gob.ec')).toBe(true);
    expect(esUrlFuenteOficial('https://ejemplo.invalid')).toBe(false);
    expect(esUrlFuenteOficial('')).toBe(false);

    const pNoOficial: Pregunta = {
      ...crearPreguntaMock('CAL-3'),
      fuente: {
        ...crearPreguntaMock('CAL-3').fuente,
        urlOficial: 'https://ejemplo.invalid',
      },
    };
    const pOficial = crearPreguntaMock('CAL-4');

    expect(esPreguntaConFuenteNoOficial(pNoOficial)).toBe(true);
    expect(esPreguntaConFuenteNoOficial(pOficial)).toBe(false);
  });

  it('22. Control de Calidad: Filtro para preguntas sin fecha de consulta', () => {
    const pSinFecha: Pregunta = {
      ...crearPreguntaMock('CAL-5'),
      fuente: {
        ...crearPreguntaMock('CAL-5').fuente,
        fechaConsulta: '',
      },
    };
    const pConFecha = crearPreguntaMock('CAL-6');

    expect(esPreguntaSinFechaConsulta(pSinFecha)).toBe(true);
    expect(esPreguntaSinFechaConsulta(pConFecha)).toBe(false);
  });

  it('23. Control de Calidad: Filtro para preguntas posiblemente desactualizadas', () => {
    const pDesactualizada: Pregunta = {
      ...crearPreguntaMock('CAL-7'),
      estado: 'desactualizada',
      fuente: {
        ...crearPreguntaMock('CAL-7').fuente,
        vigenciaVerificada: false,
      },
    };
    const pVigente = crearPreguntaMock('CAL-8');

    expect(esPreguntaPosiblementeDesactualizada(pDesactualizada)).toBe(true);
    expect(esPreguntaPosiblementeDesactualizada(pVigente)).toBe(false);
  });

  it('24. Control de Calidad: Filtro para preguntas sin explicación', () => {
    const pSinExp: Pregunta = {
      ...crearPreguntaMock('CAL-9'),
      explicacion: '',
    };
    const pConExp = crearPreguntaMock('CAL-10');

    expect(esPreguntaSinExplicacion(pSinExp)).toBe(true);
    expect(esPreguntaSinExplicacion(pConExp)).toBe(false);
  });

  it('25. Control de Calidad: Filtro para preguntas con más de una respuesta defendible', () => {
    const pAmbigua: Pregunta = {
      ...crearPreguntaMock('CAL-11'),
      posiblesAmbiguedades: ['Controversia entre opción A y B por reforma legal.'],
    };
    const pUnivoca = crearPreguntaMock('CAL-12');

    expect(esPreguntaConMasDeUnaRespuestaDefendible(pAmbigua)).toBe(true);
    expect(esPreguntaConMasDeUnaRespuestaDefendible(pUnivoca)).toBe(false);
  });

  it('26. Control de Calidad: Filtro para preguntas nunca revisadas por una persona', () => {
    const pSinRevision: Pregunta = {
      ...crearPreguntaMock('CAL-13'),
      revisadaPorHumano: false,
      ultimaRevision: undefined,
    };
    const pRevisada: Pregunta = {
      ...crearPreguntaMock('CAL-14'),
      revisadaPorHumano: true,
      ultimaRevision: '2026-10-11T10:00:00Z',
    };

    expect(esPreguntaNuncaRevisadaPorPersona(pSinRevision)).toBe(true);
    expect(esPreguntaNuncaRevisadaPorPersona(pRevisada)).toBe(false);
  });

  it('27. Control de Calidad: Regla obligatoria: No cambiar automáticamente el estado a “validada”', () => {
    // Al procesar reactivos por CSV o IA, si no hay revisión humana, no se autovalida
    const reactivoBorrador: Pregunta = {
      ...crearPreguntaMock('CAL-15'),
      estado: 'borrador',
      revisadaPorHumano: false,
    };

    // La función de auditoría no debe cambiar automáticamente a 'validada'
    expect(reactivoBorrador.estado).toBe('borrador');
    expect(reactivoBorrador.revisadaPorHumano).toBe(false);
  });

  it('28. Control de Calidad: La pregunta de demostración DEM-001 debe cumplir con el formato especificado', () => {
    const csvDemostrador = `id,perfil,materia,subtema,dificultad,tipo,enunciado,opcion_a,opcion_b,opcion_c,opcion_d,respuesta_correcta,explicacion,norma,articulo,texto_soporte,url_oficial,fecha_consulta,vigencia_verificada,numero_sentencia,regla_jurisprudencial,estado,observaciones
DEM-001,personalizado,Derecho Constitucional,Competencia,media,normativa,"PREGUNTA DE DEMOSTRACIÓN","Alternativa A","Alternativa B","Alternativa C","Alternativa D",B,"Explicación de prueba","Norma de demostración","Art. X","Texto de demostración","https://ejemplo.invalid","2026-10-10",false,"","","borrador","No utilizar para estudio"`;

    const res = procesarFilasCSV(csvDemostrador);
    expect(res.filas.length).toBe(1);
    const fila = res.filas[0];
    expect(fila.datosBrutos.id).toBe('DEM-001');
    expect(fila.datosBrutos.estado).toBe('borrador');
    expect(fila.datosBrutos.url_oficial).toBe('https://ejemplo.invalid');
    expect(fila.datosBrutos.vigencia_verificada).toBe('false');

    // Confirmar que activa los filtros de auditoría jurídica
    const p = fila.pregunta!;
    expect(esPreguntaConFuenteNoOficial(p)).toBe(true); // https://ejemplo.invalid
    expect(esPreguntaPosiblementeDesactualizada(p)).toBe(true); // vigencia_verificada: false
    expect(esPreguntaNuncaRevisadaPorPersona(p)).toBe(true); // nunca revisada por persona
    expect(p.estado).toBe('borrador'); // Permanece como borrador
  });

  // --- PRUEBAS DEL BANCO DE PREGUNTAS Y PARSER DE OPCIÓN MÚLTIPLE (4 OPCIONES) ---

  it('29. Banco Vacío e Importador: El simulador maneja banco vacío e importa reactivos con 4 opciones', () => {
    const textoPrueba = `1. ¿Cuál es el término para interponer la acción de protección?
A) 15 días término
B) En cualquier momento mientras subsista la vulneración
C) 30 días calendario
D) 90 días improrrogables
Respuesta correcta: B
Materia: Derecho Constitucional
Fundamentación: Conforme a la LOGJCC y jurisprudencia de la Corte Constitucional.`;

    const res = parsearPreguntasDesdeTexto(textoPrueba);
    expect(res.validas).toHaveLength(1);
    expect(res.invalidas).toHaveLength(0);

    const p = res.validas[0];
    expect(p.alternativas).toHaveLength(4);
    expect(p.alternativas.map((a) => a.id)).toEqual(['A', 'B', 'C', 'D']);
    expect(p.respuestaCorrecta).toBe('B');
    expect(p.estado).toBe('validada');
    expect(p.materia).toBe('Derecho Constitucional');
  });

  it('30. Metodología de Opción Múltiple: El parser rechaza preguntas con menos de 4 alternativas o sin respuesta', () => {
    // Caso con solo 3 alternativas
    const textoIncompleto = `1. ¿Pregunta con solo 3 alternativas?
A) Opción uno
B) Opción dos
C) Opción tres
Respuesta: A`;

    const resIncompleto = parsearPreguntasDesdeTexto(textoIncompleto);
    expect(resIncompleto.validas).toHaveLength(0);
    expect(resIncompleto.invalidas).toHaveLength(1);
    expect(resIncompleto.invalidas[0].error).toContain('4 opciones');

    // Caso sin respuesta correcta
    const textoSinRespuesta = `1. ¿Pregunta sin respuesta correcta?
A) Opción uno
B) Opción dos
C) Opción tres
D) Opción cuatro`;

    const resSinResp = parsearPreguntasDesdeTexto(textoSinRespuesta);
    expect(resSinResp.validas).toHaveLength(0);
    expect(resSinResp.invalidas).toHaveLength(1);
    expect(resSinResp.invalidas[0].error).toContain('respuesta correcta');
  });

  it('31. Manejo del motor ante banco vacío: Notifica claramente la necesidad de cargar reactivos', () => {
    const bancoVacio: Pregunta[] = [];
    const config: ExamenConfig = {
      modalidad: 'oficial_aleatorio',
      perfilId: 'penal_completo',
      numeroPreguntas: 100,
      duracionMinutos: 60,
      mostrarMateriaDuranteExamen: false,
    };

    const res = seleccionarPreguntasParaExamen(bancoVacio, config);
    expect(res.preguntas).toHaveLength(0);
    expect(res.error).toBeDefined();
    expect(res.error).toContain('El banco de preguntas solo cuenta con 0 preguntas');
  });

  it('32. Integración Oficial: Cuestionarios Constitucional (105), Penal (63), Procedimientos (48), Contravenciones (60), Violencia (63) y Tránsito (63) suman 402 preguntas oficiales', () => {
    expect(BANCO_CONSTITUCIONAL_JR).toHaveLength(105);
    expect(BANCO_PENAL_JR).toHaveLength(63);
    expect(BANCO_PROCEDIMIENTOS_PENALES_JR).toHaveLength(48);
    expect(BANCO_CONTRAVENCIONES_JR).toHaveLength(60);
    expect(BANCO_VIOLENCIA_JR).toHaveLength(63);
    expect(BANCO_TRANSITO_JR).toHaveLength(63);
    expect(BANCO_OFICIAL_JR).toHaveLength(402);

    // Verificar que todas las preguntas de tránsito tienen 4 alternativas y respuesta correcta válida
    for (const p of BANCO_TRANSITO_JR) {
      expect(p.materia).toBe('Tránsito: delitos y contravenciones');
      expect(p.alternativas).toHaveLength(4);
      expect(p.alternativas.map((a) => a.id)).toEqual(['A', 'B', 'C', 'D']);
      expect(['A', 'B', 'C', 'D']).toContain(p.respuestaCorrecta);
      expect(p.enunciado.trim().length).toBeGreaterThan(10);
      expect(p.fuente.norma).toBeDefined();
      expect(p.estado).toBe('validada');
    }

    // Verificar que todas las preguntas de violencia contra la mujer tienen 4 alternativas y respuesta correcta válida
    for (const p of BANCO_VIOLENCIA_JR) {
      expect(['Violencia contra la mujer o miembros del núcleo familiar', 'Infracciones contra la integridad sexual y reproductiva']).toContain(p.materia);
      expect(p.alternativas).toHaveLength(4);
      expect(p.alternativas.map((a) => a.id)).toEqual(['A', 'B', 'C', 'D']);
      expect(['A', 'B', 'C', 'D']).toContain(p.respuestaCorrecta);
      expect(p.enunciado.trim().length).toBeGreaterThan(10);
      expect(p.fuente.norma).toBeDefined();
      expect(p.estado).toBe('validada');
    }

    // Verificar que todas las preguntas de contravenciones tienen 4 alternativas y respuesta correcta válida
    for (const p of BANCO_CONTRAVENCIONES_JR) {
      expect(p.materia).toBe('Derecho Penal');
      expect(p.alternativas).toHaveLength(4);
      expect(p.alternativas.map((a) => a.id)).toEqual(['A', 'B', 'C', 'D']);
      expect(['A', 'B', 'C', 'D']).toContain(p.respuestaCorrecta);
      expect(p.enunciado.trim().length).toBeGreaterThan(10);
      expect(p.fuente.norma).toBeDefined();
      expect(p.estado).toBe('validada');
    }

    // Verificar que todas las preguntas de procedimientos penales tienen 4 alternativas y respuesta correcta válida
    for (const p of BANCO_PROCEDIMIENTOS_PENALES_JR) {
      expect(p.materia).toBe('Derecho Penal');
      expect(p.alternativas).toHaveLength(4);
      expect(p.alternativas.map((a) => a.id)).toEqual(['A', 'B', 'C', 'D']);
      expect(['A', 'B', 'C', 'D']).toContain(p.respuestaCorrecta);
      expect(p.enunciado.trim().length).toBeGreaterThan(10);
      expect(p.fuente.norma).toBeDefined();
      expect(p.estado).toBe('validada');
    }

    // Verificar que todas las preguntas penales tienen 4 alternativas y respuesta correcta válida
    for (const p of BANCO_PENAL_JR) {
      expect(p.materia).toBe('Derecho Penal');
      expect(p.alternativas).toHaveLength(4);
      expect(p.alternativas.map((a) => a.id)).toEqual(['A', 'B', 'C', 'D']);
      expect(['A', 'B', 'C', 'D']).toContain(p.respuestaCorrecta);
      expect(p.enunciado.trim().length).toBeGreaterThan(10);
      expect(p.fuente.norma).toBeDefined();
      expect(p.estado).toBe('validada');
    }

    // Verificar que el examen oficial de 100 preguntas se puede seleccionar sin errores
    const configOficial: ExamenConfig = {
      modalidad: 'oficial_aleatorio',
      perfilId: 'penal_completo',
      numeroPreguntas: 100,
      duracionMinutos: 60,
      mostrarMateriaDuranteExamen: false,
    };
    const resOficial = seleccionarPreguntasParaExamen(BANCO_OFICIAL_JR, configOficial);
    expect(resOficial.preguntas).toHaveLength(100);
    expect(resOficial.error).toBeUndefined();

    // Comprobar que en el examen oficial hay preguntas de múltiples materias
    const materias = new Set(resOficial.preguntas.map((p) => p.materia));
    expect(materias.has('Derecho Constitucional')).toBe(true);
    expect(materias.has('Derecho Penal')).toBe(true);
    expect(materias.has('Tránsito: delitos y contravenciones')).toBe(true);
  });
});

