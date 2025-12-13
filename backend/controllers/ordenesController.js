import { pool } from '../database/schema.js';

// Guardar orden temporal
export const guardarOrdenTemporal = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { usuario_id, nombre_orden, datos_orden } = req.body;
    
    if (!datos_orden || !datos_orden.items || datos_orden.items.length === 0) {
      connection.release();
      return res.status(400).json({ error: 'La orden debe tener al menos un producto' });
    }
    
    const [result] = await connection.execute(`
      INSERT INTO ordenes_temporales (usuario_id, nombre_orden, datos_orden)
      VALUES (?, ?, ?)
    `, [usuario_id, nombre_orden, JSON.stringify(datos_orden)]);
    
    const [ordenes] = await connection.execute(
      'SELECT * FROM ordenes_temporales WHERE id = ?',
      [result.insertId]
    );
    
    connection.release();
    res.status(201).json(ordenes[0]);
  } catch (error) {
    connection.release();
    res.status(500).json({ error: error.message });
  }
};

// Obtener órdenes temporales del usuario
export const obtenerOrdenesTemporales = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { usuario_id } = req.params;
    
    const [ordenes] = await connection.execute(`
      SELECT * FROM ordenes_temporales 
      WHERE usuario_id = ?
      ORDER BY fecha_creacion DESC
    `, [usuario_id]);
    
    // Parsear datos_orden JSON
    const ordenesParseadas = ordenes.map(orden => ({
      ...orden,
      datos_orden: JSON.parse(orden.datos_orden)
    }));
    
    connection.release();
    res.json(ordenesParseadas);
  } catch (error) {
    connection.release();
    res.status(500).json({ error: error.message });
  }
};

// Eliminar orden temporal
export const eliminarOrdenTemporal = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    
    const [result] = await connection.execute(
      'DELETE FROM ordenes_temporales WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      connection.release();
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    connection.release();
    res.json({ mensaje: 'Orden eliminada correctamente' });
  } catch (error) {
    connection.release();
    res.status(500).json({ error: error.message });
  }
};

// Actualizar orden temporal
export const actualizarOrdenTemporal = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { nombre_orden, datos_orden } = req.body;
    
    const [result] = await connection.execute(`
      UPDATE ordenes_temporales 
      SET nombre_orden = ?, datos_orden = ?
      WHERE id = ?
    `, [nombre_orden, JSON.stringify(datos_orden), id]);
    
    if (result.affectedRows === 0) {
      connection.release();
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    const [ordenes] = await connection.execute(
      'SELECT * FROM ordenes_temporales WHERE id = ?',
      [id]
    );
    
    connection.release();
    res.json({
      ...ordenes[0],
      datos_orden: JSON.parse(ordenes[0].datos_orden)
    });
  } catch (error) {
    connection.release();
    res.status(500).json({ error: error.message });
  }
};
