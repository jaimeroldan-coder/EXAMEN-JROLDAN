import React, { useState } from 'react';
import {
  Sparkles,
  X,
  FileText,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Copy,
  Plus,
  Loader2,
} from 'lucide-react';
import { AIAssistantResponse, Pregunta } from '../types';

interface AIAssistantModalProps {
  onCerrar: () => void;
  onAplicarPregunta: (preguntaGenerada: Partial<Pregunta>) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  onCerrar,
  onAplicarPregunta,
}) => {
  const [accion, setAccion] = useState<'proponer_pregunta' | 'detectar_ambiguedades' | 'proponer_distractores'>('proponer_pregunta');
  const [documentoTexto, setDocumentoTexto] = useState('');
  const [materia, setMateria] = useState('Derecho Constitucional');
  const [subtema, setSubtema] = useState('');
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<AIAssistantResponse | null>(null);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const handleConsultar = async () => {
    if (!documentoTexto.trim() || documentoTexto.trim().length < 20) {
      setErrorServidor('Por favor ingrese el fragmento normativo o documento oficial de sustento (mínimo 20 caracteres).');
      return;
    }

    setCargando(true);
    setErrorServidor(null);
    setResultado(null);

    try {
      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion,
          documentoTexto,
          materia,
          subtema,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error en el servicio de IA.');
      }

      setResultado(data);
    } catch (e: any) {
      setErrorServidor(e?.message || 'Error comunicándose con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  const handleTransferirABorrador = () => {
    if (!resultado || !resultado.pregunta) return;
    const p = resultado.pregunta;

    const nueva: Partial<Pregunta> = {
      id: `IA-${Date.now()}`,
      perfil: ['penal', 'personalizado'],
      materia: p.materia || materia,
      subtema: p.subtema || subtema || 'General',
      dificultad: p.dificultad,
      tipo: 'normativa',
      enunciado: p.enunciado,
      alternativas: p.alternativas,
      respuestaCorrecta: p.respuestaCorrecta,
      explicacion: p.explicacion,
      explicacionDistractores: {},
      fuente: {
        norma: p.norma || 'Norma indicada en documento',
        articulo: p.articulo || 'Artículo aplicable',
        textoSoporte: p.textoSoporte || '',
        urlOficial: 'https://www.asambleanacional.gob.ec',
        fechaConsulta: new Date().toISOString().split('T')[0],
        vigenciaVerificada: false, // Regla estricta: requiere verificación humana
      },
      jurisprudencia: {},
      estado: 'borrador', // NUNCA se valida automáticamente; siempre borrador
      posiblesAmbiguedades: p.posiblesAmbiguedades || (resultado.resultado === 'PREGUNTA_AMBIGUA' ? ['Ambigüedad detectada en análisis inicial'] : undefined),
      revisadaPorHumano: false,
      exigeAprobacionHumana: true,
      observaciones: `Propuesta asistida por IA Gemini en el servidor. Justificación: ${resultado.justificacion}`,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
    };

    onAplicarPregunta(nueva);
    onCerrar();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onCerrar}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Asistente de Elaboración y Control Jurídico</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white">
            Generación y Análisis Asistido
          </h3>
          <p className="text-xs text-slate-500">
            Funciona exclusivamente a partir de los documentos normativos provistos.
            Todo reactivo se genera como <strong>borrador</strong> sujeto a revisión humana.
          </p>
        </div>

        {/* Formulario de Entrada */}
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Acción del Asistente
              </label>
              <select
                value={accion}
                onChange={(e: any) => setAccion(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="proponer_pregunta">Proponer pregunta con 4 opciones</option>
                <option value="detectar_ambiguedades">Evaluar ambigüedad en texto legal</option>
                <option value="proponer_distractores">Proponer distractores plausibles</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Materia Destino
              </label>
              <input
                type="text"
                value={materia}
                onChange={(e) => setMateria(e.target.value)}
                placeholder="Ej. Derecho Constitucional"
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Documento o Texto Normativo Específico de Sustento
            </label>
            <textarea
              rows={5}
              value={documentoTexto}
              onChange={(e) => setDocumentoTexto(e.target.value)}
              placeholder="Copie aquí el artículo, fragmento de ley o resolución judicial del cual se debe extraer la pregunta..."
              className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
            />
            <span className="text-[11px] text-slate-400">
              El modelo tiene orden estricta de no usar conocimientos no respaldados en este texto.
            </span>
          </div>

          <button
            type="button"
            disabled={cargando}
            onClick={handleConsultar}
            className="w-full py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs shadow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {cargando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analizando texto normativo...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Ejecutar Análisis Asistido</span>
              </>
            )}
          </button>
        </div>

        {errorServidor && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200">
            {errorServidor}
          </div>
        )}

        {/* Resultado Estructurado */}
        {resultado && (
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                Resultado del Modelo
              </span>
              <span
                className={`px-2.5 py-0.5 rounded font-mono font-bold text-[11px] ${
                  resultado.resultado === 'PROPUESTA_GENERADA'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {resultado.resultado}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Justificación técnica:</strong> {resultado.justificacion}
              </p>
            </div>

            {resultado.pregunta && (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-teal-500/30 space-y-3">
                <div className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                  {resultado.pregunta.enunciado}
                </div>
                <div className="space-y-1">
                  {resultado.pregunta.alternativas.map((alt) => (
                    <div
                      key={alt.id}
                      className={`p-2 rounded text-xs flex items-center gap-2 ${
                        alt.id === resultado.pregunta?.respuestaCorrecta
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 font-semibold text-emerald-900 dark:text-emerald-200'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] shrink-0 font-bold">
                        {alt.id}
                      </span>
                      <span>{alt.texto}</span>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <p>
                    <strong>Explicación:</strong> {resultado.pregunta.explicacion}
                  </p>
                  <p>
                    <strong>Fuente:</strong> {resultado.pregunta.norma} - {resultado.pregunta.articulo}
                  </p>
                </div>

                {/* Advertencias de Ambigüedad o Desactualización */}
                {((resultado.pregunta.advertencias && resultado.pregunta.advertencias.length > 0) ||
                  (resultado.pregunta.posiblesAmbiguedades && resultado.pregunta.posiblesAmbiguedades.length > 0) ||
                  resultado.pregunta.posibleDesactualizacion) && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-[11px] space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Advertencias Metodológicas Registradas:</span>
                    </div>
                    {resultado.pregunta.posibleDesactualizacion && (
                      <p className="text-orange-700 dark:text-orange-300 font-semibold">
                        • Posible desactualización normativa detectada.
                      </p>
                    )}
                    {resultado.pregunta.posiblesAmbiguedades?.map((amb, idx) => (
                      <p key={idx} className="text-red-700 dark:text-red-300">
                        • Ambigüedad: {amb}
                      </p>
                    ))}
                    {resultado.pregunta.advertencias?.map((adv, idx) => (
                      <p key={idx}>• {adv}</p>
                    ))}
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleTransferirABorrador}
                    className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs shadow flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Cargar en Formulario como Borrador</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
