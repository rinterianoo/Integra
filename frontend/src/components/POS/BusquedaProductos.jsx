import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';

export default function BusquedaProductos({ onAgregarProducto }) {
  const [busqueda, setBusqueda] = useState('');
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [cargando, setCargando] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    cargarCategorias();
    cargarProductos();
    // Focus en el input al cargar
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (busqueda.length >= 2) {
      buscarProductos();
    } else if (busqueda.length === 0) {
      cargarProductos();
    }
  }, [busqueda, categoriaSeleccionada]);

  const cargarCategorias = async () => {
    try {
      const response = await api.get('/productos/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const params = {};
      if (categoriaSeleccionada) params.categoria = categoriaSeleccionada;
      
      const response = await api.get('/productos', { params });
      setProductos(response.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setCargando(false);
    }
  };

  const buscarProductos = async () => {
    try {
      setCargando(true);
      const params = { busqueda };
      if (categoriaSeleccionada) params.categoria = categoriaSeleccionada;
      
      const response = await api.get('/productos', { params });
      setProductos(response.data);
    } catch (error) {
      console.error('Error al buscar productos:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleBusqueda = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
  };

  const handleKeyPress = async (e) => {
    if (e.key === 'Enter' && busqueda) {
      // Buscar por código exacto (código de barras)
      try {
        const response = await api.get(`/productos/buscar/${busqueda}`);
        onAgregarProducto(response.data);
        setBusqueda('');
      } catch (error) {
        // Si no encuentra, mostrar resultados de búsqueda
        buscarProductos();
      }
    }
  };

  const handleAgregarProducto = (producto) => {
    onAgregarProducto(producto);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-full gap-3">
      {/* Sidebar de categorías */}
      <div className="w-44 bg-white rounded-lg shadow-lg p-3 overflow-y-auto">
        <h3 className="font-bold text-gray-800 mb-2 text-sm">Categorías</h3>
        <div className="space-y-1">
          <button
            onClick={() => setCategoriaSeleccionada('')}
            className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${
              categoriaSeleccionada === '' 
                ? 'bg-primary text-white' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Todas
          </button>
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoriaSeleccionada(cat.id)}
              className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${
                categoriaSeleccionada === cat.id 
                  ? 'bg-primary text-white' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Área principal con búsqueda y productos */}
      <div className="flex-1 flex flex-col gap-3 h-full">
        {/* Barra de búsqueda */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={busqueda}
            onChange={handleBusqueda}
            onKeyPress={handleKeyPress}
            placeholder="Buscar por código, nombre o escanear código de barras..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base text-gray-900"
          />
        </div>

        {/* Galería de productos */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 overflow-y-auto">
          {cargando ? (
            <div className="p-8 text-center text-gray-500">Cargando productos...</div>
          ) : productos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No se encontraron productos</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {productos.map(producto => (
                <div
                  key={producto.id}
                  onClick={() => handleAgregarProducto(producto)}
                  className="bg-white border-2 border-gray-200 rounded-lg p-3 hover:shadow-xl hover:border-primary cursor-pointer transition"
                >
                  <h4 className="font-bold text-gray-800 text-base mb-2 line-clamp-2 h-12">
                    {producto.nombre}
                  </h4>
                  
                  <div className="text-xs text-gray-500 mb-3 space-y-1">
                    <div>Código: {producto.codigo}</div>
                    <div className={producto.stock > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      Stock: {producto.stock}
                    </div>
                  </div>
                  
                  <div className="text-2xl font-bold text-primary text-center">
                    Q{parseFloat(producto.precio).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
