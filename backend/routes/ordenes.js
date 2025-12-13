import express from 'express';
import { 
  guardarOrdenTemporal, 
  obtenerOrdenesTemporales, 
  eliminarOrdenTemporal,
  actualizarOrdenTemporal 
} from '../controllers/ordenesController.js';
import { verificarToken } from '../controllers/authController.js';

const router = express.Router();

router.post('/', verificarToken, guardarOrdenTemporal);
router.get('/usuario/:usuario_id', verificarToken, obtenerOrdenesTemporales);
router.put('/:id', verificarToken, actualizarOrdenTemporal);
router.delete('/:id', verificarToken, eliminarOrdenTemporal);

export default router;
