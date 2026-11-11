import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  Database, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles,
  AlertTriangle,
  Play
} from 'lucide-react';
import { SUPABASE_SQL_SCRIPT } from '../lib/sqlScript';
import { 
  getStoredSupabaseConfig, 
  saveSupabaseConfig, 
  testSupabaseConnection 
} from '../lib/supabaseClient';

interface SqlEditorViewProps {
  onConnectionStatusChanged: () => void;
}

export const SqlEditorView: React.FC<SqlEditorViewProps> = ({
  onConnectionStatusChanged,
}) => {
  const [copied, setCopied] = useState(false);
  const stored = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(stored.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(stored.anonKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([SUPABASE_SQL_SCRIPT], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tecnifix_schema_supabase.sql';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    setTestResult(res);
    setTesting(false);

    if (res.success) {
      saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
      onConnectionStatusChanged();
    }
  };

  const handleClearConfig = () => {
    saveSupabaseConfig('', '');
    setSupabaseUrl('');
    setSupabaseAnonKey('');
    setTestResult(null);
    onConnectionStatusChanged();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            Script Oficial para Supabase
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Script SQL para el SQL Editor de Supabase
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Crea las 3 tablas (<code>clientes</code>, <code>equipos</code> y <code>ordenes</code>) con claves primarias UUID, claves foráneas, restricciones de unicidad (UNIQUE en documento y número de serie), triggers automáticos para <code>updated_at</code> y validación estricta de reglas de negocio a nivel de base de datos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '¡Copiado al Portapapeles!' : 'Copiar Script SQL'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Descargar .sql</span>
          </button>
        </div>
      </div>

      {/* Grid: Instrucciones de uso y Conexión Supabase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pasos para ejecutar en Supabase */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-600" />
            <span>Cómo ejecutarlo en Supabase</span>
          </h3>

          <ol className="text-xs text-slate-600 space-y-3 list-decimal list-inside leading-relaxed">
            <li>
              Crea un proyecto gratuito en{' '}
              <a 
                href="https://supabase.com" 
                target="_blank" 
                rel="noreferrer" 
                className="text-sky-700 font-semibold underline inline-flex items-center gap-0.5"
              >
                supabase.com <ExternalLink className="w-3 h-3 inline" />
              </a>.
            </li>
            <li>
              En el menú lateral izquierdo, haz clic en el ícono de <strong>SQL Editor</strong>.
            </li>
            <li>
              Haz clic en <strong>+ New Query</strong>.
            </li>
            <li>
              Pega todo el script SQL que copiaste aquí con el botón verde.
            </li>
            <li>
              Presiona el botón verde <strong>Run</strong> (o Ctrl + Enter).
            </li>
            <li>
              Verás el mensaje <em>Success. No rows returned</em> y las 3 tablas estarán creadas con sus datos de prueba y políticas RLS listas.
            </li>
          </ol>

          {/* Configuración de conexión con la app */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Conectar esta App con tu Supabase
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Encuentra tus credenciales en Supabase: <strong>Project Settings → API</strong>.
            </p>

            <form onSubmit={handleTestAndSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">
                  Project URL
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full p-2 rounded-lg border border-slate-300 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">
                  Anon Public Key
                </label>
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full p-2 rounded-lg border border-slate-300 font-mono text-[11px]"
                />
              </div>

              {testResult && (
                <div className={`p-3 rounded-lg border text-xs font-medium ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  {testResult.message}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={testing}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {testing ? 'Verificando tablas...' : 'Probar y Conectar'}
                </button>

                {supabaseUrl && (
                  <button
                    type="button"
                    onClick={handleClearConfig}
                    className="px-2.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
                    title="Desconectar y volver a modo local"
                  >
                    Desconectar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Visor de código SQL con sintaxis legible */}
        <div className="lg:col-span-2 bg-slate-900 text-slate-200 rounded-xl overflow-hidden border border-slate-800 shadow-sm flex flex-col">
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 font-mono text-slate-400">schema_supabase.sql</span>
            </div>

            <button
              onClick={handleCopy}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          <div className="p-4 overflow-y-auto max-h-[600px] text-xs font-mono leading-relaxed select-all">
            <pre className="whitespace-pre text-slate-300">
              {SUPABASE_SQL_SCRIPT}
            </pre>
          </div>
        </div>

      </div>

      {/* Resumen de características técnicas del script */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          Detalle de la Arquitectura de Base de Datos Implementada
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <strong className="text-slate-900 block font-bold text-sm">
              1. Clientes (clientes)
            </strong>
            <p>
              Identificador UUID, <code>documento UNIQUE</code> (DNI/CUIT intransferible), nombre, teléfono, email, dirección, marcas de tiempo <code>created_at</code> y <code>updated_at</code>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <strong className="text-slate-900 block font-bold text-sm">
              2. Equipos (equipos)
            </strong>
            <p>
              Identificador UUID, relación <code>cliente_id REFERENCES clientes</code>, <code>numero_serie UNIQUE</code> (número de serie único de fábrica), tipo, marca, modelo, accesorios dejados y notas.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <strong className="text-slate-900 block font-bold text-sm">
              3. Órdenes (ordenes)
            </strong>
            <p>
              Identificador UUID, <code>numero_orden UNIQUE</code>, relación <code>equipo_id REFERENCES equipos</code>, falla reportada, diagnóstico técnico, <code>costo &gt;= 0</code>, estados controlados y disparadores automáticos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
