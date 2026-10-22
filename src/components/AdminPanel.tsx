import React, { useState } from 'react';
import {
  Settings,
  Shield,
  KeyRound,
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Edit2,
  Copy,
  Trash2,
  Sparkles,
  FileText,
  FileSpreadsheet,
  RefreshCw,
  Database,
  Lock,
  Layers,
  Save,
  X,
  ExternalLink,
} from 'lucide-react';
import { useSimulator } from '../context/SimulatorContext';
import {
  AlternativaId,
  Dificultad,
  EstadoPregunta,
  Pregunta,
  TipoPregunta,
} from '../types';
import { dbService } from '../services/db';
import {
  CSVFilaParseada,
  exportarPreguntasACSV,
  generarPlantillaCSV,
  procesarFilasCSV,
} from '../services/csvParser';
import { validarPreguntaParaAprobacion } from '../services/validator';
import { MATERIAS_DEFINICION } from '../services/curriculum';
import { AIAssistantModal } from './AIAssistantModal';
import { CargarBancoModal } from './CargarBancoModal';

export const AdminPanel: React.FC = () => {
  const {
    preguntas,
    recargarDatos,
    vaciarBancoCompleto,
    agregarPreguntasLote,
    eliminarDatosDemo,
    restaurarDatosDemo,
    autogenerarBancoCompleto,
  } = useSimulator();

  // Control de Acceso mediante PIN / Contraseña Administrador
  const [autenticado, setAutenticado] = useState<boolean>(() => {
    return sessionStorage.getItem('sje_admin_auth') === 'true';
  });
  const [pinIngresado, setPinIngresado] = useState('');
  const [errorPin, setErrorPin] = useState(false);
  const [mostrarCambioPin, setMostrarCambioPin] = useState(false);
  const [nuevoPin, setNuevoPin] = useState('');

  // Pestaña activa del Panel
  const [pestaña, setPestaña] = useState<'preguntas' | 'importar' | 'backup' | 'cobertura'>('preguntas');

  // Filtros y Búsqueda
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroMateria, setFiltroMateria] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroDificultad, setFiltroDificultad] = useState('todas');

  // Modales
  const [modalPregunta, setModalPregunta] = useState<Partial<Pregunta> | null>(null);
  const [modalIAAbierto, setModalIAAbierto] = useState(false);
  const [modalCargarBanco, setModalCargarBanco] = useState(false);
  const [mensajeFeedback, setMensajeFeedback] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  // Estado para Importación CSV
  const [csvTexto, setCsvTexto] = useState('');
  const [csvFilasProcesadas, setCsvFilasProcesadas] = useState<CSVFilaParseada[]>([]);
  const [csvPreviewActivo, setCsvPreviewActivo] = useState(false);

  // Manejo de PIN
  const pinActualConfigurado = localStorage.getItem('sje_admin_pin') || 'admin123';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinIngresado.trim() === pinActualConfigurado) {
      setAutenticado(true);
      sessionStorage.setItem('sje_admin_auth', 'true');
      setErrorPin(false);
    } else {
      setErrorPin(true);
    }
  };

  const handleCambiarPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevoPin.length >= 4) {
      localStorage.setItem('sje_admin_pin', nuevoPin);
      setMostrarCambioPin(false);
      setMensajeFeedback({ tipo: 'ok', texto: 'Clave administrativa actualizada correctamente.' });
    }
  };

  // Filtrado de preguntas
  const preguntasFiltradas = preguntas.filter((p) => {
    if (filtroMateria !== 'todas' && p.materia !== filtroMateria) return false;
    if (filtroEstado !== 'todas' && p.estado !== filtroEstado) return false;
    if (filtroDificultad !== 'todas' && p.dificultad !== filtroDificultad) return false;

    if (terminoBusqueda.trim()) {
      const q = terminoBusqueda.toLowerCase();
      const coincide =
        p.id.toLowerCase().includes(q) ||
        p.enunciado.toLowerCase().includes(q) ||
        p.materia.toLowerCase().includes(q) ||
        p.subtema.toLowerCase().includes(q) ||
        p.fuente?.norma?.toLowerCase().includes(q) ||
        p.fuente?.articulo?.toLowerCase().includes(q) ||
        p.jurisprudencia?.numeroSentencia?.toLowerCase().includes(q);
      if (!coincide) return false;
    }

    return true;
  });

  // Guardar pregunta desde el modal individual
  const handleGuardarPreguntaModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalPregunta) return;

    // Ejecutar validador
    const val = validarPreguntaParaAprobacion(modalPregunta, preguntas);

    if (modalPregunta.estado === 'validada' && !val.esValida) {
      setMensajeFeedback({
        tipo: 'error',
        texto: `No se puede validar la pregunta: ${val.errores.join('; ')}`,
      });
      return;
    }

    const ahora = new Date().toISOString();
    const preguntaDef: Pregunta = {
      id: modalPregunta.id || `P-${Date.now()}`,
      perfil: modalPregunta.perfil || ['penal', 'personalizado'],
      materia: modalPregunta.materia || 'Derecho Constitucional',
      subtema: modalPregunta.subtema || 'General',
      dificultad: (modalPregunta.dificultad || 'media') as Dificultad,
      tipo: (modalPregunta.tipo || 'normativa') as TipoPregunta,
      enunciado: modalPregunta.enunciado || '',
      alternativas: modalPregunta.alternativas || [
        { id: 'A', texto: '' },
        { id: 'B', texto: '' },
        { id: 'C', texto: '' },
        { id: 'D', texto: '' },
      ],
      respuestaCorrecta: modalPregunta.respuestaCorrecta || 'A',
      explicacion: modalPregunta.explicacion || '',
      explicacionDistractores: modalPregunta.explicacionDistractores || {},
      fuente: {
        norma: modalPregunta.fuente?.norma || '',
        articulo: modalPregunta.fuente?.articulo || '',
        textoSoporte: modalPregunta.fuente?.textoSoporte || '',
        urlOficial: modalPregunta.fuente?.urlOficial || '',
        fechaConsulta: modalPregunta.fuente?.fechaConsulta || ahora.split('T')[0],
        vigenciaVerificada: Boolean(modalPregunta.fuente?.vigenciaVerificada),
      },
      jurisprudencia: {
        numeroSentencia: modalPregunta.jurisprudencia?.numeroSentencia || '',
        organo: modalPregunta.jurisprudencia?.organo || '',
        reglaJurisprudencial: modalPregunta.jurisprudencia?.reglaJurisprudencial || '',
      },
      estado: (modalPregunta.estado || 'borrador') as EstadoPregunta,
      observaciones: modalPregunta.observaciones || '',
      fechaCreacion: modalPregunta.fechaCreacion || ahora,
      fechaActualizacion: ahora,
      esDemostracion: Boolean(modalPregunta.esDemostracion),
    };

    await dbService.savePregunta(preguntaDef);
    await recargarDatos();
    setModalPregunta(null);
    setMensajeFeedback({ tipo: 'ok', texto: 'Pregunta guardada exitosamente.' });
  };

  const handleEliminarPregunta = async (id: string) => {
    if (confirm(`¿Confirma eliminar definitivamente la pregunta ${id}?`)) {
      await dbService.deletePregunta(id);
      await recargarDatos();
      setMensajeFeedback({ tipo: 'ok', texto: `Pregunta ${id} eliminada.` });
    }
  };

  const handleDuplicarPregunta = async (p: Pregunta) => {
    const copia: Pregunta = {
      ...p,
      id: `${p.id}-COPIA`,
      estado: 'borrador', // Copias inician como borrador para revisión
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
    };
    await dbService.savePregunta(copia);
    await recargarDatos();
    setMensajeFeedback({ tipo: 'ok', texto: `Pregunta duplicada como borrador: ${copia.id}` });
  };

  // Manejo de CSV
  const handleCargarArchivoCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Únicamente se admiten archivos con extensión .csv');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo supera el límite permitido de 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvTexto(text);
      const res = procesarFilasCSV(text, preguntas);
      setCsvFilasProcesadas(res.filas);
      setCsvPreviewActivo(true);
    };
    reader.readAsText(file);
  };

  const handleConfirmarImportacionCSV = async () => {
    const validasParaGuardar = csvFilasProcesadas
      .filter((f) => f.esValida && f.pregunta)
      .map((f) => f.pregunta as Pregunta);

    if (validasParaGuardar.length === 0) {
      alert('No existen filas válidas para importar.');
      return;
    }

    await dbService.savePreguntasBatch(validasParaGuardar);
    await recargarDatos();
    setCsvPreviewActivo(false);
    setCsvTexto('');
    setCsvFilasProcesadas([]);
    setMensajeFeedback({
      tipo: 'ok',
      texto: `Se importaron satisfactoriamente ${validasParaGuardar.length} preguntas al banco.`,
    });
  };

  const handleDescargarInformeErroresCSV = () => {
    const filasConError = csvFilasProcesadas.filter((f) => !f.esValida);
    const lineas = ['fila,id,errores'];
    filasConError.forEach((f) => {
      lineas.push(`"${f.filaNumero}","${f.datosBrutos.id || ''}","${f.errores.join('; ').replace(/"/g, '""')}"`);
    });
    const blob = new Blob([lineas.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'informe_errores_importacion.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Manejo de Backup
  const handleDescargarBackup = async () => {
    const jsonStr = await dbService.exportarCopiaSeguridad();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_simulador_judicial_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestaurarBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const res = await dbService.restaurarCopiaSeguridad(text);
        await recargarDatos();
        setMensajeFeedback({
          tipo: 'ok',
          texto: `Copia de seguridad restaurada: ${res.preguntas} preguntas, ${res.intentos} intentos.`,
        });
      } catch (err: any) {
        setMensajeFeedback({ tipo: 'error', texto: err?.message || 'Error al restaurar.' });
      }
    };
    reader.readAsText(file);
  };

  // Si no está autenticado, mostrar pantalla de PIN
  if (!autenticado) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
              Acceso Administrativo Protegido
            </h2>
            <p className="text-xs text-slate-500">
              Ingrese la clave de seguridad institucional para gestionar reactivos y fuentes jurídicas.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                PIN / Contraseña de Administrador
              </label>
              <input
                type="password"
                value={pinIngresado}
                onChange={(e) => {
                  setPinIngresado(e.target.value);
                  setErrorPin(false);
                }}
                placeholder="Clave de acceso"
                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                autoFocus
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                (Por defecto inicial: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">admin123</code>; puede modificarla en ajustes)
              </span>
            </div>

            {errorPin && (
              <p className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2 rounded border border-rose-200 dark:border-rose-900">
                Clave incorrecta. Por favor intente de nuevo.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs transition-colors shadow"
            >
              Autenticar e Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Barra de Título y Acciones */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
            <Shield className="w-3.5 h-3.5" />
            <span>Gestión Curricular y Banco de Reactivos</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white mt-1">
            Panel de Control y Administración
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setModalIAAbierto(true)}
            className="px-3.5 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Asistente de Elaboración (IA)</span>
          </button>

          <button
            onClick={() => {
              setModalPregunta({
                id: `P-${Date.now()}`,
                perfil: ['penal', 'personalizado'],
                materia: 'Derecho Constitucional',
                subtema: 'Disposiciones comunes de las garantías jurisdiccionales',
                dificultad: 'media',
                tipo: 'normativa',
                enunciado: '',
                alternativas: [
                  { id: 'A', texto: '' },
                  { id: 'B', texto: '' },
                  { id: 'C', texto: '' },
                  { id: 'D', texto: '' },
                ],
                respuestaCorrecta: 'A',
                explicacion: '',
                explicacionDistractores: {},
                fuente: {
                  norma: '',
                  articulo: '',
                  textoSoporte: '',
                  urlOficial: '',
                  fechaConsulta: new Date().toISOString().split('T')[0],
                  vigenciaVerificada: true,
                },
                jurisprudencia: {},
                estado: 'borrador',
              });
            }}
            className="px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Pregunta</span>
          </button>

          <button
            onClick={() => setMostrarCambioPin(!mostrarCambioPin)}
            className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Cambiar PIN administrativo"
          >
            <KeyRound className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {mensajeFeedback && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center justify-between ${
            mensajeFeedback.tipo === 'ok'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300'
          }`}
        >
          <span>{mensajeFeedback.texto}</span>
          <button onClick={() => setMensajeFeedback(null)} className="p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Modal / Formulario Cambio PIN */}
      {mostrarCambioPin && (
        <form onSubmit={handleCambiarPin} className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs space-y-3">
          <div className="font-bold text-slate-800 dark:text-slate-200">
            Cambiar Clave Administrativa
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={nuevoPin}
              onChange={(e) => setNuevoPin(e.target.value)}
              placeholder="Nueva clave o PIN (mínimo 4 caracteres)"
              className="p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs flex-1 max-w-xs"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded font-semibold text-xs"
            >
              Guardar Clave
            </button>
            <button
              type="button"
              onClick={() => setMostrarCambioPin(false)}
              className="px-3 py-2 border rounded text-xs"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Pestañas del Panel */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setPestaña('preguntas')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            pestaña === 'preguntas'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Banco de Reactivos ({preguntas.length})
        </button>

        <button
          onClick={() => setPestaña('importar')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            pestaña === 'importar'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Importación CSV y JSON
        </button>

        <button
          onClick={() => setPestaña('cobertura')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            pestaña === 'cobertura'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Métricas y Cobertura de Materias
        </button>

        <button
          onClick={() => setPestaña('backup')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            pestaña === 'backup'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Copia de Seguridad y Restauración
        </button>
      </div>

      {/* PESTAÑA 1: BANCO DE PREGUNTAS */}
      {pestaña === 'preguntas' && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <div className="relative sm:col-span-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
                placeholder="Buscar por texto, norma, artículo..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
              />
            </div>

            <select
              value={filtroMateria}
              onChange={(e) => setFiltroMateria(e.target.value)}
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
            >
              <option value="todas">Todas las materias</option>
              {Object.keys(MATERIAS_DEFINICION).map((m) => (
                <option key={m} value={m} className="bg-slate-800 text-white">
                  {m}
                </option>
              ))}
            </select>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
            >
              <option value="todas">Todos los estados</option>
              <option value="validada">Validada (Habilitada oficial)</option>
              <option value="borrador">Borrador</option>
              <option value="pendiente_revision">Pendiente de revisión</option>
              <option value="observada">Observada</option>
              <option value="inactiva">Inactiva</option>
              <option value="desactualizada">Desactualizada</option>
            </select>

            <div className="flex items-center justify-between sm:justify-end gap-2">
              <button
                onClick={() => {
                  const csvData = exportarPreguntasACSV(preguntasFiltradas);
                  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `preguntas_export_${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Filtradas</span>
              </button>
            </div>
          </div>

          {/* Tabla de Preguntas */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-slate-500 font-semibold">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Materia / Subtema</th>
                    <th className="p-3">Enunciado</th>
                    <th className="p-3 text-center">Correcta</th>
                    <th className="p-3">Fuente Normativa</th>
                    <th className="p-3 text-center">Estado</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {preguntasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No se encontraron preguntas que coincidan con los criterios.
                      </td>
                    </tr>
                  ) : (
                    preguntasFiltradas.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {p.id}
                          {p.esDemostracion && (
                            <span className="block text-[9px] text-amber-500 font-sans font-bold">
                              DEMO
                            </span>
                          )}
                        </td>
                        <td className="p-3 max-w-[180px]">
                          <strong className="block truncate text-slate-900 dark:text-white">
                            {p.materia}
                          </strong>
                          <span className="text-[11px] text-slate-400 truncate block">
                            {p.subtema}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs sm:max-w-md">
                          <p className="line-clamp-2 font-serif text-slate-800 dark:text-slate-200">
                            {p.enunciado}
                          </p>
                        </td>
                        <td className="p-3 text-center">
                          <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold inline-flex items-center justify-center font-mono">
                            {p.respuestaCorrecta}
                          </span>
                        </td>
                        <td className="p-3 text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          <div>{p.fuente?.norma || 'Sin norma'}</div>
                          <div className="font-mono">{p.fuente?.articulo}</div>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              p.estado === 'validada'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : p.estado === 'observada'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {p.estado}
                          </span>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setModalPregunta(p)}
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-teal-600"
                              title="Editar pregunta"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicarPregunta(p)}
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                              title="Duplicar como borrador"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleEliminarPregunta(p.id)}
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: IMPORTACIÓN CSV Y JSON */}
      {pestaña === 'importar' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 text-xs">
          <div>
            <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-teal-600" />
              Importación Estructurada de Reactivos (CSV / JSON)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Importe bancos masivos con control estricto fila por fila, detección de duplicados e informe descargable de errores.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setModalCargarBanco(true)}
              className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold flex items-center gap-1.5 shadow"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Pegar Texto o JSON (4 opciones)</span>
            </button>

            <button
              onClick={() => {
                const csvTemplate = generarPlantillaCSV();
                const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'plantilla_simulador_judicial.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Plantilla CSV Oficial</span>
            </button>

            <label className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer flex items-center gap-1.5 shadow-sm">
              <Upload className="w-3.5 h-3.5" />
              <span>Cargar Archivo CSV</span>
              <input type="file" accept=".csv" onChange={handleCargarArchivoCSV} className="hidden" />
            </label>
          </div>

          {/* Vista Previa CSV */}
          {csvPreviewActivo && (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Vista Previa de Importación ({csvFilasProcesadas.length} filas analizadas)
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">
                    {csvFilasProcesadas.filter((f) => f.esValida).length} Válidas
                  </span>
                  <span>•</span>
                  <span className="text-rose-600 font-bold">
                    {csvFilasProcesadas.filter((f) => !f.esValida).length} Con Errores
                  </span>
                </div>
              </div>

              {/* Botón de Descargar Errores si existen */}
              {csvFilasProcesadas.some((f) => !f.esValida) && (
                <button
                  onClick={handleDescargarInformeErroresCSV}
                  className="text-rose-600 font-semibold underline hover:text-rose-800"
                >
                  Descargar informe de errores en CSV &rarr;
                </button>
              )}

              {/* Tabla de Vista Previa */}
              <div className="max-h-72 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 uppercase text-[10px] text-slate-500 font-bold">
                    <tr>
                      <th className="p-2.5">Fila</th>
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Materia</th>
                      <th className="p-2.5">Enunciado</th>
                      <th className="p-2.5 text-center">Correcta</th>
                      <th className="p-2.5">Diagnóstico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {csvFilasProcesadas.map((f) => (
                      <tr
                        key={f.filaNumero}
                        className={f.esValida ? 'bg-white dark:bg-slate-900' : 'bg-rose-50/50 dark:bg-rose-950/20'}
                      >
                        <td className="p-2.5 font-mono">{f.filaNumero}</td>
                        <td className="p-2.5 font-mono">{f.datosBrutos.id}</td>
                        <td className="p-2.5">{f.datosBrutos.materia}</td>
                        <td className="p-2.5 max-w-xs truncate">{f.datosBrutos.enunciado}</td>
                        <td className="p-2.5 text-center font-bold">{f.datosBrutos.respuesta_correcta}</td>
                        <td className="p-2.5">
                          {f.esValida ? (
                            <span className="text-emerald-600 font-bold">Correcto</span>
                          ) : (
                            <span className="text-rose-600">{f.errores.join('; ')}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setCsvPreviewActivo(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarImportacionCSV}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg shadow"
                >
                  Confirmar e Importar Filas Válidas
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 3: COBERTURA POR MATERIA */}
      {pestaña === 'cobertura' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 text-xs">
          <div>
            <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              Diagnóstico de Cobertura y Reactivos Validados
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Monitoreo del inventario para garantizar que los simulacros oficiales de 100 preguntas cuenten con sustento suficiente sin repeticiones artificiales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(MATERIAS_DEFINICION).map(([nombreMateria, def]) => {
              const validadas = preguntas.filter(
                (p) => p.materia === nombreMateria && p.estado === 'validada' && !p.esDemostracion
              ).length;
              const borradores = preguntas.filter(
                (p) => p.materia === nombreMateria && p.estado === 'borrador'
              ).length;

              return (
                <div
                  key={def.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{nombreMateria}</h4>
                      <span className="text-[11px] text-slate-400">{def.subtemas.length} subtemas normados</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                        validadas >= 15
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {validadas} validadas
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Borradores pendientes: {borradores}</span>
                    <span>Total en materia: {validadas + borradores}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Autogeneración de Banco Oficial EFJ */}
          <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <strong className="text-teal-950 dark:text-teal-200 block font-serif text-sm">
                Banco Oficial de la Escuela de la Función Judicial (EFJ)
              </strong>
              <span className="text-teal-700 dark:text-teal-300 text-[11px]">
                Cargue o reinstale los 402 reactivos oficiales validados (Constitucional, Penal, Procedimientos, Contravenciones, Violencia y Tránsito) para simulacros de 100 preguntas.
              </span>
            </div>
            <button
              onClick={async () => {
                await autogenerarBancoCompleto();
                setMensajeFeedback({ tipo: 'ok', texto: 'Banco oficial de 402 preguntas únicas cargado e instalado exitosamente.' });
              }}
              className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center gap-1.5 shadow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>⚡ Cargar Banco Oficial EFJ (402)</span>
            </button>
          </div>

          {/* Opciones de Banco Demo */}
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div>
              <strong className="text-slate-900 dark:text-white block font-serif">
                Reactivos de Demostración
              </strong>
              <span className="text-slate-500 text-[11px]">
                Elimine las preguntas demo una vez que cargue un banco oficial real.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => eliminarDatosDemo()}
                className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                Eliminar Datos de Prueba
              </button>
              <button
                onClick={() => restaurarDatosDemo()}
                className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Restaurar Demo
              </button>
            </div>
          </div>

          {/* Opción de Vaciar Banco de Preguntas Completo */}
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <strong className="text-rose-950 dark:text-rose-200 block font-serif text-sm">
                Vaciar Banco de Preguntas (Dejar en 0 reactivos)
              </strong>
              <span className="text-rose-700 dark:text-rose-300 text-[11px]">
                Elimine todas las preguntas para dejar el simulador limpio a la espera del nuevo banco con 4 opciones.
              </span>
            </div>
            <button
              onClick={async () => {
                if (window.confirm('¿Confirmar vaciado total del banco de preguntas? Todas las preguntas se eliminarán (0).')) {
                  await vaciarBancoCompleto();
                  setMensajeFeedback({ tipo: 'ok', texto: 'Banco de preguntas completamente vaciado (0 reactivos).' });
                }
              }}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar Banco de Preguntas</span>
            </button>
          </div>
        </div>
      )}

      {/* PESTAÑA 4: BACKUP Y RESTORE */}
      {pestaña === 'backup' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 text-xs">
          <div>
            <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-teal-600" />
              Copias de Seguridad y Restauración Local
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Guarde un archivo JSON completo con todo el banco de preguntas, historial inmutable de simulacros y progreso de repaso espaciado.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Exportar Respaldo</h4>
              <p className="text-slate-500">
                Descarga una instantánea íntegra en formato JSON compatible para migrar o resguardar sus preguntas.
              </p>
              <button
                onClick={handleDescargarBackup}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg shadow flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Archivo JSON de Backup</span>
              </button>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Restaurar Respaldo</h4>
              <p className="text-slate-500">
                Restaura preguntas e histórico a partir de un archivo JSON previamente exportado.
              </p>
              <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg shadow cursor-pointer inline-flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Seleccionar JSON para Restaurar</span>
                <input type="file" accept=".json" onChange={handleRestaurarBackup} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear / Editar Pregunta */}
      {modalPregunta && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleGuardarPreguntaModal}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto text-xs"
          >
            <button
              type="button"
              onClick={() => setModalPregunta(null)}
              className="absolute top-5 right-5 text-slate-400 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
                {modalPregunta.id ? `Editar Reactivo: ${modalPregunta.id}` : 'Crear Nuevo Reactivo'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Para asignar estado 'validada', todos los criterios institucionales deben cumplirse satisfactoriamente.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold block mb-1">Materia</label>
                <select
                  value={modalPregunta.materia || 'Derecho Constitucional'}
                  onChange={(e) => setModalPregunta({ ...modalPregunta, materia: e.target.value })}
                  className="w-full p-2 rounded border bg-transparent"
                >
                  {Object.keys(MATERIAS_DEFINICION).map((m) => (
                    <option key={m} value={m} className="bg-slate-800 text-white">
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Subtema</label>
                <input
                  type="text"
                  value={modalPregunta.subtema || ''}
                  onChange={(e) => setModalPregunta({ ...modalPregunta, subtema: e.target.value })}
                  placeholder="Subtema específico"
                  className="w-full p-2 rounded border bg-transparent"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Dificultad y Estado</label>
                <div className="flex gap-2">
                  <select
                    value={modalPregunta.dificultad || 'media'}
                    onChange={(e: any) =>
                      setModalPregunta({ ...modalPregunta, dificultad: e.target.value })
                    }
                    className="w-1/2 p-2 rounded border bg-transparent"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>

                  <select
                    value={modalPregunta.estado || 'borrador'}
                    onChange={(e: any) =>
                      setModalPregunta({ ...modalPregunta, estado: e.target.value })
                    }
                    className="w-1/2 p-2 rounded border bg-transparent"
                  >
                    <option value="borrador">Borrador</option>
                    <option value="pendiente_revision">Pendiente</option>
                    <option value="observada">Observada</option>
                    <option value="validada">Validada</option>
                    <option value="inactiva">Inactiva</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="font-bold block mb-1">Enunciado del Reactivo</label>
              <textarea
                rows={3}
                required
                value={modalPregunta.enunciado || ''}
                onChange={(e) => setModalPregunta({ ...modalPregunta, enunciado: e.target.value })}
                placeholder="Redacte un enunciado claro y autosuficiente. Si usa NO o EXCEPTO, destáquelo en mayúsculas..."
                className="w-full p-2.5 rounded border bg-transparent font-serif"
              />
            </div>

            {/* Alternativas */}
            <div className="space-y-2">
              <label className="font-bold block">
                Alternativas (Seleccione el botón circular de la respuesta correcta)
              </label>
              {(['A', 'B', 'C', 'D'] as AlternativaId[]).map((letra, idx) => {
                const altTexto = modalPregunta.alternativas?.[idx]?.texto || '';
                const esCorrecta = modalPregunta.respuestaCorrecta === letra;
                return (
                  <div key={letra} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModalPregunta({ ...modalPregunta, respuestaCorrecta: letra })}
                      className={`w-7 h-7 rounded-full font-bold flex items-center justify-center shrink-0 ${
                        esCorrecta
                          ? 'bg-teal-700 text-white ring-2 ring-teal-500'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {letra}
                    </button>
                    <input
                      type="text"
                      required
                      value={altTexto}
                      onChange={(e) => {
                        const nuevasAlts = [...(modalPregunta.alternativas || [])];
                        nuevasAlts[idx] = { id: letra, texto: e.target.value };
                        setModalPregunta({ ...modalPregunta, alternativas: nuevasAlts as any });
                      }}
                      placeholder={`Alternativa ${letra}`}
                      className="flex-1 p-2 rounded border bg-transparent"
                    />
                  </div>
                );
              })}
            </div>

            {/* Justificación y Fuente Legal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold block mb-1">Explicación Jurídica</label>
                <textarea
                  rows={2}
                  value={modalPregunta.explicacion || ''}
                  onChange={(e) => setModalPregunta({ ...modalPregunta, explicacion: e.target.value })}
                  placeholder="Fundamento dogmático y normativo..."
                  className="w-full p-2 rounded border bg-transparent"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Norma y Artículo de Respaldo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={modalPregunta.fuente?.norma || ''}
                    onChange={(e) =>
                      setModalPregunta({
                        ...modalPregunta,
                        fuente: { ...modalPregunta.fuente!, norma: e.target.value },
                      })
                    }
                    placeholder="Norma (ej. COIP)"
                    className="w-2/3 p-2 rounded border bg-transparent"
                  />
                  <input
                    type="text"
                    value={modalPregunta.fuente?.articulo || ''}
                    onChange={(e) =>
                      setModalPregunta({
                        ...modalPregunta,
                        fuente: { ...modalPregunta.fuente!, articulo: e.target.value },
                      })
                    }
                    placeholder="Art."
                    className="w-1/3 p-2 rounded border bg-transparent"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="chk_vigente"
                    checked={Boolean(modalPregunta.fuente?.vigenciaVerificada)}
                    onChange={(e) =>
                      setModalPregunta({
                        ...modalPregunta,
                        fuente: {
                          ...modalPregunta.fuente!,
                          vigenciaVerificada: e.target.checked,
                        },
                      })
                    }
                  />
                  <label htmlFor="chk_vigente" className="text-[11px] text-slate-600 dark:text-slate-400">
                    Vigencia legal verificada fehacientemente
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setModalPregunta(null)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg shadow"
              >
                Guardar Reactivo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Asistente Gemini */}
      {modalIAAbierto && (
        <AIAssistantModal
          onCerrar={() => setModalIAAbierto(false)}
          onAplicarPregunta={(p) => {
            setModalPregunta(p);
            setMensajeFeedback({
              tipo: 'ok',
              texto: 'Pregunta asistida cargada en el formulario en estado Borrador.',
            });
          }}
        />
      )}
      {/* Modal Cargar Banco de Preguntas */}
      {modalCargarBanco && (
        <CargarBancoModal onCerrar={() => setModalCargarBanco(false)} />
      )}
    </div>
  );
};
