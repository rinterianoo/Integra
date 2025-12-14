import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function ejecutarDatosPrueba() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'integrapos',
    multipleStatements: true
  });

  try {
    console.log('📦 Cargando datos de prueba multi-tienda...\n');

    const sqlFile = join(__dirname, 'database', 'datos_prueba_multitienda.sql');
    const sql = readFileSync(sqlFile, 'utf8');

    await connection.query(sql);

    console.log('✅ Datos de prueba creados exitosamente\n');
    
    // Mostrar resumen
    const [tiendas] = await connection.query('SELECT id, nombre FROM tiendas');
    console.log('🏪 TIENDAS:');
    tiendas.forEach(t => console.log(`   - ${t.nombre} (ID: ${t.id})`));
    
    const [usuarios] = await connection.query(`
      SELECT t.nombre as tienda, u.nombre, u.email, u.rol 
      FROM usuarios u 
      INNER JOIN tiendas t ON u.tienda_id = t.id 
      WHERE u.rol != 'super_admin'
      ORDER BY t.id, u.rol
    `);
    console.log('\n👥 USUARIOS:');
    usuarios.forEach(u => console.log(`   - ${u.nombre} (${u.rol}) - ${u.email} - Tienda: ${u.tienda}`));
    
    const [productos] = await connection.query(`
      SELECT t.nombre as tienda, COUNT(p.id) as total 
      FROM tiendas t 
      LEFT JOIN productos p ON t.id = p.tienda_id 
      GROUP BY t.id, t.nombre
    `);
    console.log('\n📦 PRODUCTOS:');
    productos.forEach(p => console.log(`   - ${p.tienda}: ${p.total} productos`));
    
    console.log('\n🔑 CREDENCIALES PARA PRUEBAS:');
    console.log('   Super Admin: superadmin@integra.com / super123');
    console.log('   Admin Principal: admin.principal@integra.com / admin123');
    console.log('   Cajero Principal: cajero.principal@integra.com / cajero123');
    console.log('   Admin Centro: admin.centro@integra.com / admin123');
    console.log('   Cajero Centro: cajero.centro@integra.com / cajero123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

ejecutarDatosPrueba();
