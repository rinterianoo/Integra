import pool from '../database/schema.js';

// Obtener todos los productos activos
export const obtenerProductos = async (req, res) => {
  try {
    const { busqueda, categoria } = req.query;
    const tienda_id = req.usuario.tienda_id;
    
    let query = `
      SELECT p.*, c.nombre as categoria_nombre 
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = 1 AND p.tienda_id = ?
    `;
    
    const params = [tienda_id];
    
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
    const tienda_id = req.usuario.tienda_id;
    
    const [productos] = await pool.query(`
      SELECT p.*, c.nombre as categoria_nombre 
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = 1 AND p.tienda_id = ? AND (p.codigo = ? OR p.codigo_barras = ?)
    `, [tienda_id, codigo, codigo]);
    
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
    const tienda_id = req.usuario.tienda_id;
    
    const [categorias] = await pool.query(`
      SELECT * FROM categorias WHERE activo = 1 AND tienda_id = ? ORDER BY nombre
    `, [tienda_id]);
    
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear producto
export const crearProducto = async (req, res) => {
  try {
    const { codigo, nombre, descripcion, categoria_id, precio_costo, precio_venta, codigo_barras, stock, stock_minimo, visible_pos } = req.body;
    const tienda_id = req.usuario.tienda_id;
    
    const [result] = await pool.query(`
      INSERT INTO productos (tienda_id, codigo, nombre, descripcion, categoria_id, precio_costo, precio_venta, codigo_barras, stock, stock_minimo, visible_pos, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [tienda_id, codigo, nombre, descripcion || null, categoria_id, precio_costo, precio_venta, codigo_barras || null, stock || 0, stock_minimo || 0, visible_pos ? 1 : 0]);
    
    res.status(201).json({ id: result.insertId, mensaje: 'Producto creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar producto
export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, nombre, descripcion, categoria_id, precio_costo, precio_venta, codigo_barras, stock, stock_minimo, visible_pos, activo } = req.body;
    
    await pool.query(`
      UPDATE productos 
      SET codigo = ?, nombre = ?, descripcion = ?, categoria_id = ?, precio_costo = ?, precio_venta = ?, codigo_barras = ?, stock = ?, stock_minimo = ?, visible_pos = ?, activo = ?
      WHERE id = ?
    `, [codigo, nombre, descripcion || null, categoria_id, precio_costo, precio_venta, codigo_barras || null, stock, stock_minimo, visible_pos ? 1 : 0, activo ? 1 : 0, id]);
    
    res.json({ mensaje: 'Producto actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar producto (soft delete)
export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query(`UPDATE productos SET activo = 0 WHERE id = ?`, [id]);
    
    res.json({ mensaje: 'Producto eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los productos (incluidos inactivos) para administración
export const obtenerTodosProductos = async (req, res) => {
  try {
    const { busqueda, categoria, visible_pos } = req.query;
    const tienda_id = req.usuario.tienda_id;
    
    let query = `
      SELECT p.*, c.nombre as categoria_nombre 
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.tienda_id = ?
    `;
    
    const params = [tienda_id];
    
    if (busqueda) {
      query += ` AND (p.codigo LIKE ? OR p.nombre LIKE ? OR p.codigo_barras = ?)`;
      const searchTerm = `%${busqueda}%`;
      params.push(searchTerm, searchTerm, busqueda);
    }
    
    if (categoria) {
      query += ` AND p.categoria_id = ?`;
      params.push(categoria);
    }
    
    if (visible_pos !== undefined) {
      query += ` AND p.visible_pos = ?`;
      params.push(visible_pos === 'true' ? 1 : 0);
    }
    
    query += ` ORDER BY p.nombre`;
    
    const [productos] = await pool.query(query, params);
    
    const productosFormateados = productos.map(p => ({
      ...p,
      precio_costo: parseFloat(p.precio_costo || 0),
      precio_venta: parseFloat(p.precio_venta || 0),
      precio: parseFloat(p.precio_venta || 0),
      stock: parseInt(p.stock),
      stock_minimo: parseInt(p.stock_minimo || 0),
      activo: parseInt(p.activo),
      visible_pos: parseInt(p.visible_pos)
    }));
    
    res.json(productosFormateados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear categoría
export const crearCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const tienda_id = req.usuario.tienda_id;
    
    const [result] = await pool.query(`
      INSERT INTO categorias (tienda_id, nombre, descripcion, activo)
      VALUES (?, ?, ?, 1)
    `, [tienda_id, nombre, descripcion || null]);
    
    res.status(201).json({ id: result.insertId, mensaje: 'Categoría creada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar categoría
export const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;
    
    await pool.query(`
      UPDATE categorias 
      SET nombre = ?, descripcion = ?, activo = ?
      WHERE id = ?
    `, [nombre, descripcion || null, activo ? 1 : 0, id]);
    
    res.json({ mensaje: 'Categoría actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar categoría (soft delete)
export const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query(`UPDATE categorias SET activo = 0 WHERE id = ?`, [id]);
    
    res.json({ mensaje: 'Categoría eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
