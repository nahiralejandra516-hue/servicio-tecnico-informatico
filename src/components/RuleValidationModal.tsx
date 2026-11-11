import React from 'react';
import { AlertTriangle, CheckCircle2, X, ArrowRight, ShieldAlert } from 'lucide-react';
import { ValidationResult } from '../types';

interface RuleValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ValidationResult | null;
  onConfirmAlternative?: () => void;
  alternativeActionLabel?: string;
}

export const RuleValidationModal: React.FC<RuleValidationModalProps> = ({
  isOpen,
  onClose,
  result,
  onConfirmAlternative,
  alternativeActionLabel,
}) => {
  if (!isOpen || !result) return null;

  const isSuccess = result.valid;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
        role="alertdialog"
        aria-modal="true"
      >
        {/* Encabezado con estado visual claro */}
        <div className={`p-5 flex items-start gap-4 border-b ${
          isSuccess 
            ? 'bg-emerald-50/70 border-emerald-100 text-emerald-900' 
            : 'bg-amber-50/80 border-amber-100 text-amber-950'
        }`}>
          <div className={`p-2.5 rounded-lg shrink-0 ${
            isSuccess ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
          }`}>
            {isSuccess ? <CheckCircle2 className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>

          <div className="flex-1">
            <h3 className="text-base font-bold tracking-tight">
              {result.message}
            </h3>
            {result.reason && (
              <p className="mt-1 text-sm text-slate-700 leading-relaxed">
                {result.reason}
              </p>
            )}
          </div>

          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md"
            aria-label="Cerrar aviso"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo con lista de requisitos faltantes o instrucciones */}
        <div className="p-5 space-y-4 text-sm">
          {result.missingRequirements && result.missingRequirements.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200">
              <span className="font-semibold text-xs tracking-wider text-slate-600 uppercase">
                Requisitos obligatorios no cumplidos:
              </span>
              <ul className="mt-2 space-y-1.5">
                {result.missingRequirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-rose-700 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.suggestedAction && (
            <div className="text-slate-600 bg-sky-50/60 border border-sky-100 p-3.5 rounded-lg">
              <span className="font-semibold text-xs text-sky-900 block mb-1 uppercase tracking-wider">
                ¿Cómo proceder para resolverlo?
              </span>
              <p className="text-sky-900">{result.suggestedAction}</p>
            </div>
          )}

          <div className="text-xs text-slate-500 pt-1">
            <span>Regla de integridad técnica</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Validación activa en tiempo real</span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          {onConfirmAlternative && alternativeActionLabel && (
            <button
              onClick={() => {
                onConfirmAlternative();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              <span>{alternativeActionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
