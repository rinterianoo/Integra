-- =====================================================
-- MIGRACIÓN MULTI-TIENDA PARA INTEGRA POS
-- =====================================================

-- 1. Crear tabla de tiendas
CREATE TABLE IF NOT EXISTS tiendas (
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

-- 2. Agregar tienda_id a la tabla usuarios
ALTER TABLE usuarios ADD COLUMN tienda_id INT AFTER id;
ALTER TABLE usuarios ADD CONSTRAINT fk_usuarios_tienda 
    FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE;
ALTER TABLE usuarios ADD INDEX idx_tienda_id (tienda_id);

-- 3. Agregar tienda_id a productos
ALTER TABLE productos ADD COLUMN tienda_id INT AFTER id;
ALTER TABLE productos ADD CONSTRAINT fk_productos_tienda 
    FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE;
ALTER TABLE productos ADD INDEX idx_productos_tienda (tienda_id);

-- 4. Agregar tienda_id a categorias
ALTER TABLE categorias ADD COLUMN tienda_id INT AFTER id;
ALTER TABLE categorias ADD CONSTRAINT fk_categorias_tienda 
    FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE;
ALTER TABLE categorias ADD INDEX idx_categorias_tienda (tienda_id);

-- 5. Agregar tienda_id a turnos
ALTER TABLE turnos ADD COLUMN tienda_id INT AFTER id;
ALTER TABLE turnos ADD CONSTRAINT fk_turnos_tienda 
    FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE;
ALTER TABLE turnos ADD INDEX idx_turnos_tienda (tienda_id);

-- 6. Agregar tienda_id a ventas
ALTER TABLE ventas ADD COLUMN tienda_id INT AFTER id;
ALTER TABLE ventas ADD CONSTRAINT fk_ventas_tienda 
    FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE;
ALTER TABLE ventas ADD INDEX idx_ventas_tienda (tienda_id);

-- 7. Agregar tienda_id a ordenes_temporales
ALTER TABLE ordenes_temporales ADD COLUMN tienda_id INT AFTER id;
ALTER TABLE ordenes_temporales ADD CONSTRAINT fk_ordenes_tienda 
    FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE;
ALTER TABLE ordenes_temporales ADD INDEX idx_ordenes_tienda (tienda_id);

-- 8. Crear rol super_admin en usuarios
ALTER TABLE usuarios MODIFY COLUMN rol ENUM('super_admin', 'administrador', 'cajero', 'supervisor') DEFAULT 'cajero';

-- 9. Insertar tienda por defecto y migrar datos existentes
INSERT INTO tiendas (nombre, direccion, telefono, activa) 
VALUES ('Tienda Principal', 'Dirección por defecto', '0000-0000', TRUE);

SET @tienda_principal_id = LAST_INSERT_ID();

-- 10. Asignar la tienda principal a todos los registros existentes
UPDATE usuarios SET tienda_id = @tienda_principal_id WHERE tienda_id IS NULL;
UPDATE productos SET tienda_id = @tienda_principal_id WHERE tienda_id IS NULL;
UPDATE categorias SET tienda_id = @tienda_principal_id WHERE tienda_id IS NULL;
UPDATE turnos SET tienda_id = @tienda_principal_id WHERE tienda_id IS NULL;
UPDATE ventas SET tienda_id = @tienda_principal_id WHERE tienda_id IS NULL;
UPDATE ordenes_temporales SET tienda_id = @tienda_principal_id WHERE tienda_id IS NULL;

-- 11. Hacer tienda_id obligatorio en todas las tablas
ALTER TABLE usuarios MODIFY COLUMN tienda_id INT NOT NULL;
ALTER TABLE productos MODIFY COLUMN tienda_id INT NOT NULL;
ALTER TABLE categorias MODIFY COLUMN tienda_id INT NOT NULL;
ALTER TABLE turnos MODIFY COLUMN tienda_id INT NOT NULL;
ALTER TABLE ventas MODIFY COLUMN tienda_id INT NOT NULL;
ALTER TABLE ordenes_temporales MODIFY COLUMN tienda_id INT NOT NULL;

-- 12. Crear usuario super admin por defecto
INSERT INTO usuarios (nombre, email, password, rol, tienda_id)
VALUES (
    'Super Administrador',
    'superadmin@integra.com',
    '$2b$10$rH8qY5K5J5mYxZ5nZ5nZ5.Z5nZ5nZ5nZ5nZ5nZ5nZ5nZ5nZ5nZ5nZ',  -- password: super123
    'super_admin',
    @tienda_principal_id
);

SELECT '✅ Migración multi-tienda completada exitosamente' AS resultado;
