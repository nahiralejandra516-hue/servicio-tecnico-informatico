export type EstadoOrden = 
  | 'recibido'
  | 'en_diagnostico'
  | 'en_reparacion'
  | 'reparado'
  | 'entregado'
  | 'cancelado';

export interface Cliente {
  id: string;
  documento: string; // DNI / CUIT / Pasaporte (Único)
  nombre_completo: string;
  telefono: string;
  email: string;
  direccion?: string;
  created_at: string;
  updated_at: string;
}

export interface Equipo {
  id: string;
  cliente_id: string;
  numero_serie: string; // Número de serie único
  tipo_equipo: string; // Notebook, PC de escritorio, All-in-One, Impresora, Monitor, etc.
  marca: string;
  modelo: string;
  accesorios_dejados?: string; // Cargador, cable de poder, mouse, funda, etc.
  notas_equipo?: string;
  created_at: string;
  updated_at: string;
}

export interface Orden {
  id: string;
  numero_orden: string; // Ej: ORD-2026-001
  equipo_id: string;
  falla_reportada: string;
  diagnostico?: string;
  costo: number; // >= 0
  estado: EstadoOrden;
  fecha_ingreso: string;
  fecha_diagnostico?: string;
  fecha_reparado?: string;
  fecha_entrega?: string;
  created_at: string;
  updated_at: string;
  // Campos embebidos para vistas convenientes
  equipo?: Equipo;
  cliente?: Cliente;
}

export interface ValidationResult {
  valid: boolean;
  message: string;
  reason?: string;
  missingRequirements?: string[];
  suggestedAction?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}
