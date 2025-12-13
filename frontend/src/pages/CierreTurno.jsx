import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  XMarkIcon, 
  ChartBarIcon, 
  BanknotesIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon 
} from '@heroicons/react/24/outline';

export default function CierreTurno() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [turnoActivo, setTurnoActivo] = useState(null);
  const [arqueo, setArqueo] = useState(null);
  const [montoFinal, setMontoFinal] = useState('');
  const [notas, setNotas] = useState('');
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarDatosTurno();
  }, []);

  const cargarDatosTurno = async () => {
    try {
      const turnoResponse = await api.get(`/turnos/activo/${usuario.id}`);
      setTurnoActivo(turnoResponse.data);

      const arqueoResponse = await api.get(`/turnos/${turnoResponse.data.id}/arqueo`);
      setArqueo(arqueoResponse.data);
    } catch (error) {
      console.error('Error al cargar datos del turno:', error);
      alert('No hay turno activo');
      navigate('/apertura-turno');
    } finally {
      setCargando(false);
    }
  };

  const handleCerrarTurno = async (e) => {
    e.preventDefault();
    
    if (!montoFinal) {
      alert('Debes ingresar el monto final en caja');
      return;
    }

    const confirmar = window.confirm(
      '¿Estás seguro de cerrar el turno? Esta acción no se puede deshacer.'
    );

    if (!confirmar) return;

    setProcesando(true);

    try {
      await api.put(`/turnos/${turnoActivo.id}/cerrar`, {
        monto_final: parseFloat(montoFinal),
        notas: notas
      });

      alert('Turno cerrado correctamente');
      logout();
    } catch (error) {
      console.error('Error al cerrar turno:', error);
      alert(error.response?.data?.error || 'Error al cerrar el turno');
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Cargando datos del turno...</div>
      </div>
    );
  }

  if (!turnoActivo || !arqueo) {
    return null;
  }

  const ventasEfectivo = arqueo.ventasPorMetodo.find(v => v.metodo_pago === 'efectivo')?.total || 0;
  const montoEsperado = parseFloat(turnoActivo.monto_inicial) + parseFloat(ventasEfectivo);
  const diferencia = montoFinal ? parseFloat(montoFinal) - montoEsperado : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Cierre de Turno</h1>
              <p className="text-gray-600">
                Turno #{turnoActivo.id} - {usuario.nombre}
              </p>
              <p className="text-sm text-gray-500">
                Apertura: {new Date(turnoActivo.fecha_apertura).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => navigate('/pos')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <XMarkIcon className="h-5 w-5" />
              Cancelar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resumen de ventas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estadísticas generales */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ChartBarIcon className="h-6 w-6" />
                Resumen de Ventas
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {arqueo.totalVentas.cantidad}
                  </div>
                  <div className="text-sm text-gray-600">Ventas</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    Q{arqueo.totalVentas.subtotal.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Subtotal</div>
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    Q{arqueo.totalVentas.descuento.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Descuentos</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    Q{arqueo.totalVentas.propina.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Propinas</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold text-gray-700">Total Vendido:</span>
                  <span className="text-3xl font-bold text-green-600">
                    Q{arqueo.totalVentas.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Ventas por método de pago */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Ventas por Método de Pago</h2>
              
              <div className="space-y-3">
                {arqueo.ventasPorMetodo.map(metodo => {
                  const getIcono = (tipo) => {
                    switch (tipo) {
                      case 'efectivo':
                        return <BanknotesIcon className="h-6 w-6 text-green-600" />;
                      case 'tarjeta':
                        return <CreditCardIcon className="h-6 w-6 text-blue-600" />;
                      case 'transferencia':
                        return <DevicePhoneMobileIcon className="h-6 w-6 text-purple-600" />;
                      default:
                        return <BanknotesIcon className="h-6 w-6 text-gray-600" />;
                    }
                  };

                  return (
                    <div key={metodo.metodo_pago} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getIcono(metodo.metodo_pago)}
                        <div>
                          <div className="font-semibold capitalize">{metodo.metodo_pago}</div>
                          <div className="text-sm text-gray-600">
                            {metodo.cantidad_ventas} transacción(es)
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-800">
                        Q{metodo.total.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Productos más vendidos */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Top 10 Productos Vendidos</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 text-sm font-semibold text-gray-700">Producto</th>
                      <th className="text-center px-4 py-2 text-sm font-semibold text-gray-700">Cantidad</th>
                      <th className="text-right px-4 py-2 text-sm font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {arqueo.productosVendidos.map((producto, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{producto.nombre}</td>
                        <td className="px-4 py-3 text-sm text-center font-semibold">
                          {producto.cantidad_vendida}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                          Q{producto.total_vendido.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Panel de arqueo */}
          <div className="space-y-6">
            {/* Arqueo de caja */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Arqueo de Caja</h2>
              
              <form onSubmit={handleCerrarTurno} className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">Monto Inicial:</span>
                    <span className="font-bold">Q{turnoActivo.monto_inicial.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between p-3 bg-green-50 rounded">
                    <span className="text-gray-700">Ventas en Efectivo:</span>
                    <span className="font-bold text-green-600">
                      +Q{ventasEfectivo.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between p-3 bg-blue-50 rounded border-2 border-blue-200">
                    <span className="font-semibold text-gray-800">Monto Esperado:</span>
                    <span className="font-bold text-blue-600 text-lg">
                      Q{montoEsperado.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Monto Real en Caja *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-4 text-gray-500 text-lg">$</span>
                    <input
                      type="number"
                      value={montoFinal}
                      onChange={(e) => setMontoFinal(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg font-semibold text-gray-900"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Cuenta el efectivo físico en caja
                  </p>
                </div>

                {montoFinal && (
                  <div className={`p-4 rounded-lg ${
                    diferencia === 0 
                      ? 'bg-green-50 border-2 border-green-200' 
                      : diferencia > 0 
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : 'bg-red-50 border-2 border-red-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">
                        {diferencia === 0 ? 'Cuadrado ✓' : diferencia > 0 ? 'Sobrante' : 'Faltante'}
                      </span>
                      <span className={`text-2xl font-bold ${
                        diferencia === 0 
                          ? 'text-green-600' 
                          : diferencia > 0 
                          ? 'text-blue-600'
                          : 'text-red-600'
                      }`}>
                        {diferencia > 0 ? '+' : ''}Q{diferencia.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Notas de Cierre
                  </label>
                  <textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                    placeholder="Observaciones sobre el cierre..."
                    rows="3"
                  />
                </div>

                <button
                  type="submit"
                  disabled={procesando || !montoFinal}
                  className="w-full bg-primary text-white py-4 rounded-lg text-lg font-semibold hover:bg-primary-dark transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {procesando ? 'Cerrando Turno...' : 'Cerrar Turno y Salir'}
                </button>
              </form>
            </div>

            {/* Información adicional */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Importante:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Verifica el efectivo cuidadosamente</li>
                <li>• El cierre es irreversible</li>
                <li>• Reporta cualquier diferencia</li>
                <li>• Guarda el reporte impreso</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
