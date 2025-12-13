import express from 'express';
import { obtenerProductos, buscarProducto, obtenerCategorias } from '../controllers/productosController.js';
import { verificarToken } from '../controllers/authController.js';

const router = express.Router();

router.get('/', verificarToken, obtenerProductos);
router.get('/buscar/:codigo', verificarToken, buscarProducto);
router.get('/categorias', verificarToken, obtenerCategorias);

export default router;
