import React, { useState } from 'react';
import { X, Database, CheckCircle2, RotateCcw } from 'lucide-react';
import { getStoredSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../lib/supabaseClient';
import { db } from '../lib/storage';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const current = getStoredSupabaseConfig();
  const [url, setUrl] = useState(current.url);
  const [key, setKey] = useState(current.anonKey);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const res = await testSupabaseConnection(url, key);
    setResult(res);
    setLoading(false);

    if (res.success) {
      saveSupabaseConfig(url, key);
      onConfigUpdated();
    }
  };

  const handleResetToLocal = () => {
    saveSupabaseConfig('', '');
    setUrl('');
    setKey('');
    setResult({
      success: true,
      message: 'Modo local reactivado. Los datos se guardan en el almacenamiento local del navegador.',
    });
    onConfigUpdated();
  };

  const handleResetDemoData = () => {
    if (confirm('¿Restablecer los datos de prueba iniciales (clientes, equipos y órdenes de ejemplo)?')) {
      db.resetDemoData();
      onConfigUpdated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Conexión con Supabase y Base de Datos
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleTestAndSave} className="p-5 space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Puedes conectar tu base de datos real de Supabase ingresando los datos de tu proyecto (Project Settings → API). Si no tienes cuenta aún, la aplicación funciona al 100% en modo local de simulación.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Project URL de Supabase
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzabcdefg.supabase.co"
              className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Anon Public API Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-[11px]"
            />
          </div>

          {result && (
            <div className={`p-3 rounded-lg border text-xs font-medium ${
              result.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {result.message}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleResetToLocal}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Usar solo modo local
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? 'Comprobando...' : 'Guardar y Conectar'}
              </button>
            </div>
          </div>

          {/* Restaurar datos demo */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              ¿Quieres reiniciar los datos de demostración?
            </span>
            <button
              type="button"
              onClick={handleResetDemoData}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restaurar demo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
