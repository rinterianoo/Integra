-- ========================================
-- SCRIPT PARA LIMPIAR BASE DE DATOS
-- ========================================

-- Desactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas
DROP TABLE IF EXISTS ordenes_temporales;
DROP TABLE IF EXISTS detalle_ventas;
DROP TABLE IF EXISTS ventas;
DROP TABLE IF EXISTS turnos;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS tiendas;

-- Reactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Base de datos limpiada exitosamente' as mensaje;
