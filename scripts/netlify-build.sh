#!/bin/bash

echo "🚀 Building for Netlify..."

# Configurar variables de entorno para deshabilitar ESLint como error
export DISABLE_ESLINT_PLUGIN=true
export ESLINT_NO_DEV_ERRORS=true
export NODE_ENV=production

echo "📦 Installing client dependencies..."
cd client && npm install

echo "🔧 Building React app with ESLint warnings disabled..."
npm run build

echo "✅ Netlify build completed!"
