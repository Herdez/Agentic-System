@echo off
cls
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║      🛡️  SISTEMA DE DEFENSA BLOCKCHAIN CON AGENTES AI  🛡️      ║
echo ║                                                               ║
echo ║           🤖 7 Agentes AI Autónomos                           ║
echo ║           ⚡ Tiempo Real con WebSocket                        ║
echo ║           🚀 React + Node.js + MongoDB                       ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Iniciando aplicación...
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado. Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar si npm está instalado
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm no está disponible. Por favor verifica la instalación de Node.js
    pause
    exit /b 1
)

echo ✅ Node.js y npm detectados
echo.

REM Instalar dependencias si no existen
if not exist "node_modules" (
    echo 📦 Instalando dependencias principales...
    npm install
)

if not exist "server\node_modules" (
    echo 📦 Instalando dependencias del servidor...
    cd server && npm install && cd ..
)

if not exist "client\node_modules" (
    echo 📦 Instalando dependencias del cliente...
    cd client && npm install && cd ..
)

echo.
echo ✅ Todas las dependencias están listas
echo.
echo 🚀 Iniciando Sistema de Defensa Blockchain...
echo.

REM Ejecutar el script de inicio
npm start

pause
