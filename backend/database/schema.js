import poolImport from './mysql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Exportar el pool
export const pool = poolImport;

export async function inicializarBaseDatos() {
  try {
    // Leer y ejecutar el archivo SQL
    const sqlFile = fs.readFileSync(path.join(__dirname, 'integrapos.sql'), 'utf8');
    
    // Dividir por statements (separados por ;)
    const statements = sqlFile
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    const connection = await poolImport.getConnection();
    
    try {
      for (const statement of statements) {
        if (statement.trim()) {
          await connection.query(statement);
        }
      }
      console.log('✅ Base de datos inicializada correctamente');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error al inicializar base de datos:', error);
    throw error;
  }
}
export default pool;
