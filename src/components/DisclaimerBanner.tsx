import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [cerrado, setCerrado] = useState(false);

  if (cerrado) return null;

  return (
    <aside aria-label="Aviso Legal Institucional" className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" aria-hidden="true" />
          <p>
            <span className="font-semibold tracking-wide uppercase text-[11px] text-amber-800 dark:text-amber-300">
              Aviso Legal Independiente:
            </span>{' '}
            Esta aplicación es una herramienta privada de autoformación para la preparación del concurso de juezas y jueces temporales de unidades judiciales (Resoluciones 144-2026 y 198-2026).{' '}
            <strong>No constituye un producto oficial ni representa al Consejo de la Judicatura del Ecuador.</strong>
          </p>
        </div>
        <button
          onClick={() => setCerrado(true)}
          className="text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-100 p-1 rounded transition-colors"
          title="Ocultar aviso"
          aria-label="Cerrar aviso"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
