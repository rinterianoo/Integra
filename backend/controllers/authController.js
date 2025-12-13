import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../database/schema.js';

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE email = ? AND activo = 1', [email]);
    
    if (usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const usuario = usuarios[0];
    const passwordValido = bcrypt.compareSync(password, usuario.password);
    
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    // No enviar password
    const { password: _, ...usuarioSinPassword } = usuario;
    
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
      'SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = ?',
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
