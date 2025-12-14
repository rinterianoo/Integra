import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'integrapos',
  multipleStatements: true
};

async function resetearBaseDatos() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    
    // 1. Crear base de datos desde cero con estructura multi-tienda
    console.log('\n🏗️  Creando base de datos desde cero...');
    const sqlCrear = fs.readFileSync(
      path.join(__dirname, 'database', 'crear_desde_cero.sql'),
      'utf8'
    );
    await connection.query(sqlCrear);
    console.log('✅ Base de datos creada');
    
    // 2. Cargar datos de prueba
    console.log('\n📦 Cargando datos de prueba...');
    const sqlDatosPrueba = fs.readFileSync(
      path.join(__dirname, 'database', 'datos_prueba_multitienda.sql'),
      'utf8'
    );
    await connection.query(sqlDatosPrueba);
    console.log('✅ Datos de prueba cargados');
    
    // 3. Mostrar resumen
    console.log('\n📊 RESUMEN DE LA BASE DE DATOS:');
    console.log('═'.repeat(50));
    
    const [tiendas] = await connection.query('SELECT id, nombre, activa FROM tiendas ORDER BY id');
    console.log('\n🏪 TIENDAS:');
    tiendas.forEach(t => {
      console.log(`   ${t.activa ? '✅' : '❌'} ${t.nombre} (ID: ${t.id})`);
    });
    
    const [usuarios] = await connection.query(`
      SELECT u.nombre, u.email, u.rol, t.nombre as tienda 
      FROM usuarios u 
      LEFT JOIN tiendas t ON u.tienda_id = t.id 
      ORDER BY u.rol, u.id
    `);
    console.log('\n👥 USUARIOS:');
    usuarios.forEach(u => {
      console.log(`   ${u.nombre} (${u.rol}) - ${u.email}`);
      console.log(`      Tienda: ${u.tienda || 'Sin tienda'}`);
    });
    
    const [productos] = await connection.query(`
      SELECT t.nombre as tienda, COUNT(*) as cantidad 
      FROM productos p
      JOIN tiendas t ON p.tienda_id = t.id
      GROUP BY t.id
      ORDER BY t.id
    `);
    console.log('\n📦 PRODUCTOS POR TIENDA:');
    productos.forEach(p => {
      console.log(`   ${p.tienda}: ${p.cantidad} productos`);
    });
    
    console.log('\n' + '═'.repeat(50));
    console.log('\n🔑 CREDENCIALES PARA PRUEBAS:');
    console.log('   Super Admin: superadmin@integra.com / super123');
    console.log('   Admin Principal: admin.principal@integra.com / admin123');
    console.log('   Cajero Principal: cajero.principal@integra.com / cajero123');
    console.log('   Admin Centro: admin.centro@integra.com / admin123');
    console.log('   Cajero Centro: cajero.centro@integra.com / cajero123');
    console.log('\n✅ Base de datos reseteada exitosamente!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

resetearBaseDatos();
