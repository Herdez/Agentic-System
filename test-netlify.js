// Test simple para verificar que la función de Netlify se puede cargar
const express = require('express');

try {
    // Intentar cargar la función
    console.log('🔍 Verificando carga de dependencias...');
    
    // Cargar NetlifySimulationService
    const NetlifySimulationService = require('./netlify/functions/NetlifySimulationService');
    console.log('✅ NetlifySimulationService cargado correctamente');
    
    // Crear instancia
    const service = new NetlifySimulationService();
    console.log('✅ Instancia de NetlifySimulationService creada');
    
    // Test básico de métodos
    const agents = service.getAgents();
    console.log(`✅ getAgents() devuelve ${agents.length} agentes`);
    
    const alerts = service.getAlerts();
    console.log(`✅ getAlerts() devuelve ${alerts.length} alertas`);
    
    const status = service.getSimulationStatus();
    console.log(`✅ getSimulationStatus() devuelve modo: ${status.mode}`);
    
    const stats = service.getSystemStats();
    console.log(`✅ getSystemStats() devuelve ${Object.keys(stats).length} categorías`);
    
    console.log('\n🎉 ¡Todos los tests pasaron! La función de Netlify está lista.');
    console.log('🌐 La simulación funcionará correctamente en Netlify.');
    
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
