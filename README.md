# SIMULADOR JUDICIAL ECUADOR

**Herramienta integral de preparación para el concurso de selección y designación de juezas y jueces temporales de unidades judiciales del Ecuador (Resoluciones CJ 144-2026 y 198-2026).**

---

### AVISO LEGAL INDEPENDIENTE Y DESCARGO DE RESPONSABILIDAD
Esta aplicación web es una herramienta privada, independiente y académica orientada al entrenamiento técnico-jurídico y autoformación individual de postulantes. **No es un producto oficial, no está administrada ni representa al Consejo de la Judicatura del Ecuador ni a la Escuela de la Función Judicial.** El contenido de las preguntas y la metodología se ciñen a los instructivos de acceso público y a la legislación vigente de la República del Ecuador.

---

## 1. Arquitectura del Sistema

La solución está construida bajo una arquitectura full-stack desacoplada, segura y resiliente:

- **Frontend:**
  - React 19 con TypeScript en modo estricto.
  - Tailwind CSS para diseño institucional sobrio, jurídico, de alto contraste y soporte de modo claro y oscuro.
  - Almacenamiento local persistente mediante **IndexedDB** (`dbService`): funcionamiento autónomo local (*offline-first*), garantizando que las preguntas, las respuestas guardadas al instante y el historial no se pierdan ante recargas accidentales.
  - Instantáneas inmutables (*snapshots*): cada examen guarda una copia exacta e inalterable de las preguntas y alternativas presentadas en ese intento, asegurando que futuras modificaciones en el banco no alteren los resultados históricos.

- **Servidor (Backend Node.js & Express):**
  - Entry point `server.ts` con proxy de middleware Vite en desarrollo y servicio estático en producción.
  - Aislamiento seguro de credenciales: la clave `GEMINI_API_KEY` reside exclusivamente en el entorno del servidor y **nunca se transfiere ni expone al navegador**.
  - Endpoint seguro `/api/gemini/assistant` con el SDK oficial `@google/genai` (modelo `gemini-3.8-flash`) y respuesta estructurada validada con JSON Schema en el servidor.

---

## 2. Reglas Metodológicas del Simulador

Conforme al instructivo institucional:

| Parámetro | Valor Reglamentario | Detalle Operativo |
| :--- | :--- | :--- |
| **Total de Preguntas** | 100 reactivos | Selección automática y aleatoria |
| **Tiempo Máximo** | 60 minutos | Temporizador con entrega automática a cero |
| **Opciones por Reactivo** | Exactamente 4 | Alternativas A, B, C y D |
| **Respuestas Correctas** | 1 única | Sin respuestas ambiguas ni dobles opciones |
| **Valor por Acierto** | 0,50 puntos | Calificación proporcional directa |
| **Puntaje Máximo** | 50,00 puntos | 100 respuestas correctas |
| **Puntaje Mínimo Aprobatorio** | 40,00 puntos | **80 respuestas correctas** |
| **Penalización por Error** | 0 puntos | Las falladas o no contestadas no restan |
| **Entrega** | Definitiva | Respuestas y justificaciones solo visibles tras entregar |
| **Meta Pedagógica de Seguridad**| 88+ aciertos | Recomendación didáctica de confianza (no oficial) |

---

## 3. Modalidades de Examen

1. **Simulacro Oficial Aleatorio:**
   - Selecciona 100 preguntas aleatoriamente entre las materias habilitadas del perfil.
   - No inventa una distribución fija si no consta documentalmente.
   - Bloquea el inicio si el banco no tiene suficientes reactivos reales validados (no duplica preguntas artificialmente).

2. **Simulacro Equilibrado:**
   - Distribuye las preguntas proporcionalmente entre las materias del perfil.
   - Claramente rotulado como configuración didáctica, no como regla oficial.

3. **Práctica Personalizada:**
   - Permite elegir cantidad de preguntas (10, 20, 50, 100), materias específicas, dificultad y tiempo.
   - Filtros de refuerzo: repetir únicamente preguntas falladas, marcadas o no dominadas.

---

## 4. Perfiles y Materias Curriculares

- **Perfil Penal Completo (7 materias):**
  1. Derecho Constitucional
  2. Adolescentes infractores
  3. Derecho Penal
  4. Tránsito: delitos y contravenciones
  5. Contravenciones determinadas en el COIP y en el COFJ
  6. Violencia contra la mujer o miembros del núcleo familiar
  7. Infracciones contra la integridad sexual y reproductiva

- **Perfil Personalizado del Usuario (6 materias):**
  - Mismas materias excluyendo Derecho Penal por defecto.
  - Advertencia obligatoria: *“Si la postulación corresponde al perfil penal previsto en el instructivo del Consejo de la Judicatura, verifique si debe incluir también la materia Derecho Penal.”*

---

## 5. Algoritmo de Repaso Espaciado

Implementa intervalos científicos de retención:
- **Nivel 0 (Error reciente):** Revisar en la siguiente sesión (0 días).
- **Nivel 1 (Primer acierto tras error):** Revisar en 1 día.
- **Nivel 2 (Segundo acierto consecutivo):** Revisar en 3 días.
- **Nivel 3 (Tercer acierto consecutivo):** Revisar en 7 días (Dominada).
- **Nivel 4 (Cuarto acierto consecutivo):** Revisar en 14 días.
- **Nivel 5 (Quinto acierto consecutivo):** Revisar en 30 días (Consolidada).

---

## 6. Instrucciones de Ejecución y Despliegue

### Requisitos
- Node.js versión 20 o superior.
- NPM.

### Variables de Entorno (`.env`)
```bash
cp .env.example .env
# Defina su clave de Google GenAI para habilitar el asistente de elaboración en el servidor:
GEMINI_API_KEY="AIzaSy..."
PORT=3000
```

### Ejecutar en Desarrollo
```bash
npm run dev
```
Acceda en su navegador a `http://localhost:3000`.

### Compilar y Desplegar para Producción
```bash
npm run build
npm start
```

### Ejecutar Pruebas Automatizadas
```bash
npm test
```

---

## 7. Instrucciones para Importar el Banco de Preguntas

En el menú superior, ingrese a **Administración** (clave inicial por defecto: `admin123`):
1. **Importación CSV:**
   - Descargue la plantilla CSV desde el botón *"Descargar Plantilla CSV Oficial"*.
   - Complete las columnas obligatorias respetando los formatos normativos.
   - Cargue el archivo para ver la vista previa; el sistema informará errores fila por fila y permitirá descargar un reporte en caso de discrepancias.
2. **Importación JSON / Restauración:**
   - Puede cargar o pegar archivos JSON que cumplan el esquema institucional.
3. **Preguntas de Demostración:**
   - La aplicación incluye 10 preguntas de prueba etiquetadas visiblemente como *"PREGUNTA DE DEMOSTRACIÓN — NO USAR PARA ESTUDIO"*.
   - Puede eliminarlas con un solo clic en la pestaña de Métricas del panel de administración al cargar su banco real.

---

## 8. Asistente de Elaboración con Gemini

- Se ejecuta en el servidor a través de la ruta `/api/gemini/assistant`.
- Solo utiliza los documentos o artículos jurídicos suministrados en el formulario.
- Si el documento legal no es suficiente para sustentar la pregunta de manera unívoca, devuelve `FUENTE_INSUFICIENTE`.
- Toda pregunta asistida se genera como **Borrador** y exige revisión humana obligatoria antes de ser validada para simulacros oficiales.
