import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useCarrito } from '../../context/CarritoContext';

export default function Carrito() {
  const {
    items,
    descuento,
    propina,
    clienteNombre,
    actualizarCantidad,
    eliminarItem,
    calcularSubtotal,
    calcularTotal,
    setDescuento,
    setPropina,
    setClienteNombre
  } = useCarrito();

  const subtotal = calcularSubtotal();
  const total = calcularTotal();

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold text-gray-800">Carrito de Compra</h2>
        <p className="text-gray-600">{items.length} producto(s)</p>
      </div>

      {/* Lista de productos */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {items.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg">Carrito vacío</p>
            <p className="text-sm">Busca y agrega productos para comenzar</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.producto_id} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{item.nombre}</h4>
                  <p className="text-sm text-gray-500">{item.codigo}</p>
                </div>
                <button
                  onClick={() => eliminarItem(item.producto_id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => actualizarCantidad(item.producto_id, item.cantidad - 1)}
                    className="p-1 text-white bg-primary hover:bg-primary-dark rounded"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  
                  <input
                    type="number"
                    value={item.cantidad}
                    onChange={(e) => actualizarCantidad(item.producto_id, parseInt(e.target.value) || 1)}
                    className="w-16 text-center border border-gray-300 bg-white rounded px-2 py-1 text-gray-900"
                    min="1"
                  />
                  
                  <button
                    onClick={() => actualizarCantidad(item.producto_id, item.cantidad + 1)}
                    className="p-1 text-white bg-primary hover:bg-primary-dark rounded"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                  
                  <span className="text-sm text-gray-600">
                    × ${item.precio_unitario.toFixed(2)}
                  </span>
                </div>
                
                <div className="text-lg font-bold text-gray-800">
                  ${(item.precio_unitario * item.cantidad).toFixed(2)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totales y opciones */}
      {items.length > 0 && (
        <div className="p-4 border-t space-y-3">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente (opcional)
            </label>
            <input
              type="text"
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              placeholder="Nombre del cliente"
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
            />
          </div>

          {/* Descuento */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Descuento</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">$</span>
              <input
                type="number"
                value={descuento}
                onChange={(e) => setDescuento(parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-right text-gray-900"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Propina */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Propina</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">$</span>
              <input
                type="number"
                value={propina}
                onChange={(e) => setPropina(parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-right text-gray-900"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Botones rápidos de propina */}
          <div className="flex gap-2">
            {[0, 5, 10, 15, 20].map(porcentaje => (
              <button
                key={porcentaje}
                onClick={() => setPropina((subtotal * porcentaje) / 100)}
                className="flex-1 px-2 py-1 text-xs text-white bg-primary hover:bg-primary-dark rounded font-semibold"
              >
                {porcentaje}%
              </button>
            ))}
          </div>

          {/* Resumen */}
          <div className="space-y-2 pt-3 border-t">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            
            {descuento > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Descuento:</span>
                <span className="font-semibold">-${descuento.toFixed(2)}</span>
              </div>
            )}
            
            {propina > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Propina:</span>
                <span className="font-semibold">+${propina.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-2xl font-bold text-gray-900 pt-2 border-t">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
