import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Clock,
  FileCheck2,
  Award,
  Layers,
  ShieldAlert,
  Play,
  CheckCircle,
  Sparkles,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { useSimulator } from '../context/SimulatorContext';
import {
  AciertosMinimosAprobacion,
  DuracionOficialMinutos,
  PuntajeMaximoOficial,
  PuntajeMinimoAprobacion,
  TotalPreguntasOficial,
} from './constants';
import { CargarBancoModal } from './CargarBancoModal';

interface ExamModalPreStartProps {
  onCerrar: () => void;
  onIniciarExito: () => void;
  onAbrirConfigPractica: () => void;
}

export const ExamModalPreStart: React.FC<ExamModalPreStartProps> = ({
  onCerrar,
  onIniciarExito,
  onAbrirConfigPractica,
}) => {
  const {
    perfilActual,
    preguntas,
    preguntasValidadas,
    preguntasDemo,
    iniciarExamen,
  } = useSimulator();
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [iniciando, setIniciando] = useState(false);
  const [modalCargarBanco, setModalCargarBanco] = useState(false);

  const materiasPerfilSet = new Set(perfilActual.materias);
  const validadasPerfil = preguntasValidadas.filter(
    (p) => materiasPerfilSet.has(p.materia)
  );

  const tieneRealesSuficientes = validadasPerfil.length >= TotalPreguntasOficial;

  const handleConfirmarInicio = async () => {
    setErrorMensaje(null);
    setIniciando(true);

    try {
      if (preguntas.length === 0 || validadasPerfil.length === 0) {
        setErrorMensaje(
          'El banco de preguntas se encuentra actualmente vacío. Por favor cargue o pegue sus preguntas (4 opciones y respuesta correcta) para iniciar el simulacro.'
        );
        setIniciando(false);
        return;
      }

      if (!tieneRealesSuficientes) {
        setErrorMensaje(
          `El simulacro oficial normado requiere 100 reactivos, y el banco actual cuenta con ${validadasPerfil.length} preguntas validadas. Puede utilizar "Práctica Personalizada" para examinarse con las preguntas disponibles o cargar más reactivos.`
        );
        setIniciando(false);
        return;
      }

      const res = await iniciarExamen({
        modalidad: 'oficial_aleatorio',
        perfilId: perfilActual.id,
        numeroPreguntas: TotalPreguntasOficial,
        duracionMinutos: DuracionOficialMinutos,
        mostrarMateriaDuranteExamen: false,
        materiasSeleccionadas: perfilActual.materias,
      });

      if (!res.ok) {
        setErrorMensaje(res.error || 'No fue posible generar el examen.');
        setIniciando(false);
      } else {
        onIniciarExito();
      }
    } catch (e: any) {
      setErrorMensaje(e?.message || 'Error inesperado al iniciar.');
      setIniciando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onCerrar}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Condiciones Oficiales del Simulacro</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white">
            Confirmación de Inicio de Examen
          </h3>
          <p className="text-xs text-slate-500">
            Resoluciones CJ 144-2026 y 198-2026 para juezas y jueces temporales de unidades judiciales
          </p>
        </div>

        {/* Resumen de Reglas */}
        <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500">Perfil evaluado:</span>
            <strong className="text-slate-800 dark:text-slate-200">{perfilActual.nombre}</strong>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500">Materias habilitadas:</span>
            <strong className="text-slate-800 dark:text-slate-200">{perfilActual.materias.length} materias</strong>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500">Cantidad de preguntas:</span>
            <strong className="text-slate-800 dark:text-slate-200">{TotalPreguntasOficial} objetivas (A, B, C, D)</strong>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500">Duración máxima:</span>
            <strong className="text-slate-800 dark:text-slate-200">{DuracionOficialMinutos} minutos (cuenta regresiva)</strong>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500">Puntaje máximo:</span>
            <strong className="text-slate-800 dark:text-slate-200">{PuntajeMaximoOficial} puntos (0.50 pts por acierto)</strong>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Puntaje mínimo de aprobación:</span>
            <strong className="text-teal-600 dark:text-teal-400 font-bold">
              {PuntajeMinimoAprobacion} puntos ({AciertosMinimosAprobacion} aciertos)
            </strong>
          </div>
        </div>

        {/* Advertencias */}
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>Las preguntas y sus cuatro alternativas se presentarán en orden aleatorio único.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>No se mostrará la respuesta correcta hasta que haya entregado definitivamente el examen.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>Al expirar los 60 minutos, el examen se entregará de forma automática.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>Podrá marcar preguntas para revisión antes de confirmar la entrega.</span>
          </div>
        </div>

        {/* Aviso de Estado del Banco */}
        {!tieneRealesSuficientes && (
          <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 space-y-2.5">
            <div className="flex items-center gap-2 font-bold uppercase text-[11px] text-teal-800 dark:text-teal-300">
              <Upload className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Banco Personalizado del Usuario</span>
            </div>
            <p>
              Actualmente el banco local cuenta con{' '}
              <strong>{validadasPerfil.length}</strong> reactivos validados para este perfil.
              El simulacro oficial institucional de evaluación judicial requiere 100 preguntas.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setModalCargarBanco(true)}
                className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Cargar / Pegar Preguntas (4 opciones)</span>
              </button>

              {validadasPerfil.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onCerrar();
                    onAbrirConfigPractica();
                  }}
                  className="text-slate-600 dark:text-slate-400 font-medium underline hover:text-slate-900"
                >
                  O practicar con las {validadasPerfil.length} disponibles &rarr;
                </button>
              )}
            </div>
          </div>
        )}

        {errorMensaje && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200">
            {errorMensaje}
          </div>
        )}

        {/* Botones de Pie */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCerrar}
            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={iniciando || validadasPerfil.length === 0}
            onClick={handleConfirmarInicio}
            className="px-5 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white text-xs font-semibold shadow flex items-center gap-2 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{iniciando ? 'Generando examen...' : 'Confirmar e Iniciar Examen'}</span>
          </button>
        </div>

        {/* Modal Cargar Banco */}
        {modalCargarBanco && (
          <CargarBancoModal onCerrar={() => setModalCargarBanco(false)} />
        )}
      </div>
    </div>
  );
};
