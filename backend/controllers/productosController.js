import pool from '../database/schema.js';

// Obtener todos los productos activos
export const obtenerProductos = async (req, res) => {
  try {
    const { busqueda, categoria } = req.query;
    
    let query = `
      SELECT p.*, c.nombre as categoria_nombre 
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = 1
    `;
    
    const params = [];
    
    if (busqueda) {
      query += ` AND (p.codigo LIKE ? OR p.nombre LIKE ? OR p.codigo_barras = ?)`;
      const searchTerm = `%${busqueda}%`;
      params.push(searchTerm, searchTerm, busqueda);
    }
    
    if (categoria) {
      query += ` AND p.categoria_id = ?`;
      params.push(categoria);
    }
    
    query += ` ORDER BY p.nombre`;
    
    const [productos] = await pool.query(query, params);
    
    // Convertir campos numéricos
    const productosFormateados = productos.map(p => ({
      ...p,
      precio: parseFloat(p.precio),
      stock: parseInt(p.stock),
      activo: parseInt(p.activo)
    }));
    
    res.json(productosFormateados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Buscar producto por código o código de barras
export const buscarProducto = async (req, res) => {
  try {
    const { codigo } = req.params;
    
    const [productos] = await pool.query(`
      SELECT p.*, c.nombre as categoria_nombre 
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = 1 AND (p.codigo = ? OR p.codigo_barras = ?)
    `, [codigo, codigo]);
    
    if (productos.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Convertir campos numéricos
    const producto = {
      ...productos[0],
      precio: parseFloat(productos[0].precio),
      stock: parseInt(productos[0].stock),
      activo: parseInt(productos[0].activo)
    };
    
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener categorías
export const obtenerCategorias = async (req, res) => {
  try {
    const [categorias] = await pool.query(`
      SELECT * FROM categorias WHERE activo = 1 ORDER BY nombre
    `);
    
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
