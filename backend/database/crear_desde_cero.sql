-- =====================================================
-- CREACIÓN COMPLETA DE BASE DE DATOS MULTI-TIENDA
-- =====================================================

-- Desactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas si existen
DROP TABLE IF EXISTS ordenes_temporales;
DROP TABLE IF EXISTS movimientos_caja;
DROP TABLE IF EXISTS pagos;
DROP TABLE IF EXISTS detalles_venta;
DROP TABLE IF EXISTS ventas;
DROP TABLE IF EXISTS turnos;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS tiendas;

-- Reactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. CREAR TABLA DE TIENDAS
-- =====================================================
CREATE TABLE tiendas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(255),
    nit VARCHAR(50),
    logo_url VARCHAR(500),
    configuracion JSON,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. CREAR TABLA DE USUARIOS (con tienda_id)
-- =====================================================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tienda_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('super_admin', 'administrador', 'cajero', 'supervisor') NOT NULL DEFAULT 'cajero',
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE,
    INDEX idx_tienda_id (tienda_id),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. CREAR TABLA DE CATEGORIAS (con tienda_id)
-- =====================================================
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tienda_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE,
    INDEX idx_tienda_id (tienda_id),
    UNIQUE KEY unique_nombre_tienda (nombre, tienda_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. CREAR TABLA DE PRODUCTOS (con tienda_id)
-- =====================================================
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tienda_id INT NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    codigo_barras VARCHAR(100),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria_id INT,
    precio DECIMAL(10,2) NOT NULL,
    costo DECIMAL(10,2) DEFAULT 0,
    stock INT DEFAULT 0,
    stock_minimo INT DEFAULT 0,
    imagen VARCHAR(255),
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
    INDEX idx_tienda_id (tienda_id),
    INDEX idx_codigo (codigo),
    INDEX idx_codigo_barras (codigo_barras),
    INDEX idx_nombre (nombre),
    UNIQUE KEY unique_codigo_tienda (codigo, tienda_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. CREAR TABLA DE TURNOS (con tienda_id)
-- =====================================================
CREATE TABLE turnos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tienda_id INT NOT NULL,
    usuario_id INT NOT NULL,
    monto_inicial DECIMAL(10,2) NOT NULL,
    monto_final DECIMAL(10,2),
    monto_esperado DECIMAL(10,2),
    diferencia DECIMAL(10,2),
    notas TEXT,
    estado ENUM('abierto', 'cerrado') NOT NULL,
    fecha_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP NULL,
    FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_tienda_id (tienda_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. CREAR TABLA DE VENTAS (con tienda_id)
-- =====================================================
CREATE TABLE ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tienda_id INT NOT NULL,
    numero_venta VARCHAR(50) NOT NULL,
    usuario_id INT NOT NULL,
    turno_id INT NOT NULL,
    cliente_nombre VARCHAR(255),
    subtotal DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) DEFAULT 0,
    propina DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    estado ENUM('completada', 'cancelada', 'temporal') NOT NULL,
    notas TEXT,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (turno_id) REFERENCES turnos(id) ON DELETE CASCADE,
    INDEX idx_tienda_id (tienda_id),
    INDEX idx_numero_venta (numero_venta),
    INDEX idx_fecha (fecha_venta),
    INDEX idx_turno (turno_id),
    UNIQUE KEY unique_numero_venta_tienda (numero_venta, tienda_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. CREAR TABLA DE DETALLES DE VENTA
-- =====================================================
CREATE TABLE detalles_venta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    INDEX idx_venta (venta_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. CREAR TABLA DE PAGOS
-- =====================================================
CREATE TABLE pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL,
    metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'mixto') NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    referencia VARCHAR(255),
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
    INDEX idx_venta (venta_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. CREAR TABLA DE MOVIMIENTOS DE CAJA
-- =====================================================
CREATE TABLE movimientos_caja (
    id INT AUTO_INCREMENT PRIMARY KEY,
    turno_id INT NOT NULL,
    tipo ENUM('entrada', 'salida', 'venta') NOT NULL,
    concepto VARCHAR(255) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    venta_id INT,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (turno_id) REFERENCES turnos(id) ON DELETE CASCADE,
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE SET NULL,
    INDEX idx_turno (turno_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 10. CREAR TABLA DE ORDENES TEMPORALES (con tienda_id)
-- =====================================================
CREATE TABLE ordenes_temporales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tienda_id INT NOT NULL,
    usuario_id INT NOT NULL,
    nombre_orden VARCHAR(255) NOT NULL,
    datos_orden TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_tienda_id (tienda_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 11. INSERTAR TIENDA PRINCIPAL
-- =====================================================
INSERT INTO tiendas (nombre, direccion, telefono, activa) 
VALUES ('Tienda Principal', 'Dirección por defecto', '0000-0000', TRUE);

SET @tienda_principal_id = LAST_INSERT_ID();

-- =====================================================
-- 12. CREAR USUARIO SUPER ADMIN
-- =====================================================
INSERT INTO usuarios (nombre, email, password, rol, tienda_id)
VALUES (
    'Super Administrador',
    'superadmin@integra.com',
    '$2a$10$jEuFT1W.l1X8AjeD6ZRroe5MnWh0ZWYKlwqOUqD9Y84xlO1Lf8K6a',  -- password: super123
    'super_admin',
    @tienda_principal_id
);

-- =====================================================
-- 13. CREAR CATEGORIA GENERAL PARA TIENDA PRINCIPAL
-- =====================================================
INSERT INTO categorias (tienda_id, nombre, descripcion, activo)
VALUES (@tienda_principal_id, 'General', 'Categoría general de productos', 1);

SELECT '✅ Base de datos multi-tienda creada exitosamente' AS resultado;
