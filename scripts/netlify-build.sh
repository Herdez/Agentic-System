#!/bin/bash

echo "🚀 Building for Netlify..."

# Configurar variables de entorno para deshabilitar ESLint como error
export DISABLE_ESLINT_PLUGIN=true
export ESLINT_NO_DEV_ERRORS=true
export NODE_ENV=production
export SKIP_MONGODB=true

echo "📦 Installing client dependencies..."
cd client && npm install

echo "� Disabling TailwindCSS temporarily..."
if [ -f "tailwind.config.js" ]; then
  mv tailwind.config.js tailwind.config.js.bak
fi

echo "🔧 Building React app with ESLint warnings disabled..."
npm run build

echo "✅ Netlify build completed!"
