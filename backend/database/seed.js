import bcrypt from 'bcryptjs';
import pool, { inicializarBaseDatos } from './schema.js';

export async function seedDatabase() {
  try {
    await inicializarBaseDatos();

    const connection = await pool.getConnection();

    try {
      // Verificar si ya hay datos
      const [usuarios] = await connection.query('SELECT COUNT(*) as count FROM usuarios');
      
      if (usuarios[0].count > 0) {
        console.log('ℹ️  La base de datos ya contiene datos');
        return;
      }

      console.log('🌱 Insertando datos iniciales...');

      // Crear usuarios de prueba
      const passwordHash = bcrypt.hashSync('admin123', 10);
      await connection.query(
        'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
        ['Administrador', 'admin@integra.com', passwordHash, 'administrador']
      );

      const passwordCajero = bcrypt.hashSync('cajero123', 10);
      await connection.query(
        'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
        ['Cajero Principal', 'cajero@integra.com', passwordCajero, 'cajero']
      );

      // Crear categorías
      const categorias = [
        ['Alimentos', 'Productos alimenticios'],
        ['Bebidas', 'Bebidas frías y calientes'],
        ['Snacks', 'Botanas y dulces'],
        ['Lácteos', 'Productos lácteos'],
        ['Limpieza', 'Productos de limpieza'],
        ['Panadería', 'Pan y repostería']
      ];

      for (const cat of categorias) {
        await connection.query(
          'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
          cat
        );
      }

      // Crear productos de ejemplo
      const productos = [
        ['PROD001', '7501234567890', 'Coca Cola 600ml', 'Refresco de cola', 2, 15.00, 10.00, 50],
        ['PROD002', '7501234567891', 'Agua Natural 1L', 'Agua purificada', 2, 10.00, 6.00, 100],
        ['PROD003', '7501234567892', 'Pan Blanco', 'Pan de caja blanco', 6, 35.00, 20.00, 30],
        ['PROD004', '7501234567893', 'Leche Entera 1L', 'Leche entera pasteurizada', 4, 22.00, 15.00, 40],
        ['PROD005', '7501234567894', 'Papas Fritas 150g', 'Papas fritas sabor original', 3, 18.00, 12.00, 60],
        ['PROD006', '7501234567895', 'Galletas Chocolate', 'Galletas con chispas de chocolate', 3, 25.00, 16.00, 45],
        ['PROD007', '7501234567896', 'Detergente 1kg', 'Detergente en polvo', 5, 45.00, 30.00, 25],
        ['PROD008', '7501234567897', 'Jabón de Baño', 'Jabón en barra', 5, 12.00, 7.00, 70],
        ['PROD009', '7501234567898', 'Café Instantáneo 200g', 'Café soluble', 2, 65.00, 45.00, 20],
        ['PROD010', '7501234567899', 'Azúcar 1kg', 'Azúcar refinada', 1, 28.00, 18.00, 35],
        ['PROD011', '7501234567900', 'Arroz 1kg', 'Arroz blanco', 1, 32.00, 22.00, 40],
        ['PROD012', '7501234567901', 'Frijoles 1kg', 'Frijoles negros', 1, 30.00, 20.00, 35],
        ['PROD013', '7501234567902', 'Aceite Vegetal 1L', 'Aceite vegetal comestible', 1, 38.00, 28.00, 30],
        ['PROD014', '7501234567903', 'Atún en Lata', 'Atún en agua', 1, 22.00, 15.00, 50],
        ['PROD015', '7501234567904', 'Jugo de Naranja 1L', 'Jugo natural de naranja', 2, 28.00, 18.00, 25]
      ];

      for (const prod of productos) {
        await connection.query(
          `INSERT INTO productos (codigo, codigo_barras, nombre, descripcion, categoria_id, precio, costo, stock)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          prod
        );
      }

      console.log('✅ Datos iniciales insertados correctamente');
      console.log('👤 Usuario admin: admin@integra.com / admin123');
      console.log('👤 Usuario cajero: cajero@integra.com / cajero123');
      
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error al poblar base de datos:', error);
    throw error;
  }
}
