import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ExamenConfig,
  IntentoExamen,
  ModalidadSimulacro,
  Pregunta,
  PreguntaSnapshot,
  RepasoEspaciadoItem,
} from '../types';
import { dbService } from '../services/db';
import { calificarIntento, seleccionarPreguntasParaExamen } from '../services/examEngine';
import { procesarResultadoPregunta } from '../services/spacedRepetition';
import { PERFILES_PREDETERMINADOS, PerfilInfo } from '../services/curriculum';
import { BANCO_COMPLETO_EFJ_110 } from '../services/bancoPreguntasOficialEFJ';

interface SimulatorContextType {
  preguntas: Pregunta[];
  preguntasValidadas: Pregunta[];
  preguntasDemo: Pregunta[];
  perfilActual: PerfilInfo;
  setPerfilId: (id: 'penal_completo' | 'personalizado_usuario') => void;
  intentoActivo: IntentoExamen | null;
  historialIntentos: IntentoExamen[];
  itemsRepaso: RepasoEspaciadoItem[];
  cargando: boolean;
  esModoOscuro: boolean;
  alternarModoOscuro: () => void;
  recargarDatos: () => Promise<void>;
  vaciarBancoCompleto: () => Promise<void>;
  agregarPreguntasLote: (nuevas: Pregunta[], reemplazar?: boolean) => Promise<number>;
  eliminarDatosDemo: () => Promise<void>;
  restaurarDatosDemo: () => Promise<void>;
  autogenerarBancoCompleto: () => Promise<void>;
  iniciarExamen: (config: ExamenConfig) => Promise<{ ok: boolean; error?: string }>;
  registrarRespuesta: (indicePregunta: number, alternativaId: 'A' | 'B' | 'C' | 'D' | null) => void;
  alternarMarcaRevision: (indicePregunta: number) => void;
  entregarExamenDefinitivo: (porTiempo?: boolean) => Promise<IntentoExamen>;
  cancelarExamenEnProgreso: () => void;
  eliminarIntentoHistorial: (id: string) => Promise<void>;
  registrarInterrupcion: () => void;
}

const SimulatorContext = createContext<SimulatorContextType | undefined>(undefined);

export const SimulatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicialización con el banco oficial facilitado por el usuario (168 preguntas: 105 Constitucionales + 63 Penales con 4 opciones)
  const [preguntas, setPreguntas] = useState<Pregunta[]>(() => [...BANCO_COMPLETO_EFJ_110]);
  const [perfilId, setPerfilIdState] = useState<'penal_completo' | 'personalizado_usuario'>('penal_completo');
  const [intentoActivo, setIntentoActivo] = useState<IntentoExamen | null>(null);
  const [historialIntentos, setHistorialIntentos] = useState<IntentoExamen[]>([]);
  const [itemsRepaso, setItemsRepaso] = useState<RepasoEspaciadoItem[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [esModoOscuro, setEsModoOscuro] = useState<boolean>(() => {
    return localStorage.getItem('sje_dark_mode') === 'true';
  });

  const perfilActual =
    PERFILES_PREDETERMINADOS.find((p) => p.id === perfilId) || PERFILES_PREDETERMINADOS[0];

  const alternarModoOscuro = () => {
    setEsModoOscuro((prev) => {
      const nuevo = !prev;
      localStorage.setItem('sje_dark_mode', String(nuevo));
      if (nuevo) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return nuevo;
    });
  };

  useEffect(() => {
    if (esModoOscuro) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [esModoOscuro]);

  const recargarDatos = async () => {
    setCargando(true);
    try {
      await dbService.inicializarDatos();
      const p = await dbService.getPreguntas();
      const h = await dbService.getIntentos();
      const r = await dbService.getRepasoItems();
      
      setPreguntas(p && p.length > 0 ? p : [...BANCO_COMPLETO_EFJ_110]);
      setHistorialIntentos(h);
      setItemsRepaso(r);

      // Revisar si había un examen en progreso no entregado guardado
      const enProgreso = h.find((it) => !it.entregado);
      if (enProgreso && !intentoActivo) {
        setIntentoActivo(enProgreso);
      }
    } catch (e) {
      console.error('Error al inicializar base de datos local:', e);
      setPreguntas([...BANCO_COMPLETO_EFJ_110]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    recargarDatos();
  }, []);

  const vaciarBancoCompleto = async () => {
    setCargando(true);
    try {
      await dbService.vaciarBancoCompleto();
      setPreguntas([]);
    } catch (e) {
      console.error('Error al vaciar banco de preguntas:', e);
    } finally {
      setCargando(false);
    }
  };

  const agregarPreguntasLote = async (nuevas: Pregunta[], reemplazar = false): Promise<number> => {
    setCargando(true);
    try {
      if (reemplazar) {
        await dbService.vaciarBancoCompleto();
        await dbService.savePreguntasBatch(nuevas);
        setPreguntas(nuevas);
      } else {
        await dbService.savePreguntasBatch(nuevas);
        setPreguntas((prev) => [...prev, ...nuevas]);
      }
      return nuevas.length;
    } finally {
      setCargando(false);
    }
  };

  const eliminarDatosDemo = async () => {
    await dbService.eliminarDatosDemostracion();
    await recargarDatos();
  };

  const restaurarDatosDemo = async () => {
    await dbService.cargarDatosDemostracion();
    await recargarDatos();
  };

  const autogenerarBancoCompleto = async () => {
    await dbService.cargarBancoOficialEFJ();
    const p = await dbService.getPreguntas();
    setPreguntas(p || []);
  };

  const setPerfilId = (id: 'penal_completo' | 'personalizado_usuario') => {
    setPerfilIdState(id);
    localStorage.setItem('sje_perfil_activo', id);
  };

  const iniciarExamen = async (config: ExamenConfig): Promise<{ ok: boolean; error?: string }> => {
    if (preguntas.length === 0) {
      return {
        ok: false,
        error: 'El banco de preguntas se encuentra vacío. Por favor pegue o importe sus preguntas para comenzar la evaluación.',
      };
    }

    // Conjuntos para filtros de práctica
    const falladasIds = new Set<string>();
    const marcadasIds = new Set<string>();
    const dominadasIds = new Set<string>();

    historialIntentos.forEach((it) => {
      if (it.entregado) {
        it.preguntasSnapshot.forEach((ps, idx) => {
          const resp = it.respuestasUsuario[idx];
          if (resp && resp !== ps.respuestaCorrecta) {
            falladasIds.add(ps.preguntaOriginalId);
          }
          if (it.preguntasMarcadasParaRevision[idx]) {
            marcadasIds.add(ps.preguntaOriginalId);
          }
        });
      }
    });

    itemsRepaso.forEach((item) => {
      if (item.nivel >= 3) {
        dominadasIds.add(item.preguntaId);
      }
    });

    let bancoParaExamen = preguntas;
    const validadasActuales = bancoParaExamen.filter((p) => p.estado === 'validada');

    if (validadasActuales.length === 0) {
      return {
        ok: false,
        error: 'No se encontraron preguntas validadas en el banco actual. Asegúrese de activar las preguntas importadas.',
      };
    }

    // Adaptar número de preguntas si el usuario tiene menos preguntas de las requeridas oficialmente
    let configAjustada = { ...config };
    if (validadasActuales.length < config.numeroPreguntas) {
      // Si el examen es oficial pero hay menos reactivos, avisar o permitir práctica con los reactivos disponibles
      if (config.modalidad === 'practica_personalizada') {
        configAjustada.numeroPreguntas = Math.min(config.numeroPreguntas, validadasActuales.length);
      } else {
        return {
          ok: false,
          error: `El simulacro oficial requiere ${config.numeroPreguntas} preguntas, pero el banco facilitado cuenta con ${validadasActuales.length} reactivos validados. Puede realizar una Práctica Personalizada con hasta ${validadasActuales.length} preguntas o completar el banco.`,
        };
      }
    }

    // Preguntas validadas para este perfil
    let seleccion = seleccionarPreguntasParaExamen(
      bancoParaExamen,
      configAjustada,
      falladasIds,
      marcadasIds,
      dominadasIds
    );

    // Si por materias específicas seleccionadas faltan reactivos, intentar con todas las materias del banco
    if (seleccion.error || !seleccion.preguntas || seleccion.preguntas.length === 0) {
      const configAmpliada: ExamenConfig = {
        ...configAjustada,
        materiasSeleccionadas: undefined,
      };
      seleccion = seleccionarPreguntasParaExamen(
        bancoParaExamen,
        configAmpliada,
        falladasIds,
        marcadasIds,
        dominadasIds
      );

      if (seleccion.error || !seleccion.preguntas || seleccion.preguntas.length === 0) {
        return {
          ok: false,
          error: seleccion.error || 'No se pudieron seleccionar suficientes preguntas para el examen con los filtros actuales.',
        };
      }
    }

    const nuevoIntento: IntentoExamen = {
      id: `INTENTO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      fechaInicio: new Date().toISOString(),
      modalidad: config.modalidad,
      perfilId: config.perfilId,
      config,
      duracionSegundosUtilizados: 0,
      entregado: false,
      entregadoAutomaticamentePorTiempo: false,
      totalPreguntas: seleccion.preguntas.length,
      puntajeMaximo: 50.0,
      puntajeMinimoAprobacion: 40.0,
      respuestasUsuario: {},
      preguntasMarcadasParaRevision: {},
      preguntasSnapshot: seleccion.preguntas,
      interrupcionesDetectadas: 0,
    };

    await dbService.saveIntento(nuevoIntento);
    setIntentoActivo(nuevoIntento);
    setHistorialIntentos((prev) => [nuevoIntento, ...prev]);

    return { ok: true };
  };

  const registrarRespuesta = async (
    indicePregunta: number,
    alternativaId: 'A' | 'B' | 'C' | 'D' | null
  ) => {
    if (!intentoActivo || intentoActivo.entregado) return;

    const actual = {
      ...intentoActivo,
      respuestasUsuario: {
        ...intentoActivo.respuestasUsuario,
        [indicePregunta]: alternativaId,
      },
    };

    setIntentoActivo(actual);
    await dbService.saveIntento(actual);
  };

  const alternarMarcaRevision = async (indicePregunta: number) => {
    if (!intentoActivo || intentoActivo.entregado) return;

    const estadoActual = Boolean(intentoActivo.preguntasMarcadasParaRevision[indicePregunta]);
    const actual = {
      ...intentoActivo,
      preguntasMarcadasParaRevision: {
        ...intentoActivo.preguntasMarcadasParaRevision,
        [indicePregunta]: !estadoActual,
      },
    };

    setIntentoActivo(actual);
    await dbService.saveIntento(actual);
  };

  const registrarInterrupcion = async () => {
    if (!intentoActivo || intentoActivo.entregado) return;
    const actual = {
      ...intentoActivo,
      interrupcionesDetectadas: (intentoActivo.interrupcionesDetectadas || 0) + 1,
    };
    setIntentoActivo(actual);
    await dbService.saveIntento(actual);
  };

  const entregarExamenDefinitivo = async (porTiempo = false): Promise<IntentoExamen> => {
    if (!intentoActivo) throw new Error('No hay examen activo');

    const calificado = calificarIntento({
      ...intentoActivo,
      entregadoAutomaticamentePorTiempo: porTiempo,
    });

    await dbService.saveIntento(calificado);
    setIntentoActivo(calificado);

    // Actualizar historial en memoria
    setHistorialIntentos((prev) =>
      prev.map((it) => (it.id === calificado.id ? calificado : it))
    );

    // Actualizar algoritmo de repaso espaciado
    calificado.preguntasSnapshot.forEach(async (snapshot, idx) => {
      const respuesta = calificado.respuestasUsuario[idx];
      const acerto = respuesta === snapshot.respuestaCorrecta;
      const existente = itemsRepaso.find((r) => r.preguntaId === snapshot.preguntaOriginalId);
      const actualizado = procesarResultadoPregunta(existente, snapshot.preguntaOriginalId, acerto);
      await dbService.saveRepasoItem(actualizado);
    });

    const repActualizados = await dbService.getRepasoItems();
    setItemsRepaso(repActualizados);

    return calificado;
  };

  const cancelarExamenEnProgreso = async () => {
    if (!intentoActivo) return;
    await dbService.deleteIntento(intentoActivo.id);
    setHistorialIntentos((prev) => prev.filter((it) => it.id !== intentoActivo.id));
    setIntentoActivo(null);
  };

  const eliminarIntentoHistorial = async (id: string) => {
    await dbService.deleteIntento(id);
    setHistorialIntentos((prev) => prev.filter((it) => it.id !== id));
    if (intentoActivo?.id === id) {
      setIntentoActivo(null);
    }
  };

  const preguntasValidadas = preguntas.filter((p) => p.estado === 'validada');
  const preguntasDemo = preguntas.filter((p) => p.esDemostracion || p.id.startsWith('DEMO-'));

  return (
    <SimulatorContext.Provider
      value={{
        preguntas,
        preguntasValidadas,
        preguntasDemo,
        perfilActual,
        setPerfilId,
        intentoActivo,
        historialIntentos,
        itemsRepaso,
        cargando,
        esModoOscuro,
        alternarModoOscuro,
        recargarDatos,
        vaciarBancoCompleto,
        agregarPreguntasLote,
        eliminarDatosDemo,
        restaurarDatosDemo,
        autogenerarBancoCompleto,
        iniciarExamen,
        registrarRespuesta,
        alternarMarcaRevision,
        entregarExamenDefinitivo,
        cancelarExamenEnProgreso,
        eliminarIntentoHistorial,
        registrarInterrupcion,
      }}
    >
      {children}
    </SimulatorContext.Provider>
  );
};

export const useSimulator = () => {
  const context = useContext(SimulatorContext);
  if (!context) {
    throw new Error('useSimulator debe ser utilizado dentro de un SimulatorProvider');
  }
  return context;
};
