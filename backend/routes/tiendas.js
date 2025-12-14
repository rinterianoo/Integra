import express from 'express';
import { 
  obtenerTodasTiendas,
  obtenerTiendaPorId,
  crearTienda,
  actualizarTienda,
  eliminarTienda,
  obtenerEstadisticasTienda
} from '../controllers/tiendasController.js';
import { verificarToken, verificarSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas públicas para usuarios autenticados (ver su tienda)
router.get('/:id', obtenerTiendaPorId);
router.get('/:id/estadisticas', obtenerEstadisticasTienda);

// Rutas solo para super_admin
router.get('/', verificarSuperAdmin, obtenerTodasTiendas);
router.post('/', verificarSuperAdmin, crearTienda);
router.put('/:id', verificarSuperAdmin, actualizarTienda);
router.delete('/:id', verificarSuperAdmin, eliminarTienda);

export default router;
