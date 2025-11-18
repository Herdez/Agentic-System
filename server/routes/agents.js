const express = require('express');
const router = express.Router();
const AgentService = require('../services/AgentService');

// GET /api/agents - Obtener todos los agentes
router.get('/', async (req, res) => {
  try {
    const agents = await AgentService.getAllAgents();
    res.json({
      success: true,
      data: agents,
      count: agents.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/agents/:id - Obtener agente por ID
router.get('/:id', async (req, res) => {
  try {
    const agent = await AgentService.getAgentById(req.params.id);
    res.json({
      success: true,
      data: agent
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/agents - Crear nuevo agente
router.post('/', async (req, res) => {
  try {
    const agent = await AgentService.createAgent(req.body);
    res.status(201).json({
      success: true,
      data: agent,
      message: 'Agente creado exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/agents/:id/action - Ejecutar acción en agente
router.put('/:id/action', async (req, res) => {
  try {
    const { action } = req.body;
    
    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'La acción es requerida'
      });
    }

    const agent = await AgentService.executeAgentAction(req.params.id, action);
    
    res.json({
      success: true,
      data: agent,
      message: `Acción "${action}" ejecutada exitosamente`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/agents/:id/metrics - Actualizar métricas de agente
router.put('/:id/metrics', async (req, res) => {
  try {
    const agent = await AgentService.updateAgentMetrics(req.params.id, req.body);
    
    res.json({
      success: true,
      data: agent,
      message: 'Métricas actualizadas exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/agents/type/:type - Obtener agentes por tipo
router.get('/type/:type', async (req, res) => {
  try {
    const agents = await AgentService.getAgentsByType(req.params.type);
    
    res.json({
      success: true,
      data: agents,
      count: agents.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/agents/stats/overview - Obtener estadísticas generales
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await AgentService.getSystemStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/agents/initialize - Inicializar agentes por defecto
router.post('/initialize', async (req, res) => {
  try {
    const agents = await AgentService.initializeDefaultAgents();
    
    res.json({
      success: true,
      data: agents,
      message: 'Agentes inicializados exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/agents/simulate - Simular actividad de agentes
router.post('/simulate', async (req, res) => {
  try {
    await AgentService.simulateAgentActivity();
    
    res.json({
      success: true,
      message: 'Simulación de actividad ejecutada'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
