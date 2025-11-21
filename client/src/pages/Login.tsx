import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Shield, Eye, EyeOff, Loader2, User, Lock } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Login Card */}
        <div className="bg-white rounded-lg shadow-xl p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-normal text-gray-600 mb-2">
              Log in to your account
            </h1>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-sky-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm placeholder-gray-400"
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-sky-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm placeholder-gray-400"
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>Log In</span>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500 mb-4">
              New to Defense System? 
              <span className="text-sky-600 hover:text-sky-700 cursor-pointer ml-1">
                Try Demo
              </span>
            </div>
            <div className="flex justify-center space-x-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="px-4 py-2 text-sm text-sky-600 border border-sky-200 rounded-md hover:bg-sky-50 transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('analyst')}
                className="px-4 py-2 text-sm text-sky-600 border border-sky-200 rounded-md hover:bg-sky-50 transition-colors"
              >
                Analyst
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('operator')}
                className="px-4 py-2 text-sm text-sky-600 border border-sky-200 rounded-md hover:bg-sky-50 transition-colors"
              >
                Operator
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-white/70">
            Blockchain Defense System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
