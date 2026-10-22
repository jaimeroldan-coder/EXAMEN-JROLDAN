import React from 'react';
import {
  Award,
  TrendingUp,
  Clock,
  Target,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  BrainCircuit,
  BarChart2,
  Calendar,
} from 'lucide-react';
import { useSimulator } from '../context/SimulatorContext';
import { MetaPedagogicaSeguridadAciertos, PuntajeMinimoAprobacion } from './constants';

export const AnalyticsView: React.FC = () => {
  const { historialIntentos, itemsRepaso, preguntas } = useSimulator();

  const entregados = historialIntentos.filter((it) => it.entregado);
  const totalIntentos = entregados.length;

  if (totalIntentos === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
          <BarChart2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100">
          Sin Historial de Evaluaciones
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Complete su primer simulacro para visualizar el promedio general, análisis por materia y subtemas débiles, evolución temporal y la curva de repaso espaciado.
        </p>
      </div>
    );
  }

  // Cálculos de métricas
  const puntajes = entregados.map((it) => it.puntajeObtenido || 0);
  const promedioGeneral = (puntajes.reduce((a, b) => a + b, 0) / totalIntentos).toFixed(2);
  const mejorPuntaje = Math.max(...puntajes).toFixed(2);
  const ultimoPuntaje = (entregados[0]?.puntajeObtenido || 0).toFixed(2);

  // Rendimiento por materia
  const materiasStats: Record<string, { total: number; correctas: number }> = {};
  const subtemasStats: Record<string, { total: number; correctas: number; materia: string }> = {};

  // Rastreo de preguntas falladas repetidamente
  const fallosPorPregunta: Record<string, { fallos: number; aciertos: number; enunciado: string; materia: string }> = {};

  entregados.forEach((it) => {
    it.preguntasSnapshot.forEach((ps, idx) => {
      const resp = it.respuestasUsuario[idx];
      const acerto = resp === ps.respuestaCorrecta;

      // Materia
      if (!materiasStats[ps.materia]) materiasStats[ps.materia] = { total: 0, correctas: 0 };
      materiasStats[ps.materia].total++;
      if (acerto) materiasStats[ps.materia].correctas++;

      // Subtema
      if (!subtemasStats[ps.subtema])
        subtemasStats[ps.subtema] = { total: 0, correctas: 0, materia: ps.materia };
      subtemasStats[ps.subtema].total++;
      if (acerto) subtemasStats[ps.subtema].correctas++;

      // Fallos
      if (!fallosPorPregunta[ps.preguntaOriginalId]) {
        fallosPorPregunta[ps.preguntaOriginalId] = {
          fallos: 0,
          aciertos: 0,
          enunciado: ps.enunciado,
          materia: ps.materia,
        };
      }
      if (acerto) {
        fallosPorPregunta[ps.preguntaOriginalId].aciertos++;
      } else {
        fallosPorPregunta[ps.preguntaOriginalId].fallos++;
      }
    });
  });

  // Temas fuertes (>=80%) vs débiles (<60%)
  const temasFuertes = Object.entries(subtemasStats)
    .filter(([_, d]) => d.total >= 2 && d.correctas / d.total >= 0.8)
    .map(([subtema, d]) => ({ subtema, pct: Math.round((d.correctas / d.total) * 100), ...d }));

  const temasDebiles = Object.entries(subtemasStats)
    .filter(([_, d]) => d.total >= 1 && d.correctas / d.total < 0.7)
    .map(([subtema, d]) => ({ subtema, pct: Math.round((d.correctas / d.total) * 100), ...d }));

  const falladasRepetidamente = Object.entries(fallosPorPregunta)
    .filter(([_, d]) => d.fallos >= 2)
    .sort((a, b) => b[1].fallos - a[1].fallos);

  const dominadas = itemsRepaso.filter((item) => item.nivel >= 3);

  // Niveles de repaso espaciado
  const nivel0 = itemsRepaso.filter((i) => i.nivel === 0).length;
  const nivel1 = itemsRepaso.filter((i) => i.nivel === 1).length;
  const nivel2 = itemsRepaso.filter((i) => i.nivel === 2).length;
  const nivel3 = itemsRepaso.filter((i) => i.nivel === 3).length;
  const nivel4 = itemsRepaso.filter((i) => i.nivel === 4).length;
  const nivel5 = itemsRepaso.filter((i) => i.nivel === 5).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Encabezado */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>Panel Pedagógico y Analítica Predictiva</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white mt-1">
          Análisis del Aprendizaje Jurídico
        </h2>
        <p className="text-xs text-slate-500">
          Monitoreo longitudinal de aciertos, cobertura dogmática y curvas de retención espaciada.
        </p>
      </div>

      {/* Tarjetas Principales de Desempeño */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Promedio General</span>
          <div className="text-3xl font-bold font-serif text-slate-900 dark:text-white">
            {promedioGeneral}
            <span className="text-sm font-sans text-slate-400"> / 50</span>
          </div>
          <span className="text-[11px] text-slate-400 block">{totalIntentos} intentos completados</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Mejor Puntaje</span>
          <div className="text-3xl font-bold font-serif text-emerald-600 dark:text-emerald-400">
            {mejorPuntaje}
            <span className="text-sm font-sans text-slate-400"> / 50</span>
          </div>
          <span className="text-[11px] text-slate-400 block">
            {Number(mejorPuntaje) >= PuntajeMinimoAprobacion ? 'Alcanzó umbral mínimo' : 'Pendiente umbral'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Último Resultado</span>
          <div className="text-3xl font-bold font-serif text-slate-900 dark:text-white">
            {ultimoPuntaje}
            <span className="text-sm font-sans text-slate-400"> / 50</span>
          </div>
          <span className="text-[11px] text-slate-400 block">
            {entregados[0]?.correctas || 0} aciertos registrados
          </span>
        </div>

        {/* Meta Pedagógica de Seguridad: 88 aciertos */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Meta Pedagógica</span>
            <span className="text-[10px] uppercase font-bold text-teal-600 bg-teal-50 dark:bg-teal-950 px-1.5 py-0.5 rounded">
              Seguridad
            </span>
          </div>
          <div className="text-3xl font-bold font-serif text-teal-600 dark:text-teal-400">
            {MetaPedagogicaSeguridadAciertos}+
            <span className="text-sm font-sans text-slate-400"> aciertos</span>
          </div>
          <span className="text-[10px] text-slate-500 leading-tight block">
            Meta pedagógica de seguridad recomendada para asegurar margen de confianza (no es requisito oficial).
          </span>
        </div>
      </section>

      {/* Histograma / Evolución Temporal */}
      <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              Evolución Histórica de Puntajes
            </h3>
            <p className="text-xs text-slate-500">
              Trayectoria de rendimiento a lo largo de los simulacros completados. Línea mínima: 40 puntos.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {entregados.slice(0, 10).map((it, idx) => {
            const puntaje = it.puntajeObtenido || 0;
            const pct = Math.min(100, (puntaje / 50) * 100);
            return (
              <div key={it.id} className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span className="font-medium">
                    Simulacro #{entregados.length - idx} (
                    {new Date(it.fechaInicio).toLocaleDateString('es-EC', {
                      day: '2-digit',
                      month: 'short',
                    })}
                    )
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {puntaje.toFixed(2)} pts ({it.correctas} aciertos)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full relative overflow-hidden">
                  {/* Línea de umbral mínimo 40 pts (80%) */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-500 z-10"
                    style={{ left: '80%' }}
                    title="Mínimo 40 puntos (80%)"
                  />
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      puntaje >= 40 ? 'bg-teal-600' : 'bg-rose-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Grid: Temas Fuertes vs Temas Débiles */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temas Fuertes */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
              Subtemas con Mayor Dominio (&ge;80% aciertos)
            </h3>
          </div>
          {temasFuertes.length > 0 ? (
            <div className="space-y-2">
              {temasFuertes.slice(0, 6).map((t, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 text-xs flex justify-between items-center"
                >
                  <div className="pr-2">
                    <strong className="text-slate-900 dark:text-slate-100 block">{t.subtema}</strong>
                    <span className="text-[10px] text-slate-500">{t.materia}</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                    {t.pct}% ({t.correctas}/{t.total})
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-4">
              Realice más intentos para consolidar subtemas de alta retención.
            </p>
          )}
        </div>

        {/* Temas Débiles */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
              Subtemas Prioritarios de Refuerzo (&lt;70% aciertos)
            </h3>
          </div>
          {temasDebiles.length > 0 ? (
            <div className="space-y-2">
              {temasDebiles.slice(0, 6).map((t, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 text-xs flex justify-between items-center"
                >
                  <div className="pr-2">
                    <strong className="text-slate-900 dark:text-slate-100 block">{t.subtema}</strong>
                    <span className="text-[10px] text-slate-500">{t.materia}</span>
                  </div>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-400 shrink-0">
                    {t.pct}% ({t.correctas}/{t.total})
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-4">
              No se han detectado debilidades recurrentes en los intentos evaluados.
            </p>
          )}
        </div>
      </section>

      {/* Repaso Espaciado y Preguntas Falladas Repetidamente */}
      <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-teal-600" />
              Algoritmo de Repaso Espaciado y Retención a Largo Plazo
            </h3>
            <p className="text-xs text-slate-500">
              Escalonamiento progresivo: Nivel 0 (siguiente sesión) &rarr; Nivel 1 (1 día) &rarr; Nivel 2 (3 días) &rarr; Nivel 3 (7 días) &rarr; Nivel 4 (14 días) &rarr; Nivel 5 (30 días).
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {dominadas.length} preguntas dominadas (Nivel &ge;3)
          </div>
        </div>

        {/* Tarjetas de Niveles */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 block">Nivel 0 (Hoy)</span>
            <strong className="text-lg font-bold text-rose-600">{nivel0}</strong>
            <span className="text-[10px] text-slate-400 block">Error reciente</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 block">Nivel 1 (1d)</span>
            <strong className="text-lg font-bold text-slate-800 dark:text-slate-200">{nivel1}</strong>
            <span className="text-[10px] text-slate-400 block">1 acierto</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 block">Nivel 2 (3d)</span>
            <strong className="text-lg font-bold text-slate-800 dark:text-slate-200">{nivel2}</strong>
            <span className="text-[10px] text-slate-400 block">2 aciertos</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 block">Nivel 3 (7d)</span>
            <strong className="text-lg font-bold text-teal-600">{nivel3}</strong>
            <span className="text-[10px] text-slate-400 block">3 aciertos</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 block">Nivel 4 (14d)</span>
            <strong className="text-lg font-bold text-teal-600">{nivel4}</strong>
            <span className="text-[10px] text-slate-400 block">4 aciertos</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 block">Nivel 5 (30d)</span>
            <strong className="text-lg font-bold text-emerald-600">{nivel5}</strong>
            <span className="text-[10px] text-slate-400 block">Consolidada</span>
          </div>
        </div>

        {/* Preguntas Falladas Repetidamente */}
        {falladasRepetidamente.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-xs uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Preguntas Falladas Repetidamente en Simulacros
            </h4>
            <div className="space-y-2">
              {falladasRepetidamente.slice(0, 5).map(([id, d]) => (
                <div
                  key={id}
                  className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 text-xs flex justify-between items-center gap-3"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">{id} • {d.materia}</span>
                    <p className="font-serif text-slate-900 dark:text-slate-100 line-clamp-1">{d.enunciado}</p>
                  </div>
                  <span className="font-bold text-rose-700 dark:text-rose-400 shrink-0 font-mono">
                    {d.fallos} fallos
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
