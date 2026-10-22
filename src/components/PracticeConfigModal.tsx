import React, { useState } from 'react';
import {
  X,
  Sliders,
  CheckSquare,
  Square,
  Clock,
  Layers,
  Award,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { useSimulator } from '../context/SimulatorContext';
import { Dificultad, ExamenConfig, ModalidadSimulacro } from '../types';

interface PracticeConfigModalProps {
  onCerrar: () => void;
  onIniciarExamen: () => void;
}

export const PracticeConfigModal: React.FC<PracticeConfigModalProps> = ({
  onCerrar,
  onIniciarExamen,
}) => {
  const { perfilActual, preguntasValidadas, iniciarExamen } = useSimulator();

  const [modalidad, setModalidad] = useState<ModalidadSimulacro>('practica_personalizada');
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState<string[]>(
    perfilActual.materias
  );
  const [numeroPreguntas, setNumeroPreguntas] = useState<number>(20);
  const [duracionMinutos, setDuracionMinutos] = useState<number>(30);
  const [filtroDificultad, setFiltroDificultad] = useState<Dificultad | 'todas'>('todas');
  const [mostrarMateria, setMostrarMateria] = useState<boolean>(true);
  const [soloFalladas, setSoloFalladas] = useState<boolean>(false);
  const [soloMarcadas, setSoloMarcadas] = useState<boolean>(false);
  const [soloNoDominadas, setSoloNoDominadas] = useState<boolean>(false);

  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);

  const toggleMateria = (materia: string) => {
    if (materiasSeleccionadas.includes(materia)) {
      if (materiasSeleccionadas.length > 1) {
        setMateriasSeleccionadas(materiasSeleccionadas.filter((m) => m !== materia));
      }
    } else {
      setMateriasSeleccionadas([...materiasSeleccionadas, materia]);
    }
  };

  const handleLanzar = async () => {
    setErrorMensaje(null);
    setCargando(true);

    const config: ExamenConfig = {
      modalidad,
      perfilId: perfilActual.id,
      numeroPreguntas: Number(numeroPreguntas),
      duracionMinutos: Number(duracionMinutos),
      mostrarMateriaDuranteExamen: mostrarMateria,
      materiasSeleccionadas,
      filtroDificultad,
      soloFalladas,
      soloMarcadas,
      soloNoDominadas,
    };

    const res = await iniciarExamen(config);
    if (!res.ok) {
      setErrorMensaje(res.error || 'No fue posible generar el examen.');
      setCargando(false);
    } else {
      onIniciarExamen();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onCerrar}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
          aria-label="Cerrar configuración"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
            <Sliders className="w-3.5 h-3.5" />
            <span>Configuración Pedagógica Flexible</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white">
            Configurar Sesión de Entrenamiento
          </h3>
          <p className="text-xs text-slate-500">
            Ajuste reactivos, materias de estudio y tiempos según sus necesidades de refuerzo.
          </p>
        </div>

        {/* Selector de Modalidad */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Modalidad de Estudio
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setModalidad('practica_personalizada');
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                modalidad === 'practica_personalizada'
                  ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-950 dark:text-teal-100 font-semibold ring-1 ring-teal-500'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="font-bold">Práctica Personalizada</div>
              <span className="text-[11px] text-slate-500 font-normal">
                Selección libre de cantidad, materias, dificultad y filtros de falladas.
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setModalidad('equilibrado');
                setNumeroPreguntas(perfilActual.materias.length * 10);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                modalidad === 'equilibrado'
                  ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-950 dark:text-teal-100 font-semibold ring-1 ring-teal-500'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="font-bold">Simulacro Equilibrado</div>
              <span className="text-[11px] text-slate-500 font-normal">
                Distribución proporcional entre materias. (Configuración didáctica, no oficial).
              </span>
            </button>
          </div>
        </div>

        {modalidad === 'equilibrado' && (
          <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200">
            <strong>Nota metodológica:</strong> Esta distribución proporcional uniforme es una herramienta didáctica para garantizar repaso balanceado. El examen oficial de selección no establece cuotas fijas por materia en cada prueba individual.
          </div>
        )}

        {/* Selección de Materias */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Materias Habilitadas ({materiasSeleccionadas.length}/{perfilActual.materias.length})
          </label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
            {perfilActual.materias.map((m) => {
              const checked = materiasSeleccionadas.includes(m);
              const cantVal = preguntasValidadas.filter((p) => p.materia === m).length;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleMateria(m)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-colors ${
                    checked
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-100'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-teal-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="font-medium truncate">{m}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 shrink-0">
                    {cantVal} disp.
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Parámetros: Número de Preguntas y Tiempo */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Número de Preguntas
            </label>
            <select
              value={numeroPreguntas}
              onChange={(e) => setNumeroPreguntas(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value={10}>10 preguntas (Rápido)</option>
              <option value={20}>20 preguntas (Recomendado)</option>
              <option value={50}>50 preguntas (Medio simulacro)</option>
              <option value={100}>100 preguntas (Simulacro completo)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Tiempo Límite (minutos)
            </label>
            <select
              value={duracionMinutos}
              onChange={(e) => setDuracionMinutos(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={60}>60 minutos (Tiempo oficial)</option>
              <option value={90}>90 minutos (Sin prisa)</option>
            </select>
          </div>
        </div>

        {/* Filtros Especiales de Refuerzo */}
        {modalidad === 'practica_personalizada' && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <label className="font-bold uppercase tracking-wider text-slate-500">
              Filtros Especiales de Refuerzo
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soloFalladas}
                  onChange={(e) => setSoloFalladas(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  Practicar únicamente preguntas falladas en intentos anteriores
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soloMarcadas}
                  onChange={(e) => setSoloMarcadas(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  Practicar únicamente preguntas marcadas para revisión
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soloNoDominadas}
                  onChange={(e) => setSoloNoDominadas(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  Excluir preguntas ya dominadas en repaso espaciado (&ge; Nivel 3)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={mostrarMateria}
                  onChange={(e) => setMostrarMateria(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  Mostrar nombre de la materia durante el examen
                </span>
              </label>
            </div>
          </div>
        )}

        {preguntasValidadas.length === 0 && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
            El banco de preguntas se encuentra vacío. Por favor cargue o pegue sus preguntas en la pantalla de inicio o administración.
          </div>
        )}

        {errorMensaje && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200">
            {errorMensaje}
          </div>
        )}

        {/* Botones de Pie */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onCerrar}
            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={cargando || preguntasValidadas.length === 0}
            onClick={handleLanzar}
            className="px-5 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white text-xs font-semibold shadow flex items-center gap-2 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{cargando ? 'Generando...' : 'Iniciar Sesión'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
