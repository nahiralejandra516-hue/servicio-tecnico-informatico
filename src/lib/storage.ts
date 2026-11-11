import { Cliente, Equipo, Orden, EstadoOrden, ValidationResult } from '../types';
import { getSupabaseClient } from './supabaseClient';

const STORAGE_KEY_CLIENTES = 'tecnifix_db_clientes';
const STORAGE_KEY_EQUIPOS = 'tecnifix_db_equipos';
const STORAGE_KEY_ORDENES = 'tecnifix_db_ordenes';

// Datos semilla de demostración inicial
const SEED_CLIENTES: Cliente[] = [
  {
    id: 'cli-001',
    documento: '38492019',
    nombre_completo: 'Martín Rodríguez',
    telefono: '+54 11 4455-2233',
    email: 'martin.rodriguez@email.com',
    direccion: 'Av. Rivadavia 4520, CABA',
    created_at: '2026-11-05T14:30:00Z',
    updated_at: '2026-11-05T14:30:00Z',
  },
  {
    id: 'cli-002',
    documento: '41285741',
    nombre_completo: 'Lucía Fernández',
    telefono: '+54 11 9876-5432',
    email: 'lucia.fernandez@email.com',
    direccion: 'Calle Belgrano 128, Quilmes',
    created_at: '2026-11-06T10:15:00Z',
    updated_at: '2026-11-06T10:15:00Z',
  },
  {
    id: 'cli-003',
    documento: '35901234',
    nombre_completo: 'Esteban Morales',
    telefono: '+54 11 6543-2198',
    email: 'esteban.morales@email.com',
    direccion: 'Mitre 850, San Isidro',
    created_at: '2026-11-07T16:00:00Z',
    updated_at: '2026-11-07T16:00:00Z',
  },
  {
    id: 'cli-004',
    documento: '29876543',
    nombre_completo: 'Valeria Gómez',
    telefono: '+54 11 3322-1100',
    email: 'valeria.gomez@techcorp.com',
    direccion: 'Corrientes 2200, CABA',
    created_at: '2026-11-08T09:20:00Z',
    updated_at: '2026-11-08T09:20:00Z',
  },
];

const SEED_EQUIPOS: Equipo[] = [
  {
    id: 'eq-001',
    cliente_id: 'cli-001',
    numero_serie: 'SN-LENOVO-8842',
    tipo_equipo: 'Notebook',
    marca: 'Lenovo',
    modelo: 'IdeaPad 3 15ALC6',
    accesorios_dejados: 'Cargador original 65W y mouse inalámbrico',
    notas_equipo: 'Rayón superficial en esquina superior izquierda de tapa',
    created_at: '2026-11-05T14:35:00Z',
    updated_at: '2026-11-05T14:35:00Z',
  },
  {
    id: 'eq-002',
    cliente_id: 'cli-002',
    numero_serie: 'SN-DELL-5520-X',
    tipo_equipo: 'PC de Escritorio',
    marca: 'Dell',
    modelo: 'OptiPlex 7090 Micro',
    accesorios_dejados: 'Cable de poder 220V',
    notas_equipo: 'Gabinete sin tornillos laterales',
    created_at: '2026-11-06T10:20:00Z',
    updated_at: '2026-11-06T10:20:00Z',
  },
  {
    id: 'eq-003',
    cliente_id: 'cli-003',
    numero_serie: 'SN-ASUS-99124',
    tipo_equipo: 'Notebook',
    marca: 'ASUS',
    modelo: 'ROG Strix G15 (2023)',
    accesorios_dejados: 'Cargador 240W original y funda acolchada',
    notas_equipo: 'Teclado con desgaste en teclas WASD',
    created_at: '2026-11-07T16:05:00Z',
    updated_at: '2026-11-07T16:05:00Z',
  },
  {
    id: 'eq-004',
    cliente_id: 'cli-001',
    numero_serie: 'SN-HP-DESK-410',
    tipo_equipo: 'Impresora',
    marca: 'HP',
    modelo: 'Smart Tank 515 Multifunción',
    accesorios_dejados: 'Cable USB 2.0 y cable de poder',
    notas_equipo: 'Bandeja de papel con traba floja',
    created_at: '2026-11-08T11:00:00Z',
    updated_at: '2026-11-08T11:00:00Z',
  },
  {
    id: 'eq-005',
    cliente_id: 'cli-004',
    numero_serie: 'SN-APPLE-M2-881',
    tipo_equipo: 'Notebook',
    marca: 'Apple',
    modelo: 'MacBook Air M2 13 pulgadas',
    accesorios_dejados: 'Cargador MagSafe original 35W',
    notas_equipo: 'Impecable estado estético',
    created_at: '2026-11-08T11:30:00Z',
    updated_at: '2026-11-08T11:30:00Z',
  },
];

const SEED_ORDENES: Orden[] = [
  {
    id: 'ord-001',
    numero_orden: 'ORD-2026-001',
    equipo_id: 'eq-001',
    falla_reportada: 'No enciende tras corte de luz repentino. El cargador calienta pero la notebook no da ningún led de vida.',
    diagnostico: '',
    costo: 0,
    estado: 'recibido',
    fecha_ingreso: '2026-11-09T09:00:00Z',
    created_at: '2026-11-09T09:00:00Z',
    updated_at: '2026-11-09T09:00:00Z',
  },
  {
    id: 'ord-002',
    numero_orden: 'ORD-2026-002',
    equipo_id: 'eq-002',
    falla_reportada: 'Se apaga sola a los 10 minutos de iniciar Windows. Ventilador gira a máxima velocidad con ruido excesivo.',
    diagnostico: 'Cooler de microprocesador obstruido por pelusa compactada y pasta térmica degradada. Se requiere mantenimiento térmico integral con pasta Noctua NT-H1 y lubricación de ventilador.',
    costo: 48000,
    estado: 'en_reparacion',
    fecha_ingreso: '2026-11-08T10:30:00Z',
    fecha_diagnostico: '2026-11-09T11:00:00Z',
    created_at: '2026-11-08T10:30:00Z',
    updated_at: '2026-11-09T11:00:00Z',
  },
  {
    id: 'ord-003',
    numero_orden: 'ORD-2026-003',
    equipo_id: 'eq-003',
    falla_reportada: 'Pantalla con parpadeo y líneas verticales de colores al mover la bisagra.',
    diagnostico: 'Flex de pantalla desgastado por fricción mecánica en la bisagra. Se reemplazó cable flex EDP 144Hz nuevo, se ajustaron bisagras y se realizaron pruebas de estrés gráfico con 3DMark superadas.',
    costo: 92000,
    estado: 'reparado',
    fecha_ingreso: '2026-11-06T15:00:00Z',
    fecha_diagnostico: '2026-11-07T14:00:00Z',
    fecha_reparado: '2026-11-10T18:00:00Z',
    created_at: '2026-11-06T15:00:00Z',
    updated_at: '2026-11-10T18:00:00Z',
  },
  {
    id: 'ord-004',
    numero_orden: 'ORD-2026-004',
    equipo_id: 'eq-004',
    falla_reportada: 'Toma la hoja inclinada y luego produce atasco constante de papel.',
    diagnostico: 'Cuerpo extraño (clip de metal) en carril de tracción y rodillos pick-up desgastados. Se retiró el objeto, se lubricó mecanismo de tracción y se limpió cabezal.',
    costo: 35000,
    estado: 'entregado',
    fecha_ingreso: '2026-11-03T11:15:00Z',
    fecha_diagnostico: '2026-11-04T12:00:00Z',
    fecha_reparado: '2026-11-06T17:00:00Z',
    fecha_entrega: '2026-11-08T16:30:00Z',
    created_at: '2026-11-03T11:15:00Z',
    updated_at: '2026-11-08T16:30:00Z',
  },
  {
    id: 'ord-005',
    numero_orden: 'ORD-2026-005',
    equipo_id: 'eq-005',
    falla_reportada: 'Derrame accidental de café sobre el teclado. El trackpad no responde y teclas pegajosas.',
    diagnostico: 'Líquido penetró en módulo de teclado. Batería desconectada preventivamente. Requiere baño por ultrasonido de placa lógica y reemplazo de topcase con teclado.',
    costo: 185000,
    estado: 'en_diagnostico',
    fecha_ingreso: '2026-11-10T14:00:00Z',
    fecha_diagnostico: '2026-11-11T09:30:00Z',
    created_at: '2026-11-10T14:00:00Z',
    updated_at: '2026-11-11T09:30:00Z',
  },
];

// Helper para leer/escribir en localStorage
function getLocal<T>(key: string, defaultData: T): T {
  if (typeof window === 'undefined') return defaultData;
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(item) as T;
  } catch {
    return defaultData;
  }
}

function setLocal<T>(key: string, data: T): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

/**
 * REGLAS DE NEGOCIO ESTRICTAS
 * - Regla 1: No se puede pasar a 'en_reparacion' si no tiene diagnóstico y costo > 0
 * - Regla 2: No se puede entregar una orden si antes no figura como 'reparado'
 */
export function validarTransicionEstado(
  ordenActual: Orden,
  nuevoEstado: EstadoOrden,
  datosActualizados?: { diagnostico?: string; costo?: number }
): ValidationResult {
  // Si no cambia de estado, es válido
  if (ordenActual.estado === nuevoEstado) {
    return {
      valid: true,
      message: 'El estado se mantiene sin cambios.',
    };
  }

  const diagnosticoEfectivo = (datosActualizados?.diagnostico !== undefined 
    ? datosActualizados.diagnostico 
    : (ordenActual.diagnostico || '')).trim();

  const costoEfectivo = datosActualizados?.costo !== undefined 
    ? Number(datosActualizados.costo) 
    : Number(ordenActual.costo || 0);

  // REGLA 1: Transición a 'en_reparacion'
  if (nuevoEstado === 'en_reparacion') {
    const faltantes: string[] = [];
    if (!diagnosticoEfectivo) {
      faltantes.push('Falta escribir el diagnóstico técnico detallado');
    }
    if (costoEfectivo <= 0) {
      faltantes.push(`El presupuesto/costo debe ser mayor a $0 (valor actual: $${costoEfectivo.toLocaleString('es-AR')})`);
    }

    if (faltantes.length > 0) {
      return {
        valid: false,
        message: 'Acción rechazada por Regla de Negocio #1',
        reason: 'Para iniciar la reparación, es obligatorio haber revisado el equipo, emitido un diagnóstico técnico y presupuestado un costo positivo para el cliente.',
        missingRequirements: faltantes,
        suggestedAction: 'Carga el diagnóstico técnico y un costo estimado/aprobado mayor a $0 en el formulario de la orden.',
      };
    }

    return {
      valid: true,
      message: 'Transición a reparación autorizada: Cumple con diagnóstico técnico y presupuesto positivo registrado.',
    };
  }

  // REGLA 2: Transición a 'entregado'
  if (nuevoEstado === 'entregado') {
    if (ordenActual.estado !== 'reparado') {
      return {
        valid: false,
        message: 'Acción rechazada por Regla de Negocio #2',
        reason: `No se puede entregar una orden que se encuentra en estado "${ordenActual.estado.toUpperCase().replace('_', ' ')}". El equipo debe estar verificado y marcado como REPARADO antes de poder entregárselo al cliente.`,
        missingRequirements: [
          `Estado actual de la orden: ${ordenActual.estado.replace('_', ' ')}`,
          'Requisito obligatorio previo: Estado "reparado"',
        ],
        suggestedAction: 'Finaliza primero el proceso de reparación marcando la orden como "reparado". Una vez que el técnico certifique que funciona, podrás registrar la entrega.',
      };
    }

    return {
      valid: true,
      message: 'Entrega autorizada: El equipo figura como reparado y verificado.',
    };
  }

  // Cancelado: permitido desde cualquier estado excepto entregado ya cerrado
  if (nuevoEstado === 'cancelado') {
    if (ordenActual.estado === 'entregado') {
      return {
        valid: false,
        message: 'Acción rechazada',
        reason: 'No se puede cancelar una orden que ya fue entregada y retirada por el cliente.',
      };
    }
  }

  return {
    valid: true,
    message: `Transición a "${nuevoEstado.replace('_', ' ')}" permitida.`,
  };
}

/**
 * REPOSITORY LAYER (Soporta Supabase si está conectado, o LocalStorage)
 */
export const db = {
  // CLIENTES
  async getClientes(): Promise<Cliente[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('clientes').select('*').order('created_at', { ascending: false });
        if (!error && data) return data as Cliente[];
      } catch (err) {
        console.warn('Fallback a local storage para clientes:', err);
      }
    }
    return getLocal<Cliente[]>(STORAGE_KEY_CLIENTES, SEED_CLIENTES);
  },

  async saveCliente(cliente: Partial<Cliente>): Promise<{ success: boolean; data?: Cliente; error?: string }> {
    const clientes = await this.getClientes();
    const docClean = (cliente.documento || '').trim();

    if (!docClean) {
      return { success: false, error: 'El documento (DNI/CUIT) es obligatorio.' };
    }

    // Validación de unicidad de documento
    const existeDoc = clientes.find(c => c.documento.toLowerCase() === docClean.toLowerCase() && c.id !== cliente.id);
    if (existeDoc) {
      return {
        success: false,
        error: `Ya existe un cliente registrado con el documento "${docClean}" (${existeDoc.nombre_completo}). El documento debe ser único.`,
      };
    }

    const now = new Date().toISOString();
    let clienteGuardado: Cliente;

    if (cliente.id) {
      clienteGuardado = {
        ...clientes.find(c => c.id === cliente.id)!,
        ...cliente,
        documento: docClean,
        updated_at: now,
      } as Cliente;
    } else {
      clienteGuardado = {
        id: 'cli-' + Date.now(),
        documento: docClean,
        nombre_completo: (cliente.nombre_completo || '').trim(),
        telefono: (cliente.telefono || '').trim(),
        email: (cliente.email || '').trim(),
        direccion: (cliente.direccion || '').trim(),
        created_at: now,
        updated_at: now,
      };
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('clientes').upsert(clienteGuardado).select().single();
        if (error) throw error;
        if (data) clienteGuardado = data as Cliente;
      } catch (err: unknown) {
        console.error('Error guardando cliente en Supabase:', err);
        return { success: false, error: err instanceof Error ? err.message : String(err) };
      }
    }

    // Actualizar copia local
    const actualizados = cliente.id
      ? clientes.map(c => (c.id === clienteGuardado.id ? clienteGuardado : c))
      : [clienteGuardado, ...clientes];
    setLocal(STORAGE_KEY_CLIENTES, actualizados);

    return { success: true, data: clienteGuardado };
  },

  async deleteCliente(id: string, cascade: boolean = false): Promise<{ success: boolean; error?: string }> {
    const equipos = await this.getEquipos();
    const clienteEquipos = equipos.filter(e => e.cliente_id === id);

    if (clienteEquipos.length > 0 && !cascade) {
      return {
        success: false,
        error: `El cliente tiene ${clienteEquipos.length} equipo(s) registrado(s). Por integridad referencial en la base de datos, debes confirmar el borrado en cascada para eliminar también sus equipos y órdenes asociadas.`,
      };
    }

    const supabase = getSupabaseClient();

    // Si se activa el borrado en cascada, eliminar primero las órdenes y equipos de este cliente
    if (clienteEquipos.length > 0 && cascade) {
      const ordenes = await this.getOrdenes();
      for (const eq of clienteEquipos) {
        const ordsDelEquipo = ordenes.filter(o => o.equipo_id === eq.id);
        for (const ord of ordsDelEquipo) {
          if (supabase) {
            try {
              await supabase.from('ordenes').delete().eq('id', ord.id);
            } catch (err) {
              console.warn('Error borrando orden de cliente en Supabase:', err);
            }
          }
        }
        if (supabase) {
          try {
            await supabase.from('equipos').delete().eq('id', eq.id);
          } catch (err) {
            console.warn('Error borrando equipo de cliente en Supabase:', err);
          }
        }
      }

      // Limpiar copias locales de equipos y órdenes afectadas
      const eqIds = new Set(clienteEquipos.map(e => e.id));
      const rawOrdenes = getLocal<Orden[]>(STORAGE_KEY_ORDENES, SEED_ORDENES);
      setLocal(STORAGE_KEY_ORDENES, rawOrdenes.filter(o => !eqIds.has(o.equipo_id)));
      setLocal(STORAGE_KEY_EQUIPOS, equipos.filter(e => e.cliente_id !== id));
    }

    if (supabase) {
      try {
        const { error } = await supabase.from('clientes').delete().eq('id', id);
        if (error) throw error;
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : String(err) };
      }
    }

    const clientes = await this.getClientes();
    setLocal(STORAGE_KEY_CLIENTES, clientes.filter(c => c.id !== id));
    return { success: true };
  },

  // EQUIPOS
  async getEquipos(): Promise<Equipo[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('equipos').select('*').order('created_at', { ascending: false });
        if (!error && data) return data as Equipo[];
      } catch (err) {
        console.warn('Fallback a local storage para equipos:', err);
      }
    }
    return getLocal<Equipo[]>(STORAGE_KEY_EQUIPOS, SEED_EQUIPOS);
  },

  async saveEquipo(equipo: Partial<Equipo>): Promise<{ success: boolean; data?: Equipo; error?: string }> {
    const equipos = await this.getEquipos();
    const serieClean = (equipo.numero_serie || '').trim();

    if (!serieClean) {
      return { success: false, error: 'El número de serie es obligatorio.' };
    }

    // Validación de unicidad de número de serie
    const existeSerie = equipos.find(e => e.numero_serie.toUpperCase() === serieClean.toUpperCase() && e.id !== equipo.id);
    if (existeSerie) {
      return {
        success: false,
        error: `Ya existe un equipo registrado con el número de serie "${serieClean}" (${existeSerie.marca} ${existeSerie.modelo}). El número de serie debe ser único.`,
      };
    }

    const now = new Date().toISOString();
    let equipoGuardado: Equipo;

    if (equipo.id) {
      equipoGuardado = {
        ...equipos.find(e => e.id === equipo.id)!,
        ...equipo,
        numero_serie: serieClean,
        updated_at: now,
      } as Equipo;
    } else {
      equipoGuardado = {
        id: 'eq-' + Date.now(),
        cliente_id: equipo.cliente_id!,
        numero_serie: serieClean,
        tipo_equipo: equipo.tipo_equipo || 'Notebook',
        marca: equipo.marca || '',
        modelo: equipo.modelo || '',
        accesorios_dejados: equipo.accesorios_dejados || '',
        notas_equipo: equipo.notas_equipo || '',
        created_at: now,
        updated_at: now,
      };
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('equipos').upsert(equipoGuardado).select().single();
        if (error) throw error;
        if (data) equipoGuardado = data as Equipo;
      } catch (err: unknown) {
        console.error('Error guardando equipo en Supabase:', err);
        return { success: false, error: err instanceof Error ? err.message : String(err) };
      }
    }

    const actualizados = equipo.id
      ? equipos.map(e => (e.id === equipoGuardado.id ? equipoGuardado : e))
      : [equipoGuardado, ...equipos];
    setLocal(STORAGE_KEY_EQUIPOS, actualizados);

    return { success: true, data: equipoGuardado };
  },

  async deleteEquipo(id: string): Promise<{ success: boolean; error?: string }> {
    const ordenes = await this.getOrdenes();
    const tieneOrdenes = ordenes.some(o => o.equipo_id === id);
    if (tieneOrdenes) {
      return {
        success: false,
        error: 'No se puede eliminar el equipo porque tiene órdenes de servicio asociadas. Por integridad referencial, conserva el historial técnico.',
      };
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('equipos').delete().eq('id', id);
        if (error) throw error;
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : String(err) };
      }
    }

    const equipos = await this.getEquipos();
    setLocal(STORAGE_KEY_EQUIPOS, equipos.filter(e => e.id !== id));
    return { success: true };
  },

  // ORDENES
  async getOrdenes(): Promise<Orden[]> {
    let rawOrdenes: Orden[] = [];
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data, error } = await supabase.from('ordenes').select('*').order('created_at', { ascending: false });
        if (!error && data) rawOrdenes = data as Orden[];
      } catch (err) {
        console.warn('Fallback a local storage para ordenes:', err);
      }
    }

    if (rawOrdenes.length === 0) {
      rawOrdenes = getLocal<Orden[]>(STORAGE_KEY_ORDENES, SEED_ORDENES);
    }

    const [clientes, equipos] = await Promise.all([this.getClientes(), this.getEquipos()]);

    // Enriquecer con equipo y cliente
    return rawOrdenes.map(orden => {
      const eq = equipos.find(e => e.id === orden.equipo_id);
      const cli = eq ? clientes.find(c => c.id === eq.cliente_id) : undefined;
      return {
        ...orden,
        equipo: eq,
        cliente: cli,
      };
    });
  },

  async saveOrden(
    orden: Partial<Orden>,
    datosActualizados?: { diagnostico?: string; costo?: number }
  ): Promise<{ success: boolean; data?: Orden; validation?: ValidationResult; error?: string }> {
    const ordenes = await this.getOrdenes();
    const now = new Date().toISOString();

    let ordenExistente: Orden | undefined;
    if (orden.id) {
      ordenExistente = ordenes.find(o => o.id === orden.id);
    }

    const targetEstado = orden.estado || (ordenExistente ? ordenExistente.estado : 'recibido');

    // Validación de reglas de negocio
    if (ordenExistente) {
      const val = validarTransicionEstado(ordenExistente, targetEstado, {
        diagnostico: orden.diagnostico ?? datosActualizados?.diagnostico,
        costo: orden.costo ?? datosActualizados?.costo,
      });

      if (!val.valid) {
        return { success: false, validation: val, error: val.reason };
      }
    } else {
      // Orden nueva: No puede nacer como 'en_reparacion' sin diagnostico ni costo, ni como 'entregado'
      if (targetEstado === 'en_reparacion') {
        const diag = (orden.diagnostico || '').trim();
        const cost = Number(orden.costo || 0);
        if (!diag || cost <= 0) {
          return {
            success: false,
            validation: {
              valid: false,
              message: 'Acción rechazada por Regla de Negocio #1',
              reason: 'No se puede ingresar una orden directamente en estado "En Reparación" sin diagnóstico técnico y costo mayor a $0.',
              missingRequirements: [
                !diag ? 'Falta diagnóstico técnico' : '',
                cost <= 0 ? 'Falta costo positivo mayor a $0' : '',
              ].filter(Boolean),
            },
            error: 'No se puede ingresar en reparación sin diagnóstico y costo positivo.',
          };
        }
      }
      if (targetEstado === 'entregado') {
        return {
          success: false,
          validation: {
            valid: false,
            message: 'Acción rechazada por Regla de Negocio #2',
            reason: 'Una orden no puede nacer como "Entregada". Primero debe recibirse, diagnosticarse y repararse.',
          },
          error: 'Una orden nueva no puede registrarse como entregada directamente.',
        };
      }
    }

    let ordenGuardada: Orden;

    if (ordenExistente) {
      ordenGuardada = {
        ...ordenExistente,
        ...orden,
        diagnostico: orden.diagnostico !== undefined ? orden.diagnostico : ordenExistente.diagnostico,
        costo: orden.costo !== undefined ? Number(orden.costo) : ordenExistente.costo,
        estado: targetEstado,
        updated_at: now,
      };

      if (targetEstado === 'en_reparacion' && !ordenGuardada.fecha_diagnostico) {
        ordenGuardada.fecha_diagnostico = now;
      }
      if (targetEstado === 'reparado' && !ordenGuardada.fecha_reparado) {
        ordenGuardada.fecha_reparado = now;
      }
      if (targetEstado === 'entregado' && !ordenGuardada.fecha_entrega) {
        ordenGuardada.fecha_entrega = now;
      }
    } else {
      const nextNum = ordenes.length + 1;
      const generatedOrderNumber = `ORD-2026-${String(nextNum).padStart(3, '0')}`;

      ordenGuardada = {
        id: 'ord-' + Date.now(),
        numero_orden: orden.numero_orden || generatedOrderNumber,
        equipo_id: orden.equipo_id!,
        falla_reportada: (orden.falla_reportada || '').trim(),
        diagnostico: (orden.diagnostico || '').trim(),
        costo: Number(orden.costo || 0),
        estado: targetEstado,
        fecha_ingreso: now,
        fecha_diagnostico: targetEstado === 'en_diagnostico' || targetEstado === 'en_reparacion' ? now : undefined,
        fecha_reparado: targetEstado === 'reparado' ? now : undefined,
        fecha_entrega: undefined,
        created_at: now,
        updated_at: now,
      };
    }

    // Guardar en Supabase si está disponible
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        // Strip campos enriquecidos para la tabla ordenes
        const { equipo: _e, cliente: _c, ...payload } = ordenGuardada;
        const { data, error } = await supabase.from('ordenes').upsert(payload).select().single();
        if (error) throw error;
        if (data) {
          ordenGuardada = { ...ordenGuardada, ...data };
        }
      } catch (err: unknown) {
        console.error('Error guardando orden en Supabase:', err);
        return {
          success: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }

    // Actualizar almacenamiento local
    const rawList = getLocal<Orden[]>(STORAGE_KEY_ORDENES, SEED_ORDENES);
    const { equipo: _e, cliente: _c, ...plainOrden } = ordenGuardada;
    const actualizados = orden.id
      ? rawList.map(o => (o.id === plainOrden.id ? plainOrden : o))
      : [plainOrden, ...rawList];
    setLocal(STORAGE_KEY_ORDENES, actualizados);

    return {
      success: true,
      data: ordenGuardada,
      validation: {
        valid: true,
        message: 'Orden guardada con éxito cumpliendo todas las reglas del sistema.',
      },
    };
  },

  async cambiarEstadoOrden(
    ordenId: string,
    nuevoEstado: EstadoOrden,
    requisitos?: { diagnostico?: string; costo?: number }
  ): Promise<{ success: boolean; validation: ValidationResult; error?: string }> {
    const ordenes = await this.getOrdenes();
    const orden = ordenes.find(o => o.id === ordenId);

    if (!orden) {
      return {
        success: false,
        validation: {
          valid: false,
          message: 'Error de búsqueda',
          reason: 'No se encontró la orden solicitada.',
        },
        error: 'Orden no encontrada.',
      };
    }

    const validation = validarTransicionEstado(orden, nuevoEstado, requisitos);
    if (!validation.valid) {
      return { success: false, validation, error: validation.reason };
    }

    const result = await this.saveOrden(
      {
        id: ordenId,
        estado: nuevoEstado,
        diagnostico: requisitos?.diagnostico ?? orden.diagnostico,
        costo: requisitos?.costo !== undefined ? requisitos.costo : orden.costo,
      },
      requisitos
    );

    return {
      success: result.success,
      validation,
      error: result.error,
    };
  },

  async deleteOrden(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('ordenes').delete().eq('id', id);
        if (error) throw error;
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : String(err) };
      }
    }

    const rawList = getLocal<Orden[]>(STORAGE_KEY_ORDENES, SEED_ORDENES);
    setLocal(STORAGE_KEY_ORDENES, rawList.filter(o => o.id !== id));
    return { success: true };
  },

  resetDemoData(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CLIENTES, JSON.stringify(SEED_CLIENTES));
      localStorage.setItem(STORAGE_KEY_EQUIPOS, JSON.stringify(SEED_EQUIPOS));
      localStorage.setItem(STORAGE_KEY_ORDENES, JSON.stringify(SEED_ORDENES));
    }
  },
};
