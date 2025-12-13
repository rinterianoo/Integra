# Instrucciones para crear la base de datos MySQL

## Opción 1: Usando phpMyAdmin (Recomendado)

1. Abre XAMPP Control Panel
2. Asegúrate que MySQL esté corriendo (Start)
3. Abre tu navegador y ve a: http://localhost/phpmyadmin
4. Click en "Nuevo" en el panel izquierdo
5. Click en la pestaña "Importar"
6. Click en "Seleccionar archivo"
7. Navega a: backend/database/integrapos.sql
8. Click en "Continuar"

## Opción 2: Usando la consola de MySQL

Abre una terminal y ejecuta:

```bash
mysql -u root -p
```

Luego ejecuta estos comandos:

```sql
CREATE DATABASE integrapos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE integrapos;
SOURCE C:/Users/HP/OneDrive - Universidad Mariano Gálvez/Documentos/GitHub/Integrapos/backend/database/integrapos.sql;
```

## Opción 3: Crear base de datos vacía (el sistema la poblará)

En phpMyAdmin:
1. Click en "Nuevo"
2. Nombre de la base de datos: `integrapos`
3. Cotejamiento: `utf8mb4_unicode_ci`
4. Click en "Crear"

El backend creará automáticamente las tablas y datos al iniciar.

## Verificar conexión

Después de crear la base de datos, el backend debería iniciar correctamente con el mensaje:
```
✅ Base de datos inicializada correctamente
🌱 Insertando datos iniciales...
✅ Datos iniciales insertados correctamente
🚀 Servidor corriendo en http://localhost:5000
```
