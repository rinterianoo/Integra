import pool from '../database/schema.js';

// Obtener todas las tiendas (solo super_admin)
export const obtenerTodasTiendas = async (req, res) => {
  try {
    const [tiendas] = await pool.query(
      'SELECT * FROM tiendas ORDER BY nombre ASC'
    );
    res.json(tiendas);
  } catch (error) {
    console.error('Error al obtener tiendas:', error);
    res.status(500).json({ error: 'Error al obtener tiendas' });
  }
};

// Obtener tienda por ID
export const obtenerTiendaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [tiendas] = await pool.query(
      'SELECT * FROM tiendas WHERE id = ?',
      [id]
    );
    
    if (tiendas.length === 0) {
      return res.status(404).json({ error: 'Tienda no encontrada' });
    }
    
    res.json(tiendas[0]);
  } catch (error) {
    console.error('Error al obtener tienda:', error);
    res.status(500).json({ error: 'Error al obtener tienda' });
  }
};

// Crear nueva tienda (solo super_admin)
export const crearTienda = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { nombre, direccion, telefono, email, nit, logo_url, configuracion } = req.body;
    
    // Crear la tienda
    const [resultado] = await connection.query(
      `INSERT INTO tiendas (nombre, direccion, telefono, email, nit, logo_url, configuracion, activa)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        nombre,
        direccion || null,
        telefono || null,
        email || null,
        nit || null,
        logo_url || null,
        configuracion ? JSON.stringify(configuracion) : null
      ]
    );
    
    const tiendaId = resultado.insertId;
    
    // Crear categoría por defecto para la nueva tienda
    await connection.query(
      'INSERT INTO categorias (tienda_id, nombre) VALUES (?, ?)',
      [tiendaId, 'General']
    );
    
    await connection.commit();
    
    res.status(201).json({
      id: tiendaId,
      nombre,
      mensaje: 'Tienda creada exitosamente'
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear tienda:', error);
    res.status(500).json({ error: 'Error al crear tienda' });
  } finally {
    connection.release();
  }
};

// Actualizar tienda
export const actualizarTienda = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, direccion, telefono, email, nit, logo_url, configuracion, activa } = req.body;
    
    await pool.query(
      `UPDATE tiendas 
       SET nombre = ?, direccion = ?, telefono = ?, email = ?, nit = ?, 
           logo_url = ?, configuracion = ?, activa = ?
       WHERE id = ?`,
      [
        nombre,
        direccion || null,
        telefono || null,
        email || null,
        nit || null,
        logo_url || null,
        configuracion ? JSON.stringify(configuracion) : null,
        activa !== undefined ? activa : true,
        id
      ]
    );
    
    res.json({ mensaje: 'Tienda actualizada exitosamente' });
    
  } catch (error) {
    console.error('Error al actualizar tienda:', error);
    res.status(500).json({ error: 'Error al actualizar tienda' });
  }
};

// Eliminar tienda (solo super_admin) - CUIDADO: elimina todos los datos relacionados
export const eliminarTienda = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que no sea la última tienda activa
    const [tiendas] = await pool.query(
      'SELECT COUNT(*) as total FROM tiendas WHERE activa = TRUE'
    );
    
    if (tiendas[0].total <= 1) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la última tienda activa del sistema' 
      });
    }
    
    await pool.query('DELETE FROM tiendas WHERE id = ?', [id]);
    
    res.json({ mensaje: 'Tienda eliminada exitosamente' });
    
  } catch (error) {
    console.error('Error al eliminar tienda:', error);
    res.status(500).json({ error: 'Error al eliminar tienda' });
  }
};

// Obtener estadísticas de la tienda
export const obtenerEstadisticasTienda = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [stats] = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM usuarios WHERE tienda_id = ? AND activo = TRUE) as total_usuarios,
        (SELECT COUNT(*) FROM productos WHERE tienda_id = ? AND visible_pos = TRUE) as total_productos,
        (SELECT COUNT(*) FROM categorias WHERE tienda_id = ?) as total_categorias,
        (SELECT COUNT(*) FROM turnos WHERE tienda_id = ? AND estado = 'abierto') as turnos_activos,
        (SELECT COALESCE(SUM(total), 0) FROM ventas WHERE tienda_id = ? AND estado = 'completada' AND DATE(fecha_venta) = CURDATE()) as ventas_hoy,
        (SELECT COUNT(*) FROM ventas WHERE tienda_id = ? AND estado = 'completada' AND DATE(fecha_venta) = CURDATE()) as num_ventas_hoy
      `,
      [id, id, id, id, id, id]
    );
    
    res.json(stats[0]);
    
  } catch (error) {
    console.error('Error al obtener estadísticas de tienda:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
