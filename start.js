#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

const PORTS = {
  backend: 5000,
  frontend: 3001,
  mongo: 27017
};

let processes = [];

// Función para limpiar procesos al salir
function cleanup() {
  console.log(chalk.yellow('\n🛑 Deteniendo servicios...'));
  processes.forEach(proc => {
    if (proc && !proc.killed) {
      try {
        proc.kill('SIGTERM');
      } catch (err) {
        console.log(chalk.red(`Error deteniendo proceso: ${err.message}`));
      }
    }
  });
  process.exit(0);
}

// Manejadores de señales
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('beforeExit', cleanup);

// Función para verificar si un puerto está ocupado
function isPortInUse(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(false);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(true);
    });
  });
}

// Función para encontrar puerto disponible
async function findAvailablePort(startPort) {
  let port = startPort;
  while (await isPortInUse(port)) {
    port++;
  }
  return port;
}

// Función para mostrar banner
function showBanner() {
  console.clear();
  console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║      🛡️  SISTEMA DE DEFENSA BLOCKCHAIN CON AGENTES AI  🛡️      ║
║                                                               ║
║           🤖 7 Agentes AI Autónomos                           ║
║           ⚡ Tiempo Real con WebSocket                        ║
║           🚀 React + Node.js + MongoDB                       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `));
}

// Función para verificar dependencias
function checkDependencies() {
  console.log(chalk.blue('🔍 Verificando dependencias...'));
  
  const rootPackage = path.join(__dirname, 'package.json');
  const serverPackage = path.join(__dirname, 'server', 'package.json');
  const clientPackage = path.join(__dirname, 'client', 'package.json');
  
  if (!fs.existsSync(rootPackage)) {
    console.log(chalk.red('❌ package.json principal no encontrado'));
    process.exit(1);
  }
  
  if (!fs.existsSync(serverPackage)) {
    console.log(chalk.red('❌ package.json del servidor no encontrado'));
    process.exit(1);
  }
  
  if (!fs.existsSync(clientPackage)) {
    console.log(chalk.red('❌ package.json del cliente no encontrado'));
    process.exit(1);
  }
  
  console.log(chalk.green('✅ Dependencias verificadas'));
}

// Función para instalar dependencias si es necesario
function installDependencies() {
  console.log(chalk.blue('📦 Verificando node_modules...'));
  
  const paths = [
    __dirname,
    path.join(__dirname, 'server'),
    path.join(__dirname, 'client')
  ];
  
  let needsInstall = false;
  
  paths.forEach(dir => {
    if (!fs.existsSync(path.join(dir, 'node_modules'))) {
      needsInstall = true;
    }
  });
  
  if (needsInstall) {
    console.log(chalk.yellow('⚠️  Instalando dependencias faltantes...'));
    console.log(chalk.gray('   Esto puede tomar unos minutos...'));
    return true;
  }
  
  console.log(chalk.green('✅ node_modules encontrado'));
  return false;
}

// Función para ejecutar comando
function runCommand(command, args, cwd, name, color = 'white') {
  return new Promise((resolve, reject) => {
    console.log(chalk[color](`🚀 Iniciando ${name}...`));
    
    const proc = spawn(command, args, {
      cwd: cwd,
      stdio: 'pipe',
      shell: true
    });
    
    processes.push(proc);
    
    proc.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(chalk[color](`[${name}] ${output}`));
      }
    });
    
    proc.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output && !output.includes('Warning') && !output.includes('deprecated')) {
        console.log(chalk.red(`[${name}] ${output}`));
      }
    });
    
    proc.on('close', (code) => {
      if (code !== 0) {
        console.log(chalk.red(`❌ ${name} terminó con código ${code}`));
        reject(new Error(`${name} failed with code ${code}`));
      } else {
        console.log(chalk.green(`✅ ${name} iniciado correctamente`));
        resolve();
      }
    });
    
    proc.on('error', (err) => {
      console.log(chalk.red(`❌ Error iniciando ${name}: ${err.message}`));
      reject(err);
    });
  });
}

// Función principal
async function main() {
  try {
    showBanner();
    
    console.log(chalk.blue('🔄 Iniciando Sistema de Defensa Blockchain...\n'));
    
    // Verificar dependencias
    checkDependencies();
    
    // Instalar dependencias si es necesario
    if (installDependencies()) {
      console.log(chalk.yellow('📦 Instalando dependencias...'));
      await runCommand('npm', ['run', 'install:all'], __dirname, 'Instalador', 'yellow');
      console.log(chalk.green('✅ Dependencias instaladas\n'));
    }
    
    // Verificar puertos
    console.log(chalk.blue('🌐 Verificando puertos disponibles...'));
    
    const backendPort = await findAvailablePort(PORTS.backend);
    const frontendPort = await findAvailablePort(PORTS.frontend);
    
    if (backendPort !== PORTS.backend) {
      console.log(chalk.yellow(`⚠️  Puerto ${PORTS.backend} ocupado, usando ${backendPort} para backend`));
    }
    
    if (frontendPort !== PORTS.frontend) {
      console.log(chalk.yellow(`⚠️  Puerto ${PORTS.frontend} ocupado, usando ${frontendPort} para frontend`));
    }
    
    // Configurar variables de entorno
    process.env.PORT = backendPort;
    process.env.REACT_APP_API_URL = `http://localhost:${backendPort}`;
    
    console.log(chalk.green('✅ Puertos configurados\n'));
    
    // Iniciar backend
    console.log(chalk.blue('🖥️  Iniciando Backend...'));
    const serverProc = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, 'server'),
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, PORT: backendPort }
    });
    
    processes.push(serverProc);
    
    serverProc.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(chalk.green(`[Backend] ${output}`));
      }
    });
    
    serverProc.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output && !output.includes('Warning') && !output.includes('deprecated')) {
        console.log(chalk.red(`[Backend] ${output}`));
      }
    });
    
    // Esperar a que el backend esté listo
    console.log(chalk.gray('⏳ Esperando que el backend esté listo...'));
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Iniciar frontend
    console.log(chalk.blue('🎨 Iniciando Frontend...'));
    const clientProc = spawn('npm', ['start'], {
      cwd: path.join(__dirname, 'client'),
      stdio: 'pipe',
      shell: true,
      env: { 
        ...process.env, 
        PORT: frontendPort,
        BROWSER: 'none',
        REACT_APP_API_URL: `http://localhost:${backendPort}`
      }
    });
    
    processes.push(clientProc);
    
    clientProc.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(chalk.cyan(`[Frontend] ${output}`));
      }
    });
    
    clientProc.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output && !output.includes('Warning') && !output.includes('deprecated')) {
        console.log(chalk.red(`[Frontend] ${output}`));
      }
    });
    
    // Esperar un poco más para que todo esté listo
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Mostrar información final
    console.log(chalk.green(`
╔═══════════════════════════════════════════════════════════════╗
║                    ✅ SISTEMA INICIADO                         ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  🖥️  Backend:    http://localhost:${backendPort}                     ║
║  🎨 Frontend:   http://localhost:${frontendPort}                     ║
║  📊 API:        http://localhost:${backendPort}/api                  ║
║  💊 Health:     http://localhost:${backendPort}/api/health           ║
║  🔌 WebSocket:  http://localhost:${backendPort}                      ║
║                                                               ║
║  🤖 7 Agentes AI funcionando en modo DEMO                    ║
║  ⚡ WebSocket activo para tiempo real                         ║
║                                                               ║
║  Presiona Ctrl+C para detener todos los servicios           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `));
    
    // Abrir navegador automáticamente
    const open = require('open');
    try {
      await open(`http://localhost:${frontendPort}`);
      console.log(chalk.green('🌐 Navegador abierto automáticamente'));
    } catch (err) {
      console.log(chalk.yellow('⚠️  No se pudo abrir el navegador automáticamente'));
      console.log(chalk.gray(`   Visita manualmente: http://localhost:${frontendPort}`));
    }
    
    // Mantener el proceso activo
    console.log(chalk.gray('\n⏳ Servicios ejecutándose... Presiona Ctrl+C para detener\n'));
    
    // Keepalive
    setInterval(() => {
      // Verificar que los procesos sigan activos
      let activeProcesses = processes.filter(proc => proc && !proc.killed).length;
      if (activeProcesses === 0) {
        console.log(chalk.red('❌ Todos los procesos han terminado'));
        process.exit(1);
      }
    }, 30000);
    
  } catch (error) {
    console.log(chalk.red(`❌ Error iniciando el sistema: ${error.message}`));
    cleanup();
    process.exit(1);
  }
}

// Verificar si se necesita instalar chalk
try {
  require('chalk');
} catch (err) {
  console.log('📦 Instalando dependencias de chalk...');
  require('child_process').execSync('npm install chalk open', { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  console.log('✅ Dependencias instaladas');
}

// Ejecutar
main().catch(console.error);
