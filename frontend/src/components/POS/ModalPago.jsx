import { useState } from 'react';
import { XMarkIcon, BanknotesIcon, CreditCardIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

export default function ModalPago({ total, onCerrar, onConfirmar }) {
  const [metodosPago, setMetodosPago] = useState([
    { metodo_pago: 'efectivo', monto: total, referencia: '' }
  ]);
  const [cambio, setCambio] = useState(0);

  const calcularTotalPagos = () => {
    return metodosPago.reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0);
  };

  const actualizarMonto = (index, monto) => {
    const nuevosMetodos = [...metodosPago];
    nuevosMetodos[index].monto = parseFloat(monto) || 0;
    setMetodosPago(nuevosMetodos);

    // Calcular cambio para efectivo
    if (nuevosMetodos[index].metodo_pago === 'efectivo') {
      const totalPagado = calcularTotalPagos();
      setCambio(Math.max(0, totalPagado - total));
    }
  };

  const actualizarReferencia = (index, referencia) => {
    const nuevosMetodos = [...metodosPago];
    nuevosMetodos[index].referencia = referencia;
    setMetodosPago(nuevosMetodos);
  };

  const cambiarMetodo = (index, metodo) => {
    const nuevosMetodos = [...metodosPago];
    nuevosMetodos[index].metodo_pago = metodo;
    setMetodosPago(nuevosMetodos);
  };

  const agregarMetodoPago = () => {
    const totalPagado = calcularTotalPagos();
    const restante = total - totalPagado;
    
    setMetodosPago([...metodosPago, {
      metodo_pago: 'tarjeta',
      monto: Math.max(0, restante),
      referencia: ''
    }]);
  };

  const eliminarMetodoPago = (index) => {
    if (metodosPago.length > 1) {
      setMetodosPago(metodosPago.filter((_, i) => i !== index));
    }
  };

  const handleConfirmar = () => {
    const totalPagado = calcularTotalPagos();
    
    if (totalPagado < total) {
      alert('El monto pagado es menor al total');
      return;
    }

    // Si es pago mixto, marcar como tal
    const pagos = metodosPago.map(pago => ({
      ...pago,
      metodo_pago: metodosPago.length > 1 ? 'mixto' : pago.metodo_pago
    }));

    onConfirmar(pagos, cambio);
  };

  const getIconoMetodo = (metodo) => {
    switch (metodo) {
      case 'efectivo':
        return <BanknotesIcon className="h-6 w-6" />;
      case 'tarjeta':
        return <CreditCardIcon className="h-6 w-6" />;
      case 'transferencia':
        return <DevicePhoneMobileIcon className="h-6 w-6" />;
      default:
        return <BanknotesIcon className="h-6 w-6" />;
    }
  };

  const totalPagado = calcularTotalPagos();
  const restante = total - totalPagado;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Procesar Pago</h2>
          <button onClick={onCerrar} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Total a pagar */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg text-gray-700">Total a Pagar:</span>
              <span className="text-3xl font-bold text-blue-600">
                Q{total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Métodos de pago */}
          <div className="space-y-4">
            {metodosPago.map((pago, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Método de Pago {metodosPago.length > 1 && `#${index + 1}`}
                    </label>
                    <div className="flex gap-2">
                      {['efectivo', 'tarjeta', 'transferencia'].map(metodo => (
                        <button
                          key={metodo}
                          onClick={() => cambiarMetodo(index, metodo)}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition ${
                            pago.metodo_pago === metodo
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {getIconoMetodo(metodo)}
                          <span className="font-medium capitalize">{metodo}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {metodosPago.length > 1 && (
                    <button
                      onClick={() => eliminarMetodoPago(index)}
                      className="text-red-600 hover:text-red-800 mt-7"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monto
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">$</span>
                      <input
                        type="number"
                        value={pago.monto}
                        onChange={(e) => actualizarMonto(index, e.target.value)}
                        className="w-full pl-8 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  {pago.metodo_pago !== 'efectivo' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Referencia/Autorización
                      </label>
                      <input
                        type="text"
                        value={pago.referencia}
                        onChange={(e) => actualizarReferencia(index, e.target.value)}
                        placeholder="Ej: 1234567890"
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Botón para agregar método de pago */}
          <button
            onClick={agregarMetodoPago}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
          >
            + Agregar otro método de pago
          </button>

          {/* Resumen */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between text-lg">
              <span className="text-gray-700">Total Pagado:</span>
              <span className={`font-bold ${totalPagado >= total ? 'text-green-600' : 'text-red-600'}`}>
                Q{totalPagado.toFixed(2)}
              </span>
            </div>
            
            {restante > 0 ? (
              <div className="flex justify-between text-lg text-red-600">
                <span>Restante:</span>
                <span className="font-bold">Q{restante.toFixed(2)}</span>
              </div>
            ) : cambio > 0 && (
              <div className="flex justify-between text-lg text-green-600">
                <span>Cambio:</span>
                <span className="font-bold">Q{cambio.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onCerrar}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={totalPagado < total}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Confirmar Venta
          </button>
        </div>
      </div>
    </div>
  );
}
