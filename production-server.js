#!/usr/bin/env node

const express = require('express');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '.env.production') });

const app = express();
const server = createServer(app);

// Configuración para producción
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'production';
const CORS_ORIGINS = process.env.CORS_ORIGINS ? 
  process.env.CORS_ORIGINS.split(',') : ['*'];

console.log(`🚀 Iniciando servidor de producción en puerto ${PORT}`);
console.log(`🌍 Entorno: ${NODE_ENV}`);

// Configurar CORS para producción
app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true
}));

// Socket.IO configuración para producción
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGINS,
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Importar servicios del servidor
const DemoSimulationService = require('./server/services/DemoSimulationService');

// Inicializar servicios
const demoService = new DemoSimulationService();

// API Routes
app.use('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: process.env.APP_VERSION || '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Rutas de agentes
app.use('/api/agents', (req, res) => {
  if (req.method === 'GET') {
    const agents = demoService.getAgents();
    res.json(agents);
  } else if (req.method === 'POST' && req.path.includes('initialize')) {
    demoService.initializeAgents();
    res.json({ message: 'Agentes inicializados', count: 7 });
  } else {
    res.status(404).json({ error: 'Endpoint no encontrado' });
  }
});

// Rutas de alertas
app.use('/api/alerts', (req, res) => {
  const alerts = demoService.getAlerts();
  res.json(alerts);
});

// Rutas de simulación
app.use('/api/simulation', (req, res) => {
  if (req.method === 'GET' && req.path.includes('status')) {
    const isRunning = demoService.isSimulationRunning();
    res.json({
      isRunning,
      agentsCount: 7,
      alertsCount: demoService.getAlerts().length,
      uptime: demoService.getUptime()
    });
  } else if (req.method === 'POST' && req.path.includes('start')) {
    demoService.startSimulation();
    res.json({ message: 'Simulación iniciada' });
  } else if (req.method === 'POST' && req.path.includes('stop')) {
    demoService.stopSimulation();
    res.json({ message: 'Simulación detenida' });
  } else if (req.method === 'POST' && req.path.includes('restart')) {
    demoService.restartSimulation();
    res.json({ message: 'Simulación reiniciada' });
  } else {
    res.status(404).json({ error: 'Endpoint no encontrado' });
  }
});

// Rutas de dashboard
app.use('/api/dashboard', (req, res) => {
  const stats = demoService.getSystemStats();
  res.json(stats);
});

// Servir archivos estáticos del frontend
const frontendPath = path.join(__dirname, 'client', 'build');
if (require('fs').existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  
  // Manejar rutas de React (SPA)
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });
  
  console.log(`📁 Sirviendo archivos estáticos desde: ${frontendPath}`);
} else {
  console.log(`⚠️  Frontend build no encontrado en: ${frontendPath}`);
  app.get('/', (req, res) => {
    res.json({
      message: 'API del Sistema de Defensa Blockchain',
      status: 'Online',
      frontend: 'No disponible (build no encontrado)'
    });
  });
}

// Configurar WebSocket
io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`);
  
  // Enviar estado inicial
  socket.emit('agents-update', demoService.getAgents());
  socket.emit('alerts-update', demoService.getAlerts());
  
  socket.on('disconnect', () => {
    console.log(`🔌 Cliente desconectado: ${socket.id}`);
  });
});

// Configurar eventos de simulación
demoService.on('agentsUpdated', (agents) => {
  io.emit('demo-agents-update', agents);
});

demoService.on('newAlert', (alert) => {
  io.emit('demo-alert-new', alert);
  io.emit('demo-alerts-update', demoService.getAlerts());
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// Inicializar simulación
try {
  demoService.initializeAgents();
  demoService.startSimulation();
  console.log('🤖 Sistema demo inicializado con 7 agentes');
} catch (error) {
  console.error('❌ Error inicializando sistema demo:', error.message);
}

// Iniciar servidor
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                 ✅ SERVIDOR DE PRODUCCIÓN ACTIVO               ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  🌍 URL:        http://localhost:${PORT}                        ║
║  📊 API:        http://localhost:${PORT}/api                    ║
║  💊 Health:     http://localhost:${PORT}/api/health             ║
║  🔌 WebSocket:  Activo                                        ║
║                                                               ║
║  🤖 Agentes AI: 7 activos en modo demo                       ║
║  ⚡ Tiempo Real: WebSocket configurado                        ║
║  📱 Frontend:   ${require('fs').existsSync(frontendPath) ? 'Incluido' : 'No disponible'}                                    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

// Manejo de cierre limpio
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo servidor...');
  demoService.stopSimulation();
  server.close(() => {
    console.log('✅ Servidor detenido correctamente');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Señal SIGTERM recibida, deteniendo servidor...');
  demoService.stopSimulation();
  server.close(() => {
    console.log('✅ Servidor detenido correctamente');
    process.exit(0);
  });
});

module.exports = { app, server, io };
