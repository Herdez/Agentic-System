# Multi-stage build para optimizar el tamaño de la imagen

# Etapa 1: Build del frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/client

# Copiar package.json del cliente
COPY client/package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente del cliente
COPY client/ ./

# Construir la aplicación React
RUN npm run build

# Etapa 2: Preparar backend
FROM node:18-alpine AS backend-builder

WORKDIR /app

# Copiar package.json del root
COPY package*.json ./

# Instalar dependencias del root
RUN npm ci --only=production

# Copiar package.json del servidor
COPY server/package*.json ./server/

WORKDIR /app/server

# Instalar dependencias del servidor
RUN npm ci --only=production

# Etapa 3: Imagen final
FROM node:18-alpine AS production

WORKDIR /app

# Instalar dumb-init para manejo de señales
RUN apk add --no-cache dumb-init

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copiar dependencias del root
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/package*.json ./

# Copiar servidor y sus dependencias
COPY --from=backend-builder /app/server ./server

# Copiar archivos de configuración
COPY production-server.js ./
COPY .env.production ./

# Copiar build del frontend
COPY --from=frontend-builder /app/client/build ./client/build

# Cambiar ownership a usuario no-root
RUN chown -R nextjs:nodejs /app
USER nextjs

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=5000

# Exponer puerto
EXPOSE 5000

# Comando de inicio usando dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "production-server.js"]
