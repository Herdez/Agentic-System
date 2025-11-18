const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');

// Importar servicios
const DemoSimulationService = require('../../server/services/DemoSimulationService');

const app = express();

// Configurar CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Inicializar servicios
const demoService = new DemoSimulationService();

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: 'netlify',
    version: '1.0.0'
  });
});

// Rutas de agentes
app.get('/api/agents', (req, res) => {
  const agents = demoService.getAgents();
  res.json(agents);
});

app.post('/api/agents/initialize', (req, res) => {
  demoService.initializeAgents();
  res.json({ message: 'Agentes inicializados', count: 7 });
});

// Rutas de alertas
app.get('/api/alerts', (req, res) => {
  const alerts = demoService.getAlerts();
  res.json(alerts);
});

// Rutas de simulación
app.get('/api/simulation/status', (req, res) => {
  const isRunning = demoService.isSimulationRunning();
  res.json({
    isRunning,
    agentsCount: 7,
    alertsCount: demoService.getAlerts().length,
    uptime: demoService.getUptime()
  });
});

app.post('/api/simulation/start', (req, res) => {
  demoService.startSimulation();
  res.json({ message: 'Simulación iniciada' });
});

app.post('/api/simulation/stop', (req, res) => {
  demoService.stopSimulation();
  res.json({ message: 'Simulación detenida' });
});

app.post('/api/simulation/restart', (req, res) => {
  demoService.restartSimulation();
  res.json({ message: 'Simulación reiniciada' });
});

// Rutas de dashboard
app.get('/api/dashboard', (req, res) => {
  const stats = demoService.getSystemStats();
  res.json(stats);
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: 'Algo salió mal'
  });
});

// Inicializar simulación
try {
  demoService.initializeAgents();
  demoService.startSimulation();
} catch (error) {
  console.error('Error inicializando sistema demo:', error.message);
}

module.exports.handler = serverless(app);
