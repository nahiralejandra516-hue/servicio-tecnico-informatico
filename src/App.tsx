import React, { useState, useEffect, useCallback } from 'react';
import { Header, ActiveTab } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { OrderList } from './components/OrderList';
import { ClientManager } from './components/ClientManager';
import { ConsultationPortal } from './components/ConsultationPortal';
import { SqlEditorView } from './components/SqlEditorView';
import { DeploymentGuideView } from './components/DeploymentGuideView';
import { RuleValidationModal } from './components/RuleValidationModal';
import { OrderFormModal } from './components/OrderFormModal';
import { ChangeStatusModal } from './components/ChangeStatusModal';
import { ReceiptTicketModal } from './components/ReceiptTicketModal';
import { SupabaseSettingsModal } from './components/SupabaseSettingsModal';
import { DeleteConfirmModal, DeleteItem } from './components/DeleteConfirmModal';
import { CheckCircle2 } from 'lucide-react';

import { Cliente, Equipo, Orden, EstadoOrden, ValidationResult } from './types';
import { db } from './lib/storage';
import { getStoredSupabaseConfig } from './lib/supabaseClient';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Datos principales
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado de conexión Supabase
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Modales
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);

  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Orden | null>(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusTargetOrder, setStatusTargetOrder] = useState<Orden | null>(null);

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketTargetOrder, setTicketTargetOrder] = useState<Orden | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [filtroEstadoOrdenes, setFiltroEstadoOrdenes] = useState<EstadoOrden | 'todos'>('todos');

  // Estado de eliminación con Supabase
  const [deleteTargetItem, setDeleteTargetItem] = useState<DeleteItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cargar datos
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cls, eqs, ords] = await Promise.all([
        db.getClientes(),
        db.getEquipos(),
        db.getOrdenes(),
      ]);
      setClientes(cls);
      setEquipos(eqs);
      setOrdenes(ords);

      const cfg = getStoredSupabaseConfig();
      setIsSupabaseConnected(Boolean(cfg.url && cfg.anonKey));
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Manejador de feedback de validación de reglas
  const handleShowValidationFeedback = (result: ValidationResult) => {
    setValidationResult(result);
    setIsValidationModalOpen(true);
  };

  // Cambio directo de estado
  const handleDirectStatusChange = async (ordenId: string, nuevoEstado: EstadoOrden) => {
    const res = await db.cambiarEstadoOrden(ordenId, nuevoEstado);
    if (res.success) {
      await loadData();
    }
  };

  // Abrir modal de orden nueva
  const handleNewOrder = () => {
    setOrderToEdit(null);
    setIsOrderFormOpen(true);
  };

  // Abrir modal de orden para editar
  const handleEditOrder = (orden: Orden) => {
    setOrderToEdit(orden);
    setIsOrderFormOpen(true);
  };

  // Abrir modal de cambio de estado
  const handleOpenStatusModal = (orden: Orden) => {
    setStatusTargetOrder(orden);
    setIsStatusModalOpen(true);
  };

  // Imprimir comprobante
  const handlePrintTicket = (orden: Orden) => {
    setTicketTargetOrder(orden);
    setIsTicketModalOpen(true);
  };

  // Atajo desde Dashboard para ver órdenes con filtro
  const handleViewOrdersWithFilter = (filtro?: EstadoOrden) => {
    setFiltroEstadoOrdenes(filtro || 'todos');
    setActiveTab('ordenes');
  };

  // MANEJADORES DE BORRADO CONECTADOS A SUPABASE
  const handleRequestDeleteOrden = (orden: Orden) => {
    setDeleteTargetItem({ type: 'orden', data: orden });
    setIsDeleteModalOpen(true);
  };

  const handleRequestDeleteCliente = (cliente: Cliente) => {
    const tieneEquipos = equipos.some(e => e.cliente_id === cliente.id);
    setDeleteTargetItem({ type: 'cliente', data: cliente, cascadeWarning: tieneEquipos });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (item: DeleteItem, cascade?: boolean) => {
    if (item.type === 'orden') {
      const res = await db.deleteOrden(item.data.id);
      if (res.success) {
        setToastMessage(`Orden "${item.data.numero_orden}" eliminada exitosamente de Supabase.`);
        setTimeout(() => setToastMessage(null), 4000);
        await loadData();
      }
      return res;
    } else {
      const res = await db.deleteCliente(item.data.id, cascade);
      if (res.success) {
        setToastMessage(`Cliente "${item.data.nombre_completo}" eliminado exitosamente de Supabase.`);
        setTimeout(() => setToastMessage(null), 4000);
        await loadData();
      }
      return res;
    }
  };

  return (
    <div className="min-h-screen text-slate-900 flex flex-col font-sans relative selection:bg-pink-200 selection:text-pink-900">
      
      {/* Toast de confirmación de acción en Supabase */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900/90 text-white backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold border border-emerald-400/30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="ml-2 text-emerald-200 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Barra superior de navegación */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSupabaseConnected={isSupabaseConnected}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Contenido principal según la vista seleccionada */}
      <main className="flex-1 pb-16">
        {loading ? (
          <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-pink-900/70">Cargando base de datos técnica en Supabase...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                ordenes={ordenes}
                clientes={clientes}
                equipos={equipos}
                onNewOrder={handleNewOrder}
                onNewClient={() => {
                  setActiveTab('clientes_equipos');
                }}
                onViewOrders={handleViewOrdersWithFilter}
                onViewConsultation={() => setActiveTab('consulta')}
                onViewSqlScript={() => setActiveTab('sql_script')}
                onOpenOrderDetails={handleOpenStatusModal}
              />
            )}

            {activeTab === 'ordenes' && (
              <OrderList
                ordenes={ordenes}
                initialEstadoFilter={filtroEstadoOrdenes}
                onNewOrder={handleNewOrder}
                onEditOrder={handleEditOrder}
                onOpenStatusModal={handleOpenStatusModal}
                onPrintTicket={handlePrintTicket}
                onShowValidationFeedback={handleShowValidationFeedback}
                onDirectStatusChange={handleDirectStatusChange}
                onDeleteOrder={handleRequestDeleteOrden}
              />
            )}

            {activeTab === 'clientes_equipos' && (
              <ClientManager
                clientes={clientes}
                equipos={equipos}
                ordenes={ordenes}
                onReload={loadData}
                onOpenNewOrderForEquipment={(_eq) => {
                  setOrderToEdit(null);
                  setIsOrderFormOpen(true);
                }}
                onDeleteCliente={handleRequestDeleteCliente}
              />
            )}

            {activeTab === 'consulta' && (
              <ConsultationPortal
                ordenes={ordenes}
                clientes={clientes}
                equipos={equipos}
                onPrintTicket={handlePrintTicket}
              />
            )}

            {activeTab === 'sql_script' && (
              <SqlEditorView
                onConnectionStatusChanged={loadData}
              />
            )}

            {activeTab === 'guia_render' && (
              <DeploymentGuideView />
            )}
          </>
        )}
      </main>

      {/* Pie de página con sutil tono rosa */}
      <footer className="border-t border-pink-200/80 bg-white/70 backdrop-blur-md py-6 text-xs text-pink-950/70 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-pink-900">TecniFix</span>
            <span aria-hidden="true">·</span>
            <span>Sistema de Servicio Técnico Informático para Colegio Secundario / Terciario</span>
          </div>
          <div className="flex items-center gap-4 text-pink-900/80">
            <span>PostgreSQL & Supabase</span>
            <span aria-hidden="true">·</span>
            <span>Deploy en Render & GitHub</span>
          </div>
        </div>
      </footer>

      {/* MODAL 1: AVISOS CLAROS DE ACEPTACIÓN O RECHAZO DE REGLAS */}
      <RuleValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        result={validationResult}
      />

      {/* MODAL 2: FORMULARIO DE INGRESO / EDICIÓN DE ORDEN */}
      <OrderFormModal
        isOpen={isOrderFormOpen}
        onClose={() => setIsOrderFormOpen(false)}
        orderToEdit={orderToEdit}
        clientes={clientes}
        equipos={equipos}
        onReloadData={loadData}
        onShowValidationFeedback={handleShowValidationFeedback}
        onOrderSaved={async () => {
          await loadData();
        }}
      />

      {/* MODAL 3: CAMBIO DE ESTADO CON REGLAS DE NEGOCIO INTERACTIVAS */}
      {statusTargetOrder && (
        <ChangeStatusModal
          isOpen={isStatusModalOpen}
          onClose={() => {
            setIsStatusModalOpen(false);
            setStatusTargetOrder(null);
          }}
          orden={statusTargetOrder}
          onShowValidationFeedback={handleShowValidationFeedback}
          onConfirmChange={async (nuevoEstado, requisitos) => {
            await db.cambiarEstadoOrden(statusTargetOrder.id, nuevoEstado, requisitos);
            await loadData();
          }}
        />
      )}

      {/* MODAL 4: IMPRESIÓN DE TICKET COMPROBANTE OFICIAL */}
      <ReceiptTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => {
          setIsTicketModalOpen(false);
          setTicketTargetOrder(null);
        }}
        orden={ticketTargetOrder}
      />

      {/* MODAL 5: CONFIGURACIÓN DE CONEXIÓN A SUPABASE */}
      <SupabaseSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onConfigUpdated={loadData}
      />

      {/* MODAL 6: CONFIRMACIÓN DE ELIMINACIÓN EN SUPABASE */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetItem(null);
        }}
        item={deleteTargetItem}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
