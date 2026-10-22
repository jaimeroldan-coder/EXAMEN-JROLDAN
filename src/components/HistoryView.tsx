import React from 'react';
import {
  History,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Download,
} from 'lucide-react';
import { useSimulator } from '../context/SimulatorContext';
import { IntentoExamen } from '../types';

interface HistoryViewProps {
  onVerDetalle: (intento: IntentoExamen) => void;
  onVolverInicio: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onVerDetalle, onVolverInicio }) => {
  const { historialIntentos, eliminarIntentoHistorial } = useSimulator();

  const entregados = historialIntentos.filter((it) => it.entregado);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
            <History className="w-3.5 h-3.5" />
            <span>Auditoría de Evaluaciones</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white mt-1">
            Historial de Simulacros Completados
          </h2>
          <p className="text-xs text-slate-500">
            Cada intento conserva una instantánea inmutable de sus preguntas y alternativas originales.
          </p>
        </div>

        <button
          onClick={onVolverInicio}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Volver al Inicio
        </button>
      </div>

      {entregados.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <p className="text-slate-500 text-sm">No existen simulacros finalizados registrados.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-slate-500 font-semibold">
                <tr>
                  <th className="p-4">Fecha y Hora</th>
                  <th className="p-4">Modalidad</th>
                  <th className="p-4">Preguntas</th>
                  <th className="p-4 text-center">Aciertos</th>
                  <th className="p-4 text-center">Puntaje</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {entregados.map((it) => {
                  const fecha = new Date(it.fechaInicio).toLocaleDateString('es-EC', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={it.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono text-slate-700 dark:text-slate-300">{fecha}</td>
                      <td className="p-4 font-medium text-slate-900 dark:text-white capitalize">
                        {it.modalidad === 'oficial_aleatorio'
                          ? 'Oficial Aleatorio'
                          : it.modalidad === 'equilibrado'
                          ? 'Equilibrado (Didáctico)'
                          : 'Práctica Personalizada'}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 font-mono">
                        {it.totalPreguntas} reactivos
                      </td>
                      <td className="p-4 text-center font-mono font-medium">
                        {it.correctas} / {it.totalPreguntas} ({it.porcentajeAcierto}%)
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`font-mono font-bold text-sm ${
                            it.aprobado
                              ? 'text-teal-600 dark:text-teal-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {it.puntajeObtenido?.toFixed(2)} / 50.00
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            it.aprobado
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {it.aprobado ? 'Aprobado' : 'No alcanza'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onVerDetalle(it)}
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-teal-600 dark:text-teal-400"
                            title="Ver acta y respuestas completas"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Eliminar este intento del historial local?')) {
                                eliminarIntentoHistorial(it.id);
                              }
                            }}
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500"
                            title="Eliminar intento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
