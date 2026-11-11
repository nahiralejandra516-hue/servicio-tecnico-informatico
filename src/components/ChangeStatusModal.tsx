import React, { useState } from 'react';
import { Orden, EstadoOrden, ValidationResult } from '../types';
import { X, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { validarTransicionEstado } from '../lib/storage';

interface ChangeStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  orden: Orden;
  onConfirmChange: (
    nuevoEstado: EstadoOrden,
    requisitos: { diagnostico?: string; costo?: number }
  ) => void;
  onShowValidationFeedback: (result: ValidationResult) => void;
}

export const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({
  isOpen,
  onClose,
  orden,
  onConfirmChange,
  onShowValidationFeedback,
}) => {
  const [selectedEstado, setSelectedEstado] = useState<EstadoOrden>(orden.estado);
  const [diagnostico, setDiagnostico] = useState(orden.diagnostico || '');
  const [costo, setCosto] = useState<number>(orden.costo || 0);

  if (!isOpen) return null;

  const estados: { id: EstadoOrden; label: string; desc: string }[] = [
    { id: 'recibido', label: 'Recibido', desc: 'Equipo ingresado al taller, a la espera de revisión inicial' },
    { id: 'en_diagnostico', label: 'En Diagnóstico', desc: 'El técnico está testeando componentes y evaluando la falla' },
    { id: 'en_reparacion', label: 'En Reparación', desc: 'Requiere diagnóstico cargado y costo mayor a $0' },
    { id: 'reparado', label: 'Reparado', desc: 'Servicio completado y testeado, listo para avisar al cliente' },
    { id: 'entregado', label: 'Entregado', desc: 'Solo permitido si la orden figura previamente como Reparada' },
    { id: 'cancelado', label: 'Cancelado', desc: 'Presupuesto no aceptado o equipo no reparable' },
  ];

  // Pre-validar en tiempo real para dar feedback proactivo
  const previewValidation = validarTransicionEstado(orden, selectedEstado, {
    diagnostico,
    costo,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const val = validarTransicionEstado(orden, selectedEstado, {
      diagnostico,
      costo,
    });

    if (!val.valid) {
      onShowValidationFeedback(val);
      return;
    }

    onConfirmChange(selectedEstado, {
      diagnostico,
      costo,
    });
    onShowValidationFeedback(val);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
      >
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              {orden.numero_orden} · {orden.equipo?.marca} {orden.equipo?.modelo}
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Transición de Estado Técnico
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Selector de nuevo estado */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Seleccionar Nuevo Estado
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {estados.map((est) => (
                <button
                  type="button"
                  key={est.id}
                  onClick={() => setSelectedEstado(est.id)}
                  className={`text-left p-3 rounded-lg border text-xs transition-all ${
                    selectedEstado === est.id
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{est.label}</span>
                    {orden.estado === est.id && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                        selectedEstado === est.id ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        Actual
                      </span>
                    )}
                  </div>
                  <div className={`text-[11px] mt-1 leading-tight ${
                    selectedEstado === est.id ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    {est.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Si se selecciona En Reparación o En Diagnóstico, solicitar diagnóstico y costo */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Diagnóstico Técnico {selectedEstado === 'en_reparacion' && <span className="text-rose-600 font-bold">* (Obligatorio para reparación)</span>}
              </label>
              <textarea
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
                placeholder="Describe la falla técnica encontrada, pruebas realizadas y solución propuesta..."
                rows={3}
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Costo / Presupuesto del Servicio ($ ARS) {selectedEstado === 'en_reparacion' && <span className="text-rose-600 font-bold">* (Debe ser &gt; $0)</span>}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={costo}
                  onChange={(e) => setCosto(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full text-xs pl-7 pr-3 py-2 rounded-lg border border-slate-300 font-mono font-semibold tabular-nums focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Banner de pre-visualización de regla */}
          {!previewValidation.valid ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">{previewValidation.message}</span>
                <span className="text-amber-800">{previewValidation.reason}</span>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Transición válida según las reglas del taller.</span>
            </div>
          )}

          {/* Acciones */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              <span>Aplicar Cambio de Estado</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
