// Función simple de test para diagnóstico
exports.handler = async (event, context) => {
  try {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
      },
      body: JSON.stringify({
        message: '🎉 Netlify Functions funcionando!',
        timestamp: new Date().toISOString(),
        event: event.httpMethod + ' ' + event.path,
        query: event.queryStringParameters,
        environment: 'netlify-test'
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Error en función test',
        message: error.message
      })
    };
  }
};
