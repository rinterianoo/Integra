import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setCargando(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-block bg-primary p-4 rounded-2xl mb-4">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">Integra POS</h1>
          <p className="text-gray-600">Sistema de Punto de Venta</p>
        </div>

        {/* Card del formulario */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 placeholder-gray-400"
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 placeholder-gray-400"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-all disabled:bg-gray-400 disabled:cursor-not-allowed mt-6"
            >
              {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>

        {/* Usuarios de prueba */}
        <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
          <p className="font-bold text-gray-800 mb-3 text-base flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Credenciales de Prueba
          </p>
          
          <div className="space-y-3">
            {/* Super Admin */}
            <div className="bg-white p-3 rounded-lg border border-purple-200">
              <p className="font-semibold text-purple-700 text-xs mb-1 flex items-center">
                <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                SUPER ADMIN (Todas las tiendas)
              </p>
              <p className="text-gray-700 text-sm font-mono">superadmin@integra.com</p>
              <p className="text-gray-600 text-xs">Contraseña: super123</p>
            </div>

            {/* Tienda Principal */}
            <div className="bg-white p-3 rounded-lg border border-green-200">
              <p className="font-semibold text-green-700 text-xs mb-2 flex items-center">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                TIENDA PRINCIPAL
              </p>
              <div className="space-y-1">
                <div>
                  <p className="text-gray-700 text-sm font-mono">admin.principal@integra.com</p>
                  <p className="text-gray-500 text-xs">Admin / admin123</p>
                </div>
                <div className="pt-1 border-t border-gray-100">
                  <p className="text-gray-700 text-sm font-mono">cajero.principal@integra.com</p>
                  <p className="text-gray-500 text-xs">Cajero / cajero123</p>
                </div>
              </div>
            </div>

            {/* Sucursal Centro */}
            <div className="bg-white p-3 rounded-lg border border-blue-200">
              <p className="font-semibold text-blue-700 text-xs mb-2 flex items-center">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                SUCURSAL CENTRO
              </p>
              <div className="space-y-1">
                <div>
                  <p className="text-gray-700 text-sm font-mono">admin.centro@integra.com</p>
                  <p className="text-gray-500 text-xs">Admin / admin123</p>
                </div>
                <div className="pt-1 border-t border-gray-100">
                  <p className="text-gray-700 text-sm font-mono">cajero.centro@integra.com</p>
                  <p className="text-gray-500 text-xs">Cajero / cajero123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
