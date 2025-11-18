# 🚀 Guía Completa de Despliegue Online

## 📋 Tabla de Contenidos

1. [Preparación](#preparación)
2. [Heroku (Recomendado para principiantes)](#heroku)
3. [Railway (Moderno y simple)](#railway)
4. [Vercel (Frontend + Serverless)](#vercel)
5. [Netlify (Static + Functions)](#netlify)
6. [VPS/Servidor Propio](#vps-servidor-propio)
7. [Docker](#docker)
8. [Variables de Entorno](#variables-de-entorno)
9. [Base de Datos](#base-de-datos)
10. [Monitoreo](#monitoreo)

---

## 🛠️ Preparación

Antes de desplegar, asegúrate de tener:

```bash
# 1. Build de producción
npm run build:production

# 2. Test (si tienes tests)
npm test

# 3. Variables de entorno configuradas
cp .env.production .env
# Edita .env con tus valores
```

---

## 🟢 Heroku (Recomendado para principiantes)

### Método Automático:
```bash
chmod +x scripts/deploy-heroku.sh
./scripts/deploy-heroku.sh
```

### Método Manual:

1. **Instalar Heroku CLI**
   ```bash
   # Windows
   winget install Heroku.HerokuCLI
   
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Linux
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Login y crear app**
   ```bash
   heroku login
   heroku create tu-app-name
   ```

3. **Configurar variables de entorno**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET="tu-clave-secreta"
   heroku config:set MONGODB_URI="tu-mongodb-uri"
   ```

4. **Desplegar**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

5. **URL de tu app**: `https://tu-app-name.herokuapp.com`

---

## 🚄 Railway (Moderno y simple)

### Método Automático:
```bash
chmod +x scripts/deploy-railway.sh
./scripts/deploy-railway.sh
```

### Método Manual:

1. **Instalar Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Setup**
   ```bash
   railway login
   railway init
   ```

3. **Configurar variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set PORT=5000
   railway variables set JWT_SECRET="tu-clave"
   ```

4. **Desplegar**
   ```bash
   railway up
   ```

---

## ▲ Vercel (Frontend + Serverless)

1. **Instalar Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Configurar para fullstack**
   ```bash
   vercel login
   vercel
   # Seguir instrucciones
   ```

3. **Variables de entorno en Vercel**
   - Ve a tu proyecto en vercel.com
   - Settings > Environment Variables
   - Agregar variables necesarias

---

## 🔶 Netlify (Static + Functions)

1. **Build optimizado para Netlify**
   ```bash
   npm run build:netlify
   ```

2. **Deploy vía Git**
   - Conectar repo en netlify.com
   - Build command: `npm run build:netlify`
   - Publish directory: `client/build`

3. **Deploy manual**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --dir=client/build
   ```

---

## 🖥️ VPS/Servidor Propio

1. **Conectar a servidor**
   ```bash
   ssh usuario@tu-servidor.com
   ```

2. **Instalar dependencias**
   ```bash
   # Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # PM2 para gestión de procesos
   npm install -g pm2
   
   # Nginx (opcional)
   sudo apt update && sudo apt install nginx
   ```

3. **Clonar y setup**
   ```bash
   git clone tu-repositorio.git
   cd tu-proyecto
   npm run build:production
   ```

4. **Configurar PM2**
   ```bash
   pm2 start production-server.js --name "blockchain-defense"
   pm2 startup
   pm2 save
   ```

5. **Configurar Nginx (opcional)**
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/blockchain-defense
   sudo ln -s /etc/nginx/sites-available/blockchain-defense /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

---

## 🐳 Docker

### Build local:
```bash
chmod +x scripts/build-docker.sh
./scripts/build-docker.sh
```

### Docker Compose (producción):
```bash
docker-compose -f docker-compose.production.yml up -d
```

### Deploy con Docker:
```bash
# Build y push
docker build -t tu-usuario/blockchain-defense .
docker push tu-usuario/blockchain-defense

# En servidor de producción
docker pull tu-usuario/blockchain-defense
docker run -d -p 80:5000 \
  -e NODE_ENV=production \
  -e MONGODB_URI="tu-mongo-uri" \
  tu-usuario/blockchain-defense
```

---

## 🔐 Variables de Entorno

### Principales variables:

```bash
# Obligatorias
NODE_ENV=production
PORT=5000
JWT_SECRET=tu-clave-secreta-super-segura

# Base de datos (opcional - funciona sin MongoDB)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# CORS (para custom domain)
CORS_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com

# Frontend URLs (auto-detecta en producción)
REACT_APP_API_URL=https://tu-dominio.com/api
REACT_APP_SOCKET_URL=https://tu-dominio.com
```

### Por plataforma:

**Heroku:**
```bash
heroku config:set VARIABLE=valor
```

**Railway:**
```bash
railway variables set VARIABLE=valor
```

**Vercel:**
- Dashboard > Settings > Environment Variables

**Netlify:**
- Dashboard > Site Settings > Environment Variables

---

## 🗄️ Base de Datos

### MongoDB Atlas (Recomendado):

1. **Crear cuenta**: mongodb.com/atlas
2. **Crear cluster gratuito**
3. **Configurar usuario y whitelist IP**
4. **Obtener connection string**
5. **Configurar variable**: `MONGODB_URI=mongodb+srv://...`

### Sin base de datos:
La aplicación funciona en **modo demo** sin MongoDB, perfect para pruebas.

---

## 📊 Monitoreo

### URLs importantes después del deploy:

- **App**: `https://tu-dominio.com`
- **API**: `https://tu-dominio.com/api`
- **Health**: `https://tu-dominio.com/api/health`
- **Dashboard**: `https://tu-dominio.com/dashboard`

### Herramientas de monitoreo:

- **Logs Heroku**: `heroku logs --tail`
- **Railway**: `railway logs`
- **Uptime**: UptimeRobot, StatusCake
- **Performance**: New Relic, DataDog

---

## 🎯 Comandos Rápidos

```bash
# Test local de producción
npm run start:production

# Build para producción
npm run build:production

# Docker local
docker-compose -f docker-compose.production.yml up

# Logs Heroku
heroku logs --tail -a tu-app

# Restart Heroku
heroku restart -a tu-app

# Railway logs
railway logs

# Railway restart
railway restart
```

---

## ✅ Checklist de Despliegue

- [ ] Variables de entorno configuradas
- [ ] Build de producción exitoso
- [ ] URLs de API configuradas correctamente
- [ ] CORS configurado para dominio de producción
- [ ] Base de datos configurada (opcional)
- [ ] SSL/HTTPS habilitado
- [ ] Health check responde correctamente
- [ ] WebSocket funciona en producción
- [ ] Agentes AI activos en modo demo
- [ ] Frontend se carga correctamente

---

## 🆘 Problemas Comunes

### Error de CORS:
```bash
# Configurar CORS_ORIGINS
CORS_ORIGINS=https://tu-dominio.com
```

### WebSocket no funciona:
- Verificar que el proveedor soporte WebSocket
- Railway y Heroku sí soportan
- Netlify Functions tiene limitaciones

### App no inicia:
```bash
# Revisar logs
heroku logs --tail

# Verificar variables
heroku config

# Verificar health endpoint
curl https://tu-app.herokuapp.com/api/health
```

### Build falla:
```bash
# Limpiar cache
npm cache clean --force
rm -rf node_modules
npm install

# Build local
npm run build:production
```

¡Listo! Tu aplicación estará online y funcionando 🚀
