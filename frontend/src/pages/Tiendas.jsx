import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  BuildingStorefrontIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';

export default function Tiendas() {
  const { usuario } = useAuth();
  const [tiendas, setTiendas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tiendaEditando, setTiendaEditando] = useState(null);
  const [estadisticas, setEstadisticas] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    nit: '',
    activa: true
  });

  useEffect(() => {
    if (usuario?.rol === 'super_admin') {
      cargarTiendas();
    }
  }, [usuario]);

  const cargarTiendas = async () => {
    try {
      setCargando(true);
      const response = await api.get('/tiendas');
      setTiendas(response.data);
      
      // Cargar estadísticas para cada tienda
      for (const tienda of response.data) {
        cargarEstadisticas(tienda.id);
      }
    } catch (error) {
      console.error('Error al cargar tiendas:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarEstadisticas = async (tiendaId) => {
    try {
      const response = await api.get(`/tiendas/${tiendaId}/estadisticas`);
      setEstadisticas(prev => ({
        ...prev,
        [tiendaId]: response.data
      }));
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (tiendaEditando) {
        await api.put(`/tiendas/${tiendaEditando.id}`, formData);
      } else {
        await api.post('/tiendas', formData);
      }
      
      setModalAbierto(false);
      resetForm();
      cargarTiendas();
    } catch (error) {
      console.error('Error al guardar tienda:', error);
      alert(error.response?.data?.error || 'Error al guardar tienda');
    }
  };

  const handleEditar = (tienda) => {
    setTiendaEditando(tienda);
    setFormData({
      nombre: tienda.nombre,
      direccion: tienda.direccion || '',
      telefono: tienda.telefono || '',
      email: tienda.email || '',
      nit: tienda.nit || '',
      activa: tienda.activa
    });
    setModalAbierto(true);
  };

  const handleEliminar = async (id, nombre) => {
    if (!confirm(`¿Estás seguro de eliminar la tienda "${nombre}"? Esto eliminará TODOS los datos relacionados (productos, ventas, usuarios, etc.)`)) {
      return;
    }
    
    try {
      await api.delete(`/tiendas/${id}`);
      cargarTiendas();
    } catch (error) {
      console.error('Error al eliminar tienda:', error);
      alert(error.response?.data?.error || 'Error al eliminar tienda');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      nit: '',
      activa: true
    });
    setTiendaEditando(null);
  };

  const handleCancelar = () => {
    setModalAbierto(false);
    resetForm();
  };

  if (usuario?.rol !== 'super_admin') {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Acceso Denegado</h2>
        <p className="text-gray-600 mt-2">Solo super administradores pueden acceder a esta sección</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Tiendas</h1>
          <p className="text-gray-600">Administra todas las tiendas del sistema</p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
        >
          <PlusIcon className="h-5 w-5" />
          Nueva Tienda
        </button>
      </div>

      {/* Lista de tiendas */}
      {cargando ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Cargando tiendas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiendas.map(tienda => (
            <div key={tienda.id} className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200">
              {/* Header de la tarjeta */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <BuildingStorefrontIcon className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{tienda.nombre}</h3>
                    {tienda.activa ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircleIcon className="h-4 w-4" />
                        Activa
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 text-sm">
                        <XCircleIcon className="h-4 w-4" />
                        Inactiva
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditar(tienda)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleEliminar(tienda.id, tienda.nombre)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Información de la tienda */}
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                {tienda.direccion && (
                  <p><span className="font-semibold">Dirección:</span> {tienda.direccion}</p>
                )}
                {tienda.telefono && (
                  <p><span className="font-semibold">Teléfono:</span> {tienda.telefono}</p>
                )}
                {tienda.email && (
                  <p><span className="font-semibold">Email:</span> {tienda.email}</p>
                )}
                {tienda.nit && (
                  <p><span className="font-semibold">NIT:</span> {tienda.nit}</p>
                )}
              </div>

              {/* Estadísticas */}
              {estadisticas[tienda.id] && (
                <div className="border-t pt-4 mt-4">
                  <p className="text-xs text-gray-500 mb-2 font-semibold">Estadísticas</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Usuarios</p>
                      <p className="font-bold text-primary">{estadisticas[tienda.id].total_usuarios}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Productos</p>
                      <p className="font-bold text-primary">{estadisticas[tienda.id].total_productos}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Ventas Hoy</p>
                      <p className="font-bold text-green-600">Q{estadisticas[tienda.id].ventas_hoy.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Turnos</p>
                      <p className="font-bold text-blue-600">{estadisticas[tienda.id].turnos_activos}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de crear/editar */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {tiendaEditando ? 'Editar Tienda' : 'Nueva Tienda'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIT
                </label>
                <input
                  type="text"
                  value={formData.nit}
                  onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activa"
                  checked={formData.activa}
                  onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="activa" className="text-sm font-medium text-gray-700">
                  Tienda activa
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition font-semibold"
                >
                  {tiendaEditando ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelar}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
