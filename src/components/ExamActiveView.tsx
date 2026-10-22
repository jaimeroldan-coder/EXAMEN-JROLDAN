import React, { useEffect, useState, useCallback } from 'react';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle,
  HelpCircle,
  LayoutGrid,
} from 'lucide-react';
import { useSimulator } from '../context/SimulatorContext';
import { AlternativaId } from '../types';

interface ExamActiveViewProps {
  onFinalizado: () => void;
}

export const ExamActiveView: React.FC<ExamActiveViewProps> = ({ onFinalizado }) => {
  const {
    intentoActivo,
    registrarRespuesta,
    alternarMarcaRevision,
    entregarExamenDefinitivo,
    registrarInterrupcion,
  } = useSimulator();

  const [indiceActual, setIndiceActual] = useState(0);
  const [segundosRestantes, setSegundosRestantes] = useState<number>(() => {
    if (!intentoActivo) return 3600;
    const duracionTotalSegundos = (intentoActivo.config?.duracionMinutos || 60) * 60;
    const inicio = new Date(intentoActivo.fechaInicio).getTime();
    const ahora = Date.now();
    const transcurridoSegundos = Math.floor((ahora - inicio) / 1000);
    const restante = duracionTotalSegundos - transcurridoSegundos;
    return Math.max(0, restante);
  });
  const [mostrarMateria, setMostrarMateria] = useState(
    intentoActivo?.config?.mostrarMateriaDuranteExamen || false
  );
  const [modalConfirmarEntrega, setModalConfirmarEntrega] = useState(false);
  const [mostrarCuadriculaMovil, setMostrarCuadriculaMovil] = useState(false);
  const [tamanoTexto, setTamanoTexto] = useState<'normal' | 'grande' | 'extragrande'>('normal');
  const [mostrarFichaEFJ, setMostrarFichaEFJ] = useState(false);
  const [mostrarRetroalimentacionPractica, setMostrarRetroalimentacionPractica] = useState(false);

  // Escuchar interrupciones o salidas de pantalla (informativo)
  useEffect(() => {
    const handleVisChange = () => {
      if (document.hidden) {
        registrarInterrupcion();
      }
    };
    document.addEventListener('visibilitychange', handleVisChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisChange);
    };
  }, [registrarInterrupcion]);

  // Manejo de temporizador
  useEffect(() => {
    if (!intentoActivo || intentoActivo.entregado) return;

    const timer = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Autoentrega al expirar el tiempo
          entregarExamenDefinitivo(true).then(() => {
            onFinalizado();
          });
          return 0;
        }
        return prev - 1;
      });
    } , 1000);

    return () => clearInterval(timer);
  }, [intentoActivo, entregarExamenDefinitivo, onFinalizado]);

  // Formato mm:ss
  const formatTiempo = (totalSegundos: number) => {
    const mins = Math.floor(totalSegundos / 60);
    const secs = totalSegundos % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalPreguntas = intentoActivo?.preguntasSnapshot.length || 0;
  const preguntaActual = intentoActivo?.preguntasSnapshot[indiceActual];

  // Atajos de teclado
  const manejarTeclado = useCallback(
    (e: KeyboardEvent) => {
      if (modalConfirmarEntrega) return;
      const key = e.key.toUpperCase();

      if (['A', '1'].includes(key)) {
        e.preventDefault();
        registrarRespuesta(indiceActual, 'A');
      } else if (['B', '2'].includes(key)) {
        e.preventDefault();
        registrarRespuesta(indiceActual, 'B');
      } else if (['C', '3'].includes(key)) {
        e.preventDefault();
        registrarRespuesta(indiceActual, 'C');
      } else if (['D', '4'].includes(key)) {
        e.preventDefault();
        registrarRespuesta(indiceActual, 'D');
      } else if (['ARROWLEFT', 'K'].includes(key)) {
        e.preventDefault();
        if (indiceActual > 0) setIndiceActual((prev) => prev - 1);
      } else if (['ARROWRIGHT', 'J'].includes(key)) {
        e.preventDefault();
        if (indiceActual < totalPreguntas - 1) setIndiceActual((prev) => prev + 1);
      } else if (key === 'M') {
        e.preventDefault();
        alternarMarcaRevision(indiceActual);
      }
    },
    [indiceActual, totalPreguntas, modalConfirmarEntrega, registrarRespuesta, alternarMarcaRevision]
  );

  useEffect(() => {
    window.addEventListener('keydown', manejarTeclado);
    return () => window.removeEventListener('keydown', manejarTeclado);
  }, [manejarTeclado]);

  if (!intentoActivo || !preguntaActual) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <p className="text-slate-500">Cargando reactivos del examen...</p>
      </div>
    );
  }

  const respuestaSeleccionada = intentoActivo.respuestasUsuario[indiceActual] || null;
  const estaMarcada = Boolean(intentoActivo.preguntasMarcadasParaRevision[indiceActual]);

  // Conteo de respuestas para la entrega
  let contestadasCount = 0;
  let marcadasCount = 0;
  for (let i = 0; i < totalPreguntas; i++) {
    if (intentoActivo.respuestasUsuario[i]) contestadasCount++;
    if (intentoActivo.preguntasMarcadasParaRevision[i]) marcadasCount++;
  }
  const sinContestarCount = totalPreguntas - contestadasCount;

  const handleConfirmarEntregaDefinitiva = async () => {
    await entregarExamenDefinitivo(false);
    setModalConfirmarEntrega(false);
    onFinalizado();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-[#F8F9FA] dark:bg-[#0B1320]">
      {/* Barra Superior Fija del Examen */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
              Pregunta {indiceActual + 1} de {totalPreguntas}
            </span>
            <span className="hidden sm:inline-block text-xs text-slate-400">|</span>
            <button
              onClick={() => setMostrarMateria(!mostrarMateria)}
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              title="Alternar visualización de la materia en examen"
            >
              {mostrarMateria ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{mostrarMateria ? 'Ocultar Materia' : 'Mostrar Materia'}</span>
            </button>
          </div>

          {/* Temporizador Regresivo Prominente */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono font-bold text-sm sm:text-base transition-colors ${
                segundosRestantes < 300
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 animate-pulse border border-rose-300 dark:border-rose-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>{formatTiempo(segundosRestantes)}</span>
            </div>

            <button
              onClick={() => setMostrarCuadriculaMovil(!mostrarCuadriculaMovil)}
              className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              title="Ver cuadrícula de navegación"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            <button
              onClick={() => setModalConfirmarEntrega(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow transition-colors min-h-[40px]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Entregar Examen</span>
            </button>
          </div>
        </div>

        {/* Barra de Progreso Lineal */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1">
          <div
            className="bg-teal-600 h-1 transition-all duration-300"
            style={{ width: `${((indiceActual + 1) / totalPreguntas) * 100}%` }}
          />
        </div>
      </div>

      {/* Contenedor Principal: Pregunta + Cuadrícula Lateral */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col lg:flex-row gap-6">
        {/* Columna Izquierda / Centro: Área de la Pregunta */}
        <div className="flex-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Cabecera Institucional del Reactivo EFJ */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold font-mono border border-teal-200/50 dark:border-teal-800/50">
                  Reactivo #{indiceActual + 1} de {totalPreguntas}
                </span>

                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-mono">
                  {preguntaActual.preguntaOriginalId}
                </span>

                {mostrarMateria && (
                  <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                    {preguntaActual.materia}
                  </span>
                )}

                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/40 dark:border-amber-900/40 capitalize">
                  {preguntaActual.dificultad}
                </span>

                {preguntaActual.tipo && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200/40 dark:border-blue-900/40">
                    {preguntaActual.tipo.replace('_', ' ')}
                  </span>
                )}

                {preguntaActual.esDemostracion && (
                  <span className="px-2.5 py-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                    PREGUNTA DE DEMOSTRACIÓN — NO USAR PARA ESTUDIO
                  </span>
                )}
              </div>

              {/* Controles de Accesibilidad & Ficha Técnica */}
              <div className="flex items-center gap-2">
                {/* Selector de Tamaño Tipográfico */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs text-slate-600 dark:text-slate-400">
                  <button
                    type="button"
                    onClick={() => setTamanoTexto('normal')}
                    className={`px-2 py-1 rounded transition-colors ${
                      tamanoTexto === 'normal'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                        : 'hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Tamaño de texto estándar"
                  >
                    A
                  </button>
                  <button
                    type="button"
                    onClick={() => setTamanoTexto('grande')}
                    className={`px-2 py-1 rounded transition-colors ${
                      tamanoTexto === 'grande'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                        : 'hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Tamaño de texto grande"
                  >
                    A+
                  </button>
                  <button
                    type="button"
                    onClick={() => setTamanoTexto('extragrande')}
                    className={`px-2 py-1 rounded transition-colors ${
                      tamanoTexto === 'extragrande'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                        : 'hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Tamaño de texto extragrande"
                  >
                    A++
                  </button>
                </div>

                {/* Botón Ficha EFJ */}
                <button
                  type="button"
                  onClick={() => setMostrarFichaEFJ(!mostrarFichaEFJ)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    mostrarFichaEFJ
                      ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Ver estructura y taxonomía oficial del reactivo según la EFJ"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Estructura EFJ</span>
                </button>

                {/* Botón Marcar para Revisión */}
                <button
                  type="button"
                  onClick={() => alternarMarcaRevision(indiceActual)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-h-[36px] ${
                    estaMarcada
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'
                  }`}
                  title="Marcar pregunta para revisar antes de entregar (Atajo: M)"
                >
                  <Flag className={`w-3.5 h-3.5 ${estaMarcada ? 'fill-current' : ''}`} />
                  <span>{estaMarcada ? 'Marcada' : 'Marcar (M)'}</span>
                </button>
              </div>
            </div>

            {/* Ficha Metodológica EFJ Expandible */}
            {mostrarFichaEFJ && (
              <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60 text-xs space-y-2 animate-fade-in">
                <div className="flex items-center justify-between font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wider text-[11px]">
                  <span>Ficha Técnica Oficial del Reactivo — Escuela de la Función Judicial</span>
                  <span className="font-mono">{preguntaActual.preguntaOriginalId}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700 dark:text-slate-300">
                  <div>
                    <strong>Eje Temático:</strong> {preguntaActual.subtema}
                  </div>
                  <div>
                    <strong>Marco Jurídico:</strong> {preguntaActual.fuente?.norma}
                  </div>
                  <div>
                    <strong>Artículo Relacionado:</strong> {preguntaActual.fuente?.articulo}
                  </div>
                </div>
                <p className="text-[11px] text-teal-800 dark:text-teal-400 italic">
                  * Diseñado conforme a la pauta de 4 alternativas con distractores plausibles del Consejo de la Judicatura del Ecuador.
                </p>
              </div>
            )}

            {/* Subtema del Reactivo */}
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Eje Temático: {preguntaActual.subtema}
            </div>

            {/* Enunciado de la Pregunta con Tipografía Editorial Ajustable */}
            <div
              className={`font-serif text-slate-900 dark:text-slate-100 leading-relaxed font-medium ${
                tamanoTexto === 'grande'
                  ? 'text-lg sm:text-xl'
                  : tamanoTexto === 'extragrande'
                  ? 'text-xl sm:text-2xl'
                  : 'text-base sm:text-lg'
              }`}
            >
              {preguntaActual.enunciado}
            </div>

            {/* Lista de Alternativas (A, B, C, D) con Atajos Explícitos */}
            <div className="space-y-3 pt-2" role="radiogroup" aria-label="Opciones de respuesta">
              {preguntaActual.alternativas.map((alt) => {
                const seleccionada = respuestaSeleccionada === alt.id;
                return (
                  <button
                    key={alt.id}
                    type="button"
                    role="radio"
                    aria-checked={seleccionada}
                    onClick={() => registrarRespuesta(indiceActual, alt.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 min-h-[56px] group focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      seleccionada
                        ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/40 text-teal-950 dark:text-teal-100 ring-1 ring-teal-500 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex flex-col items-center shrink-0">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-xs ${
                          seleccionada
                            ? 'bg-teal-700 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 group-hover:bg-teal-100 dark:group-hover:bg-slate-600'
                        }`}
                      >
                        {alt.id}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                        [{alt.id}]
                      </span>
                    </div>

                    <div className="flex-1 pt-1">
                      <span
                        className={`leading-relaxed ${
                          tamanoTexto === 'grande'
                            ? 'text-base sm:text-lg'
                            : tamanoTexto === 'extragrande'
                            ? 'text-lg sm:text-xl'
                            : 'text-sm sm:text-base'
                        }`}
                      >
                        {alt.texto}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Barra de Navegación Inferior */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              onClick={() => {
                if (indiceActual > 0) setIndiceActual((prev) => prev - 1);
              }}
              disabled={indiceActual === 0}
              className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[48px]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <span className="text-xs text-slate-400 hidden sm:inline">
              Atajos: 1-4 / A-D (Opciones) • &larr; &rarr; (Navegar) • M (Marcar)
            </span>

            {indiceActual < totalPreguntas - 1 ? (
              <button
                onClick={() => setIndiceActual((prev) => prev + 1)}
                className="px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold flex items-center gap-1.5 shadow transition-all min-h-[48px]"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setModalConfirmarEntrega(true)}
                className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold flex items-center gap-1.5 shadow transition-all min-h-[48px]"
              >
                <span>Finalizar y Entregar</span>
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Columna Derecha: Cuadrícula de Navegación 1 a 100 */}
        <aside
          className={`lg:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 shrink-0 ${
            mostrarCuadriculaMovil ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
              Navegación del Examen
            </h3>
            <span className="text-xs font-mono text-slate-500">
              {contestadasCount} / {totalPreguntas} contestadas
            </span>
          </div>

          {/* Leyenda Visual */}
          <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-600 dark:text-slate-400 py-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-teal-600 inline-block" />
              <span>Contestada</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
              <span>Marcada</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-700 inline-block" />
              <span>Pendiente</span>
            </div>
          </div>

          {/* Cuadrícula de Botones 1..N */}
          <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-1.5 max-h-[460px] overflow-y-auto pr-1">
            {intentoActivo.preguntasSnapshot.map((_, idx) => {
              const contestada = Boolean(intentoActivo.respuestasUsuario[idx]);
              const marcada = Boolean(intentoActivo.preguntasMarcadasParaRevision[idx]);
              const esActual = idx === indiceActual;

              let estilo = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
              if (contestada) {
                estilo = 'bg-teal-700 text-white font-medium';
              }
              if (marcada) {
                estilo = 'bg-amber-500 text-white font-bold ring-1 ring-amber-300';
              }
              if (esActual) {
                estilo += ' ring-2 ring-slate-900 dark:ring-white scale-105';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIndiceActual(idx);
                    setMostrarCuadriculaMovil(false);
                  }}
                  className={`h-9 rounded-md text-xs font-mono flex items-center justify-center transition-all ${estilo}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Resumen al pie de la cuadrícula */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Sin responder:</span>
              <strong className="text-slate-800 dark:text-slate-200">{sinContestarCount}</strong>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Marcadas para revisión:</span>
              <strong className="text-amber-600 dark:text-amber-400">{marcadasCount}</strong>
            </div>
            <button
              onClick={() => setModalConfirmarEntrega(true)}
              className="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirmar Entrega Definitiva</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Modal de Advertencia y Confirmación de Entrega Definitiva */}
      {modalConfirmarEntrega && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                  ¿Desea entregar el examen?
                </h3>
                <p className="text-xs text-slate-500">
                  Una vez entregado, no podrá modificar sus respuestas.
                </p>
              </div>
            </div>

            {/* Estadísticas de Respuestas Previas a la Entrega */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Preguntas contestadas:</span>
                <strong className="text-teal-600 font-bold">{contestadasCount} de {totalPreguntas}</strong>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Preguntas sin contestar:</span>
                <strong className={sinContestarCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                  {sinContestarCount}
                </strong>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Marcadas para revisión:</span>
                <strong className="text-amber-600 font-bold">{marcadasCount}</strong>
              </div>
            </div>

            {sinContestarCount > 0 && (
              <p className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200 dark:border-amber-900">
                Advertencia: Dejará <strong>{sinContestarCount}</strong> preguntas sin responder (estas otorgarán 0 puntos). Las reglas institucionales no exigen contestar todas las preguntas para entregar.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalConfirmarEntrega(false)}
                className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Volver al Examen
              </button>
              <button
                type="button"
                onClick={handleConfirmarEntregaDefinitiva}
                className="px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow transition-colors"
              >
                Sí, Entregar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
