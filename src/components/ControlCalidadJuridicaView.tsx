import React, { useMemo, useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Clock,
  ExternalLink,
  UserCheck,
  UserX,
  FileText,
  Download,
  Eye,
  Edit3,
  Sparkles,
  Layers,
  ChevronRight,
  BookOpen,
  Info,
  X,
  Copy,
  AlertOctagon,
} from 'lucide-react';
import { useSimulator } from '../context/SimulatorContext';
import { Pregunta, EstadoPregunta } from '../types';
import { dbService } from '../services/db';
import {
  FiltroCalidadJuridica,
  esUrlFuenteOficial,
  esPreguntaSinFuente,
  esPreguntaConFuenteNoOficial,
  esPreguntaSinFechaConsulta,
  esPreguntaPosiblementeDesactualizada,
  esPreguntaSinExplicacion,
  esPreguntaConMasDeUnaRespuestaDefendible,
  esPreguntaNuncaRevisadaPorPersona,
  detectarDuplicadosPregunta,
  filtrarPreguntasPorCalidad,
} from '../services/qualityControl';
import { MATERIAS_DEFINICION } from '../services/curriculum';
import { validarPreguntaParaAprobacion } from '../services/validator';

export const ControlCalidadJuridicaView: React.FC = () => {
  const { preguntas, recargarDatos } = useSimulator();

  // Estados de filtrado
  const [filtroActivo, setFiltroActivo] = useState<FiltroCalidadJuridica>('todas');
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<string>('todas');
  const [terminoBusqueda, setTerminoBusqueda] = useState<string>('');

  // Modal de auditoría humana individual
  const [preguntaEnAuditoria, setPreguntaEnAuditoria] = useState<Pregunta | null>(null);
  const [nombreAuditor, setNombreAuditor] = useState<string>(() => {
    return localStorage.getItem('sje_auditor_nombre') || 'Dr. Jaime Roldán (Escuela de la Función Judicial)';
  });
  const [notaAuditor, setNotaAuditor] = useState<string>('');
  const [feedbackAccion, setFeedbackAccion] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  // Mapa de duplicados precalculado para todas las preguntas
  const mapaDuplicados = useMemo(() => {
    const mapa = new Map<string, string[]>();
    for (const p of preguntas) {
      const dups = detectarDuplicadosPregunta(p, preguntas);
      mapa.set(p.id, dups);
    }
    return mapa;
  }, [preguntas]);

  // Contadores de cada filtro
  const conteos = useMemo(() => {
    return {
      todas: preguntas.length,
      sin_fuente: preguntas.filter(esPreguntaSinFuente).length,
      fuente_no_oficial: preguntas.filter(esPreguntaConFuenteNoOficial).length,
      sin_fecha_consulta: preguntas.filter(esPreguntaSinFechaConsulta).length,
      posiblemente_desactualizadas: preguntas.filter(esPreguntaPosiblementeDesactualizada).length,
      sin_explicacion: preguntas.filter(esPreguntaSinExplicacion).length,
      mas_de_una_respuesta_defendible: preguntas.filter(esPreguntaConMasDeUnaRespuestaDefendible).length,
      nunca_revisadas_persona: preguntas.filter(esPreguntaNuncaRevisadaPorPersona).length,
    };
  }, [preguntas]);

  // Filtrado final de preguntas
  const preguntasFiltradas = useMemo(() => {
    let res = filtrarPreguntasPorCalidad(preguntas, filtroActivo);

    if (materiaSeleccionada !== 'todas') {
      res = res.filter((p) => p.materia === materiaSeleccionada);
    }

    if (terminoBusqueda.trim()) {
      const q = terminoBusqueda.toLowerCase();
      res = res.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.enunciado.toLowerCase().includes(q) ||
          p.materia.toLowerCase().includes(q) ||
          p.subtema.toLowerCase().includes(q) ||
          p.fuente?.norma?.toLowerCase().includes(q) ||
          p.fuente?.articulo?.toLowerCase().includes(q) ||
          p.fuente?.urlOficial?.toLowerCase().includes(q)
      );
    }

    return res;
  }, [preguntas, filtroActivo, materiaSeleccionada, terminoBusqueda]);

  // Manejo de aprobación humana (REGLA: NUNCA AUTOMÁTICA)
  const handleAprobarPorPersona = async (p: Pregunta) => {
    // Validar rigurosamente que cumpla con todos los criterios para ser validada
    const val = validarPreguntaParaAprobacion(p, preguntas);
    if (!val.esValida) {
      setFeedbackAccion({
        tipo: 'error',
        texto: `No se puede validar: existen impedimentos jurídicos (${val.errores.join('; ')}).`,
      });
      return;
    }

    const ahora = new Date().toISOString();
    localStorage.setItem('sje_auditor_nombre', nombreAuditor);

    const preguntaActualizada: Pregunta = {
      ...p,
      estado: 'validada',
      revisadaPorHumano: true,
      revisadoPor: nombreAuditor.trim() || 'Auditor Jurídico EFJ',
      ultimaRevision: ahora,
      observaciones: notaAuditor.trim()
        ? `${p.observaciones ? `${p.observaciones} | ` : ''}Revisión humana (${ahora.split('T')[0]}): ${notaAuditor.trim()}`
        : p.observaciones,
      fechaActualizacion: ahora,
    };

    await dbService.savePregunta(preguntaActualizada);
    await recargarDatos();
    setPreguntaEnAuditoria(null);
    setNotaAuditor('');
    setFeedbackAccion({
      tipo: 'ok',
      texto: `Pregunta ${p.id} aprobada y certificada como 'validada' por ${preguntaActualizada.revisadoPor}.`,
    });
  };

  const handleCambiarEstadoAuditoria = async (p: Pregunta, nuevoEstado: EstadoPregunta) => {
    const ahora = new Date().toISOString();
    localStorage.setItem('sje_auditor_nombre', nombreAuditor);

    const preguntaActualizada: Pregunta = {
      ...p,
      estado: nuevoEstado,
      revisadaPorHumano: true,
      revisadoPor: nombreAuditor.trim() || 'Auditor Jurídico EFJ',
      ultimaRevision: ahora,
      observaciones: notaAuditor.trim()
        ? `${p.observaciones ? `${p.observaciones} | ` : ''}Auditoría (${ahora.split('T')[0]} - ${nuevoEstado}): ${notaAuditor.trim()}`
        : p.observaciones,
      fechaActualizacion: ahora,
    };

    await dbService.savePregunta(preguntaActualizada);
    await recargarDatos();
    setPreguntaEnAuditoria(null);
    setNotaAuditor('');
    setFeedbackAccion({
      tipo: 'ok',
      texto: `Pregunta ${p.id} actualizada con estado '${nuevoEstado}'.`,
    });
  };

  // Exportar reporte de calidad a CSV
  const handleExportarReporteCSV = () => {
    const cabeceras = [
      'ID',
      'Materia',
      'Subtema',
      'Estado',
      'Norma',
      'Articulo',
      'FechaConsulta',
      'VigenciaVerificada',
      'URLOficial',
      'EsURLOficial',
      'TieneExplicacion',
      'PosiblesAmbiguedades',
      'PosiblesDuplicados',
      'RevisadaPorHumano',
      'UltimaRevision',
    ];

    const filas = preguntasFiltradas.map((p) => {
      const dups = mapaDuplicados.get(p.id) || [];
      const tieneExp = Boolean(p.explicacion && p.explicacion.trim().length >= 5);
      const amb = (p.posiblesAmbiguedades || []).join('; ');
      const esOficial = esUrlFuenteOficial(p.fuente?.urlOficial);

      return [
        `"${p.id}"`,
        `"${(p.materia || '').replace(/"/g, '""')}"`,
        `"${(p.subtema || '').replace(/"/g, '""')}"`,
        `"${p.estado}"`,
        `"${(p.fuente?.norma || '').replace(/"/g, '""')}"`,
        `"${(p.fuente?.articulo || '').replace(/"/g, '""')}"`,
        `"${p.fuente?.fechaConsulta || ''}"`,
        `"${p.fuente?.vigenciaVerificada ? 'SI' : 'NO'}"`,
        `"${(p.fuente?.urlOficial || '').replace(/"/g, '""')}"`,
        `"${esOficial ? 'SI' : 'NO'}"`,
        `"${tieneExp ? 'SI' : 'NO'}"`,
        `"${amb.replace(/"/g, '""')}"`,
        `"${dups.join('; ')}"`,
        `"${p.revisadaPorHumano ? 'SI' : 'NO'}"`,
        `"${p.ultimaRevision || 'Nunca'}"`,
      ].join(',');
    });

    const csvContent = [cabeceras.join(','), ...filas].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `control_calidad_juridica_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Encabezado Institucional de Control de Calidad */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Auditoría de Reactivos — Escuela de la Función Judicial</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white mt-1">
            Control de Calidad Jurídica
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Verificación estricta de fuentes normativas vigentes, trazabilidad oficial, ausencia de ambigüedad y revisión humana obligatoria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportarReporteCSV}
            className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Exportar Informe ({preguntasFiltradas.length})</span>
          </button>
        </div>
      </div>

      {/* Banner Informativo de Regla Imperativa */}
      <div className="bg-slate-900 text-slate-200 rounded-xl p-4 border border-slate-800 flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">
            Regla de Garantía Constitucional e Integridad: No cambio automático a “validada”
          </p>
          <p className="text-slate-400 leading-relaxed">
            Ninguna pregunta ingresada por importación o generada por el Asistente Gemini puede adquirir la categoría “validada” de forma automática.
            Cada reactivo requiere la intervención de un revisor humano que examine la norma, el artículo y la unicidad de la solución.
          </p>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {feedbackAccion && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center justify-between ${
            feedbackAccion.tipo === 'ok'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
          }`}
        >
          <span>{feedbackAccion.texto}</span>
          <button onClick={() => setFeedbackAccion(null)} className="p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* FILTROS RÁPIDOS OBLIGATORIOS (Pills con contadores exactos) */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Filtros de Auditoría y Localización de Inconsistencias:
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setFiltroActivo('todas')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 border ${
              filtroActivo === 'todas'
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
            }`}
          >
            <span>Todas</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold">
              {conteos.todas}
            </span>
          </button>

          <button
            onClick={() => setFiltroActivo('sin_fuente')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 border ${
              filtroActivo === 'sin_fuente'
                ? 'bg-rose-700 text-white border-rose-700'
                : 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Preguntas sin fuente</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 font-mono font-bold">
              {conteos.sin_fuente}
            </span>
          </button>

          <button
            onClick={() => setFiltroActivo('fuente_no_oficial')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 border ${
              filtroActivo === 'fuente_no_oficial'
                ? 'bg-amber-700 text-white border-amber-700'
                : 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Fuente no oficial</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-mono font-bold">
              {conteos.fuente_no_oficial}
            </span>
          </button>

          <button
            onClick={() => setFiltroActivo('sin_fecha_consulta')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 border ${
              filtroActivo === 'sin_fecha_consulta'
                ? 'bg-indigo-700 text-white border-indigo-700'
                : 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Sin fecha de consulta</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 font-mono font-bold">
              {conteos.sin_fecha_consulta}
            </span>
          </button>

          <button
            onClick={() => setFiltroActivo('posiblemente_desactualizadas')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 border ${
              filtroActivo === 'posiblemente_desactualizadas'
                ? 'bg-orange-700 text-white border-orange-700'
                : 'bg-white dark:bg-slate-900 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-900/60 hover:bg-orange-50 dark:hover:bg-orange-950/40'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Posiblemente desactualizadas</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-200 font-mono font-bold">
              {conteos.posiblemente_desactualizadas}
            </span>
          </button>

          <button
            onClick={() => setFiltroActivo('sin_explicacion')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 border ${
              filtroActivo === 'sin_explicacion'
                ? 'bg-purple-700 text-white border-purple-700'
                : 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/60 hover:bg-purple-50 dark:hover:bg-purple-950/40'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Sin explicación</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 font-mono font-bold">
              {conteos.sin_explicacion}
            </span>
          </button>

          <button
            onClick={() => setFiltroActivo('mas_de_una_respuesta_defendible')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 border ${
              filtroActivo === 'mas_de_una_respuesta_defendible'
                ? 'bg-red-800 text-white border-red-800'
                : 'bg-white dark:bg-slate-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>&gt;1 respuesta defendible (ambiguas)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200 font-mono font-bold">
              {conteos.mas_de_una_respuesta_defendible}
            </span>
          </button>

          <button
            onClick={() => setFiltroActivo('nunca_revisadas_persona')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 border ${
              filtroActivo === 'nunca_revisadas_persona'
                ? 'bg-teal-800 text-white border-teal-800'
                : 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-900/60 hover:bg-teal-50 dark:hover:bg-teal-950/40'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            <span>Nunca revisadas por persona</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 font-mono font-bold">
              {conteos.nunca_revisadas_persona}
            </span>
          </button>
        </div>
      </div>

      {/* Controles de Búsqueda y Materia */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <div className="relative sm:col-span-2">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            placeholder="Buscar por ID, norma, artículo, URL, texto..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100"
          />
        </div>

        <select
          value={materiaSeleccionada}
          onChange={(e) => setMateriaSeleccionada(e.target.value)}
          className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100"
        >
          <option value="todas">Todas las materias curriculares</option>
          {Object.keys(MATERIAS_DEFINICION).map((m) => (
            <option key={m} value={m} className="bg-slate-800 text-white">
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* TABLA PRINCIPAL DE CONTROL DE CALIDAD JURÍDICA */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold text-[11px]">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Materia / Subtema</th>
                <th className="p-3 text-center">Estado</th>
                <th className="p-3">Norma y Artículo</th>
                <th className="p-3">Fecha Consulta</th>
                <th className="p-3 text-center">Vigencia Verificada</th>
                <th className="p-3">URL Oficial</th>
                <th className="p-3 text-center">Explicación</th>
                <th className="p-3">Posibles Ambigüedades</th>
                <th className="p-3 text-center">Posibles Duplicados</th>
                <th className="p-3">Última Revisión</th>
                <th className="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {preguntasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-12 text-center text-slate-400">
                    <ShieldAlert className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-medium">No hay preguntas que coincidan con el filtro seleccionado.</p>
                    <p className="text-[11px] mt-1">Intente cambiar de filtro o restablecer los términos de búsqueda.</p>
                  </td>
                </tr>
              ) : (
                preguntasFiltradas.map((p) => {
                  const dups = mapaDuplicados.get(p.id) || [];
                  const tieneFuente = Boolean(p.fuente?.norma && p.fuente?.articulo);
                  const esOficial = esUrlFuenteOficial(p.fuente?.urlOficial);
                  const tieneExplicacion = Boolean(p.explicacion && p.explicacion.trim().length >= 5);
                  const tieneAmbiguedad =
                    (p.posiblesAmbiguedades && p.posiblesAmbiguedades.length > 0) ||
                    (p.observaciones && p.observaciones.toLowerCase().includes('ambig'));

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* 1. ID */}
                      <td className="p-3 font-mono font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {p.id}
                        {p.esDemostracion && (
                          <span className="block text-[9px] font-sans text-amber-500 font-bold">
                            DEMO
                          </span>
                        )}
                      </td>

                      {/* 2. Materia / Subtema */}
                      <td className="p-3 max-w-[180px]">
                        <strong className="block text-slate-900 dark:text-slate-100 truncate">
                          {p.materia}
                        </strong>
                        <span className="text-[11px] text-slate-400 truncate block">
                          {p.subtema}
                        </span>
                      </td>

                      {/* 3. Estado */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            p.estado === 'validada'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                              : p.estado === 'observada'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
                              : p.estado === 'desactualizada'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300'
                          }`}
                        >
                          {p.estado}
                        </span>
                      </td>

                      {/* 4. Norma y Artículo */}
                      <td className="p-3 max-w-[190px]">
                        {tieneFuente ? (
                          <>
                            <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                              {p.fuente.norma}
                            </div>
                            <div className="text-[11px] font-mono text-teal-600 dark:text-teal-400">
                              {p.fuente.articulo}
                            </div>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-[11px]">
                            <XCircle className="w-3.5 h-3.5" />
                            Sin fuente registrada
                          </span>
                        )}
                      </td>

                      {/* 5. Fecha de consulta */}
                      <td className="p-3 whitespace-nowrap font-mono text-[11px]">
                        {p.fuente?.fechaConsulta ? (
                          <span className="text-slate-700 dark:text-slate-300">
                            {p.fuente.fechaConsulta}
                          </span>
                        ) : (
                          <span className="text-rose-500 font-semibold">Sin fecha</span>
                        )}
                      </td>

                      {/* 6. Vigencia verificada */}
                      <td className="p-3 text-center whitespace-nowrap">
                        {p.fuente?.vigenciaVerificada ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Vigente</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>No verificada</span>
                          </span>
                        )}
                      </td>

                      {/* 7. URL Oficial */}
                      <td className="p-3 max-w-[160px] text-[11px]">
                        {p.fuente?.urlOficial ? (
                          <div className="flex items-center gap-1">
                            {esOficial ? (
                              <span className="text-emerald-600 font-bold text-[10px] uppercase">
                                [Oficial]
                              </span>
                            ) : (
                              <span className="text-amber-600 font-bold text-[10px] uppercase">
                                [No oficial]
                              </span>
                            )}
                            <a
                              href={p.fuente.urlOficial}
                              target="_blank"
                              rel="noreferrer"
                              className="text-teal-600 dark:text-teal-400 hover:underline truncate block"
                              title={p.fuente.urlOficial}
                            >
                              {p.fuente.urlOficial.replace('https://', '').replace('http://', '')}
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No registrada</span>
                        )}
                      </td>

                      {/* 8. Existencia de explicación */}
                      <td className="p-3 text-center whitespace-nowrap">
                        {tieneExplicacion ? (
                          <span
                            className="inline-flex items-center gap-1 text-emerald-600 font-semibold"
                            title={p.explicacion}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Sí</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>No</span>
                          </span>
                        )}
                      </td>

                      {/* 9. Posibles ambigüedades */}
                      <td className="p-3 max-w-[180px] text-[11px]">
                        {tieneAmbiguedad ? (
                          <div className="text-red-600 dark:text-red-400 flex items-start gap-1 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">
                              {(p.posiblesAmbiguedades && p.posiblesAmbiguedades.length > 0)
                                ? p.posiblesAmbiguedades.join('; ')
                                : p.observaciones}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Sin ambigüedades</span>
                        )}
                      </td>

                      {/* 10. Posibles duplicados */}
                      <td className="p-3 text-center whitespace-nowrap text-[11px]">
                        {dups.length > 0 ? (
                          <span
                            className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold"
                            title={`Posible duplicado de: ${dups.join(', ')}`}
                          >
                            {dups.length} {dups.length === 1 ? 'coincidencia' : 'coincidencias'}
                          </span>
                        ) : (
                          <span className="text-slate-400">Ninguno</span>
                        )}
                      </td>

                      {/* 11. Última revisión */}
                      <td className="p-3 max-w-[160px] text-[11px] text-slate-600 dark:text-slate-300">
                        {p.revisadaPorHumano && p.ultimaRevision ? (
                          <div>
                            <div className="font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                              <UserCheck className="w-3 h-3" />
                              <span>{p.revisadoPor || 'Humano'}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {p.ultimaRevision.split('T')[0]}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400">
                            <UserX className="w-3 h-3" />
                            <span>Nunca revisada</span>
                          </span>
                        )}
                      </td>

                      {/* 12. Acción: Auditar Reactivo */}
                      <td className="p-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setPreguntaEnAuditoria(p);
                            setNotaAuditor('');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold flex items-center gap-1 ml-auto shadow-sm"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Auditar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE AUDITORÍA JURÍDICA Y APROBACIÓN HUMANA */}
      {preguntaEnAuditoria && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto text-xs">
            <button
              onClick={() => setPreguntaEnAuditoria(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Auditoría Jurídica Presencial y Aprobación Humana</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                Revisión del Reactivo: {preguntaEnAuditoria.id}
              </h3>
              <p className="text-[11px] text-slate-500">
                Estado actual: <strong className="uppercase">{preguntaEnAuditoria.estado}</strong> | Materia:{' '}
                {preguntaEnAuditoria.materia}
              </p>
            </div>

            {/* Enunciado y Opciones */}
            <div className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                {preguntaEnAuditoria.enunciado}
              </div>

              <div className="space-y-1.5">
                {preguntaEnAuditoria.alternativas.map((alt) => (
                  <div
                    key={alt.id}
                    className={`p-2.5 rounded-lg text-xs flex items-center gap-2.5 border ${
                      alt.id === preguntaEnAuditoria.respuestaCorrecta
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 text-emerald-900 dark:text-emerald-200 font-semibold'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">
                      {alt.id}
                    </span>
                    <span>{alt.texto}</span>
                    {alt.id === preguntaEnAuditoria.respuestaCorrecta && (
                      <span className="ml-auto text-[10px] font-bold text-emerald-700 uppercase">
                        Correcta
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Explicación y Fuente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-1.5">
                <strong className="block text-slate-900 dark:text-white font-semibold">
                  Explicación y Justificación:
                </strong>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  {preguntaEnAuditoria.explicacion || (
                    <span className="text-rose-500 font-bold">Sin explicación registrada.</span>
                  )}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-1.5">
                <strong className="block text-slate-900 dark:text-white font-semibold">
                  Soporte Normativo:
                </strong>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                  <div>
                    <strong>Norma:</strong> {preguntaEnAuditoria.fuente?.norma || 'No registrada'}
                  </div>
                  <div>
                    <strong>Artículo:</strong> {preguntaEnAuditoria.fuente?.articulo || 'No registrado'}
                  </div>
                  <div>
                    <strong>Fecha Consulta:</strong>{' '}
                    {preguntaEnAuditoria.fuente?.fechaConsulta || 'No registrada'}
                  </div>
                  <div>
                    <strong>Vigencia Verificada:</strong>{' '}
                    {preguntaEnAuditoria.fuente?.vigenciaVerificada ? 'Sí' : 'No'}
                  </div>
                  <div>
                    <strong>URL Oficial:</strong>{' '}
                    <span className="break-all">{preguntaEnAuditoria.fuente?.urlOficial || 'Ninguna'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Texto de Soporte transcrito */}
            {preguntaEnAuditoria.fuente?.textoSoporte && (
              <div className="p-3 rounded-lg bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/40 text-[11px]">
                <strong className="text-teal-900 dark:text-teal-300 block mb-0.5">
                  Texto Legal Transcrito:
                </strong>
                <p className="font-mono text-slate-700 dark:text-slate-300 italic">
                  "{preguntaEnAuditoria.fuente.textoSoporte}"
                </p>
              </div>
            )}

            {/* Datos del Auditor y Observaciones */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Especialista Auditor Responsable:
                  </label>
                  <input
                    type="text"
                    value={nombreAuditor}
                    onChange={(e) => setNombreAuditor(e.target.value)}
                    placeholder="Nombre y cargo del auditor"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Observaciones Técnicas o Anotación de Auditoría:
                  </label>
                  <input
                    type="text"
                    value={notaAuditor}
                    onChange={(e) => setNotaAuditor(e.target.value)}
                    placeholder="Comentarios sobre vigencia, precisión, etc."
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* BOTONES DE DECISIÓN HUMANA EXPLÍCITA */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPreguntaEnAuditoria(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                Cerrar sin Cambios
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCambiarEstadoAuditoria(preguntaEnAuditoria, 'observada')}
                  className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                >
                  Marcar como Observada
                </button>

                <button
                  type="button"
                  onClick={() => handleCambiarEstadoAuditoria(preguntaEnAuditoria, 'desactualizada')}
                  className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                >
                  Marcar Desactualizada
                </button>

                <button
                  type="button"
                  onClick={() => handleCambiarEstadoAuditoria(preguntaEnAuditoria, 'borrador')}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  Mantener en Borrador
                </button>

                <button
                  type="button"
                  onClick={() => handleAprobarPorPersona(preguntaEnAuditoria)}
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aprobar y Validar por Persona</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
