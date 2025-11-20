const express = require('express');
const router = express.Router();
const SimulationService = require('../services/SimulationService');
const DemoSimulationService = require('../services/DemoSimulationService');

// Función para detectar modo demo desde variables de entorno o configuración
const isDemoMode = () => {
  return process.env.SKIP_MONGODB === 'true' || !process.env.MONGODB_URI || process.env.NODE_ENV === 'demo';
};

// Obtener estado de la simulación
router.get('/status', async (req, res) => {
  try {
    let stats;
    const demoMode = isDemoMode();
    
    if (demoMode) {
      stats = DemoSimulationService.getSimulationStats();
    } else {
      stats = await SimulationService.getSimulationStats();
    }
    
    res.json({
      success: true,
      data: { ...stats, demoMode }
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
    const demoMode = isDemoMode();
    
    if (demoMode) {
      DemoSimulationService.startSimulation();
    } else {
      SimulationService.startSimulation();
    }
    
    res.json({
      success: true,
      message: `Simulación ${demoMode ? 'demo' : ''} iniciada exitosamente`
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
    const demoMode = isDemoMode();
    
    if (demoMode) {
      DemoSimulationService.stopSimulation();
    } else {
      SimulationService.stopSimulation();
    }
    
    res.json({
      success: true,
      message: `Simulación ${demoMode ? 'demo' : ''} detenida exitosamente`
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
    const demoMode = isDemoMode();
    
    if (demoMode) {
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
      message: `Simulación ${demoMode ? 'demo' : ''} reiniciada exitosamente`
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
