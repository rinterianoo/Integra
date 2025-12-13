import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { seedDatabase } from './database/seed.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import productosRoutes from './routes/productos.js';
import turnosRoutes from './routes/turnos.js';
import ventasRoutes from './routes/ventas.js';
import ordenesRoutes from './routes/ordenes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializar base de datos (async)
seedDatabase().catch(console.error);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/turnos', turnosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/ordenes', ordenesRoutes);

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ mensaje: 'API Integra POS v3.0.0' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 API disponible en http://localhost:${PORT}/api`);
});

export default app;
