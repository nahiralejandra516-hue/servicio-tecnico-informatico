import React from 'react';
import { 
  Wrench, 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Search, 
  Database, 
  Github, 
  CheckCircle2, 
  HardDrive
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'ordenes' | 'clientes_equipos' | 'consulta' | 'sql_script' | 'guia_render';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isSupabaseConnected: boolean;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isSupabaseConnected,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-200/80 shadow-xs shadow-pink-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zona 1: Marca Wordmark con detalle rosa lindo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 flex items-center justify-center text-white shadow-xs shadow-pink-200">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                  TecniFix
                </span>
                <span className="hidden sm:inline-block text-xs font-medium text-pink-700/80">
                  · Servicio Técnico Informático
                </span>
              </div>
            </div>
          </div>

          {/* Zona 2: Navegación de vistas */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-rose-100/80 text-rose-950 font-semibold border border-rose-200/70 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-rose-50/70'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-rose-500" />
              <span>Panel Principal</span>
            </button>

            <button
              onClick={() => setActiveTab('ordenes')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'ordenes'
                  ? 'bg-rose-100/80 text-rose-950 font-semibold border border-rose-200/70 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-rose-50/70'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-rose-500" />
              <span>Órdenes de Reparación</span>
            </button>

            <button
              onClick={() => setActiveTab('clientes_equipos')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'clientes_equipos'
                  ? 'bg-rose-100/80 text-rose-950 font-semibold border border-rose-200/70 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-rose-50/70'
              }`}
            >
              <Users className="w-4 h-4 text-rose-500" />
              <span>Clientes y Equipos</span>
            </button>

            <button
              onClick={() => setActiveTab('consulta')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'consulta'
                  ? 'bg-pink-100/90 text-pink-950 font-semibold border border-pink-300/70 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-rose-50/70'
              }`}
            >
              <Search className="w-4 h-4 text-pink-600" />
              <span>Portal de Consulta</span>
            </button>

            <button
              onClick={() => setActiveTab('sql_script')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'sql_script'
                  ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-rose-50/70'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Script SQL Supabase</span>
            </button>

            <button
              onClick={() => setActiveTab('guia_render')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'guia_render'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Github className="w-4 h-4 text-slate-600" />
              <span>Render & GitHub</span>
            </button>
          </nav>

          {/* Zona 3: Estado de Base de Datos y Acción */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenSettings}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all whitespace-nowrap ${
                isSupabaseConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
              title="Configurar conexión con Supabase"
            >
              {isSupabaseConnected ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Supabase Conectado</span>
                </>
              ) : (
                <>
                  <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                  <span>Modo Local / Demo</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Barra de pestañas móvil en pantallas pequeñas */}
        <div className="lg:hidden flex items-center gap-1 pb-3 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('ordenes')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'ordenes' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Órdenes
          </button>
          <button
            onClick={() => setActiveTab('clientes_equipos')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'clientes_equipos' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Clientes/Equipos
          </button>
          <button
            onClick={() => setActiveTab('consulta')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'consulta' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Portal Consulta
          </button>
          <button
            onClick={() => setActiveTab('sql_script')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'sql_script' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Script SQL
          </button>
          <button
            onClick={() => setActiveTab('guia_render')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'guia_render' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Render / GitHub
          </button>
        </div>

      </div>
    </header>
  );
};
