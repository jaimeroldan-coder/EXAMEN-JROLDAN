import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldAlert,
  BarChart,
  Layers,
  Filter,
  Check,
  X,
  Minus,
} from 'lucide-react';
import { useSimulator } from '../context/SimulatorContext';
import { AlternativaId, IntentoExamen, PreguntaSnapshot } from '../types';

interface ExamResultsViewProps {
  intento: IntentoExamen;
  onVolverInicio: () => void;
  onIniciarPracticaConFiltro: (preguntaIds: string[]) => void;
}

export const ExamResultsView: React.FC<ExamResultsViewProps> = ({
  intento,
  onVolverInicio,
  onIniciarPracticaConFiltro,
}) => {
  const [preguntaExpandida, setPreguntaExpandida] = useState<number | null>(null);
  const [filtroRevision, setFiltroRevision] = useState<'todas' | 'incorrectas' | 'marcadas'>('todas');

  const {
    correctas = 0,
    incorrectas = 0,
    noContestadas = 0,
    puntajeObtenido = 0,
    porcentajeAcierto = 0,
    aprobado = false,
    totalPreguntas = 0,
  } = intento;

  // Rendimiento por materia
  const porMateria: Record<string, { total: number; correctas: number }> = {};
  // Rendimiento por subtema
  const porSubtema: Record<string, { total: number; correctas: number; materia: string }> = {};
  // Rendimiento por dificultad
  const porDificultad: Record<string, { total: number; correctas: number }> = {
    baja: { total: 0, correctas: 0 },
    media: { total: 0, correctas: 0 },
    alta: { total: 0, correctas: 0 },
  };

  const incorrectasIds: string[] = [];
  const marcadasIds: string[] = [];

  intento.preguntasSnapshot.forEach((ps, idx) => {
    const resp = intento.respuestasUsuario[idx];
    const esCorrecta = resp === ps.respuestaCorrecta;

    if (!esCorrecta) {
      incorrectasIds.push(ps.preguntaOriginalId);
    }
    if (intento.preguntasMarcadasParaRevision[idx]) {
      marcadasIds.push(ps.preguntaOriginalId);
    }

    // Materia
    if (!porMateria[ps.materia]) porMateria[ps.materia] = { total: 0, correctas: 0 };
    porMateria[ps.materia].total++;
    if (esCorrecta) porMateria[ps.materia].correctas++;

    // Subtema
    if (!porSubtema[ps.subtema])
      porSubtema[ps.subtema] = { total: 0, correctas: 0, materia: ps.materia };
    porSubtema[ps.subtema].total++;
    if (esCorrecta) porSubtema[ps.subtema].correctas++;

    // Dificultad
    const dif = ps.dificultad || 'media';
    if (!porDificultad[dif]) porDificultad[dif] = { total: 0, correctas: 0 };
    porDificultad[dif].total++;
    if (esCorrecta) porDificultad[dif].correctas++;
  });

  const exportarCSVResultados = () => {
    const lineas = [
      'numero,materia,subtema,dificultad,enunciado,respuesta_seleccionada,respuesta_correcta,resultado,norma,articulo',
    ];
    intento.preguntasSnapshot.forEach((p, idx) => {
      const resp = intento.respuestasUsuario[idx] || 'NO_CONTESTADA';
      const esCorrecta = resp === p.respuestaCorrecta;
      const estado = resp === 'NO_CONTESTADA' ? 'NO_CONTESTADA' : esCorrecta ? 'CORRECTA' : 'INCORRECTA';
      lineas.push(
        `"${idx + 1}","${p.materia}","${p.subtema}","${p.dificultad}","${p.enunciado.replace(/"/g, '""')}","${resp}","${p.respuestaCorrecta}","${estado}","${p.fuente.norma}","${p.fuente.articulo}"`
      );
    });
    const blob = new Blob([lineas.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultado_simulacro_${intento.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const preguntasFiltradas = intento.preguntasSnapshot
    .map((p, idx) => ({ p, idx }))
    .filter(({ p, idx }) => {
      if (filtroRevision === 'incorrectas') {
        return intento.respuestasUsuario[idx] !== p.respuestaCorrecta;
      }
      if (filtroRevision === 'marcadas') {
        return Boolean(intento.preguntasMarcadasParaRevision[idx]);
      }
      return true;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0">
      {/* Tarjeta de Calificación Principal */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-teal-600 dark:text-teal-400 font-semibold block">
              Evaluación Final del Simulacro
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white">
              Acta de Resultados Individuales
            </h2>
            <p className="text-xs text-slate-500">
              Intento ID: {intento.id} • Modalidad:{' '}
              {intento.modalidad === 'oficial_aleatorio'
                ? 'Simulacro Oficial Aleatorio'
                : intento.modalidad === 'equilibrado'
                ? 'Simulacro Equilibrado (Didáctico)'
                : 'Práctica Personalizada'}
            </p>
          </div>

          {/* Calificación Final con Badge Accesible */}
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Puntaje Obtenido</span>
              <div className="text-4xl sm:text-5xl font-serif font-bold text-slate-900 dark:text-white">
                {puntajeObtenido.toFixed(2)}
                <span className="text-xl text-slate-400 font-sans"> / 50.00</span>
              </div>
            </div>

            <div
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                aprobado
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
              }`}
            >
              {aprobado ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Supera el mínimo institucional (40+ pts)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>No alcanza el mínimo institucional (mínimo 40 pts)</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Métricas Resumidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-center">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
              <Check className="w-4 h-4" />
              <span>Correctas</span>
            </div>
            <strong className="text-2xl font-bold text-slate-900 dark:text-white block">
              {correctas}
            </strong>
            <span className="text-xs text-slate-500 font-mono">
              {(correctas * 0.5).toFixed(2)} pts ({porcentajeAcierto}%)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-700 dark:text-rose-400 font-semibold mb-1">
              <X className="w-4 h-4" />
              <span>Incorrectas</span>
            </div>
            <strong className="text-2xl font-bold text-slate-900 dark:text-white block">
              {incorrectas}
            </strong>
            <span className="text-xs text-slate-500 font-mono">0.00 pts (sin penalización)</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
              <Minus className="w-4 h-4" />
              <span>No Contestadas</span>
            </div>
            <strong className="text-2xl font-bold text-slate-900 dark:text-white block">
              {noContestadas}
            </strong>
            <span className="text-xs text-slate-500 font-mono">0.00 pts</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
              <Clock className="w-4 h-4" />
              <span>Entrega</span>
            </div>
            <strong className="text-base font-bold text-slate-900 dark:text-white block">
              {intento.entregadoAutomaticamentePorTiempo ? 'Límite de tiempo' : 'Entrega manual'}
            </strong>
            <span className="text-xs text-slate-500">
              {intento.interrupcionesDetectadas || 0} salidas de pantalla reg.
            </span>
          </div>
        </div>

        {/* Botones de Acción Posterior al Examen */}
        <div className="mt-8 flex flex-wrap items-center gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 print:hidden">
          {incorrectasIds.length > 0 && (
            <button
              onClick={() => onIniciarPracticaConFiltro(incorrectasIds)}
              className="px-4 py-2.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Repetir Incorrectas ({incorrectasIds.length})</span>
            </button>
          )}

          {marcadasIds.length > 0 && (
            <button
              onClick={() => onIniciarPracticaConFiltro(marcadasIds)}
              className="px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Repetir Marcadas ({marcadasIds.length})</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors flex items-center gap-2"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Exportar a PDF</span>
          </button>

          <button
            onClick={exportarCSVResultados}
            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onVolverInicio}
            className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold shadow transition-colors ml-auto"
          >
            Volver al Inicio
          </button>
        </div>
      </section>

      {/* Desglose por Materia, Subtema y Dificultad */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Materia */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            Rendimiento por Materia
          </h3>
          <div className="space-y-3">
            {Object.entries(porMateria).map(([materia, d]) => {
              const pct = d.total > 0 ? Math.round((d.correctas / d.total) * 100) : 0;
              return (
                <div key={materia} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="truncate pr-2 font-medium text-slate-700 dark:text-slate-300">{materia}</span>
                    <span className="font-mono text-slate-500">
                      {d.correctas}/{d.total} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${pct >= 80 ? 'bg-emerald-600' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-600'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subtemas con menor rendimiento */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
            <BarChart className="w-4 h-4 text-teal-600" />
            Análisis de Subtemas
          </h3>
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {Object.entries(porSubtema).map(([subtema, d]) => {
              const pct = d.total > 0 ? Math.round((d.correctas / d.total) * 100) : 0;
              return (
                <div key={subtema} className="text-xs border-b border-slate-100 dark:border-slate-800/60 pb-2">
                  <div className="flex justify-between font-medium text-slate-800 dark:text-slate-200">
                    <span className="truncate pr-2">{subtema}</span>
                    <span className="font-mono text-slate-500 shrink-0">{d.correctas}/{d.total}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">{d.materia}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dificultad */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            Rendimiento por Dificultad
          </h3>
          <div className="space-y-3">
            {(['baja', 'media', 'alta'] as const).map((dif) => {
              const d = porDificultad[dif];
              if (!d || d.total === 0) return null;
              const pct = Math.round((d.correctas / d.total) * 100);
              return (
                <div key={dif} className="space-y-1">
                  <div className="flex justify-between text-xs capitalize">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Dificultad {dif}</span>
                    <span className="font-mono text-slate-500">
                      {d.correctas}/{d.total} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${pct >= 80 ? 'bg-emerald-600' : 'bg-amber-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Lista Completa de Preguntas y Retroalimentación Jurídica */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
              Revisión Detallada y Sustentación Jurídica
            </h3>
            <p className="text-xs text-slate-500">
              Consulte la justificación normativa, análisis de distractores y precedentes aplicables de cada reactivo.
            </p>
          </div>

          {/* Filtros de Revisión */}
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 text-xs bg-slate-50 dark:bg-slate-800">
            <button
              onClick={() => setFiltroRevision('todas')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filtroRevision === 'todas'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Todas ({totalPreguntas})
            </button>
            <button
              onClick={() => setFiltroRevision('incorrectas')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filtroRevision === 'incorrectas'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Falladas ({incorrectas + noContestadas})
            </button>
            <button
              onClick={() => setFiltroRevision('marcadas')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filtroRevision === 'marcadas'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Marcadas ({marcadasIds.length})
            </button>
          </div>
        </div>

        {/* Lista Acordeón de Reactivos */}
        <div className="space-y-4">
          {preguntasFiltradas.map(({ p, idx }) => {
            const respUsuario = intento.respuestasUsuario[idx] || null;
            const esCorrecta = respUsuario === p.respuestaCorrecta;
            const noContestada = respUsuario === null;
            const expandida = preguntaExpandida === idx;

            return (
              <div
                key={idx}
                className={`border rounded-xl transition-all ${
                  noContestada
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40'
                    : esCorrecta
                    ? 'border-emerald-200 dark:border-emerald-950/80 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : 'border-rose-200 dark:border-rose-950/80 bg-rose-50/20 dark:bg-rose-950/10'
                }`}
              >
                {/* Cabecera del Ítem */}
                <button
                  type="button"
                  onClick={() => setPreguntaExpandida(expandida ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 focus:outline-none"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        #{idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-mono text-[11px] font-bold border border-teal-200/40 dark:border-teal-800/40">
                        {p.preguntaOriginalId}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium">{p.materia}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-400">{p.subtema}</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-semibold capitalize">
                        {p.dificultad}
                      </span>

                      {/* Insignia Accesible */}
                      {noContestada ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                          <Minus className="w-3 h-3" /> No Contestada
                        </span>
                      ) : esCorrecta ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                          <Check className="w-3 h-3" /> Correcta (+0.50 pts)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded">
                          <X className="w-3 h-3" /> Incorrecta (0 pts)
                        </span>
                      )}
                    </div>

                    <p className="text-sm sm:text-base font-serif font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                      {p.enunciado}
                    </p>
                  </div>

                  <div className="p-1 text-slate-400">
                    {expandida ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {/* Contenido Expandido con Explicaciones */}
                {expandida && (
                  <div className="p-4 sm:p-6 pt-0 border-t border-slate-100 dark:border-slate-800/80 space-y-6">
                    {/* Ficha Institucional EFJ */}
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider text-[10px]">
                          Ficha Metodológica EFJ
                        </span>
                        <span className="font-mono text-slate-600 dark:text-slate-400">
                          {p.preguntaOriginalId}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {p.materia} › {p.subtema}
                      </div>
                    </div>

                    <div className="text-base font-serif text-slate-900 dark:text-white pt-1">
                      {p.enunciado}
                    </div>

                    {/* Alternativas con Señalización */}
                    <div className="space-y-2">
                      {p.alternativas.map((alt) => {
                        const esLaCorrecta = alt.id === p.respuestaCorrecta;
                        const esLaElegida = alt.id === respUsuario;

                        let estilo = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/30 text-slate-700 dark:text-slate-300';
                        if (esLaCorrecta) {
                          estilo = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-medium ring-1 ring-emerald-500';
                        } else if (esLaElegida && !esLaCorrecta) {
                          estilo = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 ring-1 ring-rose-500';
                        }

                        return (
                          <div
                            key={alt.id}
                            className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-3 ${estilo}`}
                          >
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                esLaCorrecta
                                  ? 'bg-emerald-600 text-white'
                                  : esLaElegida
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {alt.id}
                            </span>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <span>{alt.texto}</span>
                                {esLaCorrecta && (
                                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 ml-2">
                                    [Respuesta Correcta]
                                  </span>
                                )}
                                {esLaElegida && !esLaCorrecta && (
                                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 ml-2">
                                    [Su Selección]
                                  </span>
                                )}
                              </div>

                              {/* Distractor explicado si existe */}
                              {p.explicacionDistractores && p.explicacionDistractores[alt.id] && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                                  Razón: {p.explicacionDistractores[alt.id]}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explicación Jurídica Principal */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                        Sustento Jurídico y Metodológico
                      </h4>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {p.explicacion}
                      </p>
                    </div>

                    {/* Ficha de Fuente Legal y Jurisprudencia */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 space-y-1">
                        <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                          Fuente Normativa
                        </span>
                        <strong className="text-slate-900 dark:text-white block font-serif">
                          {p.fuente.norma} — {p.fuente.articulo}
                        </strong>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px] italic">
                          "{p.fuente.textoSoporte}"
                        </p>
                        {p.fuente.urlOficial && (
                          <a
                            href={p.fuente.urlOficial}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline pt-1 text-[11px]"
                          >
                            <span>Consultar fuente oficial</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {!p.fuente.vigenciaVerificada && (
                          <div className="flex items-center gap-1 text-amber-600 text-[11px] pt-1">
                            <ShieldAlert className="w-3 h-3 shrink-0" />
                            <span>Fuente pendiente de verificación formal de vigencia</span>
                          </div>
                        )}
                      </div>

                      {p.jurisprudencia?.numeroSentencia ? (
                        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 space-y-1">
                          <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                            Jurisprudencia Aplicable
                          </span>
                          <strong className="text-slate-900 dark:text-white block">
                            {p.jurisprudencia.organo || 'Corte Constitucional'} • Sentencia {p.jurisprudencia.numeroSentencia}
                          </strong>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                            {p.jurisprudencia.reglaJurisprudencial}
                          </p>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 text-[11px]">
                          Sin precedente jurisprudencial complementario registrado
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
