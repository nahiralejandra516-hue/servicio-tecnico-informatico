import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Printer, 
  Laptop, 
  Calendar, 
  DollarSign,
  FileCheck
} from 'lucide-react';
import { Orden, Cliente, Equipo, EstadoOrden } from '../types';

interface ConsultationPortalProps {
  ordenes: Orden[];
  clientes: Cliente[];
  equipos: Equipo[];
  onPrintTicket: (orden: Orden) => void;
}

export const ConsultationPortal: React.FC<ConsultationPortalProps> = ({
  ordenes,
  clientes,
  equipos,
  onPrintTicket,
}) => {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<Orden[]>([]);

  const handleSearch = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = (customQuery !== undefined ? customQuery : query).trim().toLowerCase();
    
    if (!q) {
      setResults([]);
      setSearched(false);
      return;
    }

    setSearched(true);

    const matches = ordenes.filter(orden => {
      const matchNumOrden = orden.numero_orden.toLowerCase() === q;
      const matchDni = orden.cliente?.documento.toLowerCase() === q;
      const matchSerie = orden.equipo?.numero_serie.toLowerCase() === q;
      const partialNom = (orden.cliente?.nombre_completo || '').toLowerCase().includes(q);

      return matchNumOrden || matchDni || matchSerie || partialNom;
    });

    setResults(matches);
  };

  const getStepStatus = (current: EstadoOrden, step: EstadoOrden) => {
    const orderLevels: Record<EstadoOrden, number> = {
      recibido: 1,
      en_diagnostico: 2,
      en_reparacion: 3,
      reparado: 4,
      entregado: 5,
      cancelado: 0,
    };

    if (current === 'cancelado') return 'cancelled';
    const currentLvl = orderLevels[current];
    const stepLvl = orderLevels[step];

    if (currentLvl > stepLvl) return 'completed';
    if (currentLvl === stepLvl) return 'current';
    return 'upcoming';
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return null;
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  };

  const steps: { id: EstadoOrden; label: string; desc: string }[] = [
    { id: 'recibido', label: '1. Recibido', desc: 'Ingreso al taller' },
    { id: 'en_diagnostico', label: '2. En Diagnóstico', desc: 'Evaluación técnica' },
    { id: 'en_reparacion', label: '3. En Reparación', desc: 'Arreglo de componentes' },
    { id: 'reparado', label: '4. Reparado', desc: 'Listo para retiro' },
    { id: 'entregado', label: '5. Entregado', desc: 'Retirado por cliente' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Encabezado del Portal de Clientes */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100/90 border border-pink-300 text-pink-950 text-xs font-semibold shadow-xs">
          <span>Portal de Consulta para Clientes</span>
          <span aria-hidden="true">·</span>
          <span>Seguimiento Online</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Consulta el Estado de tu Reparación
        </h1>
        <p className="text-sm text-slate-600">
          Ingresa tu número de documento (DNI), código de orden (ej: ORD-2026-001) o el número de serie de tu equipo para conocer el diagnóstico técnico y avance del servicio.
        </p>
      </div>

      {/* Buscador de consulta */}
      <div className="rose-card rounded-2xl p-6 shadow-md max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ingresa tu DNI o N° de Orden (ej: ORD-2026-003)..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-600 focus:border-sky-600 font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-xs shrink-0 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Consultar Estado</span>
          </button>
        </form>

        {/* Atajos de prueba para la demostración del colegio */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-600">Búsquedas de prueba sugeridas:</span>
          <button
            type="button"
            onClick={() => {
              setQuery('38492019');
              handleSearch(undefined, '38492019');
            }}
            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono"
          >
            DNI: 38492019
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery('ORD-2026-003');
              handleSearch(undefined, 'ORD-2026-003');
            }}
            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono"
          >
            Orden: ORD-2026-003
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery('SN-DELL-5520-X');
              handleSearch(undefined, 'SN-DELL-5520-X');
            }}
            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono"
          >
            Serie: SN-DELL-5520-X
          </button>
        </div>
      </div>

      {/* RESULTADOS DE LA CONSULTA */}
      {searched && (
        <div className="space-y-6">
          {results.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-md mx-auto space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">
                No encontramos órdenes registradas
              </h3>
              <p className="text-xs text-slate-600">
                Verifica que el número de DNI o código de orden esté bien escrito, o consulta telefónicamente con el taller.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                Se encontraron {results.length} orden(es) de servicio asociadas:
              </div>

              {results.map((orden) => {
                const isReparado = orden.estado === 'reparado';
                const isEntregado = orden.estado === 'entregado';
                const isEnReparacion = orden.estado === 'en_reparacion';

                return (
                  <div 
                    key={orden.id}
                    className="rose-card rounded-2xl shadow-sm overflow-hidden"
                  >
                    {/* Cabecera del resultado */}
                    <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xl font-bold tracking-tight text-white">
                            {orden.numero_orden}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            isReparado 
                              ? 'bg-emerald-400 text-slate-900' 
                              : isEntregado 
                              ? 'bg-slate-700 text-slate-200' 
                              : 'bg-amber-400 text-slate-900'
                          }`}>
                            {orden.estado.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          Cliente: <strong>{orden.cliente?.nombre_completo}</strong> · DNI: <span className="font-mono">{orden.cliente?.documento}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-[11px] uppercase tracking-wider text-slate-400">
                            Presupuesto / Costo
                          </div>
                          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                            ${Number(orden.costo || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>

                        <button
                          onClick={() => onPrintTicket(orden)}
                          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700"
                          title="Descargar comprobante en PDF / Imprimir"
                        >
                          <Printer className="w-4 h-4 text-slate-300" />
                          <span>Comprobante</span>
                        </button>
                      </div>
                    </div>

                    {/* LÍNEA DE TIEMPO DEL ESTADO TÉCNICO */}
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
                        Progreso del Servicio Técnico
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
                        {steps.map((st, idx) => {
                          const status = getStepStatus(orden.estado, st.id);
                          return (
                            <div 
                              key={st.id} 
                              className={`p-3 rounded-xl border text-xs transition-all ${
                                status === 'completed'
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                                  : status === 'current'
                                  ? 'bg-white border-sky-400 ring-2 ring-sky-100 text-slate-900 shadow-xs'
                                  : 'bg-white/60 border-slate-200 text-slate-400'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-bold text-[11px] uppercase tracking-wider">
                                  {st.label}
                                </span>
                                {status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                                {status === 'current' && <Clock className="w-4 h-4 text-sky-600 animate-pulse" />}
                              </div>
                              <p className="text-[11px] leading-snug opacity-90">{st.desc}</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Notificación para el cliente */}
                      <div className="mt-5 p-4 rounded-xl border text-xs">
                        {isReparado && (
                          <div className="bg-emerald-50 border-emerald-200 text-emerald-900 flex items-start gap-3 p-3 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block text-sm font-bold text-emerald-950">
                                ¡Tu equipo ya está reparado y verificado en laboratorio!
                              </strong>
                              <p className="mt-0.5 text-emerald-800">
                                Puedes acercarte a retirar tu dispositivo por nuestro taller con este número de orden o tu DNI.
                              </p>
                            </div>
                          </div>
                        )}

                        {isEntregado && (
                          <div className="bg-slate-100 border-slate-200 text-slate-800 flex items-start gap-3 p-3 rounded-lg">
                            <FileCheck className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block font-bold">Orden cerrada y entregada</strong>
                              <p className="text-slate-600">
                                Este servicio cuenta con 90 días de garantía técnica sobre la mano de obra y repuestos reemplazados.
                              </p>
                            </div>
                          </div>
                        )}

                        {isEnReparacion && (
                          <div className="bg-indigo-50 border-indigo-200 text-indigo-900 flex items-start gap-3 p-3 rounded-lg">
                            <Clock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block font-bold">Equipo actualmente en banco de trabajo</strong>
                              <p className="text-indigo-800">
                                Nuestros técnicos informáticos están ejecutando la reparación autorizada.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* DETALLE TÉCNICO COMPLETO */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      {/* Columna Izquierda: Equipo */}
                      <div className="space-y-3">
                        <span className="font-bold uppercase tracking-wider text-slate-500 block">
                          Datos del Dispositivo
                        </span>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                            <Laptop className="w-4 h-4 text-slate-600" />
                            <span>{orden.equipo?.marca} {orden.equipo?.modelo}</span>
                          </div>
                          <div className="text-slate-600">
                            <strong>Tipo:</strong> {orden.equipo?.tipo_equipo}
                          </div>
                          <div className="text-slate-600 font-mono">
                            <strong>Número de Serie:</strong> {orden.equipo?.numero_serie}
                          </div>
                          <div className="text-slate-600">
                            <strong>Accesorios recibidos:</strong> {orden.equipo?.accesorios_dejados || 'Ninguno'}
                          </div>
                          {orden.equipo?.notas_equipo && (
                            <div className="text-slate-500 italic text-[11px] pt-1 border-t border-slate-200">
                              Nota estética: {orden.equipo.notas_equipo}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Columna Derecha: Falla y Diagnóstico */}
                      <div className="space-y-3">
                        <span className="font-bold uppercase tracking-wider text-slate-500 block">
                          Informe Técnico
                        </span>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                          <div>
                            <span className="font-semibold text-slate-700 block mb-0.5">Falla inicial declarada:</span>
                            <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                              {orden.falla_reportada}
                            </p>
                          </div>

                          <div>
                            <span className="font-semibold text-slate-700 block mb-0.5">Diagnóstico y Solución Técnica:</span>
                            {orden.diagnostico ? (
                              <p className="text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 font-medium leading-relaxed">
                                {orden.diagnostico}
                              </p>
                            ) : (
                              <div className="text-amber-800 italic bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                                Diagnóstico técnico en curso por el laboratorio.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
