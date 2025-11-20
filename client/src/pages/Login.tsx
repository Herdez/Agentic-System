import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      showError('Error', 'Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    
    try {
      await login(username, password);
      showSuccess('Éxito', 'Inicio de sesión exitoso');
      navigate('/dashboard');
    } catch (error: any) {
      showError('Error de autenticación', error.message || 'Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: 'admin' | 'analyst' | 'operator') => {
    const credentials = {
      admin: { username: 'admin', password: 'admin123' },
      analyst: { username: 'analyst', password: 'analyst123' },
      operator: { username: 'operator', password: 'operator123' }
    };
    
    setUsername(credentials[role].username);
    setPassword(credentials[role].password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Blockchain Defense System
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            Sistema de Defensa con Agentes AI
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Ingresa tu usuario"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Ingresa tu contraseña"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Cuentas de demostración</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="px-3 py-2 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                👑 Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('analyst')}
                className="px-3 py-2 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                📊 Analyst
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('operator')}
                className="px-3 py-2 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ⚙️ Operator
              </button>
            </div>
          </div>

          {/* Credentials Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Credenciales de prueba:</h3>
            <div className="text-xs text-blue-800 space-y-1">
              <div><strong>Admin:</strong> admin / admin123</div>
              <div><strong>Analyst:</strong> analyst / analyst123</div>
              <div><strong>Operator:</strong> operator / operator123</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-300">
          <p>Sistema de Defensa Blockchain con Agentes AI</p>
          <p className="mt-1">© 2025 - Seguridad Descentralizada</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
