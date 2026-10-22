import React from 'react';
import {
  Scale,
  Moon,
  Sun,
  ShieldAlert,
  BarChart2,
  History,
  Settings,
  BookOpen,
  ShieldCheck,
  Share2,
  Check,
} from 'lucide-react';
import { useSimulator } from '../context/SimulatorContext';

interface HeaderProps {
  vistaActual: 'inicio' | 'historial' | 'analiticas' | 'admin' | 'calidad_juridica' | 'arbitro_adversarial';
  setVistaActual: (
    vista: 'inicio' | 'historial' | 'admin' | 'analiticas' | 'calidad_juridica' | 'arbitro_adversarial'
  ) => void;
}

export const Header: React.FC<HeaderProps> = ({ vistaActual, setVistaActual }) => {
  const {
    perfilActual,
    setPerfilId,
    preguntas,
    preguntasValidadas,
    preguntasDemo,
    esModoOscuro,
    alternarModoOscuro,
    intentoActivo,
  } = useSimulator();

  const [copiado, setCopiado] = React.useState(false);

  const handleCompartir = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 3000);
      }
    } catch {
      // Fallback
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    }
  };

  const totalValidadasReales = preguntasValidadas.filter((p) => !p.esDemostracion).length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Nombre Institucional */}
          <button
            onClick={() => {
              if (!intentoActivo || intentoActivo.entregado) {
                setVistaActual('inicio');
              }
            }}
            className="flex items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-teal-400 rounded-md p-1"
          >
            <div className="w-10 h-10 rounded bg-gradient-to-br from-teal-700 to-slate-800 border border-teal-500/30 flex items-center justify-center text-teal-300 shadow-inner">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-teal-400 font-semibold block leading-tight">
                República del Ecuador
              </span>
              <h1 className="text-base sm:text-lg font-bold font-serif tracking-tight text-white leading-tight">
                SIMULADOR JUDICIAL ECUADOR
              </h1>
            </div>
          </button>

          {/* Menú y Controles */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Selector de Perfil Rápido */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700/60 text-xs">
              <span className="text-slate-400">Perfil:</span>
              <select
                aria-label="Seleccionar perfil de evaluación"
                value={perfilActual.id}
                onChange={(e) =>
                  setPerfilId(e.target.value as 'penal_completo' | 'personalizado_usuario')
                }
                disabled={Boolean(intentoActivo && !intentoActivo.entregado)}
                className="bg-transparent text-teal-300 font-medium focus:outline-none cursor-pointer"
              >
                <option value="penal_completo" className="bg-slate-800 text-white">
                  Penal Completo (7 materias)
                </option>
                <option value="personalizado_usuario" className="bg-slate-800 text-white">
                  Personalizado (6 materias)
                </option>
              </select>
            </div>

            {/* Contador de Banco */}
            <div
              title={`${preguntas.length} preguntas en el banco`}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-xs text-slate-300 border border-slate-700"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-400" />
              <span>
                Banco:{' '}
                <strong className={preguntas.length > 0 ? 'text-teal-300 font-bold' : 'text-amber-400 font-bold'}>
                  {preguntas.length}
                </strong>
                {preguntas.length === 0 ? ' (vacío)' : ' preguntas'}
              </span>
            </div>

            {/* Navegación de vistas (deshabilitada si examen en vivo no entregado) */}
            {(!intentoActivo || intentoActivo.entregado) && (
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => setVistaActual('inicio')}
                  className={`px-3 py-2 rounded text-xs sm:text-sm font-medium transition-colors ${
                    vistaActual === 'inicio'
                      ? 'bg-teal-700 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Simulador
                </button>
                <button
                  onClick={() => setVistaActual('historial')}
                  className={`px-3 py-2 rounded text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    vistaActual === 'historial'
                      ? 'bg-teal-700 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Historial</span>
                </button>
                <button
                  onClick={() => setVistaActual('analiticas')}
                  className={`px-3 py-2 rounded text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    vistaActual === 'analiticas'
                      ? 'bg-teal-700 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Analítica</span>
                </button>
                <button
                  onClick={() => setVistaActual('calidad_juridica')}
                  className={`px-3 py-2 rounded text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    vistaActual === 'calidad_juridica'
                      ? 'bg-amber-700 text-white shadow-sm'
                      : 'text-amber-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Control de calidad jurídica"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Calidad Jurídica</span>
                </button>
                <button
                  onClick={() => setVistaActual('arbitro_adversarial')}
                  className={`px-3 py-2 rounded text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    vistaActual === 'arbitro_adversarial'
                      ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                      : 'text-amber-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Árbitro Adversarial: Auditoría de Rigor y No Repetición"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Árbitro Adversarial</span>
                </button>
                <button
                  onClick={() => setVistaActual('admin')}
                  className={`px-3 py-2 rounded text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    vistaActual === 'admin'
                      ? 'bg-teal-700 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Administración</span>
                </button>
              </nav>
            )}

            {/* Botón Compartir Enlace */}
            <button
              onClick={handleCompartir}
              className={`px-2.5 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm border ${
                copiado
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-teal-300 hover:text-white'
              }`}
              title="Copiar enlace para compartir a otros usuarios"
            >
              {copiado ? <Check className="w-3.5 h-3.5 text-white" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiado ? '¡Link Copiado!' : 'Compartir'}</span>
            </button>

            {/* Selector de Modo Oscuro */}
            <button
              onClick={alternarModoOscuro}
              aria-label={esModoOscuro ? 'Activar modo claro' : 'Activar modo oscuro'}
              className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors focus:ring-2 focus:ring-teal-400"
            >
              {esModoOscuro ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
