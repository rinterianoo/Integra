import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      // Cargar estadísticas del día actual
      const response = await api.get('/ventas/estadisticas');
      setEstadisticas(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setCargando(false);
    }
  };

  const verificarTurnoYNavegar = async () => {
    try {
      await api.get(`/turnos/activo/${usuario.id}`);
      navigate('/pos');
    } catch (error) {
      navigate('/apertura-turno');
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  const stats = estadisticas || {
    ventasHoy: 0,
    totalHoy: 0,
    productosVendidos: 0,
    turnosActivos: 0,
    stockBajo: 0,
    ventasAyer: 0,
    totalAyer: 0
  };

  const cambioVentas = stats.ventasAyer > 0 
    ? ((stats.ventasHoy - stats.ventasAyer) / stats.ventasAyer * 100).toFixed(1)
    : 0;
  
  const cambioTotal = stats.totalAyer > 0
    ? ((stats.totalHoy - stats.totalAyer) / stats.totalAyer * 100).toFixed(1)
    : 0;

  const tarjetasEstadisticas = [
    {
      titulo: 'Ventas Hoy',
      valor: stats.ventasHoy,
      cambio: cambioVentas,
      icono: ShoppingCartIcon,
      color: 'bg-blue-500',
      colorClaro: 'bg-blue-50',
      colorTexto: 'text-blue-600'
    },
    {
      titulo: 'Total Hoy',
      valor: `Q${stats.totalHoy.toFixed(2)}`,
      cambio: cambioTotal,
      icono: CurrencyDollarIcon,
      color: 'bg-green-500',
      colorClaro: 'bg-green-50',
      colorTexto: 'text-green-600'
    },
    {
      titulo: 'Productos Vendidos',
      valor: stats.productosVendidos,
      icono: CubeIcon,
      color: 'bg-purple-500',
      colorClaro: 'bg-purple-50',
      colorTexto: 'text-purple-600'
    },
    {
      titulo: 'Turnos Activos',
      valor: stats.turnosActivos,
      icono: ClockIcon,
      color: 'bg-orange-500',
      colorClaro: 'bg-orange-50',
      colorTexto: 'text-orange-600'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Bienvenida */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Bienvenido, {usuario.nombre}
        </h1>
        <p className="text-gray-600 mt-1">
          {new Date().toLocaleDateString('es-GT', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Acción rápida */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">¿Listo para comenzar?</h2>
            <p className="text-blue-100">Inicia o continúa tu turno en el punto de venta</p>
          </div>
          <button
            onClick={verificarTurnoYNavegar}
            className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            Ir al POS
          </button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tarjetasEstadisticas.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.colorClaro} p-3 rounded-lg`}>
                <stat.icono className={`h-6 w-6 ${stat.colorTexto}`} />
              </div>
              {stat.cambio !== undefined && (
                <div className={`flex items-center gap-1 text-sm font-semibold ${
                  parseFloat(stat.cambio) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {parseFloat(stat.cambio) >= 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4" />
                  )}
                  {Math.abs(stat.cambio)}%
                </div>
              )}
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.titulo}</h3>
            <p className="text-2xl font-bold text-gray-900">{stat.valor}</p>
          </div>
        ))}
      </div>

      {/* Alertas y acciones rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock bajo */}
        {stats.stockBajo > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <CubeIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-1">
                  Productos con Stock Bajo
                </h3>
                <p className="text-sm text-yellow-700 mb-3">
                  {stats.stockBajo} producto(s) necesitan reabastecimiento
                </p>
                <button
                  onClick={() => navigate('/productos')}
                  className="text-sm font-semibold text-yellow-800 hover:text-yellow-900 underline"
                >
                  Ver productos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resumen del día */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-primary" />
            Resumen del Día
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ventas de ayer</span>
              <span className="font-semibold text-gray-900">{stats.ventasAyer}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total de ayer</span>
              <span className="font-semibold text-gray-900">Q{stats.totalAyer.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Promedio por venta</span>
                <span className="font-bold text-primary">
                  Q{stats.ventasHoy > 0 ? (stats.totalHoy / stats.ventasHoy).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Accesos Rápidos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={verificarTurnoYNavegar}
            className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition"
          >
            <ShoppingCartIcon className="h-8 w-8 text-primary" />
            <span className="text-sm font-medium text-gray-700">Punto de Venta</span>
          </button>

          {usuario.rol === 'administrador' && (
            <>
              <button
                onClick={() => navigate('/productos')}
                className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition"
              >
                <CubeIcon className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium text-gray-700">Productos</span>
              </button>

              <button
                onClick={() => navigate('/cierre-turno')}
                className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition"
              >
                <ClockIcon className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium text-gray-700">Cerrar Turno</span>
              </button>

              <button
                onClick={() => {/* Implementar reportes */}}
                className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition"
              >
                <ChartBarIcon className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium text-gray-700">Reportes</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
