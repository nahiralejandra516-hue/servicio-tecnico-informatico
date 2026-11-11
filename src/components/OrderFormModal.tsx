import React, { useState, useEffect } from 'react';
import { X, Check, Laptop, UserPlus, AlertCircle } from 'lucide-react';
import { Cliente, Equipo, Orden, EstadoOrden, ValidationResult } from '../types';
import { db } from '../lib/storage';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderToEdit?: Orden | null;
  clientes: Cliente[];
  equipos: Equipo[];
  onOrderSaved: (savedOrden: Orden) => void;
  onShowValidationFeedback: (result: ValidationResult) => void;
  onReloadData: () => void;
}

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  isOpen,
  onClose,
  orderToEdit,
  clientes,
  equipos,
  onOrderSaved,
  onShowValidationFeedback,
  onReloadData,
}) => {
  // Estado del formulario
  const [clienteId, setClienteId] = useState<string>('');
  const [equipoId, setEquipoId] = useState<string>('');
  const [fallaReportada, setFallaReportada] = useState<string>('');
  const [diagnostico, setDiagnostico] = useState<string>('');
  const [costo, setCosto] = useState<number>(0);
  const [estado, setEstado] = useState<EstadoOrden>('recibido');
  const [formError, setFormError] = useState<string | null>(null);

  // Sub-formulario para crear cliente rápido inline
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientDoc, setNewClientDoc] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  // Sub-formulario para crear equipo rápido inline
  const [showNewEquipmentForm, setShowNewEquipmentForm] = useState(false);
  const [newEqSerial, setNewEqSerial] = useState('');
  const [newEqTipo, setNewEqTipo] = useState('Notebook');
  const [newEqMarca, setNewEqMarca] = useState('');
  const [newEqModelo, setNewEqModelo] = useState('');
  const [newEqAccesorios, setNewEqAccesorios] = useState('');

  useEffect(() => {
    if (orderToEdit) {
      setEquipoId(orderToEdit.equipo_id);
      const eq = equipos.find(e => e.id === orderToEdit.equipo_id);
      if (eq) setClienteId(eq.cliente_id);
      setFallaReportada(orderToEdit.falla_reportada || '');
      setDiagnostico(orderToEdit.diagnostico || '');
      setCosto(orderToEdit.costo || 0);
      setEstado(orderToEdit.estado || 'recibido');
    } else {
      setClienteId('');
      setEquipoId('');
      setFallaReportada('');
      setDiagnostico('');
      setCosto(0);
      setEstado('recibido');
    }
    setFormError(null);
    setShowNewClientForm(false);
    setShowNewEquipmentForm(false);
  }, [orderToEdit, equipos, isOpen]);

  if (!isOpen) return null;

  // Equipos asociados al cliente seleccionado
  const equiposDelCliente = equipos.filter(e => e.cliente_id === clienteId);

  // Guardar nuevo cliente rápido
  const handleCreateFastClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientDoc.trim() || !newClientName.trim()) {
      setFormError('El documento (DNI) y nombre del cliente son obligatorios.');
      return;
    }

    const res = await db.saveCliente({
      documento: newClientDoc.trim(),
      nombre_completo: newClientName.trim(),
      telefono: newClientPhone.trim(),
      email: newClientEmail.trim(),
    });

    if (!res.success || !res.data) {
      setFormError(res.error || 'Error al crear cliente');
      return;
    }

    onReloadData();
    setClienteId(res.data.id);
    setShowNewClientForm(false);
    setNewClientDoc('');
    setNewClientName('');
    setNewClientPhone('');
    setNewClientEmail('');
    setFormError(null);
  };

  // Guardar nuevo equipo rápido
  const handleCreateFastEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId) {
      setFormError('Primero debes seleccionar un cliente para asignarle el equipo.');
      return;
    }
    if (!newEqSerial.trim() || !newEqMarca.trim() || !newEqModelo.trim()) {
      setFormError('El número de serie, marca y modelo son obligatorios.');
      return;
    }

    const res = await db.saveEquipo({
      cliente_id: clienteId,
      numero_serie: newEqSerial.trim(),
      tipo_equipo: newEqTipo,
      marca: newEqMarca.trim(),
      modelo: newEqModelo.trim(),
      accesorios_dejados: newEqAccesorios.trim(),
    });

    if (!res.success || !res.data) {
      setFormError(res.error || 'Error al crear equipo');
      return;
    }

    onReloadData();
    setEquipoId(res.data.id);
    setShowNewEquipmentForm(false);
    setNewEqSerial('');
    setNewEqMarca('');
    setNewEqModelo('');
    setNewEqAccesorios('');
    setFormError(null);
  };

  // Enviar formulario principal de la orden
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!equipoId) {
      setFormError('Debes seleccionar o registrar el equipo que ingresa al taller.');
      return;
    }

    if (!fallaReportada.trim()) {
      setFormError('Debes ingresar la falla reportada por el cliente.');
      return;
    }

    const res = await db.saveOrden({
      id: orderToEdit ? orderToEdit.id : undefined,
      equipo_id: equipoId,
      falla_reportada: fallaReportada.trim(),
      diagnostico: diagnostico.trim(),
      costo: Number(costo || 0),
      estado,
    });

    if (!res.success) {
      if (res.validation) {
        onShowValidationFeedback(res.validation);
      } else {
        setFormError(res.error || 'No se pudo guardar la orden');
      }
      return;
    }

    if (res.data) {
      onOrderSaved(res.data);
      if (res.validation) {
        onShowValidationFeedback(res.validation);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        role="dialog"
      >
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Formulario de Servicio
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              {orderToEdit ? `Editar Orden ${orderToEdit.numero_orden}` : 'Registrar Nuevo Ingreso de Equipo'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {formError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-900 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. SELECCIÓN DE CLIENTE */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Cliente (Documento / DNI Único) *
              </label>
              {!orderToEdit && (
                <button
                  type="button"
                  onClick={() => setShowNewClientForm(!showNewClientForm)}
                  className="text-xs font-semibold text-sky-700 hover:text-sky-900 inline-flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{showNewClientForm ? 'Seleccionar existente' : '+ Registrar nuevo cliente'}</span>
                </button>
              )}
            </div>

            {showNewClientForm ? (
              <div className="p-3 bg-white rounded-lg border border-sky-200 space-y-3">
                <span className="text-xs font-bold text-sky-900 block">Alta Rápida de Cliente</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">DNI / Documento Único *</label>
                    <input
                      type="text"
                      value={newClientDoc}
                      onChange={(e) => setNewClientDoc(e.target.value)}
                      placeholder="Ej: 38492019"
                      className="w-full p-2 border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">Nombre Completo *</label>
                    <input
                      type="text"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="Ej: Laura Martínez"
                      className="w-full p-2 border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">Teléfono</label>
                    <input
                      type="text"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      placeholder="+54 11 ..."
                      className="w-full p-2 border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">Email</label>
                    <input
                      type="email"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      placeholder="cliente@email.com"
                      className="w-full p-2 border border-slate-300 rounded"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCreateFastClient}
                  className="px-3 py-1.5 bg-sky-700 text-white rounded text-xs font-semibold hover:bg-sky-800"
                >
                  Guardar y Seleccionar Cliente
                </button>
              </div>
            ) : (
              <select
                value={clienteId}
                onChange={(e) => {
                  setClienteId(e.target.value);
                  setEquipoId('');
                }}
                disabled={Boolean(orderToEdit)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="">-- Seleccionar cliente por nombre o DNI --</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre_completo} (DNI: {c.documento}) - {c.telefono}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 2. SELECCIÓN DE EQUIPO */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Dispositivo / Equipo (Número de Serie Único) *
              </label>
              {clienteId && !orderToEdit && (
                <button
                  type="button"
                  onClick={() => setShowNewEquipmentForm(!showNewEquipmentForm)}
                  className="text-xs font-semibold text-sky-700 hover:text-sky-900 inline-flex items-center gap-1"
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>{showNewEquipmentForm ? 'Seleccionar existente' : '+ Registrar nuevo equipo'}</span>
                </button>
              )}
            </div>

            {showNewEquipmentForm ? (
              <div className="p-3 bg-white rounded-lg border border-sky-200 space-y-3">
                <span className="text-xs font-bold text-sky-900 block">Alta Rápida de Equipo</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">Número de Serie Único *</label>
                    <input
                      type="text"
                      value={newEqSerial}
                      onChange={(e) => setNewEqSerial(e.target.value)}
                      placeholder="Ej: SN-DELL-88910"
                      className="w-full p-2 border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">Tipo de Dispositivo</label>
                    <select
                      value={newEqTipo}
                      onChange={(e) => setNewEqTipo(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded bg-white"
                    >
                      <option value="Notebook">Notebook</option>
                      <option value="PC de Escritorio">PC de Escritorio</option>
                      <option value="All-in-One">All-in-One</option>
                      <option value="Impresora">Impresora</option>
                      <option value="Monitor">Monitor</option>
                      <option value="Consola">Consola</option>
                      <option value="Celular / Tablet">Celular / Tablet</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">Marca *</label>
                    <input
                      type="text"
                      value={newEqMarca}
                      onChange={(e) => setNewEqMarca(e.target.value)}
                      placeholder="Ej: HP, ASUS, Lenovo, Apple"
                      className="w-full p-2 border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">Modelo *</label>
                    <input
                      type="text"
                      value={newEqModelo}
                      onChange={(e) => setNewEqModelo(e.target.value)}
                      placeholder="Ej: Pavilion 15-eg0025"
                      className="w-full p-2 border border-slate-300 rounded"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-600">Accesorios dejados</label>
                    <input
                      type="text"
                      value={newEqAccesorios}
                      onChange={(e) => setNewEqAccesorios(e.target.value)}
                      placeholder="Ej: Cargador original, mouse, cable interlock..."
                      className="w-full p-2 border border-slate-300 rounded"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCreateFastEquipment}
                  className="px-3 py-1.5 bg-sky-700 text-white rounded text-xs font-semibold hover:bg-sky-800"
                >
                  Guardar y Asignar Equipo
                </button>
              </div>
            ) : (
              <select
                value={equipoId}
                onChange={(e) => setEquipoId(e.target.value)}
                disabled={Boolean(orderToEdit) || !clienteId}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 disabled:bg-slate-100"
              >
                <option value="">
                  {clienteId ? '-- Seleccionar equipo registrado del cliente --' : '-- Primero selecciona un cliente arriba --'}
                </option>
                {equiposDelCliente.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.marca} {eq.modelo} ({eq.tipo_equipo}) - Serie: {eq.numero_serie}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 3. FALLA REPORTADA */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              3. Falla Reportada por el Cliente *
            </label>
            <textarea
              value={fallaReportada}
              onChange={(e) => setFallaReportada(e.target.value)}
              placeholder="Describir los síntomas manifestados por el usuario (ej: no prende, pantallazo azul, bisagra rota...)"
              rows={3}
              required
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* 4. DIAGNÓSTICO TÉCNICO Y COSTO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                4. Diagnóstico Técnico {estado === 'en_reparacion' && <span className="text-rose-600 font-bold">* (Obligatorio para reparación)</span>}
              </label>
              <textarea
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
                placeholder="Examen técnico de laboratorio, componentes testeados, solución requerida..."
                rows={2}
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                5. Costo / Presupuesto ($ ARS) {estado === 'en_reparacion' && <span className="text-rose-600 font-bold">* (&gt; $0)</span>}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={costo}
                  onChange={(e) => setCosto(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs pl-7 pr-3 py-2 rounded-lg border border-slate-300 font-mono font-semibold tabular-nums focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                6. Estado Inicial de la Orden
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoOrden)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="recibido">Recibido (Ingreso estándar)</option>
                <option value="en_diagnostico">En Diagnóstico</option>
                <option value="en_reparacion">En Reparación (Requiere diag + costo)</option>
                <option value="reparado">Reparado (Listo para retirar)</option>
                <option value="entregado">Entregado (Solo si antes fue reparado)</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
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
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{orderToEdit ? 'Actualizar Orden' : 'Crear Orden de Reparación'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
