import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowLeftIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function Productos() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [visiblePosFiltro, setVisiblePosFiltro] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [categoriaEditar, setCategoriaEditar] = useState(null);
  const [cargando, setCargando] = useState(false);

  const [formProducto, setFormProducto] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria_id: '',
    precio_costo: 0,
    precio_venta: 0,
    codigo_barras: '',
    stock: 0,
    stock_minimo: 0,
    visible_pos: true,
    activo: true
  });

  const [formCategoria, setFormCategoria] = useState({
    nombre: '',
    descripcion: '',
    activo: true
  });

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, [busqueda, categoriaFiltro, visiblePosFiltro]);

  const cargarProductos = async () => {
    try {
      const params = new URLSearchParams();
      if (busqueda) params.append('busqueda', busqueda);
      if (categoriaFiltro) params.append('categoria', categoriaFiltro);
      if (visiblePosFiltro) params.append('visible_pos', visiblePosFiltro);
      
      const response = await api.get(`/productos/admin?${params.toString()}`);
      setProductos(response.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const cargarCategorias = async () => {
    try {
      const response = await api.get('/productos/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const abrirModalProducto = (producto = null) => {
    if (producto) {
      setProductoEditar(producto);
      setFormProducto({
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        categoria_id: producto.categoria_id || '',
        precio_costo: producto.precio_costo || 0,
        precio_venta: producto.precio_venta || 0,
        codigo_barras: producto.codigo_barras || '',
        stock: producto.stock || 0,
        stock_minimo: producto.stock_minimo || 0,
        visible_pos: producto.visible_pos === 1,
        activo: producto.activo === 1
      });
    } else {
      setProductoEditar(null);
      setFormProducto({
        codigo: `PROD${Date.now()}`,
        nombre: '',
        descripcion: '',
        categoria_id: '',
        precio_costo: 0,
        precio_venta: 0,
        codigo_barras: '',
        stock: 0,
        stock_minimo: 0,
        visible_pos: true,
        activo: true
      });
    }
    setMostrarModal(true);
  };

  const cerrarModalProducto = () => {
    setMostrarModal(false);
    setProductoEditar(null);
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    setCargando(true);
    
    try {
      if (productoEditar) {
        await api.put(`/productos/${productoEditar.id}`, formProducto);
      } else {
        await api.post('/productos', formProducto);
      }
      
      cerrarModalProducto();
      cargarProductos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert(error.response?.data?.error || 'Error al guardar producto');
    } finally {
      setCargando(false);
    }
  };

  const eliminarProducto = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      await api.delete(`/productos/${id}`);
      cargarProductos();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('Error al eliminar producto');
    }
  };

  const abrirModalCategoria = (categoria = null) => {
    if (categoria) {
      setCategoriaEditar(categoria);
      setFormCategoria({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion || '',
        activo: categoria.activo === 1
      });
    } else {
      setCategoriaEditar(null);
      setFormCategoria({
        nombre: '',
        descripcion: '',
        activo: true
      });
    }
    setMostrarModalCategoria(true);
  };

  const guardarCategoria = async (e) => {
    e.preventDefault();
    setCargando(true);
    
    try {
      if (categoriaEditar) {
        await api.put(`/productos/categorias/${categoriaEditar.id}`, formCategoria);
      } else {
        await api.post('/productos/categorias', formCategoria);
      }
      
      setMostrarModalCategoria(false);
      cargarCategorias();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      alert(error.response?.data?.error || 'Error al guardar categoría');
    } finally {
      setCargando(false);
    }
  };

  const calcularMargen = () => {
    if (formProducto.precio_costo > 0 && formProducto.precio_venta > 0) {
      const margen = ((formProducto.precio_venta - formProducto.precio_costo) / formProducto.precio_venta * 100);
      return margen.toFixed(2);
    }
    return '0.00';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Productos</h1>
            <p className="text-gray-600 mt-1">{productos.length} producto(s)</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => abrirModalCategoria()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              <PlusIcon className="h-5 w-5" />
              Nueva Categoría
            </button>
            <button
              onClick={() => abrirModalProducto()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              <PlusIcon className="h-5 w-5" />
              Nuevo Producto
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por código, nombre o código de barras..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            <div>
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                value={visiblePosFiltro}
                onChange={(e) => setVisiblePosFiltro(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todos</option>
                <option value="true">Visibles en POS</option>
                <option value="false">Ocultos en POS</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Producto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Categoría</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Costo</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Precio</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Margen</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Stock</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Estado</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productos.map(producto => {
                  const margen = producto.precio_venta > 0 && producto.precio_costo > 0
                    ? ((producto.precio_venta - producto.precio_costo) / producto.precio_venta * 100).toFixed(2)
                    : '0.00';
                  
                  return (
                    <tr key={producto.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{producto.codigo}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{producto.nombre}</p>
                          {producto.codigo_barras && (
                            <p className="text-xs text-gray-500">CB: {producto.codigo_barras}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{producto.categoria_nombre || '-'}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">Q{producto.precio_costo?.toFixed(2) || '0.00'}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">Q{producto.precio_venta?.toFixed(2) || '0.00'}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">{margen}%</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className={`${producto.stock <= producto.stock_minimo ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                          {producto.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {producto.visible_pos === 1 ? (
                            <EyeIcon className="h-5 w-5 text-green-600" title="Visible en POS" />
                          ) : (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" title="Oculto en POS" />
                          )}
                          <span className={`px-2 py-1 text-xs rounded-full ${producto.activo === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {producto.activo === 1 ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => abrirModalProducto(producto)}
                            className="p-1 text-primary hover:bg-primary hover:text-white rounded transition"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => eliminarProducto(producto.id)}
                            className="p-1 text-red-600 hover:bg-red-600 hover:text-white rounded transition"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Producto */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {productoEditar ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button onClick={cerrarModalProducto} className="p-2 hover:bg-gray-100 rounded-lg">
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={guardarProducto} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                  <input
                    type="text"
                    value={formProducto.codigo}
                    onChange={(e) => setFormProducto({...formProducto, codigo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código de Barras</label>
                  <input
                    type="text"
                    value={formProducto.codigo_barras}
                    onChange={(e) => setFormProducto({...formProducto, codigo_barras: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formProducto.nombre}
                  onChange={(e) => setFormProducto({...formProducto, nombre: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formProducto.descripcion}
                  onChange={(e) => setFormProducto({...formProducto, descripcion: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={formProducto.categoria_id}
                  onChange={(e) => setFormProducto({...formProducto, categoria_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Sin categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Costo (Q)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formProducto.precio_costo}
                    onChange={(e) => setFormProducto({...formProducto, precio_costo: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta (Q) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formProducto.precio_venta}
                    onChange={(e) => setFormProducto({...formProducto, precio_venta: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Margen (%)</label>
                  <input
                    type="text"
                    value={calcularMargen()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    value={formProducto.stock}
                    onChange={(e) => setFormProducto({...formProducto, stock: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    value={formProducto.stock_minimo}
                    onChange={(e) => setFormProducto({...formProducto, stock_minimo: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formProducto.visible_pos}
                    onChange={(e) => setFormProducto({...formProducto, visible_pos: e.target.checked})}
                    className="w-4 h-4 text-primary focus:ring-primary rounded"
                  />
                  <span className="text-sm text-gray-700">Visible en POS</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formProducto.activo}
                    onChange={(e) => setFormProducto({...formProducto, activo: e.target.checked})}
                    className="w-4 h-4 text-primary focus:ring-primary rounded"
                  />
                  <span className="text-sm text-gray-700">Activo</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={cerrarModalProducto}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargando}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:bg-gray-400"
                >
                  {cargando ? 'Guardando...' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Categoría */}
      {mostrarModalCategoria && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {categoriaEditar ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              <button onClick={() => setMostrarModalCategoria(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={guardarCategoria} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formCategoria.nombre}
                  onChange={(e) => setFormCategoria({...formCategoria, nombre: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formCategoria.descripcion}
                  onChange={(e) => setFormCategoria({...formCategoria, descripcion: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="2"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formCategoria.activo}
                  onChange={(e) => setFormCategoria({...formCategoria, activo: e.target.checked})}
                  className="w-4 h-4 text-primary focus:ring-primary rounded"
                />
                <span className="text-sm text-gray-700">Activo</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setMostrarModalCategoria(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargando}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:bg-gray-400"
                >
                  {cargando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
