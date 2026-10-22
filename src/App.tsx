import React, { useState } from 'react';
import { SimulatorProvider, useSimulator } from './context/SimulatorContext';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Header } from './components/Header';
import { HomeDashboard } from './components/HomeDashboard';
import { ExamModalPreStart } from './components/ExamModalPreStart';
import { ExamActiveView } from './components/ExamActiveView';
import { ExamResultsView } from './components/ExamResultsView';
import { PracticeConfigModal } from './components/PracticeConfigModal';
import { HistoryView } from './components/HistoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { AdminPanel } from './components/AdminPanel';
import { ControlCalidadJuridicaView } from './components/ControlCalidadJuridicaView';
import { AdversarialArbitratorView } from './components/AdversarialArbitratorView';
import { IntentoExamen } from './types';

const MainAppContent: React.FC = () => {
  const { intentoActivo, cargando, iniciarExamen } = useSimulator();

  const [vistaActual, setVistaActual] = useState<
    'inicio' | 'historial' | 'analiticas' | 'admin' | 'calidad_juridica' | 'arbitro_adversarial'
  >('inicio');
  const [modalPreInicioAbierto, setModalPreInicioAbierto] = useState(false);
  const [modalConfigPracticaAbierto, setModalConfigPracticaAbierto] = useState(false);
  const [intentoSeleccionadoParaRevision, setIntentoSeleccionadoParaRevision] = useState<IntentoExamen | null>(null);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-[#0B1320] text-slate-600 dark:text-slate-300">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-serif">Iniciando base de datos local y banco de preguntas...</p>
        </div>
      </div>
    );
  }

  // 1. Si hay un examen en curso activo (no entregado)
  if (intentoActivo && !intentoActivo.entregado) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B1320] text-slate-800 dark:text-slate-100 flex flex-col font-sans">
        <DisclaimerBanner />
        <Header vistaActual={vistaActual} setVistaActual={setVistaActual} />
        <main className="flex-1">
          <ExamActiveView
            onFinalizado={() => {
              // Se actualiza el estado en el contexto
            }}
          />
        </main>
      </div>
    );
  }

  // 2. Si el examen activo acaba de entregarse o se está revisando un intento específico
  const intentoParaMostrar = intentoActivo?.entregado ? intentoActivo : intentoSeleccionadoParaRevision;

  if (intentoParaMostrar && intentoParaMostrar.entregado) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B1320] text-slate-800 dark:text-slate-100 flex flex-col font-sans">
        <DisclaimerBanner />
        <Header vistaActual={vistaActual} setVistaActual={setVistaActual} />
        <main className="flex-1">
          <ExamResultsView
            intento={intentoParaMostrar}
            onVolverInicio={() => {
              setIntentoSeleccionadoParaRevision(null);
              setVistaActual('inicio');
            }}
            onIniciarPracticaConFiltro={async (preguntaIds) => {
              setIntentoSeleccionadoParaRevision(null);
              await iniciarExamen({
                modalidad: 'practica_personalizada',
                perfilId: intentoParaMostrar.perfilId as any,
                numeroPreguntas: preguntaIds.length,
                duracionMinutos: Math.max(15, Math.ceil(preguntaIds.length * 0.7)),
                mostrarMateriaDuranteExamen: true,
                soloFalladas: true,
              });
            }}
          />
        </main>
      </div>
    );
  }

  // 3. Vistas Principales de Navegación
  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B1320] text-slate-800 dark:text-slate-100 flex flex-col font-sans">
      <DisclaimerBanner />
      <Header vistaActual={vistaActual} setVistaActual={setVistaActual} />

      <main className="flex-1 pb-16">
        {vistaActual === 'inicio' && (
          <HomeDashboard
            onAbrirPreInicio={() => setModalPreInicioAbierto(true)}
            onAbrirConfigPractica={() => setModalConfigPracticaAbierto(true)}
            onIrAHistorial={() => setVistaActual('historial')}
            onIrAAdmin={() => setVistaActual('admin')}
            onIrACalidadJuridica={() => setVistaActual('calidad_juridica')}
            onIrAArbitroAdversarial={() => setVistaActual('arbitro_adversarial')}
          />
        )}

        {vistaActual === 'historial' && (
          <HistoryView
            onVerDetalle={(it) => setIntentoSeleccionadoParaRevision(it)}
            onVolverInicio={() => setVistaActual('inicio')}
          />
        )}

        {vistaActual === 'analiticas' && <AnalyticsView />}

        {vistaActual === 'calidad_juridica' && <ControlCalidadJuridicaView />}

        {vistaActual === 'arbitro_adversarial' && <AdversarialArbitratorView />}

        {vistaActual === 'admin' && <AdminPanel />}
      </main>

      {/* Modal Pre-Inicio de Simulacro Oficial */}
      {modalPreInicioAbierto && (
        <ExamModalPreStart
          onCerrar={() => setModalPreInicioAbierto(false)}
          onIniciarExito={() => setModalPreInicioAbierto(false)}
          onAbrirConfigPractica={() => {
            setModalPreInicioAbierto(false);
            setModalConfigPracticaAbierto(true);
          }}
        />
      )}

      {/* Modal Configuración de Práctica Personalizada */}
      {modalConfigPracticaAbierto && (
        <PracticeConfigModal
          onCerrar={() => setModalConfigPracticaAbierto(false)}
          onIniciarExamen={() => setModalConfigPracticaAbierto(false)}
        />
      )}

      {/* Footer Institucional Sobrio */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-serif font-bold text-slate-700 dark:text-slate-300">
            SIMULADOR JUDICIAL ECUADOR — Resoluciones CJ 144-2026 y 198-2026
          </p>
          <p>
            Herramienta privada de estudio técnico para juezas y jueces temporales de unidades judiciales. No constituye producto oficial del Consejo de la Judicatura.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <SimulatorProvider>
      <MainAppContent />
    </SimulatorProvider>
  );
}
