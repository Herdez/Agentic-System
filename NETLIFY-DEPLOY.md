# 🌐 Despliegue en Netlify

## 🎯 Configuración Específica para Netlify

### ✅ Archivos Configurados
- `netlify.toml` - Configuración principal de Netlify
- `netlify/functions/api.js` - Función serverless principal
- `netlify/functions/NetlifySimulationService.js` - Simulación stateless
- `scripts/netlify-build.sh` - Script de build personalizado

### 🔄 Simulación Stateless

**Problema Original**: El `DemoSimulationService` mantiene estado en memoria, pero las funciones de Netlify son stateless.

**Solución**: `NetlifySimulationService` genera datos dinámicos basados en timestamp:
- ✅ Agentes con actividad variable
- ✅ Alertas que cambian cada minuto  
- ✅ Estadísticas del sistema dinámicas
- ✅ Compatible con arquitectura serverless

### 🚀 Cómo Deployar

#### Opción 1: Deploy Automático (Recomendado)
1. Conecta tu repositorio GitHub a Netlify
2. Netlify detectará automáticamente `netlify.toml`
3. El build se ejecutará automáticamente

#### Opción 2: Deploy Manual
```bash
# Preparar el proyecto
./scripts/deploy-netlify.sh

# Usar Netlify CLI
npm install -g netlify-cli
netlify deploy --prod
```

#### Opción 3: Drag & Drop
1. Ejecuta `./scripts/deploy-netlify.sh`
2. Arrastra la carpeta `client/build` a Netlify
3. Configura las funciones manualmente

### 🔧 Configuración de Netlify

**Build Settings:**
- Build command: `chmod +x scripts/netlify-build.sh && scripts/netlify-build.sh`
- Publish directory: `client/build`
- Functions directory: `netlify/functions`

**Environment Variables:**
```
NODE_VERSION=20
NPM_FLAGS=--production=false
```

### 🌐 URLs Después del Deploy

- **Frontend**: `https://tu-app.netlify.app`
- **API Health**: `https://tu-app.netlify.app/.netlify/functions/api/health`
- **Agentes**: `https://tu-app.netlify.app/.netlify/functions/api/agents`
- **Alertas**: `https://tu-app.netlify.app/.netlify/functions/api/alerts`
- **Simulación**: `https://tu-app.netlify.app/.netlify/functions/api/simulation/status`

### 📊 Funciones Disponibles

#### GET Endpoints
- `/.netlify/functions/api/health` - Estado del sistema
- `/.netlify/functions/api/agents` - Lista de agentes
- `/.netlify/functions/api/alerts` - Lista de alertas
- `/.netlify/functions/api/simulation/status` - Estado de simulación
- `/.netlify/functions/api/dashboard` - Estadísticas del dashboard

#### POST Endpoints
- `/.netlify/functions/api/agents/initialize` - Inicializar agentes
- `/.netlify/functions/api/simulation/start` - Iniciar simulación
- `/.netlify/functions/api/simulation/stop` - Detener simulación
- `/.netlify/functions/api/simulation/restart` - Reiniciar simulación

### 🔍 Debugging en Netlify

#### Ver Logs de Functions
1. Ve a tu sitio en Netlify Dashboard
2. Functions tab > Ver logs en tiempo real
3. Los errores aparecerán aquí

#### Test Local de Functions
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Ejecutar en modo dev
netlify dev

# La app estará en http://localhost:8888
# Functions en http://localhost:8888/.netlify/functions/api
```

#### Test de Endpoints
```bash
# Health check
curl https://tu-app.netlify.app/.netlify/functions/api/health

# Agentes
curl https://tu-app.netlify.app/.netlify/functions/api/agents

# Status de simulación
curl https://tu-app.netlify.app/.netlify/functions/api/simulation/status
```

### ⚡ Diferencias con Otros Deployments

| Característica | Netlify | Heroku/Railway | Docker/VPS |
|----------------|---------|----------------|------------|
| **Arquitectura** | Serverless | Servidor persistente | Servidor persistente |
| **Estado** | Stateless | Stateful | Stateful |
| **Simulación** | Basada en timestamp | Procesos en background | Procesos en background |
| **WebSockets** | ❌ No soportado | ✅ Soportado | ✅ Soportado |
| **Tiempo real** | Polling/HTTP | WebSocket/SSE | WebSocket/SSE |
| **Costos** | Gratis hasta límites | Desde $5/mes | Variable |

### 🚨 Limitaciones de Netlify

1. **No WebSockets**: Usa polling para actualizaciones
2. **Functions Timeout**: 10 segundos máximo
3. **No Estado Persistente**: Cada request es independiente
4. **Cold Starts**: Puede haber latencia inicial

### ✅ Ventajas de Netlify

1. **Deploy Automático**: Desde Git
2. **CDN Global**: Carga rápida mundial
3. **HTTPS Automático**: SSL incluido
4. **Preview Deployments**: Para cada PR
5. **Rollbacks**: Fácil revertir cambios

### 🔄 Actualización del Frontend

Para que el frontend funcione correctamente con Netlify, asegúrate de que:

1. Las URLs de API apunten a `/.netlify/functions/api`
2. Se use polling en lugar de WebSockets
3. Se manejen los cold starts apropiadamente

### 📱 Monitoreo

- **Analytics**: Netlify Analytics incluido
- **Functions**: Logs en tiempo real
- **Performance**: Core Web Vitals automático
- **Uptime**: 99.9% SLA

---

## 🎉 ¡Tu Simulación de Defensa Blockchain está Lista en Netlify!

La simulación funcionará de manera stateless, generando datos dinámicos en cada request. Esto es perfecto para demos y desarrollo, manteniendo toda la funcionalidad visual sin necesidad de estado persistente.
