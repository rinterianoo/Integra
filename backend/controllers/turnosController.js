import pool from '../database/schema.js';

// Abrir turno
export const abrirTurno = async (req, res) => {
  try {
    const { usuario_id, monto_inicial, notas } = req.body;
    const tienda_id = req.usuario.tienda_id;
    
    // Verificar si hay un turno abierto
    const [turnosAbiertos] = await pool.query(
      `SELECT * FROM turnos WHERE usuario_id = ? AND tienda_id = ? AND estado = 'abierto'`,
      [usuario_id, tienda_id]
    );
    
    if (turnosAbiertos.length > 0) {
      return res.status(400).json({ error: 'Ya existe un turno abierto' });
    }
    
    const [result] = await pool.query(
      `INSERT INTO turnos (tienda_id, usuario_id, monto_inicial, notas, estado)
       VALUES (?, ?, ?, ?, 'abierto')`,
      [tienda_id, usuario_id, monto_inicial, notas || '']
    );
    
    const [turnos] = await pool.query('SELECT * FROM turnos WHERE id = ?', [result.insertId]);
    
    // Convertir valores numéricos
    const turno = {
      ...turnos[0],
      monto_inicial: parseFloat(turnos[0].monto_inicial)
    };
    
    res.status(201).json(turno);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener turno activo
export const obtenerTurnoActivo = async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const tienda_id = req.usuario.tienda_id;
    
    const [turnos] = await pool.query(`
      SELECT t.*, u.nombre as usuario_nombre
      FROM turnos t
      JOIN usuarios u ON t.usuario_id = u.id
      WHERE t.usuario_id = ? AND t.tienda_id = ? AND t.estado = 'abierto'
      ORDER BY t.fecha_apertura DESC
      LIMIT 1
    `, [usuario_id, tienda_id]);
    
    if (turnos.length === 0) {
      return res.status(404).json({ error: 'No hay turno activo' });
    }
    
    const turno = turnos[0];
    
    // Obtener estadísticas del turno
    const [estadisticas] = await pool.query(`
      SELECT 
        COUNT(*) as total_ventas,
        COALESCE(SUM(total), 0) as total_vendido,
        COALESCE(SUM(CASE WHEN estado = 'temporal' THEN 1 ELSE 0 END), 0) as ventas_temporales
      FROM ventas
      WHERE turno_id = ?
    `, [turno.id]);
    
    // Convertir valores numéricos
    const turnoConEstadisticas = {
      ...turno,
      monto_inicial: parseFloat(turno.monto_inicial),
      monto_final: turno.monto_final ? parseFloat(turno.monto_final) : null,
      total_ventas: parseInt(estadisticas[0].total_ventas),
      total_vendido: parseFloat(estadisticas[0].total_vendido),
      ventas_temporales: parseInt(estadisticas[0].ventas_temporales)
    };
    
    res.json(turnoConEstadisticas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cerrar turno
export const cerrarTurno = async (req, res) => {
  try {
    const { id } = req.params;
    const { monto_final, notas } = req.body;
    
    const [turnos] = await pool.query('SELECT * FROM turnos WHERE id = ?', [id]);
    
    if (turnos.length === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    
    const turno = turnos[0];
    
    if (turno.estado === 'cerrado') {
      return res.status(400).json({ error: 'El turno ya está cerrado' });
    }
    
    // Calcular monto esperado
    const [ventasEfectivo] = await pool.query(`
      SELECT COALESCE(SUM(p.monto), 0) as total
      FROM pagos p
      JOIN ventas v ON p.venta_id = v.id
      WHERE v.turno_id = ? AND p.metodo_pago = 'efectivo' AND v.estado = 'completada'
    `, [id]);
    
    const monto_esperado = parseFloat(turno.monto_inicial) + parseFloat(ventasEfectivo[0].total);
    const diferencia = parseFloat(monto_final) - monto_esperado;
    
    await pool.query(`
      UPDATE turnos 
      SET monto_final = ?, 
          monto_esperado = ?, 
          diferencia = ?,
          notas = ?,
          estado = 'cerrado',
          fecha_cierre = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [monto_final, monto_esperado, diferencia, notas || '', id]);
    
    const [turnoActualizado] = await pool.query('SELECT * FROM turnos WHERE id = ?', [id]);
    
    res.json(turnoActualizado[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener reporte de arqueo
export const obtenerArqueo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [turnos] = await pool.query(`
      SELECT t.*, u.nombre as usuario_nombre
      FROM turnos t
      JOIN usuarios u ON t.usuario_id = u.id
      WHERE t.id = ?
    `, [id]);
    
    if (turnos.length === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    
    // Ventas por método de pago
    const [ventasPorMetodo] = await pool.query(`
      SELECT 
        p.metodo_pago,
        COUNT(DISTINCT v.id) as cantidad_ventas,
        COALESCE(SUM(p.monto), 0) as total
      FROM pagos p
      JOIN ventas v ON p.venta_id = v.id
      WHERE v.turno_id = ? AND v.estado = 'completada'
      GROUP BY p.metodo_pago
    `, [id]);
    
    // Total de ventas
    const [totalVentas] = await pool.query(`
      SELECT 
        COUNT(*) as cantidad,
        COALESCE(SUM(subtotal), 0) as subtotal,
        COALESCE(SUM(descuento), 0) as descuento,
        COALESCE(SUM(propina), 0) as propina,
        COALESCE(SUM(total), 0) as total
      FROM ventas
      WHERE turno_id = ? AND estado = 'completada'
    `, [id]);
    
    // Productos más vendidos
    const [productosVendidos] = await pool.query(`
      SELECT 
        p.nombre,
        SUM(dv.cantidad) as cantidad_vendida,
        SUM(dv.total) as total_vendido
      FROM detalles_venta dv
      JOIN productos p ON dv.producto_id = p.id
      JOIN ventas v ON dv.venta_id = v.id
      WHERE v.turno_id = ? AND v.estado = 'completada'
      GROUP BY p.id, p.nombre
      ORDER BY cantidad_vendida DESC
      LIMIT 10
    `, [id]);
    
    res.json({
      turno: turnos[0],
      ventasPorMetodo,
      totalVentas: totalVentas[0],
      productosVendidos
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
