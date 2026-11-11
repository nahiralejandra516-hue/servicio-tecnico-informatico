import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, CheckCircle2, Database } from 'lucide-react';
import { Orden, Cliente } from '../types';

export type DeleteItem = 
  | { type: 'orden'; data: Orden }
  | { type: 'cliente'; data: Cliente; cascadeWarning?: boolean };

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DeleteItem | null;
  onConfirmDelete: (item: DeleteItem, cascade?: boolean) => Promise<{ success: boolean; error?: string }>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  item,
  onConfirmDelete,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cascade, setCascade] = useState(false);

  if (!isOpen || !item) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await onConfirmDelete(item, cascade);
      if (!res.success) {
        setErrorMessage(res.error || 'Error al eliminar el registro en Supabase.');
      } else {
        onClose();
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const isOrden = item.type === 'orden';
  const orden = isOrden ? item.data : null;
  const cliente = !isOrden ? item.data : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-rose-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Cabecera del modal */}
        <div className="p-5 bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 border-b border-rose-100 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 shadow-xs">
            <Trash2 className="w-5 h-5 text-rose-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {isOrden ? '¿Eliminar Orden de Reparación?' : '¿Eliminar Cliente?'}
            </h3>
            <p className="text-xs text-rose-800 font-medium mt-0.5 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>Se borrará de Supabase y del almacenamiento local</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 font-medium flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block">No se pudo eliminar:</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Ficha resumida de lo que se va a borrar */}
          {isOrden && orden && (
            <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 text-sm">{orden.numero_orden}</span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-rose-200 text-slate-700 font-semibold uppercase text-[10px]">
                  {orden.estado.replace('_', ' ')}
                </span>
              </div>
              <div className="text-slate-700">
                <strong>Cliente:</strong> {orden.cliente?.nombre_completo || 'No asignado'} (DNI: {orden.cliente?.documento || '-'})
              </div>
              <div className="text-slate-700">
                <strong>Equipo:</strong> {orden.equipo?.marca} {orden.equipo?.modelo} (S/N: {orden.equipo?.numero_serie})
              </div>
              <div className="text-slate-600 text-[11px] pt-1 border-t border-rose-100">
                <strong>Falla:</strong> {orden.falla_reportada}
              </div>
            </div>
          )}

          {!isOrden && cliente && (
            <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{cliente.nombre_completo}</span>
                <span className="font-mono text-slate-600 font-bold">DNI: {cliente.documento}</span>
              </div>
              {cliente.telefono && <div className="text-slate-700"><strong>Tel:</strong> {cliente.telefono}</div>}
              {cliente.email && <div className="text-slate-700"><strong>Email:</strong> {cliente.email}</div>}

              {item.cascadeWarning && (
                <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
                  <p className="font-semibold mb-1">
                    Este cliente posee equipos u órdenes asociadas en la base de datos.
                  </p>
                  <label className="flex items-start gap-2 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={cascade}
                      onChange={(e) => setCascade(e.target.checked)}
                      className="mt-0.5 accent-rose-600 rounded"
                    />
                    <span>
                      Eliminar en cascada también sus equipos y órdenes asociadas en Supabase.
                    </span>
                  </label>
                </div>
              )}
            </div>
          )}

          <p className="text-slate-600 leading-relaxed">
            Esta acción es definitiva y ejecutará la sentencia <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-700 font-mono">DELETE</code> directamente en tu base de datos de Supabase.
          </p>
        </div>

        {/* Acciones */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-colors shadow-xs disabled:opacity-50"
          >
            {loading ? (
              <span>Eliminando en Supabase...</span>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar Eliminación</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
