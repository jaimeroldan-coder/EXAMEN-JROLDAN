import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { validarYSanitizarSalidaAsistente } from './src/services/assistantValidator.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));

// Inicialización de GoogleGenAI únicamente en el servidor
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Endpoint de verificación del estado del asistente de IA
app.get('/api/gemini/status', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    disponible: hasKey,
    modelo: 'gemini-3.8-flash',
    mensaje: hasKey
      ? 'Asistente de elaboración disponible y conectado en el servidor.'
      : 'Asistente configurado; defina GEMINI_API_KEY en las variables del servidor para habilitar generación en vivo.',
  });
});

// Endpoint del Asistente de Elaboración mediante Gemini en el servidor
app.post('/api/gemini/assistant', async (req, res) => {
  try {
    const { accion, documentoTexto, materia, subtema, preguntaBase } = req.body;

    if (!documentoTexto || typeof documentoTexto !== 'string' || documentoTexto.trim().length < 15) {
      return res.status(400).json({
        error: 'Debe proporcionar el texto normativo o documento jurídico de sustento (mínimo 15 caracteres).',
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'La clave GEMINI_API_KEY no está configurada en el entorno del servidor.',
      });
    }

    const systemInstruction = `
Eres un especialista en evaluación jurídica ecuatoriana de la Escuela de la Función Judicial del Ecuador (Resoluciones CJ 144-2026 y 198-2026).
REGLAS ABSOLUTAS:
1. TRABAJAR SOLO CON EL DOCUMENTO PROPORCIONADO: Extrae reactivos únicamente de los artículos, incisos o resoluciones incluidos en el texto.
2. NO USAR CONOCIMIENTO EXTERNO: No agregues hechos, requisitos ni consecuencias que no consten textualmente o inequívocamente en la fuente.
3. NO INVENTAR NORMAS, ARTÍCULOS, SENTENCIAS O RESPUESTAS: Si el documento no especifica el artículo o norma, no los supongas.
4. DEVOLVER "FUENTE INSUFICIENTE" CUANDO FALTE RESPALDO: Si el texto no ofrece sustento suficiente o indubitado para formular 4 alternativas claras y una sola solución, devuelve en "resultado": "FUENTE_INSUFICIENTE" y "pregunta": null con la justificación correspondiente.
5. GUARDAR SIEMPRE COMO BORRADOR: Toda propuesta generada tendrá estado "borrador" ("estado": "borrador").
6. EXIGIR APROBACIÓN HUMANA: Ninguna pregunta generada por IA podrá considerarse validada sin la revisión y aprobación expresa de un especialista humano.
7. REGISTRAR ADVERTENCIAS DE AMBIGÜEDAD O POSIBLE DESACTUALIZACIÓN:
   - Si la redacción del texto normativo da pie a más de una interpretación defendible, clasifica como "PREGUNTA_AMBIGUA" e incluye la advertencia en "advertencias".
   - Si se detectan reformas, términos en desuso o no es posible asegurar vigencia actual, clasifica o advierte "POSIBLE_DESACTUALIZACION".
8. Toda pregunta debe tener exactamente cuatro alternativas (A, B, C, D) con una sola respuesta inequívocamente correcta según el texto.
9. Las alternativas no pueden contener "todas las anteriores", "ninguna de las anteriores", "todas son correctas" ni fórmulas equivalentes.
    `.trim();

    const promptUser = `
Acción solicitada: ${accion || 'proponer_pregunta'}
Materia deseada: ${materia || 'No especificada'}
Subtema deseado: ${subtema || 'No especificado'}
${preguntaBase ? `Pregunta base o borrador de partida: ${JSON.stringify(preguntaBase)}` : ''}

DOCUMENTO DE SUSTENTO PROPORCIONADO:
"""
${documentoTexto}
"""
Analiza el texto estrictamente conforme a las reglas absolutas y devuelve la respuesta estructurada en JSON.
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptUser,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resultado: {
              type: Type.STRING,
              enum: [
                'PROPUESTA_GENERADA',
                'FUENTE_INSUFICIENTE',
                'PREGUNTA_AMBIGUA',
                'POSIBLE_DESACTUALIZACION',
              ],
            },
            pregunta: {
              type: Type.OBJECT,
              properties: {
                materia: { type: Type.STRING },
                subtema: { type: Type.STRING },
                dificultad: {
                  type: Type.STRING,
                  enum: ['baja', 'media', 'alta'],
                },
                enunciado: { type: Type.STRING },
                alternativas: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: {
                        type: Type.STRING,
                        enum: ['A', 'B', 'C', 'D'],
                      },
                      texto: { type: Type.STRING },
                    },
                    required: ['id', 'texto'],
                  },
                },
                respuestaCorrecta: {
                  type: Type.STRING,
                  enum: ['A', 'B', 'C', 'D'],
                },
                explicacion: { type: Type.STRING },
                norma: { type: Type.STRING },
                articulo: { type: Type.STRING },
                textoSoporte: { type: Type.STRING },
                advertencias: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                'materia',
                'subtema',
                'dificultad',
                'enunciado',
                'alternativas',
                'respuestaCorrecta',
                'explicacion',
                'norma',
                'articulo',
                'textoSoporte',
                'advertencias',
              ],
            },
            justificacion: { type: Type.STRING },
          },
          required: ['resultado', 'justificacion'],
        },
      },
    });

    const rawText = response.text || '{}';
    let parsedData = JSON.parse(rawText);

    // Validación estricta en el servidor antes de devolver
    const resultadoValidado = validarYSanitizarSalidaAsistente(parsedData, documentoTexto);
    return res.json(resultadoValidado);
  } catch (error: any) {
    console.error('Error en asistente Gemini:', error);
    return res.status(500).json({
      error: error?.message || 'Error procesando solicitud con el modelo de IA.',
    });
  }
});

// Endpoint de validación estricta de salida (utilizable por tests o auditoría)
app.post('/api/gemini/validate-output', (req, res) => {
  try {
    const { rawOutput, documentoTexto } = req.body;
    const resultadoValidado = validarYSanitizarSalidaAsistente(rawOutput, documentoTexto || '');
    return res.json(resultadoValidado);
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || 'Error validando salida.' });
  }
});

// Integración Vite en dev o archivos estáticos en prod
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Simulador Judicial Ecuador ejecutándose en http://0.0.0.0:${PORT}`);
});
