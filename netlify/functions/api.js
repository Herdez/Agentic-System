const NetlifySimulationService = require('./NetlifySimulationService');

// Inicializar servicio stateless
const demoService = new NetlifySimulationService();

exports.handler = async (event, context) => {
  try {
    const { httpMethod: method, path, queryStringParameters: query, body } = event;
    
    // Headers CORS
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
    };

    // Manejar OPTIONS para CORS
    if (method === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }

    let response = {};

    // Rutas GET
    if (method === 'GET') {
      if (path === '/health' || path.endsWith('/health')) {
        response = {
          success: true,
          data: {
            status: 'OK',
            timestamp: new Date().toISOString(),
            environment: 'netlify-serverless',
            mode: 'stateless-simulation',
            version: '1.0.0'
          }
        };
      }
      else if (path === '/agents' || path.endsWith('/agents')) {
        response = {
          success: true,
          data: demoService.getAgents()
        };
      }
      else if (path === '/alerts' || path.endsWith('/alerts')) {
        const alerts = demoService.getAlerts();
        const limit = query?.limit ? parseInt(query.limit) : alerts.length;
        response = {
          success: true,
          data: alerts.slice(0, limit)
        };
      }
      else if (path === '/dashboard' || path.endsWith('/dashboard')) {
        response = {
          success: true,
          data: demoService.getSystemStats()
        };
      }
      else if (path === '/simulation/status' || path.endsWith('/simulation/status')) {
        response = {
          success: true,
          data: demoService.getSimulationStatus()
        };
      }
      else {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Ruta no encontrada', path: path })
        };
      }
    }
    // Rutas POST
    else if (method === 'POST') {
      if (path === '/agents/initialize' || path.endsWith('/agents/initialize')) {
        response = {
          success: true,
          data: demoService.initializeAgents()
        };
      }
      else if (path === '/simulation/start' || path.endsWith('/simulation/start')) {
        response = {
          success: true,
          data: demoService.startSimulation()
        };
      }
      else if (path === '/simulation/stop' || path.endsWith('/simulation/stop')) {
        response = {
          success: true,
          data: demoService.stopSimulation()
        };
      }
      else if (path === '/simulation/restart' || path.endsWith('/simulation/restart')) {
        response = {
          success: true,
          data: demoService.restartSimulation()
        };
      }
      else if (path.includes('/agents/') && path.includes('/action')) {
        // Manejar acciones de agentes: /agents/:agentId/action
        const agentId = path.split('/agents/')[1]?.split('/action')[0];
        
        let actionData = {};
        try {
          actionData = body ? JSON.parse(body) : {};
        } catch (e) {
          actionData = {};
        }

        response = {
          success: true,
          data: {
            message: `Acción ${actionData.action || 'unknown'} ejecutada para agente ${agentId}`,
            agentId: agentId,
            action: actionData.action || 'unknown',
            timestamp: new Date().toISOString(),
            result: 'completed',
            mode: 'netlify-stateless'
          }
        };
      }
      else {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Ruta POST no encontrada', path: path })
        };
      }
    }
    else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Método no permitido', method })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Error en función Netlify:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Error interno del servidor',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
