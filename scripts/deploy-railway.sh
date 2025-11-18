#!/bin/bash

# Script de despliegue para Railway

echo "🚀 Configurando despliegue en Railway..."

# Verificar Railway CLI
if ! command -v railway &> /dev/null; then
    echo "📦 Instalando Railway CLI..."
    npm install -g @railway/cli
fi

# Login a Railway
railway login

# Crear nuevo proyecto
railway init

# Configurar variables de entorno
echo "🔧 Configurando variables de entorno..."
railway variables set NODE_ENV=production
railway variables set PORT=5000
railway variables set JWT_SECRET=$(openssl rand -base64 32)

# MongoDB (opcional)
read -p "¿Quieres configurar MongoDB? (y/N): " setup_mongo
if [[ $setup_mongo == [Yy]* ]]; then
    read -p "URL de MongoDB: " mongo_uri
    railway variables set MONGODB_URI="$mongo_uri"
fi

# Configurar dominio personalizado (opcional)
read -p "¿Tienes un dominio personalizado? (y/N): " custom_domain
if [[ $custom_domain == [Yy]* ]]; then
    read -p "Dominio (ej: mi-app.com): " domain
    railway variables set CORS_ORIGINS="https://$domain,https://www.$domain"
fi

# Desplegar
echo "🚀 Desplegando aplicación..."
railway up

echo "✅ Despliegue completado!"
railway status
