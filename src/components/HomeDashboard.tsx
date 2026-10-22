import React, { useState } from 'react';
import {
  Play,
  Sliders,
  History,
  ShieldAlert,
  Info,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Target,
  Award,
  Layers,
  ChevronRight,
  Database,
  Sparkles,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { useSimulator } from '../context/SimulatorContext';
import { MATERIAS_DEFINICION } from '../services/curriculum';
import { CargarBancoModal } from './CargarBancoModal';
import {
  AciertosMinimosAprobacion,
  DuracionOficialMinutos,
  PuntajeMaximoOficial,
  PuntajeMinimoAprobacion,
  PuntajePorAcierto,
  TotalPreguntasOficial,
} from './constants';

interface HomeDashboardProps {
  onAbrirPreInicio: () => void;
  onAbrirConfigPractica: () => void;
  onIrAHistorial: () => void;
  onIrAAdmin: () => void;
  onIrACalidadJuridica?: () => void;
  onIrAArbitroAdversarial?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onAbrirPreInicio,
  onAbrirConfigPractica,
  onIrAHistorial,
  onIrAAdmin,
  onIrACalidadJuridica,
  onIrAArbitroAdversarial,
}) => {
  const {
    perfilActual,
    setPerfilId,
    preguntas,
    preguntasValidadas,
    preguntasDemo,
    historialIntentos,
    eliminarDatosDemo,
    autogenerarBancoCompleto,
  } = useSimulator();
  const [generandoBanco, setGenerandoBanco] = useState(false);
  const [modalCargarBanco, setModalCargarBanco] = useState(false);

  const [mostrarDetalleMaterias, setMostrarDetalleMaterias] = useState(false);

  // Filtrar validadas que corresponden al perfil actual
  const materiasPerfilSet = new Set(perfilActual.materias);
  const validadasParaPerfil = preguntasValidadas.filter(
    (p) => materiasPerfilSet.has(p.materia) && !p.esDemostracion
  );

  const totalRealesPerfil = validadasParaPerfil.length;
  const esBancoSoloDemo = totalRealesPerfil === 0 && preguntasDemo.length > 0;
  const fechaUltimaActualizacion =
    preguntas.length > 0
      ? new Date(
          Math.max(...preguntas.map((p) => new Date(p.fechaActualizacion || p.fechaCreacion).getTime()))
        ).toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'Sin datos';

  // Último intento completado
  const ultimoIntento = historialIntentos.find((it) => it.entregado);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner cuando el banco está vacío y listo para recibir preguntas del usuario */}
      {preguntas.length === 0 && (
        <div className="bg-teal-500/10 border-2 border-teal-500/40 rounded-2xl p-6 text-slate-800 dark:text-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
              <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>BANCO DE PREGUNTAS VACIADO (0 REACTIVOS)</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
              Listo para recibir tu nuevo banco de preguntas
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              El banco previo ha sido eliminado por completo. Puedes facilitarme las preguntas directamente aquí en el chat, o pegarlas/cargarlas con el botón inferior.
              Recuerda que la metodología es de <strong>opción múltiple con 4 posibles respuestas (A, B, C, D)</strong> indicando la <strong>respuesta correcta</strong>.
            </p>
          </div>
          <button
            onClick={() => setModalCargarBanco(true)}
            className="px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 shrink-0 min-h-[44px]"
          >
            <Upload className="w-4 h-4" />
            <span>Pegar / Cargar Preguntas</span>
          </button>
        </div>
      )}

      {/* Banner de Advertencia si es solo Demo */}
      {esBancoSoloDemo && (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-xl p-5 text-amber-900 dark:text-amber-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-sm tracking-wide uppercase">
                BANCO EN MODO DEMOSTRACIÓN ({preguntasDemo.length} PREGUNTAS DE PRUEBA)
              </h2>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                La aplicación contiene preguntas ficticias rotuladas exclusivamente para evaluar la interfaz.
                Para realizar simulacros oficiales de 100 preguntas, importe el banco oficial en el Panel de Administración.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setModalCargarBanco(true)}
              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-semibold shadow transition-colors flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Cargar Preguntas</span>
            </button>
            <button
              onClick={() => eliminarDatosDemo()}
              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded text-xs transition-colors"
            >
              Borrar Demo
            </button>
          </div>
        </div>
      )}

      {/* Hero Principal con Perfil y Acciones de Lanzamiento */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 lg:p-10 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/50">
                <Target className="w-3.5 h-3.5" />
                <span>Metodología Resoluciones CJ 144-2026 y 198-2026</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
                Simulador de Evaluación Judicial
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Herramienta integral de entrenamiento técnico-jurídico para la selección de juezas y jueces temporales del Ecuador.
                Exámenes aleatorizados, temporizador estricto de 60 minutos, calificación institucional de 50 puntos y desglose jurisprudencial posterior a la entrega.
              </p>
            </div>

            {/* Selector de Perfil Destacado */}
            <div className="w-full lg:w-80 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 shrink-0">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Perfil de Postulación
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => setPerfilId('penal_completo')}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                    perfilActual.id === 'penal_completo'
                      ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-950 dark:text-teal-100 font-semibold ring-1 ring-teal-500'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Perfil Penal Completo</span>
                    {perfilActual.id === 'penal_completo' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal block mt-0.5">
                    7 materias (incluye Derecho Penal)
                  </span>
                </button>

                <button
                  onClick={() => setPerfilId('personalizado_usuario')}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                    perfilActual.id === 'personalizado_usuario'
                      ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-950 dark:text-teal-100 font-semibold ring-1 ring-teal-500'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Perfil Personalizado</span>
                    {perfilActual.id === 'personalizado_usuario' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal block mt-0.5">
                    6 materias especializadas
                  </span>
                </button>
              </div>

              {/* Advertencia institucional de perfil si aplica */}
              {perfilActual.advertenciaInstitucional && (
                <div className="p-2.5 rounded bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200 leading-tight flex items-start gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>{perfilActual.advertenciaInstitucional}</span>
                </div>
              )}
            </div>
          </div>

          {/* Botones de Acción Inmediata */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onAbrirPreInicio}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm sm:text-base shadow-sm hover:shadow transition-all focus:ring-4 focus:ring-teal-300/40 min-h-[48px]"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Iniciar Simulacro Oficial (100 preguntas)</span>
            </button>

            <button
              onClick={onAbrirConfigPractica}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-sm sm:text-base border border-slate-300 dark:border-slate-700 transition-colors min-h-[48px]"
            >
              <Sliders className="w-4 h-4" />
              <span>Configurar Práctica Personalizada</span>
            </button>

            <button
              onClick={onIrACalidadJuridica}
              className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-sm font-semibold transition-colors min-h-[48px]"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Control de Calidad Jurídica</span>
            </button>

            {onIrAArbitroAdversarial && (
              <button
                onClick={onIrAArbitroAdversarial}
                className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/40 text-sm font-semibold shadow-xs transition-colors min-h-[48px]"
                title="Auditoría adversarial de 8 vectores: cero repetición y rigor EFJ"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Árbitro Adversarial EFJ</span>
              </button>
            )}

            <button
              onClick={() => setModalCargarBanco(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm sm:text-base shadow-sm transition-all min-h-[48px]"
            >
              <Upload className="w-4 h-4" />
              <span>{preguntas.length === 0 ? 'Cargar / Pegar Preguntas' : 'Gestionar / Cargar Banco'}</span>
            </button>

            <button
              onClick={onIrAHistorial}
              className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors ml-auto min-h-[48px]"
            >
              <History className="w-4 h-4" />
              <span>Ver Historial ({historialIntentos.length})</span>
            </button>
          </div>
        </div>

        {/* Barra de Parámetros Institucionales Normados */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 dark:divide-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-600 dark:text-slate-400 p-4">
          <div className="p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-slate-500 mb-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Reactivos</span>
            </div>
            <strong className="text-base text-slate-900 dark:text-white font-bold block">
              {TotalPreguntasOficial} preguntas
            </strong>
            <span className="text-[11px] text-slate-500">4 opciones (A, B, C, D)</span>
          </div>

          <div className="p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-slate-500 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Tiempo Límite</span>
            </div>
            <strong className="text-base text-slate-900 dark:text-white font-bold block">
              {DuracionOficialMinutos} minutos
            </strong>
            <span className="text-[11px] text-slate-500">Autoentrega a cero</span>
          </div>

          <div className="p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-slate-500 mb-1">
              <Target className="w-3.5 h-3.5" />
              <span>Valor por Acierto</span>
            </div>
            <strong className="text-base text-slate-900 dark:text-white font-bold block">
              {PuntajePorAcierto.toFixed(2)} pts
            </strong>
            <span className="text-[11px] text-slate-500">Máx: {PuntajeMaximoOficial} pts</span>
          </div>

          <div className="p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-slate-500 mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Mínimo Aprobatorio</span>
            </div>
            <strong className="text-base text-teal-600 dark:text-teal-400 font-bold block">
              {PuntajeMinimoAprobacion} pts
            </strong>
            <span className="text-[11px] text-slate-500">
              {AciertosMinimosAprobacion} respuestas correctas
            </span>
          </div>
        </div>
      </section>

      {/* Banner de Certificación Adversarial EFJ */}
      {onIrAArbitroAdversarial && (
        <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 border border-amber-500/30 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Certificación Adversarial EFJ Activa
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-emerald-400 font-mono">0.00% Colisiones en Tests</span>
              </div>
              <h3 className="text-lg font-serif font-bold text-white">
                Árbitro Adversarial: Auditoría de Rigor y No Repetición
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                El sistema audita continuamente el banco de reactivos mediante 8 vectores de ataque estocásticos para asegurar que ninguna pregunta se repita jamás en el mismo examen, que el orden y las opciones A/B/C/D sean aleatorias, y que se replique con exactitud la ficha estructural de la Escuela de la Función Judicial del Ecuador.
              </p>
            </div>
          </div>

          <button
            onClick={onIrAArbitroAdversarial}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0 flex items-center gap-2"
          >
            <span>Ejecutar Auditoría en Vivo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </section>
      )}

      {/* Tarjetas de Cobertura y Materias del Perfil */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta 1: Estado del Banco para este Perfil */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Disponibilidad del Banco
            </h3>
            <span className="text-[11px] text-slate-500">Actualizado: {fechaUltimaActualizacion}</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400">Validadas en este perfil:</span>
              <strong className="text-sm font-bold text-slate-900 dark:text-white">
                {totalRealesPerfil > 0 ? totalRealesPerfil : `${preguntasDemo.length} (demo)`}
              </strong>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-teal-600 h-2.5 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, ((totalRealesPerfil || preguntasDemo.length) / 100) * 100)}%`,
                }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-500">
              <span>0</span>
              <span>Meta oficial: 100 reactivos</span>
            </div>

            {totalRealesPerfil < 100 ? (
              <div className="space-y-2">
                <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded border border-amber-200 dark:border-amber-900/60 leading-tight">
                  El banco local cuenta con {totalRealesPerfil} reactivos validados.
                </p>
                <button
                  onClick={async () => {
                    setGenerandoBanco(true);
                    try {
                      await autogenerarBancoCompleto();
                    } finally {
                      setGenerandoBanco(false);
                    }
                  }}
                  disabled={generandoBanco}
                  className="w-full py-2 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{generandoBanco ? 'Autogenerando...' : '⚡ Autogenerar Banco EFJ (210 preguntas únicas)'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Banco completo listo para simulacro (100)
                </span>
                <button
                  onClick={async () => {
                    setGenerandoBanco(true);
                    try {
                      await autogenerarBancoCompleto();
                    } finally {
                      setGenerandoBanco(false);
                    }
                  }}
                  disabled={generandoBanco}
                  className="text-[11px] text-teal-600 dark:text-teal-400 underline hover:text-teal-700"
                >
                  Re-sincronizar banco
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tarjeta 2: Último Desempeño */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Último Intento Registrado
          </h3>

          {ultimoIntento ? (
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500">Puntaje obtenido:</span>
                <span
                  className={`text-2xl font-bold ${
                    ultimoIntento.aprobado
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {ultimoIntento.puntajeObtenido?.toFixed(2)} / 50.00
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Aciertos:</span>
                <strong>
                  {ultimoIntento.correctas} de {ultimoIntento.totalPreguntas} (
                  {ultimoIntento.porcentajeAcierto}%)
                </strong>
              </div>

              <div className="inline-block w-full text-center py-1 rounded text-xs font-semibold uppercase tracking-wider ${
                ultimoIntento.aprobado
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
              }">
                {ultimoIntento.aprobado ? 'Supera el mínimo' : 'No alcanza el mínimo'}
              </div>

              <div className="text-[11px] text-slate-500 text-center">
                Fecha:{' '}
                {new Date(ultimoIntento.fechaInicio).toLocaleDateString('es-EC', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-2 text-slate-500 text-xs">
              <p>No se han registrado intentos finalizados todavía.</p>
              <button
                onClick={onAbrirPreInicio}
                className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
              >
                Comenzar primer simulacro
              </button>
            </div>
          )}
        </div>

        {/* Tarjeta 3: Materias del Perfil */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Materias ({perfilActual.materias.length})
            </h3>
            <button
              onClick={() => setMostrarDetalleMaterias(!mostrarDetalleMaterias)}
              className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
            >
              {mostrarDetalleMaterias ? 'Ocultar' : 'Ver detalle'}
            </button>
          </div>

          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            {perfilActual.materias.map((m, idx) => {
              const cantVal = preguntasValidadas.filter((p) => p.materia === m && !p.esDemostracion).length;
              return (
                <li
                  key={idx}
                  className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-0"
                >
                  <span className="truncate pr-2">{m}</span>
                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-400">
                    {cantVal}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Modal o Acordeón Desplegable de Subtemas */}
      {mostrarDetalleMaterias && (
        <section className="bg-slate-50 dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white">
            Estructura Temática y Subtemas por Materia
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Cada materia contiene subtemas rigurosamente ajustados a la normativa ecuatoriana (Constitución, COIP, COFJ, Código de la Niñez y Ley de Prevención de Violencia).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {perfilActual.materias.map((materiaNombre) => {
              const def = MATERIAS_DEFINICION[materiaNombre];
              if (!def) return null;
              return (
                <div
                  key={def.id}
                  className="bg-white dark:bg-slate-800/70 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                >
                  <h4 className="font-bold text-slate-900 dark:text-white">{def.nombre}</h4>
                  <p className="text-[11px] text-slate-500">{def.descripcion}</p>
                  <div className="max-h-40 overflow-y-auto space-y-1 pt-1 pr-1 border-t border-slate-100 dark:border-slate-700">
                    {def.subtemas.map((st, i) => (
                      <div key={i} className="text-slate-700 dark:text-slate-300 flex items-start gap-1">
                        <span className="text-teal-600 dark:text-teal-400 shrink-0">•</span>
                        <span>{st}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Modal de Carga de Banco de Preguntas */}
      {modalCargarBanco && (
        <CargarBancoModal onCerrar={() => setModalCargarBanco(false)} />
      )}
    </div>
  );
};
