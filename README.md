# 🛡️ Sistema de Defensa Blockchain con Agentes AI

## 🎯 **OBJETIVO**
Desarrollar un sistema descentralizado de ciberseguridad para redes blockchain que utiliza 7 agentes AI autónomos especializados para proteger la infraestructura crítica en tiempo real. El sistema proporciona monitoreo continuo, detección proactiva de amenazas y respuesta automática ante incidentes de seguridad.

## 🔍 **CASO A RESOLVER**

### Problemática Principal:
Las redes blockchain enfrentan amenazas de ciberseguridad cada vez más sofisticadas que requieren respuesta inmediata y especializada. Los métodos tradicionales de seguridad son insuficientes para abordar:

1. **Ataques DDoS masivos** que pueden comprometer la disponibilidad de la red
2. **Intrusiones sofisticadas** que explotan vulnerabilidades del sistema
3. **Amenazas de día cero** que requieren detección basada en patrones de comportamiento
4. **Ataques coordinados** que necesitan respuesta multi-agente sincronizada
5. **Cumplimiento normativo** en entornos descentralizados complejos
6. **Recuperación ante desastres** en sistemas distribuidos críticos

### Solución Propuesta:
Sistema inteligente que combina IA, análisis de patrones y coordinación autónoma para crear una defensa adaptativa y proactiva.

## ✅ **ATRIBUTOS A CUMPLIR CON LA APLICACIÓN**

### 🚀 **Funcionales**
1. **Monitoreo en Tiempo Real**
   - Dashboard interactivo con métricas en vivo
   - Visualización geográfica de amenazas
   - Actualizaciones cada 5 segundos vía WebSocket/HTTP polling

2. **Sistema de Agentes AI Especializado**
   - 7 agentes autónomos con roles específicos
   - Coordinación automática entre agentes
   - Estados dinámicos: activo, investigando, respondiendo, escaneando, monitoreo, inactivo, mantenimiento

3. **Gestión Inteligente de Alertas**
   - Clasificación automática por severidad (crítica, alta, media, baja)
   - Notificaciones específicas con iconos distintivos
   - Seguimiento de resolución y métricas de respuesta

4. **Métricas de Seguridad Avanzadas**
   - Tasa de detección de amenazas: 70-100%
   - Falsos positivos: 0-5%
   - Eficiencia de respuesta: 84-100%
   - Tiempo de resolución: 20-70 minutos
   - Resiliencia del sistema: 92-100%

5. **Autenticación y Autorización**
   - Sistema JWT con roles (Admin, Analyst, Operator)
   - Credenciales por defecto para demo
   - Gestión de sesiones seguras

### 🔧 **No Funcionales**
1. **Rendimiento**
   - Tiempo de respuesta: 50-150ms
   - Throughput: 1000-2000 req/s
   - Disponibilidad: 99.81-99.99%
   - Escalabilidad horizontal

2. **Usabilidad**
   - Interfaz responsive para todos los dispositivos
   - Diseño intuitivo con TailwindCSS
   - Inicio con un solo comando (`npm start`)
   - Modo demo sin dependencias externas

3. **Compatibilidad**
   - Multiplataforma: Windows, macOS, Linux
   - Navegadores modernos
   - Node.js 18+, MongoDB 4.4+

4. **Mantenibilidad**
   - Arquitectura modular (MVC)
   - Código TypeScript tipado
   - Documentación completa
   - Testing automatizado

## ⚠️ **RESTRICCIONES**

### 🔒 **Técnicas**
1. **Dependencias del Sistema**
   - Node.js 18 o superior obligatorio
   - MongoDB opcional (modo demo disponible)
   - Puerto 3000/3001 para frontend
   - Puerto 5000 para backend API

2. **Recursos Computacionales**
   - RAM mínima: 2GB
   - Espacio en disco: 500MB
   - CPU: Procesador dual-core mínimo
   - Conexión a internet para APIs externas

3. **Compatibilidad de Navegadores**
   - Chrome 90+, Firefox 88+, Safari 14+
   - JavaScript habilitado obligatorio
   - WebSocket support requerido para tiempo real

### 🌐 **De Despliegue**
1. **Limitaciones de Plataforma**
   - Netlify: Sin WebSockets (usa HTTP polling)
   - Heroku: Sleep mode en plan gratuito
   - Vercel: Límites de función serverless
   - Railway: Límites de CPU/memoria

2. **Configuración de Red**
   - CORS configurado para desarrollo local
   - Puertos automáticamente detectados
   - Variables de entorno requeridas para producción

### 📋 **Operacionales**
1. **Modo Demo**
   - Funciona sin MongoDB real
   - Datos simulados con algoritmos determinísticos
   - No persiste información entre sesiones

2. **Seguridad**
   - JWT_SECRET debe configurarse para producción
   - HTTPS requerido para entornos productivos
   - Rate limiting configurado (100 req/15min)

3. **Escalabilidad**
   - Máximo 7 agentes por instancia
   - Base de datos compartida en cluster
   - Load balancing manual requerido

### 🔧 **De Desarrollo**
1. **Stack Tecnológico Fijo**
   - Frontend: React 18 + TypeScript
   - Backend: Node.js + Express
   - Base de datos: MongoDB
   - No compatible con otras bases de datos

2. **APIs Externas**
   - VirusTotal API (opcional)
   - Shodan API (opcional)
   - Limitaciones de rate limiting de terceros

Sistema descentralizado de defensa para redes blockchain con 7 agentes AI autónomos que trabajan colaborativamente para proteger la infraestructura.

## 🚀 INICIO RÁPIDO - UNA SOLA INSTRUCCIÓN

### ⚡ Comando Único (Recomendado)
```bash
npm start
```

### Opciones Alternativas
```bash
# Script directo
node start.js

# Windows Batch (Solo Windows)
start.bat
```

**¡Eso es todo!** El sistema:
- ✅ Instala automáticamente las dependencias faltantes
- ✅ Detecta puertos disponibles automáticamente
- ✅ Inicia backend y frontend simultáneamente
- ✅ Abre el navegador automáticamente
- ✅ Funciona en modo demo sin MongoDB

## 🌐 Acceso a la Aplicación

Una vez iniciado, accede a:
- 🎨 **Frontend**: http://localhost:3001
- 🖥️ **Backend API**: http://localhost:5000/api
- 💊 **Health Check**: http://localhost:5000/api/health

## 🌟 Características

### 🤖 Agentes AI Implementados

1. **🔍 Detector de Intrusos Alpha** - Monitoreo continuo de patrones de intrusión
2. **⚡ Coordinador de Respuesta Beta** - Respuesta automática ante incidentes
3. **🔍 Analizador de Vulnerabilidades Gamma** - Evaluación de código y configuraciones
4. **🕵️ Intel de Amenazas Delta** - Recopilación de inteligencia externa
5. **🎯 Coordinador de Defensa Epsilon** - Estrategia defensiva maestra
6. **📋 Auditor de Cumplimiento Zeta** - Verificación de políticas
7. **🔧 Especialista en Recuperación Eta** - Resiliencia y continuidad

### ✨ Funcionalidades Principales

- 📊 **Dashboard en Tiempo Real** - Monitoreo visual con WebSocket
- 🚨 **Sistema de Alertas Inteligentes** - Clasificación automática por severidad
- 🗺️ **Visualización de Amenazas** - Mapas geográficos y topología de red
- 📈 **Métricas y Análisis** - Estadísticas detalladas de rendimiento
- 🔐 **Autenticación Segura** - JWT con roles y permisos
- 📱 **Responsive Design** - Interfaz optimizada para todos los dispositivos

## 🚀 Instalación y Configuración

### Prerequisitos

- **Node.js** 18+ 
- **MongoDB** 4.4+
- **npm** 8+

### 1. Instalación Rápida

```bash
# Clonar el repositorio
git clone <repository-url>
cd blockchain-defense-system

# Instalar todas las dependencias
npm run install:all

# Configurar variables de entorno
cp server/.env.example server/.env
# Edita server/.env con tus configuraciones
```

### 2. Configuración de Base de Datos

```bash
# Opción 1: MongoDB local
brew install mongodb-community
brew services start mongodb-community

# Opción 2: Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Opción 3: MongoDB Atlas (recomendado para producción)
# Actualiza MONGODB_URI en server/.env
```

### 3. Variables de Entorno

Crea `server/.env` basado en `server/.env.example`:

```bash
# Base de datos
MONGODB_URI=mongodb://localhost:27017/blockchain-defense

# Configuración del servidor
PORT=5000
NODE_ENV=development

# JWT Secret (generar uno seguro para producción)
JWT_SECRET=tu-clave-super-secreta-jwt

# URL del cliente
CLIENT_URL=http://localhost:3000
```

## 🎮 Ejecución

### Desarrollo

```bash
# Ejecutar backend y frontend simultáneamente
npm run dev

# O ejecutar individualmente:
npm run server:dev  # Backend en puerto 5000
npm run client:dev  # Frontend en puerto 3000
```

### Producción

```bash
# Construir frontend
npm run build

# Ejecutar servidor
npm start
```

### Docker (Opcional)

```bash
# Levantar todo el stack
npm run docker:up

# Detener servicios
npm run docker:down
```

## 🔗 Acceso a la Aplicación

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

### Credenciales por Defecto

```
Admin:
- Usuario: admin
- Contraseña: admin123

Analyst:
- Usuario: analyst 
- Contraseña: analyst123

Operator:
- Usuario: operator
- Contraseña: operator123
```

## 📚 Estructura del Proyecto

```
blockchain-defense-system/
├── 📁 server/                    # Backend Node.js
│   ├── 📄 app.js                 # Servidor principal
│   ├── 📁 models/                # Modelos MongoDB
│   ├── 📁 routes/                # Rutas de API
│   ├── 📁 services/              # Lógica de negocio
│   └── 📁 middleware/            # Middleware personalizado
├── 📁 client/                    # Frontend React
│   ├── 📁 src/
│   │   ├── 📁 components/        # Componentes React
│   │   ├── 📁 pages/             # Páginas principales
│   │   ├── 📁 contexts/          # Context providers
│   │   ├── 📁 services/          # APIs y servicios
│   │   └── 📁 types/             # Tipos TypeScript
│   ├── 📄 package.json
│   └── 📄 tailwind.config.js
├── 📄 package.json               # Configuración principal
├── 📄 docker-compose.yml         # Configuración Docker
└── 📄 README.md                  # Este archivo
```

## 🛠️ APIs Principales

### Agentes
- `GET /api/agents` - Listar agentes
- `PUT /api/agents/:id/action` - Ejecutar acción en agente
- `GET /api/agents/stats/overview` - Estadísticas del sistema

### Alertas
- `GET /api/alerts` - Alertas recientes
- `GET /api/alerts/critical` - Alertas críticas
- `POST /api/alerts` - Crear nueva alerta
- `PUT /api/alerts/:id/resolve` - Resolver alerta

### Inteligencia de Amenazas
- `GET /api/threats` - Lista de amenazas
- `POST /api/threats/search` - Buscar amenazas
- `GET /api/threats/stats/overview` - Estadísticas

### Dashboard
- `GET /api/dashboard` - Datos completos del dashboard
- `GET /api/dashboard/realtime` - Datos en tiempo real
- `GET /api/dashboard/network-topology` - Topología de red

## 🧪 Testing y Desarrollo

### Testing

```bash
# Tests del backend
cd server && npm test

# Tests del frontend
cd client && npm test

# Coverage
cd server && npm run test:coverage
```

### Desarrollo

```bash
# Linting
cd client && npm run lint
cd server && npm run lint

# Formateo de código
cd client && npm run format
cd server && npm run format
```

## 🔧 Configuración Avanzada

### Variables de Entorno Completas

```bash
# Producción
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/blockchain-defense

# Seguridad
JWT_SECRET=super-secret-key-for-production
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Notificaciones
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Webhooks
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/WEBHOOK

# APIs Externas
VIRUSTOTAL_API_KEY=your-virustotal-key
SHODAN_API_KEY=your-shodan-key
```

### Personalización

1. **Nuevos Agentes:** Modificar `server/services/AgentService.js`
2. **Alertas Personalizadas:** Extender `server/models/Alert.js`
3. **Temas UI:** Actualizar `client/tailwind.config.js`
4. **Métricas:** Agregar en `server/routes/dashboard.js`

## 📊 Monitoreo y Logs

### Health Checks

```bash
curl http://localhost:5000/api/health
```

### Logs

```bash
# Logs del servidor
tail -f server/logs/app.log

# Logs de Docker
docker-compose logs -f
```

### Métricas

- Uptime del sistema
- Transacciones por segundo
- Latencia de red
- Amenazas detectadas
- Tiempo de respuesta de agentes

## 🚀 Despliegue

### 🌐 Netlify (Recomendado para Demos)

✅ **Deploy más fácil** - Sin configuración de servidor
✅ **Gratis** - Hasta 100GB de ancho de banda
✅ **HTTPS automático** - SSL incluido
✅ **Deploy desde Git** - Actualización automática

```bash
# Preparar para Netlify
scripts/deploy-netlify.ps1  # Windows
./scripts/deploy-netlify.sh  # Linux/Mac

# Luego en Netlify.com:
# 1. Conectar repositorio
# 2. Deploy automático
```

📚 [Guía Completa de Netlify](NETLIFY-DEPLOY.md)

### 🚀 Heroku

```bash
# Configurar Heroku
heroku create blockchain-defense-app
heroku addons:create mongolab:sandbox

# Variables de entorno
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-secret

# Deploy
git push heroku main
```

### 🚂 Railway

```bash
# Deploy directo
npm run deploy:railway
```

### ▲ Vercel

```bash
# Deploy directo
npm run deploy:vercel
```

### 🐳 Docker

```bash
# Construir imagen
docker build -t blockchain-defense .

# Ejecutar
docker run -p 5000:5000 -e MONGODB_URI=your-uri blockchain-defense
```

### 🗂️ Todas las Opciones

| Plataforma | Comando | Tiempo Setup | Costo | WebSockets |
|------------|---------|--------------|-------|------------|
| **Netlify** | `scripts/deploy-netlify.ps1` | 2 min | Gratis | ❌ |
| **Heroku** | `npm run deploy:heroku` | 5 min | $5/mes | ✅ |
| **Railway** | `npm run deploy:railway` | 3 min | $5/mes | ✅ |
| **Vercel** | `npm run deploy:vercel` | 2 min | Gratis | ❌ |
| **Docker** | `npm run docker:up` | 1 min | Variable | ✅ |

📋 [Guía Completa de Despliegue](DEPLOYMENT.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

¿Problemas o preguntas?

1. Revisa la [documentación](#-instalación-y-configuración)
2. Busca en [Issues](../../issues)
3. Crea un [nuevo issue](../../issues/new)

## 🌟 Roadmap

- [ ] Integración con APIs de threat intelligence externas
- [ ] Machine Learning para detección predictiva
- [ ] Dashboard móvil nativo
- [ ] Integración con Slack/Discord
- [ ] Análisis forense automatizado
- [ ] Backup automático y disaster recovery

## 🔄 Cambios Recientes

### v2.1.0 - Sistema Siempre Activo
- ✅ **Eliminación de controles manuales**: El sistema de defensa ahora permanece siempre activo
- ✅ **Interfaz simplificada**: Removidos botones de iniciar/pausar/reiniciar simulación
- ✅ **Estabilidad mejorada**: Reducido el problema de activación/desactivación automática
- ✅ **UI optimizada**: Dashboard centrado en métricas y estado del sistema
- ✅ **Experiencia mejorada**: Sin necesidad de intervención manual para mantener la simulación

### Cambios en Componentes:
- **SimulationControl.tsx**: Transformado de panel de control a dashboard de estado
- **Sistema de agentes**: Configurado para auto-inicialización y persistencia
- **Polling optimizado**: Reducido a 20 segundos para mayor estabilidad
- **Estado forzado**: La simulación siempre aparece como "SIEMPRE ACTIVO"

---

**Desarrollado con ❤️ para la seguridad blockchain**

[![Made with Node.js](https://img.shields.io/badge/Made%20with-Node.js-green)](https://nodejs.org/)
[![Made with React](https://img.shields.io/badge/Made%20with-React-blue)](https://reactjs.org/)
[![Made with TypeScript](https://img.shields.io/badge/Made%20with-TypeScript-blue)](https://www.typescriptlang.org/)
[![Made with TailwindCSS](https://img.shields.io/badge/Made%20with-TailwindCSS-blueviolet)](https://tailwindcss.com/)
