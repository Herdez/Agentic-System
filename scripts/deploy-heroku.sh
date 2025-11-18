#!/bin/bash

# Script de despliegue para Heroku

echo "🚀 Configurando despliegue en Heroku..."

# Verificar Heroku CLI
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI no está instalado. Instálalo desde: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Preguntar por el nombre de la app
read -p "Nombre de la aplicación en Heroku: " app_name

# Crear aplicación si no existe
heroku apps:info $app_name &> /dev/null || heroku create $app_name

# Configurar variables de entorno
echo "🔧 Configurando variables de entorno..."
heroku config:set NODE_ENV=production -a $app_name
heroku config:set JWT_SECRET=$(openssl rand -base64 32) -a $app_name

# MongoDB Atlas (opcional)
read -p "¿Quieres configurar MongoDB Atlas? (y/N): " setup_mongo
if [[ $setup_mongo == [Yy]* ]]; then
    read -p "URL de MongoDB Atlas: " mongo_uri
    heroku config:set MONGODB_URI="$mongo_uri" -a $app_name
fi

# Configurar add-ons
echo "📦 Configurando add-ons..."
# heroku addons:create mongolab:sandbox -a $app_name  # MongoDB gratuito
# heroku addons:create papertrail:choklad -a $app_name  # Logs

# Configurar dominio personalizado (opcional)
read -p "¿Tienes un dominio personalizado? (y/N): " custom_domain
if [[ $custom_domain == [Yy]* ]]; then
    read -p "Dominio (ej: mi-app.com): " domain
    heroku domains:add $domain -a $app_name
    heroku config:set CORS_ORIGINS="https://$domain,https://www.$domain" -a $app_name
fi

# Desplegar
echo "🚀 Desplegando aplicación..."
git add .
git commit -m "Deploy to Heroku" || echo "No changes to commit"
heroku git:remote -a $app_name
git push heroku main

# Mostrar información
echo "✅ Despliegue completado!"
echo "🌍 URL: https://$app_name.herokuapp.com"
heroku open -a $app_name
