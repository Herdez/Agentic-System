#!/bin/bash

# 🚀 Script de Deploy para Netlify
echo "🌐 Preparando deploy para Netlify..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Ejecuta desde el directorio raíz del proyecto."
    exit 1
fi

# Verificar archivos críticos para Netlify
echo "🔍 Verificando archivos críticos para Netlify..."

required_files=(
    "netlify.toml"
    "netlify/functions/api.js"
    "netlify/functions/NetlifySimulationService.js"
    "client/package.json"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Archivo faltante: $file"
        exit 1
    else
        echo "✅ Encontrado: $file"
    fi
done

# Instalar dependencias del cliente
echo "📦 Instalando dependencias del cliente..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias del cliente"
    exit 1
fi

# Build del cliente
echo "🏗️ Construyendo aplicación cliente..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error en build del cliente"
    exit 1
fi

cd ..

# Verificar que el build se creó correctamente
if [ ! -d "client/build" ]; then
    echo "❌ Error: No se generó el directorio de build"
    exit 1
fi

echo "✅ Build del cliente completado"

# Verificar archivos del build
build_files=(
    "client/build/index.html"
    "client/build/static"
)

for file in "${build_files[@]}"; do
    if [ ! -e "$file" ]; then
        echo "❌ Archivo de build faltante: $file"
        exit 1
    else
        echo "✅ Build incluye: $file"
    fi
done

# Verificar estructura de funciones Netlify
echo "🔧 Verificando funciones Netlify..."
if [ ! -f "netlify/functions/api.js" ]; then
    echo "❌ Función principal de API faltante"
    exit 1
fi

# Test de sintaxis de las funciones
node -c netlify/functions/api.js
if [ $? -ne 0 ]; then
    echo "❌ Error de sintaxis en api.js"
    exit 1
fi

node -c netlify/functions/NetlifySimulationService.js
if [ $? -ne 0 ]; then
    echo "❌ Error de sintaxis en NetlifySimulationService.js"
    exit 1
fi

echo "✅ Funciones Netlify verificadas"

# Mostrar resumen
echo ""
echo "🎉 ¡Deploy listo para Netlify!"
echo "📁 Archivos listos:"
echo "   - Frontend: client/build/"
echo "   - Functions: netlify/functions/"
echo "   - Config: netlify.toml"
echo ""
echo "🚀 Para deployar:"
echo "   1. Conecta tu repositorio en Netlify"
echo "   2. Netlify detectará automáticamente la configuración"
echo "   3. El build se ejecutará usando scripts/netlify-build.sh"
echo ""
echo "🌐 URLs después del deploy:"
echo "   - Frontend: https://tu-app.netlify.app"
echo "   - API: https://tu-app.netlify.app/.netlify/functions/api"
echo ""
echo "✅ Todo listo para Netlify!"
