const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');

// Importar servicio stateless para Netlify
const NetlifySimulationService = require('./NetlifySimulationService');

const app = express();

// Configurar CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Inicializar servicio stateless
const demoService = new NetlifySimulationService();

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: 'netlify-serverless',
    mode: 'stateless-simulation',
    version: '1.0.0'
  });
});

// Rutas de agentes
app.get('/api/agents', (req, res) => {
  const agents = demoService.getAgents();
  res.json(agents);
});

app.post('/api/agents/initialize', (req, res) => {
  const result = demoService.initializeAgents();
  res.json(result);
});

// Rutas de alertas
app.get('/api/alerts', (req, res) => {
  const alerts = demoService.getAlerts();
  res.json(alerts);
});

// Rutas de simulación
app.get('/api/simulation/status', (req, res) => {
  const status = demoService.getSimulationStatus();
  res.json(status);
});

app.post('/api/simulation/start', (req, res) => {
  const result = demoService.startSimulation();
  res.json(result);
});

app.post('/api/simulation/stop', (req, res) => {
  const result = demoService.stopSimulation();
  res.json(result);
});

app.post('/api/simulation/restart', (req, res) => {
  const result = demoService.restartSimulation();
  res.json(result);
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

// Inicializar simulación para Netlify
try {
  console.log('Sistema inicializado en modo Netlify stateless');
} catch (error) {
  console.error('Error inicializando sistema Netlify:', error.message);
}

module.exports.handler = serverless(app);
