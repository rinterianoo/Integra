# MIGRACIÓN A SISTEMA MULTI-TIENDA - INTEGRA POS

## 📋 Resumen
Este documento describe la implementación del sistema multi-tienda para Integra POS, permitiendo que múltiples tiendas operen de forma independiente en la misma instalación.

## ⚠️ IMPORTANTE - ANTES DE MIGRAR

1. **Haz un backup completo de tu base de datos**
2. **Detén todos los servidores (backend y frontend)**
3. **Lee todas las instrucciones antes de ejecutar**

## 🗄️ PASO 1: Ejecutar Migración de Base de Datos

### Opción A: Script Automatizado (RECOMENDADO)
Ejecuta el script que crea la base de datos desde cero con datos de prueba:
```bash
cd backend
node reset-database.js
```
Este script:
- ✅ Elimina todas las tablas existentes
- ✅ Crea estructura multi-tienda completa
- ✅ Carga 2 tiendas de prueba con usuarios y productos
- ✅ Muestra resumen detallado de los datos creados

### Opción B: Desde MySQL Workbench / phpMyAdmin
1. Abre el archivo: `backend/database/crear_desde_cero.sql`
2. Ejecuta todo el script en tu base de datos
3. Luego ejecuta: `backend/database/datos_prueba_multitienda.sql`

### Opción C: Desde línea de comandos
```bash
mysql -u root -p integrapos < backend/database/crear_desde_cero.sql
mysql -u root -p integrapos < backend/database/datos_prueba_multitienda.sql
```

### ¿Qué hace esta migración?
- ✅ Crea tabla `tiendas` con información de cada tienda
- ✅ Agrega campo `tienda_id` a todas las tablas (usuarios, productos, categorias, turnos, ventas, ordenes_temporales)
- ✅ Crea relaciones de clave foránea (ON DELETE CASCADE)
- ✅ Agrega índices para mejorar rendimiento
- ✅ Crea rol `super_admin` para gestionar múltiples tiendas
- ✅ Crea "Tienda Principal" y asigna todos los datos existentes a ella
- ✅ Crea usuario super admin por defecto

### Credenciales de Prueba
```
Super Admin:
  Email: superadmin@integra.com
  Password: super123

Admin Tienda Principal:
  Email: admin.principal@integra.com
  Password: admin123

Cajero Tienda Principal:
  Email: cajero.principal@integra.com
  Password: cajero123

Admin Sucursal Centro:
  Email: admin.centro@integra.com
  Password: admin123

Cajero Sucursal Centro:
  Email: cajero.centro@integra.com
  Password: cajero123
```

## 🔧 PASO 2: Cambios en Backend (YA IMPLEMENTADOS)

### Nuevos Archivos Creados:
1. `backend/middleware/auth.js` - Middlewares de autenticación y autorización
2. `backend/controllers/tiendasController.js` - CRUD de tiendas
3. `backend/routes/tiendas.js` - Rutas API para tiendas

### Controladores Actualizados:
- ✅ `authController.js` - Login incluye `tienda_id` en token JWT
- ✅ `productosController.js` - Todas las queries filtran por `tienda_id`
- ✅ `turnosController.js` - Turnos asociados a tienda
- ✅ `ventasController.js` - Ventas y estadísticas por tienda

### Rutas Actualizadas:
- ✅ Todas las rutas usan `verificarToken` del middleware
- ✅ Nueva ruta: `GET/POST/PUT/DELETE /api/tiendas`

## 📱 PASO 3: Actualizar Frontend

### Actualizar AuthContext
El token JWT ahora incluye `tienda_id`. Actualiza `frontend/src/context/AuthContext.jsx`:

```javascript
const decoded = jwtDecode(token);
setUsuario({
  ...decoded,
  tienda_id: decoded.tienda_id, // <-- Agregar esto
  tienda_nombre: response.data.usuario.tienda_nombre
});
```

### Crear Componente de Gestión de Tiendas (Solo Super Admin)
Archivo: `frontend/src/pages/Tiendas.jsx`
- Listar todas las tiendas
- Crear nueva tienda
- Editar tienda existente
- Ver estadísticas por tienda
- Activar/desactivar tiendas

### Actualizar Sidebar
Agregar opción "Gestión de Tiendas" solo visible para `super_admin`:

```javascript
{usuario.rol === 'super_admin' && (
  <NavLink to="/tiendas" className="menu-item">
    <BuildingStorefrontIcon className="h-5 w-5" />
    Tiendas
  </NavLink>
)}
```

## 🔒 ROLES Y PERMISOS

### Super Admin
- ✅ Ver y gestionar TODAS las tiendas
- ✅ Crear nuevas tiendas
- ✅ Crear administradores para cada tienda
- ✅ Ver reportes consolidados
- ❌ No puede operar directamente en POS (debe ser admin de una tienda)

### Administrador
- ✅ Acceso completo a SU tienda
- ✅ Gestionar productos, usuarios, configuración
- ✅ Ver reportes de su tienda
- ✅ Operar en POS
- ❌ No puede ver otras tiendas

### Cajero
- ✅ Operar POS de su tienda
- ✅ Ver productos de su tienda
- ❌ No puede modificar configuración
- ❌ No puede ver otras tiendas

### Supervisor
- ✅ Ver reportes de su tienda
- ✅ Cerrar turnos
- ✅ Acceso limitado a configuración
- ❌ No puede ver otras tiendas

## 🚀 PASO 4: Reiniciar Servidores

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 📊 VERIFICACIÓN

### 1. Login con usuario existente
- Debe funcionar normalmente
- Usuario quedó asignado a "Tienda Principal"

### 2. Login con super admin
```
Email: superadmin@integra.com
Password: super123
```

### 3. Crear segunda tienda
- Ir a "Gestión de Tiendas"
- Crear tienda "Sucursal Centro"
- Crear administrador para esa tienda

### 4. Verificar aislamiento de datos
- Login con admin de "Sucursal Centro"
- No debe ver productos de "Tienda Principal"
- Debe poder crear sus propios productos

## 🔄 FLUJO DE TRABAJO MULTI-TIENDA

### Crear Nueva Tienda:
1. Super Admin crea tienda desde panel
2. Sistema crea categoría "General" automáticamente
3. Super Admin crea usuario administrador para esa tienda
4. Administrador hace login y configura su tienda

### Operación Diaria:
1. Cada tienda opera independientemente
2. Productos, ventas y turnos son por tienda
3. Reportes y estadísticas filtrados por tienda
4. Super Admin puede ver dashboard consolidado
5. **Clientes NO se manejan por tienda** (campo cliente_nombre en ventas es suficiente)

## 🛠️ API ENDPOINTS NUEVOS

### Gestión de Tiendas
```
GET    /api/tiendas              - Listar todas (super_admin)
GET    /api/tiendas/:id          - Ver tienda específica
POST   /api/tiendas              - Crear tienda (super_admin)
PUT    /api/tiendas/:id          - Actualizar tienda (super_admin)
DELETE /api/tiendas/:id          - Eliminar tienda (super_admin)
GET    /api/tiendas/:id/estadisticas - Estadísticas de tienda
```

### Endpoints Existentes (Ahora con Filtro de Tienda)
- Todos los endpoints de productos filtran por `tienda_id` del usuario
- Todos los endpoints de ventas filtran por `tienda_id`
- Todos los endpoints de turnos filtran por `tienda_id`
- Dashboard muestra solo datos de la tienda del usuario

## ⚡ RENDIMIENTO

### Índices Creados:
- `idx_tienda_id` en todas las tablas con tienda_id
- Mejora velocidad de queries filtradas por tienda
- Relaciones de clave foránea optimizadas

## 🔐 SEGURIDAD

### Protecciones Implementadas:
- ✅ Token JWT incluye `tienda_id`
- ✅ Middleware valida tienda en cada request
- ✅ Super Admin puede acceder a todo
- ✅ Usuarios normales solo ven su tienda
- ✅ ON DELETE CASCADE previene datos huérfanos
- ✅ Validación de tienda activa en login

## 📝 NOTAS IMPORTANTES

1. **Datos Existentes**: Todos los datos actuales quedan en "Tienda Principal"
2. **Backups**: La migración es irreversible, mantén backups
3. **Performance**: Con muchas tiendas, considera particionar tablas
4. **Super Admin**: Por defecto password es `super123` - ¡CÁMBIALO!
5. **Eliminar Tiendas**: Borra TODOS los datos relacionados (productos, ventas, etc)

## 🐛 TROUBLESHOOTING

### Error: "Duplicate column tienda_id"
- La migración ya se ejecutó antes
- Verifica si la columna existe: `DESCRIBE productos;`

### Error: "Cannot add foreign key constraint"
- Hay datos con usuario_id o producto_id que no existen
- Limpia datos huérfanos antes de migrar

### Error: "Token inválido" después de migrar
- Cierra sesión y vuelve a hacer login
- Tokens antiguos no tienen tienda_id

### Productos no aparecen después de migrar
- Verifica que el usuario tenga tienda_id asignado
- Verifica que los productos tengan tienda_id asignado
- Ejecuta: `SELECT tienda_id FROM usuarios WHERE id = YOUR_USER_ID;`

## 📞 SOPORTE

Para dudas o problemas con la migración, revisa:
1. Los logs del servidor backend
2. La consola del navegador (Frontend)
3. Queries SQL ejecutadas

---

**Última actualización**: Diciembre 14, 2025  
**Versión**: 3.1.0 Multi-Tienda  
**Estado**: ✅ Backend Completado | ✅ Frontend Completado | ✅ Migración SQL Ejecutada
