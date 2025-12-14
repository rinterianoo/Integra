import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CarritoProvider } from './context/CarritoContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import POS from './pages/POS'
import AperturaTurno from './pages/AperturaTurno'
import CierreTurno from './pages/CierreTurno'
import Productos from './pages/Productos'
import Tiendas from './pages/Tiendas'

function App() {
  return (
    <Router>
      <AuthProvider>
        <CarritoProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/apertura-turno" 
              element={
                <ProtectedRoute>
                  <AperturaTurno />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tiendas" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Tiendas />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pos" 
              element={
                <ProtectedRoute>
                  <POS />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/productos" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Productos />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cierre-turno" 
              element={
                <ProtectedRoute>
                  <CierreTurno />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </CarritoProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
