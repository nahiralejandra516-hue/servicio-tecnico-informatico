import React, { useRef } from 'react';
import { X, Printer, Wrench, ShieldCheck } from 'lucide-react';
import { Orden } from '../types';

interface ReceiptTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  orden: Orden | null;
}

export const ReceiptTicketModal: React.FC<ReceiptTicketModalProps> = ({
  isOpen,
  onClose,
  orden,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !orden) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Cabecera modal */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Comprobante Oficial de Servicio Técnico</span>
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CONTENIDO DEL TICKET PARA IMPRESIÓN */}
        <div ref={printRef} className="p-6 text-xs text-slate-800 space-y-4 font-mono bg-white">
          {/* Logo y Encabezado del taller */}
          <div className="text-center border-b border-dashed border-slate-300 pb-4">
            <div className="flex items-center justify-center gap-2 font-bold text-base text-slate-900 font-sans">
              <Wrench className="w-4 h-4 text-slate-700" />
              <span>TECNIFIX - SERVICIO TÉCNICO</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Laboratorio Especializado en Hardware y Software
            </p>
            <p className="text-[10px] text-slate-400">
              Tel: +54 11 5500-1122 · info@tecnifix-taller.edu.ar
            </p>
            <div className="mt-2 text-sm font-bold text-slate-900 font-mono tracking-wider">
              ORDEN: {orden.numero_orden}
            </div>
            <div className="text-[10px] text-slate-500">
              Fecha de emisión: {formatDate(new Date().toISOString())}
            </div>
          </div>

          {/* Datos del Cliente */}
          <div className="border-b border-dashed border-slate-300 pb-3 space-y-1">
            <div className="font-bold text-[11px] uppercase tracking-wider text-slate-900 font-sans">
              CLIENTE
            </div>
            <div><strong>Nombre:</strong> {orden.cliente?.nombre_completo}</div>
            <div><strong>DNI / Doc:</strong> {orden.cliente?.documento}</div>
            <div><strong>Teléfono:</strong> {orden.cliente?.telefono}</div>
            {orden.cliente?.direccion && <div><strong>Dirección:</strong> {orden.cliente.direccion}</div>}
          </div>

          {/* Datos del Equipo */}
          <div className="border-b border-dashed border-slate-300 pb-3 space-y-1">
            <div className="font-bold text-[11px] uppercase tracking-wider text-slate-900 font-sans">
              DATOS DEL DISPOSITIVO
            </div>
            <div><strong>Dispositivo:</strong> {orden.equipo?.tipo_equipo}</div>
            <div><strong>Marca / Modelo:</strong> {orden.equipo?.marca} {orden.equipo?.modelo}</div>
            <div><strong>Número de Serie:</strong> {orden.equipo?.numero_serie}</div>
            <div><strong>Accesorios dejados:</strong> {orden.equipo?.accesorios_dejados || 'Ninguno'}</div>
          </div>

          {/* Falla y Diagnóstico */}
          <div className="border-b border-dashed border-slate-300 pb-3 space-y-1.5">
            <div className="font-bold text-[11px] uppercase tracking-wider text-slate-900 font-sans">
              DETALLE DEL SERVICIO
            </div>
            <div>
              <strong>Falla declarada:</strong>
              <div className="text-[11px] text-slate-700 bg-slate-50 p-1.5 rounded mt-0.5 font-sans">
                {orden.falla_reportada}
              </div>
            </div>
            {orden.diagnostico && (
              <div>
                <strong>Diagnóstico técnico:</strong>
                <div className="text-[11px] text-slate-700 bg-slate-50 p-1.5 rounded mt-0.5 font-sans">
                  {orden.diagnostico}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between pt-1">
              <span><strong>Estado actual:</strong> {orden.estado.toUpperCase().replace('_', ' ')}</span>
              <span><strong>Fecha ingreso:</strong> {formatDate(orden.fecha_ingreso)}</span>
            </div>
          </div>

          {/* Presupuesto Total */}
          <div className="border-b border-dashed border-slate-300 pb-3 flex items-center justify-between text-sm">
            <span className="font-bold">TOTAL PRESUPUESTADO / ABONADO:</span>
            <span className="font-bold text-base text-slate-900 font-mono">
              ${Number(orden.costo || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Términos y firmas */}
          <div className="text-[10px] text-slate-500 space-y-2 pt-1 font-sans">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Garantía de servicio técnico: 90 días sobre mano de obra y repuestos.</span>
            </div>
            <p>
              Para retirar el equipo es requisito obligatorio presentar este comprobante o acreditar titularidad con el documento {orden.cliente?.documento}. Pasados los 60 días de notificado el retiro, se devengarán gastos de depósito.
            </p>

            <div className="pt-8 grid grid-cols-2 gap-6 text-center text-[10px]">
              <div className="border-t border-slate-400 pt-1">
                Firma del Cliente
              </div>
              <div className="border-t border-slate-400 pt-1">
                Firma Taller / Técnico
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
