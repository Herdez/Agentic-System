# 🔧 Debugging: URLs de Netlify Functions

## 🌐 URLs que Deberían Funcionar Ahora

### ✅ **Health Check**
```bash
curl https://agentic-system-01.netlify.app/.netlify/functions/api/health
```

### 🤖 **Agentes**
```bash
curl https://agentic-system-01.netlify.app/.netlify/functions/api/agents
```

### 🚨 **Alertas**
```bash
# Todas las alertas
curl https://agentic-system-01.netlify.app/.netlify/functions/api/alerts

# Primeras 10 alertas
curl "https://agentic-system-01.netlify.app/.netlify/functions/api/alerts?limit=10"
```

### 📊 **Dashboard/Estadísticas**
```bash
curl https://agentic-system-01.netlify.app/.netlify/functions/api/dashboard
```

### 🎮 **Simulación**
```bash
# Estado
curl https://agentic-system-01.netlify.app/.netlify/functions/api/simulation/status

# Inicializar agentes
curl -X POST https://agentic-system-01.netlify.app/.netlify/functions/api/agents/initialize

# Controlar simulación
curl -X POST https://agentic-system-01.netlify.app/.netlify/functions/api/simulation/start
curl -X POST https://agentic-system-01.netlify.app/.netlify/functions/api/simulation/stop
curl -X POST https://agentic-system-01.netlify.app/.netlify/functions/api/simulation/restart
```

---

## 🔍 **Problema Anterior:**
- ❌ URLs tenían doble prefijo: `/.netlify/functions/api/api/dashboard`
- ❌ Esto causaba 404 porque la ruta no existía

## ✅ **Solución Aplicada:**
- ✅ Removidos prefijos `/api/` de todas las rutas en `netlify/functions/api.js`
- ✅ Ahora las URLs son: `/.netlify/functions/api/dashboard`
- ✅ Agregado soporte para query parameters (`?limit=50`)

---

## 🎯 **Resultado Esperado:**
- ✅ Dashboard carga datos correctamente
- ✅ Agentes visibles en tiempo real
- ✅ Alertas dinámicas cada 10 segundos
- ✅ Botón "Iniciar Simulación" funciona
- ✅ Sin errores 404 en la consola

---

## 🚀 **Para Verificar:**

1. **Esperar 2-3 minutos** para que Netlify haga deploy automático
2. **Abrir** https://agentic-system-01.netlify.app
3. **Verificar consola** - no debería haber errores 404
4. **Probar botón "Iniciar Simulación"**
5. **Ver datos del dashboard actualizándose**

¡La simulación debería funcionar perfectamente ahora! 🎉
