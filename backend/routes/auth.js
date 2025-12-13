import express from 'express';
import { login, obtenerPerfil, verificarToken } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.get('/perfil', verificarToken, obtenerPerfil);

export default router;
