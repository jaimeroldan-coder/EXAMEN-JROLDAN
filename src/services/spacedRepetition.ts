import { RepasoEspaciadoItem } from '../types';

const DIAS_POR_NIVEL: Record<number, number> = {
  0: 0, // Inmediato / siguiente sesión
  1: 1, // 1 día
  2: 3, // 3 días
  3: 7, // 7 días
  4: 14, // 14 días
  5: 30, // 30 días
};

export function procesarResultadoPregunta(
  itemAnterior: RepasoEspaciadoItem | undefined,
  preguntaId: string,
  acerto: boolean
): RepasoEspaciadoItem {
  const hoy = new Date();

  if (!itemAnterior) {
    if (acerto) {
      const proxima = new Date(hoy.getTime() + 1 * 24 * 60 * 60 * 1000);
      return {
        preguntaId,
        nivel: 1,
        aciertosConsecutivos: 1,
        fallosConsecutivos: 0,
        ultimaRevision: hoy.toISOString(),
        proximaRevision: proxima.toISOString(),
      };
    } else {
      return {
        preguntaId,
        nivel: 0,
        aciertosConsecutivos: 0,
        fallosConsecutivos: 1,
        ultimaRevision: hoy.toISOString(),
        proximaRevision: hoy.toISOString(),
      };
    }
  }

  if (!acerto) {
    // Error reciente: reiniciar a nivel 0 (siguiente sesión)
    return {
      preguntaId,
      nivel: 0,
      aciertosConsecutivos: 0,
      fallosConsecutivos: itemAnterior.fallosConsecutivos + 1,
      ultimaRevision: hoy.toISOString(),
      proximaRevision: hoy.toISOString(),
    };
  }

  // Acierto consecutivo
  const nuevoAciertos = itemAnterior.aciertosConsecutivos + 1;
  const nuevoNivel = Math.min(5, itemAnterior.nivel + 1);
  const diasEspera = DIAS_POR_NIVEL[nuevoNivel] || 30;
  const proxima = new Date(hoy.getTime() + diasEspera * 24 * 60 * 60 * 1000);

  return {
    preguntaId,
    nivel: nuevoNivel,
    aciertosConsecutivos: nuevoAciertos,
    fallosConsecutivos: 0,
    ultimaRevision: hoy.toISOString(),
    proximaRevision: proxima.toISOString(),
  };
}
