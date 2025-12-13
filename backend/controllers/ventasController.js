import { pool } from '../database/schema.js';

// Generar número de venta único
function generarNumeroVenta() {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  const timestamp = Date.now();
  return `V${año}${mes}${dia}-${timestamp}`;
}

// Crear venta
export const crearVenta = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { 
      usuario_id, 
      turno_id, 
      cliente_nombre,
      items, 
      descuento, 
      propina,
      pagos,
      notas,
      estado = 'completada'
    } = req.body;

    // Validar que hay items
    if (!items || items.length === 0) {
      connection.release();
      return res.status(400).json({ error: 'La venta debe tener al menos un producto' });
    }

    // Validar turno activo
    const [turnos] = await connection.execute(
      'SELECT * FROM turnos WHERE id = ? AND estado = "abierto"',
      [turno_id]
    );
    
    if (turnos.length === 0) {
      connection.release();
      return res.status(400).json({ error: 'No hay un turno activo' });
    }

    // Iniciar transacción
    await connection.beginTransaction();

    // Calcular totales
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.cantidad * item.precio_unitario;
    });

    const descuentoTotal = descuento || 0;
    const propinaTotal = propina || 0;
    const total = subtotal - descuentoTotal + propinaTotal;

    // Crear venta
    const numero_venta = generarNumeroVenta();
    const [resultVenta] = await connection.execute(`
      INSERT INTO ventas (numero_venta, usuario_id, turno_id, cliente_nombre, subtotal, descuento, propina, total, estado, notas)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      numero_venta,
      usuario_id,
      turno_id,
      cliente_nombre || '',
      subtotal,
      descuentoTotal,
      propinaTotal,
      total,
      estado,
      notas || ''
    ]);

    const venta_id = resultVenta.insertId;

    // Insertar detalles de venta
    for (const item of items) {
      const itemSubtotal = item.cantidad * item.precio_unitario;
      const itemDescuento = item.descuento || 0;
      const itemTotal = itemSubtotal - itemDescuento;

      await connection.execute(`
        INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, subtotal, descuento, total)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        venta_id,
        item.producto_id,
        item.cantidad,
        item.precio_unitario,
        itemSubtotal,
        itemDescuento,
        itemTotal
      ]);

      // Actualizar stock solo si la venta está completada
      if (estado === 'completada') {
        await connection.execute(
          'UPDATE productos SET stock = stock - ? WHERE id = ?',
          [item.cantidad, item.producto_id]
        );
      }
    }

    // Insertar pagos
    if (pagos && pagos.length > 0) {
      for (const pago of pagos) {
        await connection.execute(`
          INSERT INTO ventas_pagos (venta_id, metodo_pago, monto, referencia)
          VALUES (?, ?, ?, ?)
        `, [venta_id, pago.metodo_pago, pago.monto, pago.referencia || '']);
      }
    }

    // Commit de la transacción
    await connection.commit();

    // Obtener venta completa
    const [ventas] = await connection.execute(`
      SELECT v.*, u.nombre as usuario_nombre
      FROM ventas v
      JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.id = ?
    `, [venta_id]);

    const [detalles] = await connection.execute(`
      SELECT dv.*, p.nombre as producto_nombre, p.codigo as producto_codigo
      FROM ventas_detalle dv
      JOIN productos p ON dv.producto_id = p.id
      WHERE dv.venta_id = ?
    `, [venta_id]);

    const [pagosVenta] = await connection.execute(
      'SELECT * FROM ventas_pagos WHERE venta_id = ?',
      [venta_id]
    );

    connection.release();

    res.status(201).json({
      ...ventas[0],
      detalles,
      pagos: pagosVenta
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).json({ error: error.message });
  }
};

// Obtener ventas del turno
export const obtenerVentasTurno = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { turno_id } = req.params;
    
    const [ventas] = await connection.execute(`
      SELECT v.*, u.nombre as usuario_nombre
      FROM ventas v
      JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.turno_id = ?
      ORDER BY v.fecha_venta DESC
    `, [turno_id]);
    
    connection.release();
    res.json(ventas);
  } catch (error) {
    connection.release();
    res.status(500).json({ error: error.message });
  }
};

// Obtener detalle de venta
export const obtenerDetalleVenta = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    
    const [ventas] = await connection.execute(`
      SELECT v.*, u.nombre as usuario_nombre
      FROM ventas v
      JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.id = ?
    `, [id]);
    
    if (ventas.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    
    const [detalles] = await connection.execute(`
      SELECT dv.*, p.nombre as producto_nombre, p.codigo as producto_codigo
      FROM ventas_detalle dv
      JOIN productos p ON dv.producto_id = p.id
      WHERE dv.venta_id = ?
    `, [id]);
    
    const [pagos] = await connection.execute(
      'SELECT * FROM ventas_pagos WHERE venta_id = ?',
      [id]
    );
    
    connection.release();
    res.json({
      ...ventas[0],
      detalles,
      pagos
    });
  } catch (error) {
    connection.release();
    res.status(500).json({ error: error.message });
  }
};

// Cancelar venta
export const cancelarVenta = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    
    const [ventas] = await connection.execute(
      'SELECT * FROM ventas WHERE id = ?',
      [id]
    );
    
    if (ventas.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    
    const venta = ventas[0];
    
    if (venta.estado === 'cancelada') {
      connection.release();
      return res.status(400).json({ error: 'La venta ya está cancelada' });
    }
    
    // Iniciar transacción
    await connection.beginTransaction();
    
    // Actualizar estado
    await connection.execute(
      'UPDATE ventas SET estado = "cancelada" WHERE id = ?',
      [id]
    );
    
    // Devolver stock
    const [detalles] = await connection.execute(
      'SELECT * FROM ventas_detalle WHERE venta_id = ?',
      [id]
    );
    
    for (const detalle of detalles) {
      await connection.execute(
        'UPDATE productos SET stock = stock + ? WHERE id = ?',
        [detalle.cantidad, detalle.producto_id]
      );
    }
    
    // Commit transacción
    await connection.commit();
    
    const [ventaActualizada] = await connection.execute(
      'SELECT * FROM ventas WHERE id = ?',
      [id]
    );
    
    connection.release();
    res.json(ventaActualizada[0]);
    
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).json({ error: error.message });
  }
};
