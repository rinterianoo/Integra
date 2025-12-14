import express from 'express';
import { 
  abrirTurno, 
  obtenerTurnoActivo, 
  cerrarTurno, 
  obtenerArqueo 
} from '../controllers/turnosController.js';
import { verificarToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verificarToken, abrirTurno);
router.get('/activo/:usuario_id', verificarToken, obtenerTurnoActivo);
router.put('/:id/cerrar', verificarToken, cerrarTurno);
router.get('/:id/arqueo', verificarToken, obtenerArqueo);

export default router;
