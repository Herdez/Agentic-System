import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import Alerts from './pages/Alerts';
import ThreatIntel from './pages/ThreatIntel';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ToastProvider } from './contexts/ToastContext';
import './App.css';

// Componente para redirigir desde la raíz
const RootRedirect: React.FC = () => {
  const { state } = useAuth();
  
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return state.isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Ruta raíz - redirigir según estado de auth */}
                <Route path="/" element={<RootRedirect />} />
                
                {/* Ruta de login - accesible sin autenticación */}
                <Route path="/login" element={<Login />} />
                
                {/* Rutas protegidas */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <div className="min-h-screen">
                      <Navbar />
                      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Dashboard />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/agents" element={
                  <ProtectedRoute>
                    <div className="min-h-screen">
                      <Navbar />
                      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Agents />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/alerts" element={
                  <ProtectedRoute>
                    <div className="min-h-screen">
                      <Navbar />
                      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Alerts />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/threats" element={
                  <ProtectedRoute>
                    <div className="min-h-screen">
                      <Navbar />
                      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <ThreatIntel />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                {/* Ruta catch-all para rutas no encontradas */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </ToastProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
