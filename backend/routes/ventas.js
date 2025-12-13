import express from 'express';
import { 
  crearVenta, 
  obtenerVentasTurno, 
  obtenerDetalleVenta,
  cancelarVenta 
} from '../controllers/ventasController.js';
import { verificarToken } from '../controllers/authController.js';

const router = express.Router();

router.post('/', verificarToken, crearVenta);
router.get('/turno/:turno_id', verificarToken, obtenerVentasTurno);
router.get('/:id', verificarToken, obtenerDetalleVenta);
router.put('/:id/cancelar', verificarToken, cancelarVenta);

export default router;
