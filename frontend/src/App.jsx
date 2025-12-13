import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CarritoProvider } from './context/CarritoContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import POS from './pages/POS'
import AperturaTurno from './pages/AperturaTurno'
import CierreTurno from './pages/CierreTurno'

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
              path="/pos" 
              element={
                <ProtectedRoute>
                  <POS />
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
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </CarritoProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
