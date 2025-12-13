import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import api from '../api/axios';
import BusquedaProductos from '../components/POS/BusquedaProductos';
import Carrito from '../components/POS/Carrito';
import ModalPago from '../components/POS/ModalPago';
import { 
  ArrowRightOnRectangleIcon, 
  BookmarkIcon, 
  ClockIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function POS() {
  const { usuario, logout } = useAuth();
  const { 
    items, 
    descuento, 
    propina, 
    clienteNombre, 
    agregarItem, 
    limpiarCarrito, 
    calcularTotal,
    cargarOrden 
  } = useCarrito();
  
  const navigate = useNavigate();
  const [turnoActivo, setTurnoActivo] = useState(null);
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [mostrarOrdenesTemporales, setMostrarOrdenesTemporales] = useState(false);
  const [ordenesTemporales, setOrdenesTemporales] = useState([]);
  const [procesandoVenta, setProcesandoVenta] = useState(false);
  const [ventaCompletada, setVentaCompletada] = useState(null);

  useEffect(() => {
    verificarTurno();
  }, []);

  const verificarTurno = async () => {
    try {
      const response = await api.get(`/turnos/activo/${usuario.id}`);
      setTurnoActivo(response.data);
    } catch (error) {
      // Si no hay turno activo, redirigir a apertura
      navigate('/apertura-turno');
    }
  };

  const handleAgregarProducto = (producto) => {
    if (producto.stock <= 0) {
      alert('Producto sin stock disponible');
      return;
    }
    agregarItem(producto);
  };

  const handleProcesarPago = () => {
    if (items.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    setMostrarModalPago(true);
  };

  const handleConfirmarVenta = async (pagos, cambio) => {
    setProcesandoVenta(true);
    
    try {
      const ventaData = {
        usuario_id: usuario.id,
        turno_id: turnoActivo.id,
        cliente_nombre: clienteNombre,
        items: items,
        descuento: descuento,
        propina: propina,
        pagos: pagos,
        estado: 'completada'
      };

      const response = await api.post('/ventas', ventaData);
      
      setVentaCompletada({ ...response.data, cambio });
      setMostrarModalPago(false);
      limpiarCarrito();
      
      // Mostrar ticket
      setTimeout(() => {
        setVentaCompletada(null);
      }, 5000);
      
    } catch (error) {
      console.error('Error al procesar venta:', error);
      alert(error.response?.data?.error || 'Error al procesar la venta');
    } finally {
      setProcesandoVenta(false);
    }
  };

  const handleGuardarOrdenTemporal = async () => {
    if (items.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    const nombreOrden = prompt('Nombre de la orden:');
    if (!nombreOrden) return;

    try {
      const ordenData = {
        usuario_id: usuario.id,
        nombre_orden: nombreOrden,
        datos_orden: {
          items,
          descuento,
          propina,
          clienteNombre
        }
      };

      await api.post('/ordenes', ordenData);
      alert('Orden guardada correctamente');
      limpiarCarrito();
    } catch (error) {
      console.error('Error al guardar orden:', error);
      alert('Error al guardar la orden');
    }
  };

  const handleCargarOrdenesTemporales = async () => {
    try {
      const response = await api.get(`/ordenes/usuario/${usuario.id}`);
      setOrdenesTemporales(response.data);
      setMostrarOrdenesTemporales(true);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
    }
  };

  const toggleOrdenesTemporales = async () => {
    if (mostrarOrdenesTemporales) {
      setMostrarOrdenesTemporales(false);
    } else {
      await handleCargarOrdenesTemporales();
    }
  };

  const handleCargarOrden = async (orden) => {
    cargarOrden(orden.datos_orden);
    setMostrarOrdenesTemporales(false);
    
    // Eliminar orden temporal
    try {
      await api.delete(`/ordenes/${orden.id}`);
    } catch (error) {
      console.error('Error al eliminar orden:', error);
    }
  };

  const handleCerrarTurno = () => {
    navigate('/cierre-turno');
  };

  const total = calcularTotal();

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Integra POS</h1>
            <p className="text-sm text-gray-600">
              Cajero: {usuario.nombre} | Turno #{turnoActivo?.id}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={toggleOrdenesTemporales}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold"
            >
              <ClockIcon className="h-5 w-5" />
              Órdenes Temporales
            </button>
            
            <button
              onClick={handleCerrarTurno}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              <XMarkIcon className="h-5 w-5" />
              Cerrar Turno
            </button>
            
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Panel izquierdo - Búsqueda y productos */}
        <div className="flex-1 h-full">
          <BusquedaProductos onAgregarProducto={handleAgregarProducto} />
        </div>

        {/* Panel derecho - Carrito */}
        <div className="w-80 flex flex-col gap-3">
          <Carrito />
          
          {/* Botones de acción */}
          {items.length > 0 && (
            <div className="space-y-2">
              <button
                onClick={handleGuardarOrdenTemporal}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
              >
                <BookmarkIcon className="h-5 w-5" />
                Guardar Orden
              </button>
              
              <button
                onClick={handleProcesarPago}
                className="w-full px-6 py-4 bg-primary text-white rounded-lg text-xl font-bold hover:bg-primary-dark transition"
              >
                Procesar Pago - Q{total.toFixed(2)}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de pago */}
      {mostrarModalPago && (
        <ModalPago
          total={total}
          onCerrar={() => setMostrarModalPago(false)}
          onConfirmar={handleConfirmarVenta}
        />
      )}

      {/* Modal de órdenes temporales */}
      {mostrarOrdenesTemporales && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Órdenes Temporales</h2>
              <button
                onClick={() => setMostrarOrdenesTemporales(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-3">
              {ordenesTemporales.length === 0 ? (
                <p className="text-center text-gray-500">No hay órdenes guardadas</p>
              ) : (
                ordenesTemporales.map(orden => (
                  <div
                    key={orden.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleCargarOrden(orden)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{orden.nombre_orden}</h3>
                        <p className="text-sm text-gray-600">
                          {orden.datos_orden.items.length} producto(s)
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(orden.fecha_creacion).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">
                          Q${orden.datos_orden.items.reduce((sum, item) => 
                            sum + (item.precio_unitario * item.cantidad), 0
                          ).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notificación de venta completada */}
      {ventaCompletada && (
        <div className="fixed top-20 right-6 bg-primary text-white rounded-lg shadow-xl p-6 max-w-md z-50">
          <div className="flex items-start gap-4">
            <CheckCircleIcon className="h-8 w-8 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-2">¡Venta Completada!</h3>
              <p className="text-sm mb-1">Venta: {ventaCompletada.numero_venta}</p>
              <p className="text-sm mb-1">Total: Q${ventaCompletada.total.toFixed(2)}</p>
              {ventaCompletada.cambio > 0 && (
                <p className="text-sm font-bold">Cambio: Q${ventaCompletada.cambio.toFixed(2)}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
