import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import Alerts from './pages/Alerts';
import ThreatIntel from './pages/ThreatIntel';
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ToastProvider } from './contexts/ToastContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/*" element={
                  <div className="min-h-screen">
                    <Navbar />
                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/agents" element={<Agents />} />
                        <Route path="/alerts" element={<Alerts />} />
                        <Route path="/threats" element={<ThreatIntel />} />
                      </Routes>
                    </main>
                  </div>
                } />
              </Routes>
            </div>
          </Router>
        </ToastProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
