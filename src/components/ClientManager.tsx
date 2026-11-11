import React, { useState } from 'react';
import { 
  Users, 
  Laptop, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  AlertCircle, 
  Check, 
  X,
  Phone,
  Mail,
  FileCheck
} from 'lucide-react';
import { Cliente, Equipo, Orden } from '../types';
import { db } from '../lib/storage';

interface ClientManagerProps {
  clientes: Cliente[];
  equipos: Equipo[];
  ordenes: Orden[];
  onReload: () => void;
  onOpenNewOrderForEquipment?: (equipo: Equipo) => void;
  onDeleteCliente?: (cliente: Cliente) => void;
}

export const ClientManager: React.FC<ClientManagerProps> = ({
  clientes,
  equipos,
  ordenes,
  onReload,
  onOpenNewOrderForEquipment,
  onDeleteCliente,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'clientes' | 'equipos'>('clientes');
  const [searchTerm, setSearchTerm] = useState('');

  // Modales
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientFormDoc, setClientFormDoc] = useState('');
  const [clientFormName, setClientFormName] = useState('');
  const [clientFormPhone, setClientFormPhone] = useState('');
  const [clientFormEmail, setClientFormEmail] = useState('');
  const [clientFormAddress, setClientFormAddress] = useState('');

  const [editingEquipo, setEditingEquipo] = useState<Equipo | null>(null);
  const [isEquipoModalOpen, setIsEquipoModalOpen] = useState(false);
  const [eqFormClienteId, setEqFormClienteId] = useState('');
  const [eqFormSerial, setEqFormSerial] = useState('');
  const [eqFormTipo, setEqFormTipo] = useState('Notebook');
  const [eqFormMarca, setEqFormMarca] = useState('');
  const [eqFormModelo, setEqFormModelo] = useState('');
  const [eqFormAccesorios, setEqFormAccesorios] = useState('');
  const [eqFormNotas, setEqFormNotas] = useState('');

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filtrado de clientes
  const clientesFiltrados = clientes.filter(c => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      c.nombre_completo.toLowerCase().includes(q) ||
      c.documento.toLowerCase().includes(q) ||
      c.telefono.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  // Filtrado de equipos
  const equiposFiltrados = equipos.filter(e => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    const cli = clientes.find(c => c.id === e.cliente_id);
    return (
      e.numero_serie.toLowerCase().includes(q) ||
      e.marca.toLowerCase().includes(q) ||
      e.modelo.toLowerCase().includes(q) ||
      e.tipo_equipo.toLowerCase().includes(q) ||
      (cli && cli.nombre_completo.toLowerCase().includes(q)) ||
      (cli && cli.documento.toLowerCase().includes(q))
    );
  });

  // Abrir modal cliente para crear o editar
  const handleOpenClientModal = (cli?: Cliente) => {
    setStatusMessage(null);
    if (cli) {
      setEditingCliente(cli);
      setClientFormDoc(cli.documento);
      setClientFormName(cli.nombre_completo);
      setClientFormPhone(cli.telefono);
      setClientFormEmail(cli.email);
      setClientFormAddress(cli.direccion || '');
    } else {
      setEditingCliente(null);
      setClientFormDoc('');
      setClientFormName('');
      setClientFormPhone('');
      setClientFormEmail('');
      setClientFormAddress('');
    }
    setIsClientModalOpen(true);
  };

  const handleSaveCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const res = await db.saveCliente({
      id: editingCliente ? editingCliente.id : undefined,
      documento: clientFormDoc.trim(),
      nombre_completo: clientFormName.trim(),
      telefono: clientFormPhone.trim(),
      email: clientFormEmail.trim(),
      direccion: clientFormAddress.trim(),
    });

    if (!res.success) {
      setStatusMessage({ type: 'error', text: res.error || 'Error al guardar cliente' });
      return;
    }

    onReload();
    setIsClientModalOpen(false);
    setStatusMessage({
      type: 'success',
      text: editingCliente ? 'Cliente actualizado correctamente.' : 'Nuevo cliente registrado con éxito.',
    });
  };

  const handleDeleteCliente = async (cli: Cliente) => {
    if (!confirm(`¿Eliminar al cliente ${cli.nombre_completo} (DNI: ${cli.documento})?`)) return;
    setStatusMessage(null);

    const res = await db.deleteCliente(cli.id);
    if (!res.success) {
      setStatusMessage({ type: 'error', text: res.error || 'No se pudo eliminar el cliente' });
      return;
    }

    onReload();
    setStatusMessage({ type: 'success', text: 'Cliente eliminado correctamente.' });
  };

  // Abrir modal equipo para crear o editar
  const handleOpenEquipoModal = (eq?: Equipo) => {
    setStatusMessage(null);
    if (eq) {
      setEditingEquipo(eq);
      setEqFormClienteId(eq.cliente_id);
      setEqFormSerial(eq.numero_serie);
      setEqFormTipo(eq.tipo_equipo);
      setEqFormMarca(eq.marca);
      setEqFormModelo(eq.modelo);
      setEqFormAccesorios(eq.accesorios_dejados || '');
      setEqFormNotas(eq.notas_equipo || '');
    } else {
      setEditingEquipo(null);
      setEqFormClienteId(clientes[0]?.id || '');
      setEqFormSerial('');
      setEqFormTipo('Notebook');
      setEqFormMarca('');
      setEqFormModelo('');
      setEqFormAccesorios('');
      setEqFormNotas('');
    }
    setIsEquipoModalOpen(true);
  };

  const handleSaveEquipo = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const res = await db.saveEquipo({
      id: editingEquipo ? editingEquipo.id : undefined,
      cliente_id: eqFormClienteId,
      numero_serie: eqFormSerial.trim(),
      tipo_equipo: eqFormTipo,
      marca: eqFormMarca.trim(),
      modelo: eqFormModelo.trim(),
      accesorios_dejados: eqFormAccesorios.trim(),
      notas_equipo: eqFormNotas.trim(),
    });

    if (!res.success) {
      setStatusMessage({ type: 'error', text: res.error || 'Error al guardar equipo' });
      return;
    }

    onReload();
    setIsEquipoModalOpen(false);
    setStatusMessage({
      type: 'success',
      text: editingEquipo ? 'Equipo actualizado correctamente.' : 'Nuevo equipo registrado con número de serie único.',
    });
  };

  const handleDeleteEquipo = async (eq: Equipo) => {
    if (!confirm(`¿Eliminar equipo ${eq.marca} ${eq.modelo} (Serie: ${eq.numero_serie})?`)) return;
    setStatusMessage(null);

    const res = await db.deleteEquipo(eq.id);
    if (!res.success) {
      setStatusMessage({ type: 'error', text: res.error || 'No se pudo eliminar el equipo' });
      return;
    }

    onReload();
    setStatusMessage({ type: 'success', text: 'Equipo eliminado con éxito.' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Base de Datos Técnica
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Gestión de Clientes y Equipos
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Garantía de documento único para clientes y número de serie único para equipos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'clientes' ? (
            <button
              onClick={() => handleOpenClientModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Registrar Cliente</span>
            </button>
          ) : (
            <button
              onClick={() => handleOpenEquipoModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Registrar Equipo</span>
            </button>
          )}
        </div>
      </div>

      {/* Avisos de estado */}
      {statusMessage && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs font-medium ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {statusMessage.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="flex-1">{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Selector de sub-pestaña */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => {
            setActiveSubTab('clientes');
            setSearchTerm('');
          }}
          className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === 'clientes'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Clientes ({clientes.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('equipos');
            setSearchTerm('');
          }}
          className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === 'equipos'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>Equipos ({equipos.length})</span>
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={
            activeSubTab === 'clientes'
              ? 'Buscar cliente por nombre, DNI, teléfono o email...'
              : 'Buscar equipo por número de serie, marca, modelo o cliente...'
          }
          className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
        />
      </div>

      {/* TABLA CLIENTES */}
      {activeSubTab === 'clientes' && (
        <div className="rose-card rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Documento (ÚNICO)</th>
                  <th className="py-3 px-4">Nombre Completo</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Dirección</th>
                  <th className="py-3 px-4 text-center">Equipos Registrados</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientesFiltrados.map((cli) => {
                  const cantEquipos = equipos.filter(e => e.cliente_id === cli.id).length;
                  return (
                    <tr key={cli.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {cli.documento}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {cli.nombre_completo}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{cli.telefono || '-'}</span>
                        </div>
                        {cli.email && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{cli.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {cli.direccion || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono font-bold text-[11px]">
                          {cantEquipos}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenClientModal(cli)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                            title="Editar datos del cliente"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteCliente ? onDeleteCliente(cli) : handleDeleteCliente(cli)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md transition-colors"
                            title="Eliminar cliente de Supabase y del sistema"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLA EQUIPOS */}
      {activeSubTab === 'equipos' && (
        <div className="rose-card rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Número de Serie (ÚNICO)</th>
                  <th className="py-3 px-4">Dispositivo</th>
                  <th className="py-3 px-4">Cliente Asignado</th>
                  <th className="py-3 px-4">Accesorios Dejados</th>
                  <th className="py-3 px-4 text-center">Historial Órdenes</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equiposFiltrados.map((eq) => {
                  const cliente = clientes.find(c => c.id === eq.cliente_id);
                  const cantOrdenes = ordenes.filter(o => o.equipo_id === eq.id).length;
                  return (
                    <tr key={eq.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {eq.numero_serie}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {eq.marca} {eq.modelo}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {eq.tipo_equipo}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          {cliente?.nombre_completo || 'Cliente no encontrado'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          DNI: {cliente?.documento}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {eq.accesorios_dejados || 'Sin accesorios'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono font-bold text-[11px]">
                          {cantOrdenes}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {onOpenNewOrderForEquipment && (
                            <button
                              onClick={() => onOpenNewOrderForEquipment(eq)}
                              className="px-2 py-1 text-[11px] font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md transition-colors"
                              title="Crear nueva orden para este equipo"
                            >
                              + Orden
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEquipoModal(eq)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                            title="Editar datos del equipo"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEquipo(eq)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md transition-colors"
                            title="Eliminar equipo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL CLIENTE */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingCliente ? 'Modificar Datos de Cliente' : 'Nuevo Cliente (Documento Único)'}
              </h3>
              <button onClick={() => setIsClientModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCliente} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Documento Único (DNI / CUIT / CI) *
                </label>
                <input
                  type="text"
                  required
                  value={clientFormDoc}
                  onChange={(e) => setClientFormDoc(e.target.value)}
                  placeholder="Ej: 38492019"
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-semibold"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Restricción UNIQUE: No pueden registrarse dos clientes con el mismo documento.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={clientFormName}
                  onChange={(e) => setClientFormName(e.target.value)}
                  placeholder="Ej: Juan Carlos Pérez"
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={clientFormPhone}
                    onChange={(e) => setClientFormPhone(e.target.value)}
                    placeholder="+54 11 ..."
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={clientFormEmail}
                    onChange={(e) => setClientFormEmail(e.target.value)}
                    placeholder="email@ejemplo.com"
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={clientFormAddress}
                  onChange={(e) => setClientFormAddress(e.target.value)}
                  placeholder="Calle, número, localidad"
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EQUIPO */}
      {isEquipoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingEquipo ? 'Modificar Datos de Equipo' : 'Nuevo Dispositivo (Serie Única)'}
              </h3>
              <button onClick={() => setIsEquipoModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEquipo} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cliente Dueño del Equipo *
                </label>
                <select
                  required
                  value={eqFormClienteId}
                  onChange={(e) => setEqFormClienteId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="">-- Seleccionar cliente --</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre_completo} (DNI: {c.documento})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Número de Serie Único (S/N) *
                </label>
                <input
                  type="text"
                  required
                  value={eqFormSerial}
                  onChange={(e) => setEqFormSerial(e.target.value)}
                  placeholder="Ej: SN-ASUS-99124"
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-semibold"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Restricción UNIQUE: No pueden registrarse dos equipos con el mismo número de serie.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Equipo</label>
                <select
                  value={eqFormTipo}
                  onChange={(e) => setEqFormTipo(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marca *</label>
                  <input
                    type="text"
                    required
                    value={eqFormMarca}
                    onChange={(e) => setEqFormMarca(e.target.value)}
                    placeholder="Ej: Dell, Lenovo, HP"
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Modelo *</label>
                  <input
                    type="text"
                    required
                    value={eqFormModelo}
                    onChange={(e) => setEqFormModelo(e.target.value)}
                    placeholder="Ej: Inspiron 15 3520"
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Accesorios Dejados</label>
                <input
                  type="text"
                  value={eqFormAccesorios}
                  onChange={(e) => setEqFormAccesorios(e.target.value)}
                  placeholder="Cargador, cable de poder, funda..."
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEquipoModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800"
                >
                  Guardar Equipo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
