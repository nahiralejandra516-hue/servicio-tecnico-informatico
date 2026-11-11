import React, { useState, useMemo } from 'react';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  RotateCcw, 
  FileText, 
  ArrowRightCircle, 
  Printer, 
  Edit3, 
  CheckCircle2, 
  Wrench,
  Clock,
  PackageCheck,
  Trash2
} from 'lucide-react';
import { Orden, EstadoOrden, ValidationResult } from '../types';
import { validarTransicionEstado } from '../lib/storage';

interface OrderListProps {
  ordenes: Orden[];
  onNewOrder: () => void;
  onEditOrder: (orden: Orden) => void;
  onOpenStatusModal: (orden: Orden) => void;
  onPrintTicket: (orden: Orden) => void;
  onShowValidationFeedback: (result: ValidationResult) => void;
  onDirectStatusChange: (ordenId: string, nuevoEstado: EstadoOrden) => void;
  onDeleteOrder: (orden: Orden) => void;
  initialEstadoFilter?: EstadoOrden | 'todos';
}

export const OrderList: React.FC<OrderListProps> = ({
  ordenes,
  onNewOrder,
  onEditOrder,
  onOpenStatusModal,
  onPrintTicket,
  onShowValidationFeedback,
  onDirectStatusChange,
  onDeleteOrder,
  initialEstadoFilter = 'todos',
}) => {
  // Filtros combinados
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoOrden | 'todos'>(initialEstadoFilter);
  const [tipoEquipoFilter, setTipoEquipoFilter] = useState<string>('todos');

  // Tipos de equipos únicos para el selector
  const tiposEquipos = useMemo(() => {
    const set = new Set<string>();
    ordenes.forEach(o => {
      if (o.equipo?.tipo_equipo) set.add(o.equipo.tipo_equipo);
    });
    return Array.from(set);
  }, [ordenes]);

  // Filtrado reactivo combinado
  const ordenesFiltradas = useMemo(() => {
    return ordenes.filter(orden => {
      // 1. Filtro por estado
      if (estadoFilter !== 'todos' && orden.estado !== estadoFilter) {
        return false;
      }

      // 2. Filtro por tipo de equipo
      if (tipoEquipoFilter !== 'todos' && orden.equipo?.tipo_equipo !== tipoEquipoFilter) {
        return false;
      }

      // 3. Filtro por texto combinado (DNI, Cliente, Serie, Marca, Modelo, Falla, Nro Orden)
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase().trim();
        const numOrdenMatch = orden.numero_orden.toLowerCase().includes(query);
        const fallaMatch = orden.falla_reportada.toLowerCase().includes(query);
        const diagMatch = (orden.diagnostico || '').toLowerCase().includes(query);
        const clienteNomMatch = (orden.cliente?.nombre_completo || '').toLowerCase().includes(query);
        const clienteDniMatch = (orden.cliente?.documento || '').toLowerCase().includes(query);
        const serieMatch = (orden.equipo?.numero_serie || '').toLowerCase().includes(query);
        const marcaMatch = (orden.equipo?.marca || '').toLowerCase().includes(query);
        const modeloMatch = (orden.equipo?.modelo || '').toLowerCase().includes(query);

        return (
          numOrdenMatch ||
          fallaMatch ||
          diagMatch ||
          clienteNomMatch ||
          clienteDniMatch ||
          serieMatch ||
          marcaMatch ||
          modeloMatch
        );
      }

      return true;
    });
  }, [ordenes, estadoFilter, tipoEquipoFilter, searchTerm]);

  const handleQuickTransition = (orden: Orden, targetEstado: EstadoOrden) => {
    const val = validarTransicionEstado(orden, targetEstado);
    if (!val.valid) {
      onShowValidationFeedback(val);
      return;
    }
    onDirectStatusChange(orden.id, targetEstado);
    onShowValidationFeedback(val);
  };

  const getBadgeStyle = (estado: EstadoOrden) => {
    switch (estado) {
      case 'recibido':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'en_diagnostico':
        return 'bg-sky-100 text-sky-900 border-sky-200';
      case 'en_reparacion':
        return 'bg-indigo-100 text-indigo-900 border-indigo-200';
      case 'reparado':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'entregado':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'cancelado':
        return 'bg-rose-100 text-rose-900 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getEstadoLabel = (estado: EstadoOrden) => {
    switch (estado) {
      case 'recibido': return 'Recibido';
      case 'en_diagnostico': return 'En Diagnóstico';
      case 'en_reparacion': return 'En Reparación';
      case 'reparado': return 'Reparado';
      case 'entregado': return 'Entregado';
      case 'cancelado': return 'Cancelado';
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header de sección */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Administración del Taller
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Órdenes de Reparación y Servicio
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Control de flujo técnico, presupuestos y validación estricta de cambios de estado.
          </p>
        </div>

        <button
          onClick={onNewOrder}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs whitespace-nowrap self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <span>Ingresar Nueva Orden</span>
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS COMBINADOS */}
      <div className="rose-card rounded-2xl p-4.5 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          
          {/* Input de búsqueda general */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, DNI, número de serie, modelo, orden o falla..."
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Filtro por tipo de equipo */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={tipoEquipoFilter}
              onChange={(e) => setTipoEquipoFilter(e.target.value)}
              className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-medium text-slate-700"
            >
              <option value="todos">Todos los dispositivos</option>
              {tiposEquipos.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          {/* Botón de reseteo si hay filtros */}
          {(searchTerm || estadoFilter !== 'todos' || tipoEquipoFilter !== 'todos') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setEstadoFilter('todos');
                setTipoEquipoFilter('todos');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors whitespace-nowrap"
              title="Restablecer todos los filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
          )}

        </div>

        {/* Segmented filter por Estados */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 shrink-0">
            Estado:
          </span>
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'recibido', label: 'Recibidos' },
            { id: 'en_diagnostico', label: 'En Diagnóstico' },
            { id: 'en_reparacion', label: 'En Reparación' },
            { id: 'reparado', label: 'Reparados (Listos)' },
            { id: 'entregado', label: 'Entregados' },
            { id: 'cancelado', label: 'Cancelados' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setEstadoFilter(tab.id as EstadoOrden | 'todos')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap shrink-0 ${
                estadoFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tab.label}
              {tab.id !== 'todos' && (
                <span className="ml-1.5 opacity-75 font-mono text-[11px]">
                  ({ordenes.filter(o => o.estado === tab.id).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* LISTADO / TABLA DE ÓRDENES */}
      <div className="rose-card rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-pink-100 flex items-center justify-between text-xs text-slate-600 bg-rose-50/40">
          <span>
            Mostrando <strong>{ordenesFiltradas.length}</strong> de {ordenes.length} órdenes registradas
          </span>
          <div className="flex items-center gap-2 text-[11px]">
            <span>Reglas activas:</span>
            <span className="text-amber-800 font-medium">Reparación con diag + costo</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-800 font-medium">Entrega solo reparadas</span>
          </div>
        </div>

        {ordenesFiltradas.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              No se encontraron órdenes con los filtros seleccionados
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Intenta cambiar los términos de búsqueda o selecciona otro estado técnico.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setEstadoFilter('todos');
                setTipoEquipoFilter('todos');
              }}
              className="mt-2 text-xs font-semibold text-slate-900 underline"
            >
              Ver todas las órdenes
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Orden / Fecha</th>
                  <th className="py-3 px-4">Cliente (DNI Único)</th>
                  <th className="py-3 px-4">Equipo (Serie Única)</th>
                  <th className="py-3 px-4">Falla y Diagnóstico</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Costo ($)</th>
                  <th className="py-3 px-4 text-center">Acciones y Reglas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ordenesFiltradas.map((orden) => (
                  <tr key={orden.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Código de orden y fecha */}
                    <td className="py-4 px-4 align-top">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {orden.numero_orden}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Ingreso: {formatDate(orden.fecha_ingreso)}</span>
                      </div>
                    </td>

                    {/* Cliente y DNI */}
                    <td className="py-4 px-4 align-top">
                      <div className="font-bold text-slate-900">
                        {orden.cliente?.nombre_completo || 'Cliente s/d'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        DNI: {orden.cliente?.documento || 'No asignado'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {orden.cliente?.telefono}
                      </div>
                    </td>

                    {/* Dispositivo y Serie */}
                    <td className="py-4 px-4 align-top">
                      <div className="font-semibold text-slate-900">
                        {orden.equipo ? `${orden.equipo.marca} ${orden.equipo.modelo}` : 'Equipo no asignado'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Serie: {orden.equipo?.numero_serie || '-'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {orden.equipo?.tipo_equipo}
                      </div>
                    </td>

                    {/* Falla y Diagnóstico */}
                    <td className="py-4 px-4 align-top max-w-xs">
                      <div>
                        <span className="font-semibold text-slate-700">Falla:</span>{' '}
                        <span className="text-slate-600 line-clamp-2">{orden.falla_reportada}</span>
                      </div>
                      <div className="mt-1.5 pt-1.5 border-t border-slate-100">
                        <span className="font-semibold text-slate-700">Diagnóstico:</span>{' '}
                        {orden.diagnostico ? (
                          <span className="text-slate-700 font-medium line-clamp-2">{orden.diagnostico}</span>
                        ) : (
                          <span className="text-amber-700 italic">Pendiente de diagnóstico técnico</span>
                        )}
                      </div>
                    </td>

                    {/* Badge de Estado */}
                    <td className="py-4 px-4 align-top">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border ${getBadgeStyle(orden.estado)}`}>
                        {getEstadoLabel(orden.estado)}
                      </span>
                    </td>

                    {/* Costo */}
                    <td className="py-4 px-4 align-top text-right">
                      <div className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                        ${Number(orden.costo || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </div>
                      {orden.costo === 0 && orden.estado !== 'entregado' && (
                        <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
                          Sin presupuesto
                        </div>
                      )}
                    </td>

                    {/* Acciones y prueba directa de reglas */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex flex-col gap-1.5 min-w-[160px]">
                        
                        {/* Botón principal de cambio de estado */}
                        <button
                          onClick={() => onOpenStatusModal(orden)}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 text-white font-semibold text-[11px] hover:bg-slate-800 transition-colors shadow-xs"
                        >
                          <ArrowRightCircle className="w-3.5 h-3.5 text-sky-400" />
                          <span>Cambiar Estado</span>
                        </button>

                        {/* Atajos rápidos para probar las reglas de negocio solicitadas */}
                        <div className="flex items-center gap-1">
                          {/* Probar Regla 1: Pasar a reparación */}
                          {orden.estado !== 'en_reparacion' && orden.estado !== 'entregado' && (
                            <button
                              onClick={() => handleQuickTransition(orden, 'en_reparacion')}
                              className="flex-1 px-2 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 hover:bg-indigo-100 rounded text-[10px] font-semibold transition-colors truncate"
                              title="Intentar pasar a Reparación (Valida Regla 1)"
                            >
                              Reparar
                            </button>
                          )}

                          {/* Pasar a reparado */}
                          {orden.estado === 'en_reparacion' && (
                            <button
                              onClick={() => handleQuickTransition(orden, 'reparado')}
                              className="flex-1 px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 hover:bg-emerald-100 rounded text-[10px] font-semibold transition-colors truncate"
                              title="Marcar equipo como Reparado"
                            >
                              Listo
                            </button>
                          )}

                          {/* Probar Regla 2: Entregar orden */}
                          {orden.estado !== 'entregado' && (
                            <button
                              onClick={() => handleQuickTransition(orden, 'entregado')}
                              className="flex-1 px-2 py-1 bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200 rounded text-[10px] font-semibold transition-colors truncate"
                              title="Intentar Entregar al cliente (Valida Regla 2)"
                            >
                              Entregar
                            </button>
                          )}
                        </div>

                        {/* Botones secundarios: Editar, Ticket y Eliminar */}
                        <div className="flex items-center gap-1 pt-1.5 border-t border-slate-100 text-slate-600">
                          <button
                            onClick={() => onEditOrder(orden)}
                            className="flex-1 inline-flex items-center justify-center gap-1 py-1 px-1.5 hover:bg-slate-100 rounded text-[11px] font-medium transition-colors"
                            title="Editar datos de la orden"
                          >
                            <Edit3 className="w-3 h-3 text-slate-500" />
                            <span>Editar</span>
                          </button>

                          <button
                            onClick={() => onPrintTicket(orden)}
                            className="flex-1 inline-flex items-center justify-center gap-1 py-1 px-1.5 hover:bg-slate-100 rounded text-[11px] font-medium transition-colors text-slate-700"
                            title="Imprimir comprobante técnico / ticket"
                          >
                            <Printer className="w-3 h-3 text-slate-500" />
                            <span>Ticket</span>
                          </button>

                          <button
                            onClick={() => onDeleteOrder(orden)}
                            className="flex-1 inline-flex items-center justify-center gap-1 py-1 px-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded text-[11px] font-medium transition-colors border border-transparent hover:border-rose-200"
                            title="Eliminar orden de Supabase y del sistema"
                          >
                            <Trash2 className="w-3 h-3 text-rose-500" />
                            <span>Eliminar</span>
                          </button>
                        </div>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
