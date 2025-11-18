const express = require('express');
const router = express.Router();
const SimulationService = require('../services/SimulationService');
const DemoSimulationService = require('../services/DemoSimulationService');

// Variable para detectar modo demo (se puede importar desde app.js si es necesario)
let isDemoMode = true; // Por defecto en modo demo

// Obtener estado de la simulación
router.get('/status', async (req, res) => {
  try {
    let stats;
    if (isDemoMode) {
      stats = DemoSimulationService.getSimulationStats();
    } else {
      stats = await SimulationService.getSimulationStats();
    }
    
    res.json({
      success: true,
      data: { ...stats, demoMode: isDemoMode }
    });
  } catch (error) {
    console.error('Error obteniendo estado de simulación:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estado de simulación'
    });
  }
});

// Iniciar simulación
router.post('/start', (req, res) => {
  try {
    if (isDemoMode) {
      DemoSimulationService.startSimulation();
    } else {
      SimulationService.startSimulation();
    }
    
    res.json({
      success: true,
      message: `Simulación ${isDemoMode ? 'demo' : ''} iniciada exitosamente`
    });
  } catch (error) {
    console.error('Error iniciando simulación:', error);
    res.status(500).json({
      success: false,
      message: 'Error iniciando simulación'
    });
  }
});

// Detener simulación
router.post('/stop', (req, res) => {
  try {
    if (isDemoMode) {
      DemoSimulationService.stopSimulation();
    } else {
      SimulationService.stopSimulation();
    }
    
    res.json({
      success: true,
      message: `Simulación ${isDemoMode ? 'demo' : ''} detenida exitosamente`
    });
  } catch (error) {
    console.error('Error deteniendo simulación:', error);
    res.status(500).json({
      success: false,
      message: 'Error deteniendo simulación'
    });
  }
});

// Reiniciar simulación
router.post('/restart', (req, res) => {
  try {
    if (isDemoMode) {
      DemoSimulationService.stopSimulation();
      setTimeout(() => {
        DemoSimulationService.startSimulation();
      }, 1000);
    } else {
      SimulationService.stopSimulation();
      setTimeout(() => {
        SimulationService.startSimulation();
      }, 1000);
    }
    
    res.json({
      success: true,
      message: `Simulación ${isDemoMode ? 'demo' : ''} reiniciada exitosamente`
    });
  } catch (error) {
    console.error('Error reiniciando simulación:', error);
    res.status(500).json({
      success: false,
      message: 'Error reiniciando simulación'
    });
  }
});

module.exports = router;
