import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  ShoppingCartIcon,
  CubeIcon,
  ChartBarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Sidebar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      nombre: 'Dashboard',
      icon: HomeIcon,
      ruta: '/dashboard',
      roles: ['super_admin', 'administrador', 'cajero', 'supervisor']
    },
    {
      nombre: 'Tiendas',
      icon: BuildingStorefrontIcon,
      ruta: '/tiendas',
      roles: ['super_admin']
    },
    {
      nombre: 'Punto de Venta',
      icon: ShoppingCartIcon,
      ruta: '/pos',
      roles: ['administrador', 'cajero', 'supervisor']
    },
    {
      nombre: 'Productos',
      icon: CubeIcon,
      ruta: '/productos',
      roles: ['administrador', 'supervisor']
    },
    {
      nombre: 'Reportes',
      icon: ChartBarIcon,
      ruta: '/reportes',
      roles: ['administrador', 'supervisor']
    },
    {
      nombre: 'Clientes',
      icon: UserGroupIcon,
      ruta: '/clientes',
      roles: ['administrador', 'supervisor']
    },
    {
      nombre: 'Configuración',
      icon: Cog6ToothIcon,
      ruta: '/configuracion',
      roles: ['administrador']
    }
  ];

  const menuItemsFiltrados = menuItems.filter(item => 
    item.roles.includes(usuario.rol)
  );

  return (
    <>
      {/* Botón móvil */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-lg shadow-lg"
      >
        {abierto ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Overlay móvil */}
      {abierto && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setAbierto(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${
          abierto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg">
                <ShoppingCartIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Integra</h1>
                <p className="text-xs text-gray-600">Punto de Venta</p>
              </div>
            </div>
          </div>

          {/* Usuario */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-primary bg-opacity-10 p-2 rounded-full">
                <span className="text-primary font-semibold text-sm">
                  {usuario.nombre.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {usuario.nombre}
                </p>
                <p className="text-xs text-gray-600 capitalize">{usuario.rol}</p>
              </div>
            </div>
          </div>

          {/* Menú */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {menuItemsFiltrados.map((item) => (
                <li key={item.ruta}>
                  <NavLink
                    to={item.ruta}
                    onClick={() => setAbierto(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.nombre}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Cerrar sesión */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
