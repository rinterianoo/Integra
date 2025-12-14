import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { BanknotesIcon } from '@heroicons/react/24/outline';

export default function AperturaTurno() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [montoInicial, setMontoInicial] = useState('');
  const [notas, setNotas] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleAbrirTurno = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const response = await api.post('/turnos', {
        usuario_id: usuario.id,
        monto_inicial: parseFloat(montoInicial),
        notas: notas
      });

      alert('Turno abierto correctamente');
      navigate('/pos');
    } catch (error) {
      console.error('Error al abrir turno:', error);
      setError(error.response?.data?.error || 'Error al abrir el turno');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <BanknotesIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Apertura de Turno</h1>
          <p className="text-gray-600">Cajero: {usuario.nombre}</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleAbrirTurno} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Monto Inicial en Caja *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-4 text-gray-500 text-lg">$</span>
              <input
                type="number"
                value={montoInicial}
                onChange={(e) => setMontoInicial(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg text-gray-900"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Ingresa el efectivo con el que inicias la caja
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 placeholder-gray-400"
              placeholder="Observaciones sobre la apertura..."
              rows="3"
            />
          </div>

          <button
            type="submit"
            disabled={cargando || !montoInicial}
            className="w-full bg-primary text-white py-4 rounded-lg text-lg font-semibold hover:bg-primary-dark transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {cargando ? 'Abriendo Turno...' : 'Abrir Turno'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Información:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Verifica el efectivo antes de iniciar</li>
            <li>• El monto inicial debe coincidir con el dinero en caja</li>
            <li>• Guarda el recibo de apertura</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
