# 🛒 Integra POS - Sistema de Punto de Venta

Versión 3.0.0 - Sistema POS Web Completo y Autónomo

## ✨ Características Implementadas

### 1️⃣ Punto de Venta (POS)
✅ Interfaz de cajero rápida e intuitiva
✅ Búsqueda de productos (código, nombre, código de barras)
✅ Carrito de compras con modificación de cantidades
✅ Múltiples métodos de pago (efectivo, tarjeta, transferencia, mixto)
✅ Descuentos y propinas
✅ Órdenes temporales
✅ Sistema de turnos (apertura/cierre)
✅ Arqueo de caja con reportes detallados

## 🚀 Tecnologías

### Backend
- Node.js con módulos ES6
- Express.js 4.18
- SQLite 3 con better-sqlite3 9.2
- bcryptjs 2.4 - Hash de contraseñas
- jsonwebtoken 9.0 - Autenticación JWT
- express-validator 7.0 - Validación
- cors, dotenv, axios, node-cron

### Frontend
- React 18.2 con Hooks
- React Router DOM 6.21
- Vite 5.0
- Tailwind CSS 3.4
- Heroicons & Lucide React
- Context API para estado global

## 📁 Estructura del Proyecto

```
Integrapos/
├── backend/
│   ├── controllers/       # Lógica de negocio
│   ├── database/          # Esquema y seed de BD
│   ├── routes/            # Rutas API
│   └── server.js          # Servidor Express
└── frontend/
    ├── src/
    │   ├── api/           # Cliente Axios
    │   ├── components/    # Componentes React
    │   ├── context/       # Context API
    │   ├── pages/         # Páginas principales
    │   └── App.jsx
    └── index.html
```

## 🚦 Inicio Rápido

### 1. Clonar o descargar el proyecto

### 2. Backend
```bash
cd backend
npm install
npm run dev
```
El backend estará disponible en `http://localhost:5000`

### 3. Frontend (en otra terminal)
```bash
cd frontend
npm install
npm run dev
```
El frontend estará disponible en `http://localhost:3000`

## 👤 Usuarios de Prueba

```
Administrador:
Email: admin@integra.com
Password: admin123

Cajero:
Email: cajero@integra.com
Password: cajero123
```

## 📖 Guía de Uso

### 1. Iniciar Sesión
- Accede a `http://localhost:3000`
- Ingresa con cualquiera de los usuarios de prueba

### 2. Apertura de Turno
- Al iniciar sesión por primera vez, se te pedirá abrir un turno
- Ingresa el monto inicial en caja (efectivo con el que inicias)
- Click en "Abrir Turno"

### 3. Realizar Ventas
- **Buscar productos**: Escribe código, nombre o escanea código de barras
- **Agregar al carrito**: Click en el producto o presiona Enter
- **Modificar cantidades**: Usa los botones +/- o ingresa directamente
- **Agregar descuentos**: Ingresa el monto en el campo de descuento
- **Agregar propinas**: Ingresa monto o usa botones de porcentaje
- **Procesar pago**: Click en "Procesar Pago"

### 4. Métodos de Pago
- **Efectivo**: El sistema calcula el cambio automáticamente
- **Tarjeta**: Ingresa número de autorización
- **Transferencia**: Ingresa referencia
- **Mixto**: Agrega múltiples métodos de pago

### 5. Órdenes Temporales
- **Guardar orden**: Click en "Guardar Orden" para pausar una venta
- **Cargar orden**: Click en "Órdenes Temporales" y selecciona una orden guardada

### 6. Cierre de Turno
- Click en "Cerrar Turno"
- Revisa el resumen de ventas
- Cuenta el efectivo físico en caja
- Ingresa el "Monto Real en Caja"
- El sistema muestra si hay diferencia (sobrante/faltante)
- Click en "Cerrar Turno y Salir"

## 🗄️ Base de Datos

La base de datos SQLite se crea automáticamente en `backend/database/integrapos.db`

### Tablas principales:
- `usuarios` - Cajeros y administradores
- `productos` - Catálogo de productos
- `categorias` - Categorías de productos
- `turnos` - Control de turnos de caja
- `ventas` - Registro de ventas
- `detalles_venta` - Items de cada venta
- `pagos` - Métodos de pago por venta
- `movimientos_caja` - Movimientos de efectivo
- `ordenes_temporales` - Órdenes guardadas

### Productos de Ejemplo:
- 15 productos precargados en diferentes categorías
- Códigos de barras de ejemplo
- Precios y stock configurados

## 🔐 API Endpoints

### Autenticación
- `POST /api/auth/login` - Login
- `GET /api/auth/perfil` - Obtener perfil

### Productos
- `GET /api/productos` - Listar productos
- `GET /api/productos/buscar/:codigo` - Buscar por código
- `GET /api/productos/categorias` - Listar categorías

### Turnos
- `POST /api/turnos` - Abrir turno
- `GET /api/turnos/activo/:usuario_id` - Obtener turno activo
- `PUT /api/turnos/:id/cerrar` - Cerrar turno
- `GET /api/turnos/:id/arqueo` - Obtener arqueo

### Ventas
- `POST /api/ventas` - Crear venta
- `GET /api/ventas/turno/:turno_id` - Ventas del turno
- `GET /api/ventas/:id` - Detalle de venta
- `PUT /api/ventas/:id/cancelar` - Cancelar venta

### Órdenes Temporales
- `POST /api/ordenes` - Guardar orden
- `GET /api/ordenes/usuario/:usuario_id` - Órdenes del usuario
- `PUT /api/ordenes/:id` - Actualizar orden
- `DELETE /api/ordenes/:id` - Eliminar orden

## 🎨 Características de la Interfaz

- **Diseño responsive**: Optimizado para tablets y pantallas táctiles
- **Búsqueda inteligente**: Busca por código, nombre o código de barras
- **Atajos de teclado**: Enter para agregar productos rápidamente
- **Feedback visual**: Notificaciones de ventas completadas
- **Cálculo automático**: Totales, cambio y diferencias en tiempo real
- **Reportes detallados**: Arqueo con estadísticas y top productos

## 📝 Scripts Disponibles

### Backend
```bash
npm run dev    # Desarrollo con nodemon (auto-reload)
npm start      # Producción
```

### Frontend
```bash
npm run dev    # Servidor de desarrollo
npm run build  # Build de producción
npm run preview # Vista previa del build
npm run lint   # Ejecutar ESLint
```

## 🔧 Configuración

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=tu_clave_secreta_jwt
JWT_EXPIRES_IN=24h
DATABASE_PATH=./database/integrapos.db
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📊 Estado del Proyecto

✅ **Completado**: Módulo POS completo y funcional
- Sistema de autenticación
- Gestión de productos
- Carrito de compras
- Múltiples métodos de pago
- Órdenes temporales
- Apertura y cierre de turno
- Arqueo de caja con reportes

## 🚀 Próximos Pasos

El sistema está listo para:
- Agregar impresión de tickets
- Implementar módulo de inventario
- Agregar módulo de reportes avanzados
- Implementar gestión de clientes
- Agregar soporte multi-comercio
- Implementar sincronización en la nube

## 💻 Requisitos del Sistema

- Node.js 16 o superior
- npm 8 o superior
- Navegador web moderno (Chrome, Firefox, Edge)
- 100MB de espacio en disco

## 🐛 Solución de Problemas

### El backend no inicia
```bash
# Verificar que el puerto 5000 esté libre
netstat -ano | findstr :5000

# Si está ocupado, cambiar el puerto en backend/.env
```

### El frontend no se conecta al backend
- Verificar que el backend esté corriendo
- Revisar la URL en `frontend/.env`
- Verificar que no haya errores de CORS

### Error en la base de datos
```bash
# Eliminar la base de datos y dejar que se recree
cd backend/database
del integrapos.db
```

## 📄 Licencia

Este proyecto es para uso educativo y comercial.

## 👨‍💻 Desarrollo

Sistema desarrollado con las mejores prácticas:
- Código limpio y comentado
- Arquitectura escalable
- Manejo de errores robusto
- Validación de datos
- Seguridad con JWT
- Transacciones de base de datos

---

**¡El sistema está listo para usar! 🎉**

Inicia sesión con los usuarios de prueba y comienza a realizar ventas.
