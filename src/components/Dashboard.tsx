import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  PlusCircle, 
  Search, 
  AlertCircle, 
  ArrowRight,
  Database,
  Users,
  Laptop
} from 'lucide-react';
import { Orden, Cliente, Equipo, EstadoOrden } from '../types';

interface DashboardProps {
  ordenes: Orden[];
  clientes: Cliente[];
  equipos: Equipo[];
  onNewOrder: () => void;
  onNewClient: () => void;
  onViewOrders: (filtroEstado?: EstadoOrden) => void;
  onViewConsultation: () => void;
  onViewSqlScript: () => void;
  onOpenOrderDetails: (orden: Orden) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  ordenes,
  clientes,
  equipos,
  onNewOrder,
  onNewClient,
  onViewOrders,
  onViewConsultation,
  onViewSqlScript,
  onOpenOrderDetails,
}) => {
  // Cálculo de métricas solicitadas
  const ordenesPendientes = ordenes.filter(o => 
    o.estado === 'recibido' || o.estado === 'en_diagnostico' || o.estado === 'en_reparacion'
  );

  const ordenesReparadas = ordenes.filter(o => o.estado === 'reparado');

  const ordenesEntregadas = ordenes.filter(o => o.estado === 'entregado');

  const totalPlataEntregadas = ordenesEntregadas.reduce((acc, curr) => acc + (Number(curr.costo) || 0), 0);

  // Desglose de pendientes
  const countRecibidas = ordenes.filter(o => o.estado === 'recibido').length;
  const countDiagnostico = ordenes.filter(o => o.estado === 'en_diagnostico').length;
  const countReparacion = ordenes.filter(o => o.estado === 'en_reparacion').length;

  // Órdenes recientes (primeras 5)
  const ordenesRecientes = [...ordenes].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 5);

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
      case 'reparado': return 'Reparado (Listo)';
      case 'entregado': return 'Entregado';
      case 'cancelado': return 'Cancelado';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Banner de bienvenida y acciones rápidas con estilo rosa lindo */}
      <div className="rose-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-700">
            <span>Taller de Informática</span>
            <span aria-hidden="true">·</span>
            <span>Panel de Control</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Servicio Técnico Informático
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Gestión de clientes, equipos y órdenes de reparación con validación estricta de reglas técnicas de negocio y base de datos Supabase.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={onNewOrder}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4 text-pink-400" />
            <span>Nueva Orden de Reparación</span>
          </button>

          <button
            onClick={onNewClient}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-pink-200 text-slate-700 text-xs font-semibold hover:bg-rose-50 transition-colors shadow-xs whitespace-nowrap"
          >
            <Users className="w-4 h-4 text-pink-600" />
            <span>Nuevo Cliente</span>
          </button>

          <button
            onClick={onViewConsultation}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-pink-50 border border-pink-200 text-pink-900 text-xs font-semibold hover:bg-pink-100 transition-colors shadow-xs whitespace-nowrap"
          >
            <Search className="w-4 h-4 text-pink-600" />
            <span>Portal de Clientes</span>
          </button>
        </div>
      </div>

      {/* TRES TARJETAS KPI PRINCIPALES REQUERIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KPI 1: ÓRDENES PENDIENTES */}
        <div 
          onClick={() => onViewOrders()}
          className="rose-card rose-card-hover rounded-2xl p-6 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Órdenes Pendientes
            </span>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900 font-mono tabular-nums">
              {ordenesPendientes.length}
            </span>
            <span className="text-xs font-medium text-slate-500">
              equipos en proceso técnico
            </span>
          </div>

          {/* Desglose interior */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900 font-mono tabular-nums">{countRecibidas}</span>
              <span className="text-[11px] text-slate-500">Recibidas</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900 font-mono tabular-nums">{countDiagnostico}</span>
              <span className="text-[11px] text-slate-500">En diagnóstico</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900 font-mono tabular-nums">{countReparacion}</span>
              <span className="text-[11px] text-slate-500">En reparación</span>
            </div>
          </div>
        </div>

        {/* KPI 2: ÓRDENES REPARADAS (Listas para retirar) */}
        <div 
          onClick={() => onViewOrders('reparado')}
          className="rose-card rose-card-hover rounded-2xl p-6 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Órdenes Reparadas
            </span>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-emerald-700 font-mono tabular-nums">
              {ordenesReparadas.length}
            </span>
            <span className="text-xs font-medium text-slate-500">
              listas para entregar al cliente
            </span>
          </div>

          <div className="mt-4 pt-4 border-t border-rose-100 flex items-center justify-between text-xs text-slate-600">
            <span>Aptas para paso a <strong>Entregado</strong></span>
            <span className="text-emerald-700 font-medium group-hover:underline flex items-center gap-1">
              Ver listas <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 3: TOTAL EN PLATA DE LAS ENTREGADAS */}
        <div className="rose-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total en Plata Entregadas
            </span>
            <div className="w-10 h-10 rounded-lg bg-pink-50 text-pink-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-mono tabular-nums">
              ${totalPlataEntregadas.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className="text-xs font-medium text-slate-500 mt-1">
              recaudación total por {ordenesEntregadas.length} órdenes entregadas
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Promedio por orden:</span>
            <span className="font-semibold text-slate-900 font-mono tabular-nums">
              ${ordenesEntregadas.length > 0 
                ? (totalPlataEntregadas / ordenesEntregadas.length).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : '0.00'}
            </span>
          </div>
        </div>

      </div>

      {/* Reglas de Negocio en Taller: Recordatorio Visual */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs border border-slate-800">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-slate-800 text-amber-400 rounded-lg shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-bold text-white">
              Reglas de Negocio Automatizadas en el Sistema y Supabase
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs text-slate-300">
              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                <span className="font-bold text-amber-300 block mb-1">
                  Regla #1: Requisitos de Reparación
                </span>
                <span>
                  Ningún equipo puede pasar a <strong>En Reparación</strong> si no tiene un diagnóstico técnico redactado y un costo presupuestado mayor a $0.
                </span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                <span className="font-bold text-emerald-300 block mb-1">
                  Regla #2: Requisitos de Entrega
                </span>
                <span>
                  Ninguna orden puede pasarse a <strong>Entregado</strong> si no figura previamente como <strong>Reparada</strong> en el sistema.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección con Órdenes Recientes y Acceso al Script SQL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Tabla de órdenes recientes (2 columnas) */}
        <div className="lg:col-span-2 rose-card rounded-2xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-rose-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Órdenes de Reparación Recientes
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Últimos ingresos y servicios técnicos en curso
              </p>
            </div>
            <button
              onClick={() => onViewOrders()}
              className="text-xs font-semibold text-slate-900 hover:text-slate-700 hover:underline inline-flex items-center gap-1"
            >
              Ver todas ({ordenes.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Orden</th>
                  <th className="py-3 px-4">Cliente / DNI</th>
                  <th className="py-3 px-4">Equipo</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Costo</th>
                  <th className="py-3 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ordenesRecientes.map((orden) => (
                  <tr key={orden.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {orden.numero_orden}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {orden.cliente?.nombre_completo || 'Cliente no asignado'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        DNI: {orden.cliente?.documento || '-'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">
                        {orden.equipo ? `${orden.equipo.marca} ${orden.equipo.modelo}` : 'Equipo no asignado'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        S/N: {orden.equipo?.numero_serie || '-'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getBadgeStyle(orden.estado)}`}>
                        {getEstadoLabel(orden.estado)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      ${Number(orden.costo || 0).toLocaleString('es-AR')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onOpenOrderDetails(orden)}
                        className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                      >
                        Ver Ficha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel lateral: Acceso rápido al SQL y resumen de base de datos */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Script SQL para Supabase
                </h3>
                <p className="text-xs text-slate-500">
                  Listo para copiar y ejecutar en el SQL Editor
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Incluye las tablas <code>clientes</code>, <code>equipos</code> y <code>ordenes</code> con claves foráneas, restricciones UNIQUE, triggers automáticos para <code>updated_at</code> y validación de reglas de negocio en Postgres.
            </p>

            <button
              onClick={onViewSqlScript}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-xs"
            >
              <span>Ver y Copiar Script SQL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Registros en el Sistema
            </h3>
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="flex items-center gap-2 text-slate-700">
                  <Users className="w-4 h-4 text-slate-400" />
                  Clientes Registrados (DNI único)
                </span>
                <span className="font-bold text-slate-900 font-mono tabular-nums">
                  {clientes.length}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="flex items-center gap-2 text-slate-700">
                  <Laptop className="w-4 h-4 text-slate-400" />
                  Equipos Ingresados (Serie única)
                </span>
                <span className="font-bold text-slate-900 font-mono tabular-nums">
                  {equipos.length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Órdenes de Reparación Totales
                </span>
                <span className="font-bold text-slate-900 font-mono tabular-nums">
                  {ordenes.length}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
