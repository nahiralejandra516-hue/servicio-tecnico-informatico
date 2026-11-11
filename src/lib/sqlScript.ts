/**
 * Script SQL profesional para ejecutar en el SQL Editor de Supabase
 * Crea las tablas clientes, equipos y ordenes con:
 * - Claves primarias (UUID gen_random_uuid())
 * - Claves foráneas con integridad referencial (ON DELETE RESTRICT)
 * - Restricciones de unicidad (UNIQUE en documento y numero_serie)
 * - Valores por defecto y marcas temporales (created_at, updated_at)
 * - Triggers de actualización automática de updated_at
 * - Triggers de validación de reglas de negocio a nivel de base de datos
 * - Políticas de Row Level Security (RLS) para acceso desde la app
 */

export const SUPABASE_SQL_SCRIPT = `-- =====================================================================
-- PROYECTO: SISTEMA DE GESTIÓN DE SERVICIO TÉCNICO INFORMÁTICO
-- PLATAFORMA: Supabase / PostgreSQL
-- TABLAS: clientes, equipos, ordenes
-- =====================================================================

-- 1. Habilitar extensión para generación de identificadores únicos UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 2. FUNCIÓN GENERAL PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
-- =====================================================================
CREATE OR REPLACE FUNCTION actualizar_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- 3. TABLA: CLIENTES
-- Guarda la información de los clientes con su documento único (DNI/CUIT/CI)
-- =====================================================================
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    documento VARCHAR(20) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    telefono VARCHAR(50),
    email VARCHAR(150),
    direccion TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    
    -- Restricción de unicidad: No pueden existir dos clientes con el mismo documento
    CONSTRAINT uq_clientes_documento UNIQUE (documento)
);

-- Trigger para updated_at en clientes
DROP TRIGGER IF EXISTS trg_actualizar_clientes_updated_at ON clientes;
CREATE TRIGGER trg_actualizar_clientes_updated_at
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp_updated_at();

-- =====================================================================
-- 4. TABLA: EQUIPOS
-- Guarda los dispositivos que ingresan al taller con su número de serie único
-- =====================================================================
CREATE TABLE IF NOT EXISTS equipos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL,
    numero_serie VARCHAR(100) NOT NULL,
    tipo_equipo VARCHAR(50) NOT NULL, -- Notebook, PC Escritorio, Impresora, All-in-One, Consola, etc.
    marca VARCHAR(80) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    accesorios_dejados TEXT, -- Cargador, funda, cable de alimentación, mouse, etc.
    notas_equipo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    -- Clave foránea al cliente
    CONSTRAINT fk_equipos_cliente FOREIGN KEY (cliente_id)
        REFERENCES clientes(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    -- Restricción de unicidad: El número de serie de cada equipo debe ser único
    CONSTRAINT uq_equipos_numero_serie UNIQUE (numero_serie)
);

-- Trigger para updated_at en equipos
DROP TRIGGER IF EXISTS trg_actualizar_equipos_updated_at ON equipos;
CREATE TRIGGER trg_actualizar_equipos_updated_at
    BEFORE UPDATE ON equipos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp_updated_at();

-- =====================================================================
-- 5. TABLA: ORDENES (Órdenes de Reparación)
-- Registra el ciclo de vida del servicio técnico de cada equipo
-- =====================================================================
CREATE TABLE IF NOT EXISTS ordenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_orden VARCHAR(30) NOT NULL,
    equipo_id UUID NOT NULL,
    falla_reportada TEXT NOT NULL,
    diagnostico TEXT,
    costo NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    estado VARCHAR(30) NOT NULL DEFAULT 'recibido',
    fecha_ingreso TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    fecha_diagnostico TIMESTAMPTZ,
    fecha_reparado TIMESTAMPTZ,
    fecha_entrega TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    -- Clave foránea al equipo
    CONSTRAINT fk_ordenes_equipo FOREIGN KEY (equipo_id)
        REFERENCES equipos(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    -- Restricción de unicidad: Código de orden único
    CONSTRAINT uq_ordenes_numero_orden UNIQUE (numero_orden),

    -- Restricción de valor de costo no negativo
    CONSTRAINT chk_ordenes_costo_no_negativo CHECK (costo >= 0),

    -- Restricción de estados válidos permitidos
    CONSTRAINT chk_ordenes_estado_valido CHECK (
        estado IN ('recibido', 'en_diagnostico', 'en_reparacion', 'reparado', 'entregado', 'cancelado')
    ),

    -- REGLA 1 (Nivel de Constraint):
    -- Si el estado es 'en_reparacion', DEBE tener diagnóstico no vacío y costo > 0
    CONSTRAINT chk_ordenes_requisitos_reparacion CHECK (
        estado != 'en_reparacion' OR (
            diagnostico IS NOT NULL AND 
            length(trim(diagnostico)) > 0 AND 
            costo > 0
        )
    )
);

-- Trigger para updated_at en ordenes
DROP TRIGGER IF EXISTS trg_actualizar_ordenes_updated_at ON ordenes;
CREATE TRIGGER trg_actualizar_ordenes_updated_at
    BEFORE UPDATE ON ordenes
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp_updated_at();

-- =====================================================================
-- 6. TRIGGER DE REGLAS DE NEGOCIO ESTRICTAS (Con mensajes claros)
-- Valida las transiciones de estado antes de INSERT o UPDATE en ordenes
-- =====================================================================
CREATE OR REPLACE FUNCTION validar_reglas_negocio_orden()
RETURNS TRIGGER AS $$
BEGIN
    -- REGLA 1: No se puede pasar a 'en_reparacion' sin diagnóstico y costo positivo
    IF NEW.estado = 'en_reparacion' THEN
        IF NEW.diagnostico IS NULL OR length(trim(NEW.diagnostico)) = 0 THEN
            RAISE EXCEPTION 'REGLA RECHAZADA: No se puede pasar la orden a reparación sin registrar un diagnóstico técnico previo.';
        END IF;

        IF NEW.costo IS NULL OR NEW.costo <= 0 THEN
            RAISE EXCEPTION 'REGLA RECHAZADA: No se puede pasar la orden a reparación sin definir un presupuesto/costo positivo mayor a cero (costo actual: $%).', COALESCE(NEW.costo, 0);
        END IF;

        -- Registrar fecha de paso a reparación si no está seteada
        IF NEW.fecha_diagnostico IS NULL THEN
            NEW.fecha_diagnostico = timezone('utc'::text, now());
        END IF;
    END IF;

    -- REGLA 2: No se puede entregar una orden si antes no figura como 'reparado'
    IF NEW.estado = 'entregado' THEN
        IF TG_OP = 'UPDATE' AND OLD.estado != 'reparado' THEN
            RAISE EXCEPTION 'REGLA RECHAZADA: No se puede entregar una orden que no figure previamente en estado "reparado". (Estado actual de la orden: "%")', OLD.estado;
        ELSIF TG_OP = 'INSERT' THEN
            RAISE EXCEPTION 'REGLA RECHAZADA: No se puede ingresar una orden directamente en estado "entregado". Debe cumplir el ciclo de recepción y reparación.';
        END IF;

        -- Registrar fecha de entrega si no está seteada
        IF NEW.fecha_entrega IS NULL THEN
            NEW.fecha_entrega = timezone('utc'::text, now());
        END IF;
    END IF;

    -- Si pasa a estado 'reparado', asegurar timestamp de fecha_reparado
    IF NEW.estado = 'reparado' AND NEW.fecha_reparado IS NULL THEN
        NEW.fecha_reparado = timezone('utc'::text, now());
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_reglas_orden ON ordenes;
CREATE TRIGGER trg_validar_reglas_orden
    BEFORE INSERT OR UPDATE ON ordenes
    FOR EACH ROW
    EXECUTE FUNCTION validar_reglas_negocio_orden();

-- =====================================================================
-- 7. ÍNDICES DE RENDIMIENTO PARA BÚSQUEDAS RÁPIDAS
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_clientes_documento ON clientes(documento);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre_completo);
CREATE INDEX IF NOT EXISTS idx_equipos_cliente_id ON equipos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_equipos_numero_serie ON equipos(numero_serie);
CREATE INDEX IF NOT EXISTS idx_ordenes_equipo_id ON ordenes(equipo_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_numero_orden ON ordenes(numero_orden);

-- =====================================================================
-- 8. POLÍTICAS DE ROW LEVEL SECURITY (RLS) PARA SUPABASE
-- Permite que la app web lea, inserte y actualice registros
-- =====================================================================
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes ENABLE ROW LEVEL SECURITY;

-- Políticas para clientes
DROP POLICY IF EXISTS "Permitir lectura publica de clientes" ON clientes;
CREATE POLICY "Permitir lectura publica de clientes"
    ON clientes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir escritura publica de clientes" ON clientes;
CREATE POLICY "Permitir escritura publica de clientes"
    ON clientes FOR ALL USING (true) WITH CHECK (true);

-- Políticas para equipos
DROP POLICY IF EXISTS "Permitir lectura publica de equipos" ON equipos;
CREATE POLICY "Permitir lectura publica de equipos"
    ON equipos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir escritura publica de equipos" ON equipos;
CREATE POLICY "Permitir escritura publica de equipos"
    ON equipos FOR ALL USING (true) WITH CHECK (true);

-- Políticas para ordenes
DROP POLICY IF EXISTS "Permitir lectura publica de ordenes" ON ordenes;
CREATE POLICY "Permitir lectura publica de ordenes"
    ON ordenes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir escritura publica de ordenes" ON ordenes;
CREATE POLICY "Permitir escritura publica de ordenes"
    ON ordenes FOR ALL USING (true) WITH CHECK (true);

-- =====================================================================
-- 9. DATOS DE PRUEBA INICIALES (SEMILLA PARA DEMO)
-- Ejecutar estas líneas para tener datos de prueba realistas
-- =====================================================================
DO $$
DECLARE
    v_cli1 UUID;
    v_cli2 UUID;
    v_cli3 UUID;
    v_eq1 UUID;
    v_eq2 UUID;
    v_eq3 UUID;
    v_eq4 UUID;
BEGIN
    -- Insertar Clientes si no existen
    INSERT INTO clientes (documento, nombre_completo, telefono, email, direccion)
    VALUES ('38492019', 'Martín Rodríguez', '+54 11 4455-2233', 'martin.rodriguez@email.com', 'Av. Rivadavia 4520, CABA')
    ON CONFLICT (documento) DO UPDATE SET nombre_completo = EXCLUDED.nombre_completo
    RETURNING id INTO v_cli1;

    INSERT INTO clientes (documento, nombre_completo, telefono, email, direccion)
    VALUES ('41285741', 'Lucía Fernández', '+54 11 9876-5432', 'lucia.fernandez@email.com', 'Calle Belgrano 128, Quilmes')
    ON CONFLICT (documento) DO UPDATE SET nombre_completo = EXCLUDED.nombre_completo
    RETURNING id INTO v_cli2;

    INSERT INTO clientes (documento, nombre_completo, telefono, email, direccion)
    VALUES ('35901234', 'Esteban Morales', '+54 11 6543-2198', 'esteban.morales@email.com', 'Mitre 850, San Isidro')
    ON CONFLICT (documento) DO UPDATE SET nombre_completo = EXCLUDED.nombre_completo
    RETURNING id INTO v_cli3;

    -- Insertar Equipos
    INSERT INTO equipos (cliente_id, numero_serie, tipo_equipo, marca, modelo, accesorios_dejados, notas_equipo)
    VALUES (v_cli1, 'SN-LENOVO-8842', 'Notebook', 'Lenovo', 'IdeaPad 3 15ALC6', 'Cargador original 65W y mouse inalámbrico', 'Presenta rayón superficial en tapa')
    ON CONFLICT (numero_serie) DO UPDATE SET modelo = EXCLUDED.modelo
    RETURNING id INTO v_eq1;

    INSERT INTO equipos (cliente_id, numero_serie, tipo_equipo, marca, modelo, accesorios_dejados, notas_equipo)
    VALUES (v_cli2, 'SN-DELL-5520-X', 'PC de Escritorio', 'Dell', 'OptiPlex 7090 Micro', 'Cable de fuente interlock', 'Sin accesorios adicionales')
    ON CONFLICT (numero_serie) DO UPDATE SET modelo = EXCLUDED.modelo
    RETURNING id INTO v_eq2;

    INSERT INTO equipos (cliente_id, numero_serie, tipo_equipo, marca, modelo, accesorios_dejados, notas_equipo)
    VALUES (v_cli3, 'SN-ASUS-99124', 'Notebook', 'ASUS', 'ROG Strix G15', 'Cargador 240W original y funda acolchada', 'Teclado con tecla W gastada')
    ON CONFLICT (numero_serie) DO UPDATE SET modelo = EXCLUDED.modelo
    RETURNING id INTO v_eq3;

    INSERT INTO equipos (cliente_id, numero_serie, tipo_equipo, marca, modelo, accesorios_dejados, notas_equipo)
    VALUES (v_cli1, 'SN-HP-DESK-410', 'Impresora', 'HP', 'Ink Advantage 4175', 'Cable USB y cable 220V', 'Bandeja de papel con traba floja')
    ON CONFLICT (numero_serie) DO UPDATE SET modelo = EXCLUDED.modelo
    RETURNING id INTO v_eq4;

    -- Insertar Órdenes de prueba con distintos estados cumpliendo las reglas
    INSERT INTO ordenes (numero_orden, equipo_id, falla_reportada, diagnostico, costo, estado, fecha_ingreso)
    VALUES (
        'ORD-2026-001',
        v_eq1,
        'No enciende tras corte de luz. Led de carga no titila.',
        NULL,
        0.00,
        'recibido',
        now() - interval '2 days'
    ) ON CONFLICT (numero_orden) DO NOTHING;

    INSERT INTO ordenes (numero_orden, equipo_id, falla_reportada, diagnostico, costo, estado, fecha_ingreso, fecha_diagnostico)
    VALUES (
        'ORD-2026-002',
        v_eq2,
        'Levanta alta temperatura y se apaga a los 10 minutos de uso.',
        'Cooler CPU clavado por suciedad y pasta térmica cristalizada. Requiere limpieza química y cambio de pad térmico.',
        45000.00,
        'en_reparacion',
        now() - interval '3 days',
        now() - interval '1 day'
    ) ON CONFLICT (numero_orden) DO NOTHING;

    INSERT INTO ordenes (numero_orden, equipo_id, falla_reportada, diagnostico, costo, estado, fecha_ingreso, fecha_diagnostico, fecha_reparado)
    VALUES (
        'ORD-2026-003',
        v_eq3,
        'Pantalla con líneas verticales y parpadeo intermitente.',
        'Cable flex de pantalla desprendido y conector dañado. Se reemplazó flex LVDS nuevo y se recalibró la tasa de refresco.',
        85000.00,
        'reparado',
        now() - interval '5 days',
        now() - interval '3 days',
        now() - interval '12 hours'
    ) ON CONFLICT (numero_orden) DO NOTHING;

    INSERT INTO ordenes (numero_orden, equipo_id, falla_reportada, diagnostico, costo, estado, fecha_ingreso, fecha_diagnostico, fecha_reparado, fecha_entrega)
    VALUES (
        'ORD-2026-004',
        v_eq4,
        'Atasco de papel y no toma hojas desde la bandeja superior.',
        'Rodillos de alimentación de goma desgastados. Se realizó service de gomas pick-up rollers y purga de cabezal.',
        32000.00,
        'entregado',
        now() - interval '7 days',
        now() - interval '6 days',
        now() - interval '4 days',
        now() - interval '2 days'
    ) ON CONFLICT (numero_orden) DO NOTHING;

END $$;
`;
