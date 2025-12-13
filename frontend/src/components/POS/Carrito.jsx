import { XMarkIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useCarrito } from '../../context/CarritoContext';

export default function Carrito() {
  const {
    items,
    actualizarCantidad,
    eliminarItem,
    calcularSubtotal,
    calcularTotal
  } = useCarrito();

  const subtotal = calcularSubtotal();
  const total = calcularTotal();

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold text-gray-800">Carrito</h2>
        <p className="text-sm text-gray-600">{items.length} producto(s)</p>
      </div>

      {/* Lista de productos */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-sm">Carrito vacío</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.producto_id} className="flex items-center justify-between py-2 border-b border-gray-200">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">{item.nombre}</h4>
                <p className="text-xs text-gray-600">Q{item.precio_unitario.toFixed(2)}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => actualizarCantidad(item.producto_id, item.cantidad - 1)}
                  className="p-0.5 text-white bg-primary hover:bg-primary-dark rounded"
                >
                  <MinusIcon className="h-3 w-3" />
                </button>
                
                <span className="text-sm font-medium text-gray-900 min-w-[20px] text-center">{item.cantidad}</span>
                
                <button
                  onClick={() => actualizarCantidad(item.producto_id, item.cantidad + 1)}
                  className="p-0.5 text-white bg-primary hover:bg-primary-dark rounded"
                >
                  <PlusIcon className="h-3 w-3" />
                </button>
                
                <span className="text-sm font-semibold text-gray-900 min-w-[55px] text-right">Q{(item.precio_unitario * item.cantidad).toFixed(2)}</span>
                
                <button
                  onClick={() => eliminarItem(item.producto_id)}
                  className="text-red-500 hover:text-red-700 ml-1"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Total */}
      {items.length > 0 && (
        <div className="p-4 border-t">
          <div className="flex justify-between text-2xl font-bold text-gray-900">
            <span>Total:</span>
            <span>Q{total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
