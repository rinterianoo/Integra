-- Migración para agregar campos faltantes en la tabla productos
USE integrapos;

-- Agregar campos si no existen
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS precio_costo DECIMAL(10,2) DEFAULT 0 AFTER precio,
ADD COLUMN IF NOT EXISTS precio_venta DECIMAL(10,2) DEFAULT 0 AFTER precio_costo,
ADD COLUMN IF NOT EXISTS visible_pos TINYINT(1) DEFAULT 1 AFTER activo;

-- Copiar datos de columnas antiguas a nuevas (si existen)
UPDATE productos SET precio_venta = precio WHERE precio_venta = 0;
UPDATE productos SET precio_costo = costo WHERE precio_costo = 0 AND costo IS NOT NULL;

-- Nota: Puedes eliminar las columnas antiguas si ya no las necesitas
-- ALTER TABLE productos DROP COLUMN precio;
-- ALTER TABLE productos DROP COLUMN costo;
