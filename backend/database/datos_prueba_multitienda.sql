-- =====================================================
-- DATOS DE PRUEBA MULTI-TIENDA
-- =====================================================

-- Este script ya asume que la migración multitienda fue ejecutada

-- 1. Verificar tiendas existentes
SELECT * FROM tiendas;

-- 2. Crear segunda tienda
INSERT INTO tiendas (nombre, direccion, telefono, email, nit, activa) 
VALUES ('Sucursal Centro', 'Zona 1, Ciudad de Guatemala', '2222-2222', 'centro@integra.com', '12345678-9', TRUE);

SET @tienda_principal = 1;
SET @tienda_centro = LAST_INSERT_ID();

-- 3. Crear categoría para la nueva tienda (si no existe)
INSERT IGNORE INTO categorias (tienda_id, nombre, descripcion, activo)
VALUES (@tienda_centro, 'General', 'Categoría general', 1);

-- 4. Crear usuarios para Tienda Principal (ID = 1) - evitar duplicados
-- Admin Tienda Principal
INSERT IGNORE INTO usuarios (tienda_id, nombre, email, password, rol, activo) 
VALUES (
    @tienda_principal,
    'Admin Principal',
    'admin.principal@integra.com',
    '$2a$10$s50Vft8nVIT4IqzDd2Wipe6.jcZJuQVGv/Pi8a98qGvkMfVF7a0Te',  -- password: admin123
    'administrador',
    1
);

-- Cajero Tienda Principal
INSERT IGNORE INTO usuarios (tienda_id, nombre, email, password, rol, activo) 
VALUES (
    @tienda_principal,
    'Cajero Principal',
    'cajero.principal@integra.com',
    '$2a$10$Th87XmLHBYVj6JI5Wx6sZO4Byu08WPq0y4suLpt6U5wzmCpFR9k2K',  -- password: cajero123
    'cajero',
    1
);

-- 5. Crear usuarios para Sucursal Centro
-- Admin Sucursal Centro
INSERT IGNORE INTO usuarios (tienda_id, nombre, email, password, rol, activo) 
VALUES (
    @tienda_centro,
    'Admin Centro',
    'admin.centro@integra.com',
    '$2a$10$s50Vft8nVIT4IqzDd2Wipe6.jcZJuQVGv/Pi8a98qGvkMfVF7a0Te',  -- password: admin123
    'administrador',
    1
);

-- Cajero Sucursal Centro
INSERT IGNORE INTO usuarios (tienda_id, nombre, email, password, rol, activo) 
VALUES (
    @tienda_centro,
    'Cajero Centro',
    'cajero.centro@integra.com',
    '$2a$10$Th87XmLHBYVj6JI5Wx6sZO4Byu08WPq0y4suLpt6U5wzmCpFR9k2K',  -- password: cajero123
    'cajero',
    1
);

-- 6. Crear productos de prueba para Tienda Principal
INSERT IGNORE INTO productos (tienda_id, codigo, nombre, descripcion, categoria_id, precio, stock, activo)
SELECT 
    @tienda_principal,
    CONCAT('PRIN-', LPAD(n, 3, '0')),
    CONCAT('Producto Principal ', n),
    'Producto de la tienda principal',
    (SELECT id FROM categorias WHERE tienda_id = @tienda_principal LIMIT 1),
    20.00 + (n * 10),
    50,
    1
FROM (
    SELECT 1 as n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
) numbers;

-- 7. Crear productos de prueba para Sucursal Centro
INSERT IGNORE INTO productos (tienda_id, codigo, nombre, descripcion, categoria_id, precio, stock, activo)
SELECT 
    @tienda_centro,
    CONCAT('CENT-', LPAD(n, 3, '0')),
    CONCAT('Producto Centro ', n),
    'Producto de sucursal centro',
    (SELECT id FROM categorias WHERE tienda_id = @tienda_centro LIMIT 1),
    30.00 + (n * 10),
    40,
    1
FROM (
    SELECT 1 as n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
) numbers;

-- 8. Mostrar resumen
SELECT '===== RESUMEN MULTI-TIENDA =====' as '';

SELECT 'TIENDAS CREADAS:' as '';
SELECT id, nombre, direccion, telefono FROM tiendas;

SELECT 'USUARIOS POR TIENDA:' as '';
SELECT t.nombre as Tienda, u.nombre as Usuario, u.email, u.rol 
FROM usuarios u 
INNER JOIN tiendas t ON u.tienda_id = t.id
ORDER BY t.id, u.rol;

SELECT 'PRODUCTOS POR TIENDA:' as '';
SELECT t.nombre as Tienda, COUNT(p.id) as Total_Productos
FROM tiendas t
LEFT JOIN productos p ON t.id = p.tienda_id
GROUP BY t.id, t.nombre;

SELECT 'CREDENCIALES PARA PRUEBAS:' as '';
SELECT 
    'Super Admin' as Rol,
    'superadmin@integra.com' as Email,
    'super123' as Password,
    'Ver todas las tiendas' as Acceso
UNION ALL
SELECT 
    'Admin Principal',
    'admin.principal@integra.com',
    'admin123',
    'Solo Tienda Principal'
UNION ALL
SELECT 
    'Cajero Principal',
    'cajero.principal@integra.com',
    'cajero123',
    'Solo Tienda Principal'
UNION ALL
SELECT 
    'Admin Centro',
    'admin.centro@integra.com',
    'admin123',
    'Solo Sucursal Centro'
UNION ALL
SELECT 
    'Cajero Centro',
    'cajero.centro@integra.com',
    'cajero123',
    'Solo Sucursal Centro';

SELECT '✅ Datos de prueba multi-tienda creados exitosamente' as Resultado;
