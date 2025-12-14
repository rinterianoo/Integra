import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../database/schema.js';

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [usuarios] = await pool.query(
      `SELECT u.*, t.nombre as tienda_nombre, t.activa as tienda_activa 
       FROM usuarios u 
       INNER JOIN tiendas t ON u.tienda_id = t.id 
       WHERE u.email = ? AND u.activo = 1`,
      [email]
    );
    
    if (usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const usuario = usuarios[0];
    
    // Verificar que la tienda esté activa
    if (!usuario.tienda_activa) {
      return res.status(403).json({ error: 'La tienda no está activa' });
    }
    
    const passwordValido = bcrypt.compareSync(password, usuario.password);
    
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email, 
        rol: usuario.rol,
        tienda_id: usuario.tienda_id
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    // No enviar password
    const { password: _, tienda_activa, ...usuarioSinPassword } = usuario;
    
    res.json({
      token,
      usuario: usuarioSinPassword
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener perfil
export const obtenerPerfil = async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.rol, u.activo, u.tienda_id,
              t.nombre as tienda_nombre
       FROM usuarios u
       INNER JOIN tiendas t ON u.tienda_id = t.id
       WHERE u.id = ?`,
      [req.usuario.id]
    );
    
    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(usuarios[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Middleware de autenticación
export const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(403).json({ error: 'Token no proporcionado' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
