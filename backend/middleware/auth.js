import jwt from 'jsonwebtoken';

// Verificar token JWT
export const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt_super_seguro');
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Verificar que el usuario sea super_admin
export const verificarSuperAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'super_admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol super_admin' });
  }
  next();
};

// Verificar que el usuario sea administrador o super_admin
export const verificarAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'administrador' && req.usuario.rol !== 'super_admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol administrador' });
  }
  next();
};

// Middleware para agregar filtro de tienda_id automáticamente
// Excepción: super_admin puede ver todas las tiendas
export const filtrarPorTienda = (req, res, next) => {
  // Si es super_admin y no especifica tienda_id, no filtramos
  if (req.usuario.rol === 'super_admin' && !req.query.tienda_id && !req.body.tienda_id) {
    req.tienda_id = null; // null = ver todas
  } else {
    // Para usuarios normales, siempre usar su tienda_id
    req.tienda_id = req.usuario.tienda_id;
  }
  next();
};

// Verificar que el recurso pertenezca a la tienda del usuario
export const verificarAccesoTienda = (tienda_id_recurso) => {
  return (req, res, next) => {
    // Super admin tiene acceso a todo
    if (req.usuario.rol === 'super_admin') {
      return next();
    }
    
    // Verificar que el recurso pertenezca a la tienda del usuario
    if (tienda_id_recurso !== req.usuario.tienda_id) {
      return res.status(403).json({ error: 'No tienes acceso a este recurso' });
    }
    
    next();
  };
};
