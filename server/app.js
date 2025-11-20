const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = createServer(app);

// Variable para modo demo
let isDemoMode = false;

// Configuración Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "ws://localhost:5000", "http://localhost:5000", "ws://localhost:5001", "http://localhost:5001"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por ventana por IP
});
app.use('/api', limiter);

// Middleware general
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "http://localhost:3001", 
    "http://localhost:3002"
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Conexión MongoDB con timeout rápido para modo demo
if (process.env.SKIP_MONGODB === 'true' || !process.env.MONGODB_URI) {
  console.log('🎮 Iniciando directamente en modo DEMO (sin base de datos)');
  isDemoMode = true;
} else {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blockchain-defense', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 3000, // 3 segundos timeout
    connectTimeoutMS: 3000
  })
  .then(() => {
    console.log('✅ MongoDB conectado exitosamente');
    isDemoMode = false;
  })
  .catch(err => {
    console.error('❌ Error conectando MongoDB:', err.message);
    console.log('🎮 Iniciando en modo DEMO (sin base de datos)');
    isDemoMode = true;
  });
}

// Importar servicios
const AgentService = require('./services/AgentService');
const AlertService = require('./services/AlertService');
const ThreatIntelService = require('./services/ThreatIntelService');
const SimulationService = require('./services/SimulationService');
const DemoSimulationService = require('./services/DemoSimulationService');

// Importar rutas
const agentRoutes = require('./routes/agents');
const alertRoutes = require('./routes/alerts');
const threatRoutes = require('./routes/threats');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const simulationRoutes = require('./routes/simulation');

// Usar rutas
app.use('/api/agents', agentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/threats', threatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/simulation', simulationRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// WebSocket para comunicación en tiempo real
io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`);
  
  // Configurar servicios según el modo
  if (isDemoMode) {
    DemoSimulationService.setSocketIO(io);
  } else {
    SimulationService.setSocketIO(io);
  }
  
  // Enviar estado inicial
  if (isDemoMode) {
    socket.emit('initial-data', {
      agents: DemoSimulationService.getDemoAgents(),
      alerts: DemoSimulationService.getDemoAlerts(),
      demoMode: true
    });
  } else {
    socket.emit('initial-data', {
      agents: AgentService.getAllAgents(),
      alerts: AlertService.getRecentAlerts(10),
      systemStats: AgentService.getSystemStats(),
      demoMode: false
    });
  }

  // Manejar eventos del cliente
  socket.on('agent-action', async (data) => {
    try {
      if (!isDemoMode) {
        const result = await AgentService.executeAgentAction(data.agentId, data.action);
        io.emit('agent-update', result);
        
        // Crear alerta de acción
        const alert = await AlertService.createAlert({
          type: 'INFO',
          message: `Acción ${data.action} ejecutada en agente ${result.name}`,
          agentId: data.agentId,
          severity: 'low'
        });
        io.emit('new-alert', alert);
      } else {
        // Modo demo: simular acción
        io.emit('demo-action', { action: data.action, agentId: data.agentId });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Manejar control de simulación
  socket.on('start-simulation', () => {
    if (isDemoMode) {
      DemoSimulationService.startSimulation();
    } else {
      SimulationService.startSimulation();
    }
    io.emit('simulation-status', { running: true });
  });

  socket.on('stop-simulation', () => {
    if (isDemoMode) {
      DemoSimulationService.stopSimulation();
    } else {
      SimulationService.stopSimulation();
    }
    io.emit('simulation-status', { running: false });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Cliente desconectado: ${socket.id}`);
  });
});

// Simulador de actividad de red y agentes AI (removido por conflictos)

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// Ruta catch-all para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5001;
server.listen(PORT, async () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`🌐 API disponible en http://localhost:${PORT}/api`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔌 WebSocket: http://localhost:${PORT}`);
  
  // Inicializar sistema según el modo
  if (isDemoMode) {
    console.log('🎮 Modo DEMO activado - simulación sin base de datos');
    console.log('✅ Agentes demo inicializados');
    
    // Configurar Socket.IO pero NO iniciar automáticamente
    DemoSimulationService.setSocketIO(io);
    console.log('⏸️ Simulación demo lista (usar botón para iniciar)');
  } else {
    // Inicializar agentes por defecto
    try {
      await AgentService.initializeDefaultAgents();
      console.log('✅ Sistema de agentes inicializado');
      
      // Configurar Socket.IO pero NO iniciar automáticamente
      SimulationService.setSocketIO(io);
      console.log('⏸️ Simulación lista (usar botón para iniciar)');
    } catch (error) {
      console.error('❌ Error inicializando sistema:', error);
    }
  }
});

module.exports = { app, io };
