import express from 'express';
import { 
  obtenerProductos, 
  buscarProducto, 
  obtenerCategorias,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerTodosProductos,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
} from '../controllers/productosController.js';
import { verificarToken } from '../controllers/authController.js';

const router = express.Router();

// Productos
router.get('/', verificarToken, obtenerProductos);
router.get('/admin', verificarToken, obtenerTodosProductos);
router.get('/buscar/:codigo', verificarToken, buscarProducto);
router.post('/', verificarToken, crearProducto);
router.put('/:id', verificarToken, actualizarProducto);
router.delete('/:id', verificarToken, eliminarProducto);

// Categorías
router.get('/categorias', verificarToken, obtenerCategorias);
router.post('/categorias', verificarToken, crearCategoria);
router.put('/categorias/:id', verificarToken, actualizarCategoria);
router.delete('/categorias/:id', verificarToken, eliminarCategoria);

export default router;
