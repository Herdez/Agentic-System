// 🔧 Script de Test para Verificar Netlify Functions
// Ejecutar después del deploy para verificar que todo funcione

const testUrls = [
  {
    name: "Test Function",
    url: "https://agentic-system-01.netlify.app/.netlify/functions/test",
    method: "GET"
  },
  {
    name: "Health Check",
    url: "https://agentic-system-01.netlify.app/.netlify/functions/api/health",
    method: "GET"
  },
  {
    name: "Agentes",
    url: "https://agentic-system-01.netlify.app/.netlify/functions/api/agents",
    method: "GET"
  },
  {
    name: "Alertas",
    url: "https://agentic-system-01.netlify.app/.netlify/functions/api/alerts?limit=10",
    method: "GET"
  },
  {
    name: "Dashboard",
    url: "https://agentic-system-01.netlify.app/.netlify/functions/api/dashboard",
    method: "GET"
  },
  {
    name: "Estado Simulación",
    url: "https://agentic-system-01.netlify.app/.netlify/functions/api/simulation/status",
    method: "GET"
  },
  {
    name: "Inicializar Agentes",
    url: "https://agentic-system-01.netlify.app/.netlify/functions/api/agents/initialize",
    method: "POST"
  },
  {
    name: "Iniciar Simulación",
    url: "https://agentic-system-01.netlify.app/.netlify/functions/api/simulation/start",
    method: "POST"
  }
];

async function testNetlifyFunctions() {
  console.log("🌐 Probando Netlify Functions...\n");
  
  for (const test of testUrls) {
    try {
      const response = await fetch(test.url, { 
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${test.name}: OK (${response.status})`);
        if (test.name === "Agentes" && data.success && Array.isArray(data.data)) {
          console.log(`   📊 ${data.data.length} agentes encontrados`);
        } else if (test.name === "Alertas" && data.success && Array.isArray(data.data)) {
          console.log(`   🚨 ${data.data.length} alertas encontradas`);
        } else if (test.name === "Dashboard" && data.success && data.data) {
          const stats = data.data;
          console.log(`   📈 Agentes: ${stats.agents?.total || 0}, Alertas: ${stats.alerts?.total || 0}`);
        }
      } else {
        console.log(`❌ ${test.name}: Error ${response.status}`);
        console.log(`   Error: ${data.error || data.message || 'Desconocido'}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Exception`);
      console.log(`   Error: ${error.message}`);
    }
  }
  
  console.log("\n🎯 Test completado!");
  console.log("Si todos muestran ✅, la simulación debería funcionar.");
}

// Solo ejecutar si estamos en un entorno que soporte fetch
if (typeof fetch !== 'undefined') {
  testNetlifyFunctions();
} else {
  console.log("Este script requiere un entorno con fetch (navegador o Node.js 18+)");
}
