import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  Code,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Plus,
  HelpCircle,
  Copy,
  Sparkles,
} from 'lucide-react';
import { useSimulator } from '../context/SimulatorContext';
import { parsearPreguntasDesdeJSON, parsearPreguntasDesdeTexto } from '../services/questionTextParser';
import { procesarFilasCSV } from '../services/csvParser';
import { AlternativaId, Pregunta } from '../types';

interface CargarBancoModalProps {
  onCerrar: () => void;
  onExito?: (cantidad: number) => void;
}

const EJEMPLO_TEXTO = `1. ¿Cuál es el término o plazo general para la interposición de la acción de protección?
A) Quince días término contados desde la notificación del acto
B) En cualquier momento mientras subsista la vulneración del derecho constitucional
C) Treinta días calendario improrrogables
D) Noventa días conforme al Código Orgánico Administrativo
Respuesta correcta: B
Materia: Derecho Constitucional
Fundamentación: Conforme a la LOGJCC y jurisprudencia vinculante de la Corte Constitucional.

2. En materia penal ecuatoriana, ¿cuál es el estándar exigido para emitir sentencia condenatoria?
A) Certeza moral del juzgador sin necesidad de prueba pericial
B) Más allá de toda duda razonable con base en la prueba actuada en juicio
C) Preponderancia de la prueba presentada por Fiscalía
D) Indicio unívoco y testimonial concordante
Respuesta correcta: B
Materia: Derecho Penal
Fundamentación: Artículo 5 numeral 3 del Código Orgánico Integral Penal (COIP).`;

const EJEMPLO_JSON = `[
  {
    "enunciado": "¿Cuál es el órgano de gobierno, administración, vigilancia y disciplina de la Función Judicial?",
    "opciones": [
      "La Corte Nacional de Justicia",
      "El Consejo de la Judicatura",
      "La Fiscalía General del Estado",
      "El Ministerio de la Ley y Justicia"
    ],
    "respuestaCorrecta": "B",
    "materia": "Derecho Constitucional",
    "explicacion": "Art. 178 de la Constitución de la República del Ecuador."
  }
]`;

export const CargarBancoModal: React.FC<CargarBancoModalProps> = ({ onCerrar, onExito }) => {
  const { preguntas, agregarPreguntasLote, vaciarBancoCompleto } = useSimulator();

  const [pestaña, setPestaña] = useState<'texto' | 'json' | 'archivo'>('texto');
  const [textoEntrada, setTextoEntrada] = useState('');
  const [reemplazarExistente, setReemplazarExistente] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  // Análisis en tiempo real de texto
  const parseoTexto = React.useMemo(() => {
    if (!textoEntrada.trim()) return null;
    if (pestaña === 'texto') {
      return parsearPreguntasDesdeTexto(textoEntrada);
    } else if (pestaña === 'json') {
      const res = parsearPreguntasDesdeJSON(textoEntrada);
      return {
        validas: res.validas,
        invalidas: res.error ? [{ indice: 1, fragmento: 'JSON', error: res.error }] : [],
      };
    }
    return null;
  }, [textoEntrada, pestaña]);

  const handleCargarEjemplo = () => {
    if (pestaña === 'texto') {
      setTextoEntrada(EJEMPLO_TEXTO);
    } else {
      setTextoEntrada(EJEMPLO_JSON);
    }
  };

  const handleSubirArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const contenido = event.target?.result as string;
      if (!contenido) return;

      if (file.name.endsWith('.json')) {
        const res = parsearPreguntasDesdeJSON(contenido);
        if (res.validas.length > 0) {
          const agregadas = await agregarPreguntasLote(res.validas, reemplazarExistente);
          setMensaje({ tipo: 'ok', texto: `Se cargaron exitosamente ${agregadas} preguntas desde el archivo JSON.` });
          if (onExito) onExito(agregadas);
        } else {
          setMensaje({ tipo: 'error', texto: res.error || 'No se reconocieron preguntas válidas en el JSON.' });
        }
      } else if (file.name.endsWith('.csv')) {
        const res = procesarFilasCSV(contenido);
        const validas = res.filas.filter((f) => f.esValida && f.pregunta).map((f) => f.pregunta as Pregunta);
        if (validas.length > 0) {
          const agregadas = await agregarPreguntasLote(validas, reemplazarExistente);
          setMensaje({ tipo: 'ok', texto: `Se cargaron exitosamente ${agregadas} preguntas desde el archivo CSV.` });
          if (onExito) onExito(agregadas);
        } else {
          setMensaje({ tipo: 'error', texto: 'No se encontraron filas válidas en el archivo CSV.' });
        }
      } else {
        // Archivo de texto plano
        const res = parsearPreguntasDesdeTexto(contenido);
        if (res.validas.length > 0) {
          const agregadas = await agregarPreguntasLote(res.validas, reemplazarExistente);
          setMensaje({ tipo: 'ok', texto: `Se cargaron exitosamente ${agregadas} preguntas desde el archivo de texto.` });
          if (onExito) onExito(agregadas);
        } else {
          setMensaje({ tipo: 'error', texto: 'No se reconocieron preguntas con 4 opciones y respuesta en el texto.' });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmarImportacion = async () => {
    if (!parseoTexto || parseoTexto.validas.length === 0) {
      setMensaje({
        tipo: 'error',
        texto: 'No hay preguntas válidas para importar. Asegúrese de que cada pregunta tenga 4 opciones (A, B, C, D) y su respuesta correcta.',
      });
      return;
    }

    setGuardando(true);
    try {
      const cantidad = await agregarPreguntasLote(parseoTexto.validas, reemplazarExistente);
      setMensaje({
        tipo: 'ok',
        texto: `¡Excelente! Se han cargado exitosamente ${cantidad} reactivos de opción múltiple al banco de preguntas.`,
      });
      setTextoEntrada('');
      if (onExito) onExito(cantidad);
      setTimeout(() => {
        onCerrar();
      }, 1200);
    } catch (e: any) {
      setMensaje({ tipo: 'error', texto: e?.message || 'Error al guardar preguntas en el banco.' });
    } finally {
      setGuardando(false);
    }
  };

  const handleVaciar = async () => {
    if (window.confirm('¿Está seguro de que desea eliminar todas las preguntas del banco actual y dejarlo en 0?')) {
      await vaciarBancoCompleto();
      setMensaje({ tipo: 'ok', texto: 'El banco de preguntas ha sido vaciado por completo (0 reactivos).' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Botón Cerrar */}
        <button
          onClick={onCerrar}
          aria-label="Cerrar modal"
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 text-xs font-semibold uppercase tracking-wider">
            <Upload className="w-4 h-4" />
            <span>Gestión y Carga de Banco de Preguntas</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white">
            Cargar Banco de Preguntas
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Metodología de opción múltiple: cada reactivo debe incluir <strong>4 alternativas (A, B, C, D)</strong> y especificar su <strong>respuesta correcta</strong>.
          </p>
        </div>

        {/* Estado actual del banco */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Estado del banco:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded text-xs ${
                preguntas.length > 0
                  ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              {preguntas.length} {preguntas.length === 1 ? 'pregunta' : 'preguntas'} en memoria
            </span>
            {preguntas.length === 0 && (
              <span className="text-slate-500 italic">(Banco vacío, esperando tus preguntas)</span>
            )}
          </div>

          {preguntas.length > 0 && (
            <button
              onClick={handleVaciar}
              className="text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1 hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar Banco Actual (0)</span>
            </button>
          )}
        </div>

        {/* Feedback de error o éxito */}
        {mensaje && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
              mensaje.tipo === 'ok'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
            }`}
          >
            {mensaje.tipo === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{mensaje.texto}</span>
          </div>
        )}

        {/* Pestañas de método */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
          <button
            onClick={() => setPestaña('texto')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              pestaña === 'texto'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Pegar Texto Directo</span>
          </button>

          <button
            onClick={() => setPestaña('json')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              pestaña === 'json'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Pegar JSON</span>
          </button>

          <button
            onClick={() => setPestaña('archivo')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              pestaña === 'archivo'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir Archivo (.txt / .csv / .json)</span>
          </button>
        </div>

        {/* Pestaña: Texto Directo o JSON */}
        {pestaña !== 'archivo' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {pestaña === 'texto'
                  ? 'Pega aquí tus preguntas con 4 opciones (A, B, C, D) y respuesta correcta:'
                  : 'Pega aquí el array JSON con tus preguntas:'}
              </label>
              <button
                type="button"
                onClick={handleCargarEjemplo}
                className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cargar Formato de Ejemplo</span>
              </button>
            </div>

            <textarea
              value={textoEntrada}
              onChange={(e) => setTextoEntrada(e.target.value)}
              placeholder={
                pestaña === 'texto'
                  ? '1. ¿Enunciado de la pregunta?\nA) Opción A\nB) Opción B\nC) Opción C\nD) Opción D\nRespuesta correcta: B\n\n2. ¿Segunda pregunta?...'
                  : '[\n  {\n    "enunciado": "...",\n    "opciones": ["A", "B", "C", "D"],\n    "respuestaCorrecta": "B"\n  }\n]'
              }
              rows={10}
              className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />

            {/* Diagnóstico de Parseo en Tiempo Real */}
            {parseoTexto && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Diagnóstico de lectura automática:
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {parseoTexto.validas.length} válidas con 4 opciones
                    </span>
                    {parseoTexto.invalidas.length > 0 && (
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {parseoTexto.invalidas.length} por corregir
                      </span>
                    )}
                  </div>
                </div>

                {parseoTexto.invalidas.length > 0 && (
                  <div className="space-y-1 pt-1 text-[11px] text-amber-700 dark:text-amber-300 max-h-24 overflow-y-auto">
                    {parseoTexto.invalidas.map((inv, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span>• Pregunta #{inv.indice}:</span>
                        <span>{inv.error}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pestaña: Subir Archivo */}
        {pestaña === 'archivo' && (
          <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center space-y-4 bg-slate-50/50 dark:bg-slate-850">
            <Upload className="w-10 h-10 mx-auto text-teal-600 dark:text-teal-400" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Selecciona tu archivo de banco de preguntas
              </h3>
              <p className="text-xs text-slate-500">
                Soporta archivos de texto (.txt), hojas de cálculo (.csv) o datos estructurados (.json) con 4 opciones.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs cursor-pointer shadow transition-colors">
              <Upload className="w-4 h-4" />
              <span>Explorar Archivo</span>
              <input
                type="file"
                accept=".txt,.csv,.json"
                onChange={handleSubirArchivo}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Opción de Modo de Inserción */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
            <input
              type="checkbox"
              checked={reemplazarExistente}
              onChange={(e) => setReemplazarExistente(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
            />
            <span>Reemplazar banco existente completamente (dejar solo estas preguntas)</span>
          </label>
        </div>

        {/* Acciones Finales */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCerrar}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
          >
            Cerrar
          </button>

          {pestaña !== 'archivo' && (
            <button
              type="button"
              disabled={guardando || !parseoTexto || parseoTexto.validas.length === 0}
              onClick={handleConfirmarImportacion}
              className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white font-semibold text-xs shadow transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {guardando
                  ? 'Guardando...'
                  : `Cargar ${parseoTexto?.validas.length || 0} Preguntas al Simulador`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
