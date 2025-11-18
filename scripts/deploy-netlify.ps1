# 🚀 Script de Deploy para Netlify (Windows PowerShell)

Write-Host "🌐 Preparando deploy para Netlify..." -ForegroundColor Cyan

# Verificar que estamos en el directorio correcto
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Ejecuta desde el directorio raíz del proyecto." -ForegroundColor Red
    exit 1
}

# Verificar archivos críticos para Netlify
Write-Host "🔍 Verificando archivos críticos para Netlify..." -ForegroundColor Yellow

$requiredFiles = @(
    "netlify.toml",
    "netlify/functions/api.js",
    "netlify/functions/NetlifySimulationService.js",
    "client/package.json"
)

foreach ($file in $requiredFiles) {
    if (!(Test-Path $file)) {
        Write-Host "❌ Archivo faltante: $file" -ForegroundColor Red
        exit 1
    } else {
        Write-Host "✅ Encontrado: $file" -ForegroundColor Green
    }
}

# Instalar dependencias del cliente
Write-Host "📦 Instalando dependencias del cliente..." -ForegroundColor Yellow
Set-Location client

try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "Error instalando dependencias"
    }
    Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
} catch {
    Write-Host "❌ Error instalando dependencias del cliente" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Build del cliente
Write-Host "🏗️ Construyendo aplicación cliente..." -ForegroundColor Yellow

try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Error en build"
    }
    Write-Host "✅ Build completado" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en build del cliente" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

# Verificar que el build se creó correctamente
if (!(Test-Path "client/build")) {
    Write-Host "❌ Error: No se generó el directorio de build" -ForegroundColor Red
    exit 1
}

# Verificar archivos del build
$buildFiles = @(
    "client/build/index.html",
    "client/build/static"
)

foreach ($file in $buildFiles) {
    if (!(Test-Path $file)) {
        Write-Host "❌ Archivo de build faltante: $file" -ForegroundColor Red
        exit 1
    } else {
        Write-Host "✅ Build incluye: $file" -ForegroundColor Green
    }
}

# Verificar estructura de funciones Netlify
Write-Host "🔧 Verificando funciones Netlify..." -ForegroundColor Yellow

if (!(Test-Path "netlify/functions/api.js")) {
    Write-Host "❌ Función principal de API faltante" -ForegroundColor Red
    exit 1
}

# Test de sintaxis de las funciones
try {
    node -c "netlify/functions/api.js"
    if ($LASTEXITCODE -ne 0) {
        throw "Error de sintaxis en api.js"
    }
    
    node -c "netlify/functions/NetlifySimulationService.js"
    if ($LASTEXITCODE -ne 0) {
        throw "Error de sintaxis en NetlifySimulationService.js"
    }
    
    Write-Host "✅ Funciones Netlify verificadas" -ForegroundColor Green
} catch {
    Write-Host "❌ Error de sintaxis en las funciones" -ForegroundColor Red
    exit 1
}

# Mostrar resumen
Write-Host ""
Write-Host "🎉 ¡Deploy listo para Netlify!" -ForegroundColor Green
Write-Host "📁 Archivos listos:" -ForegroundColor Cyan
Write-Host "   - Frontend: client/build/" -ForegroundColor White
Write-Host "   - Functions: netlify/functions/" -ForegroundColor White
Write-Host "   - Config: netlify.toml" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Para deployar:" -ForegroundColor Cyan
Write-Host "   1. Conecta tu repositorio en Netlify" -ForegroundColor White
Write-Host "   2. Netlify detectará automáticamente la configuración" -ForegroundColor White
Write-Host "   3. El build se ejecutará usando scripts/netlify-build.sh" -ForegroundColor White
Write-Host ""
Write-Host "🌐 URLs después del deploy:" -ForegroundColor Cyan
Write-Host "   - Frontend: https://tu-app.netlify.app" -ForegroundColor White
Write-Host "   - API: https://tu-app.netlify.app/.netlify/functions/api" -ForegroundColor White
Write-Host ""
Write-Host "✅ Todo listo para Netlify!" -ForegroundColor Green

# Opcional: Abrir Netlify en el navegador
$response = Read-Host "¿Quieres abrir Netlify.com para hacer el deploy? (s/N)"
if ($response -eq "s" -or $response -eq "S" -or $response -eq "si" -or $response -eq "Si") {
    Start-Process "https://app.netlify.com/start"
}
