const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Usuarios simulados (en producción usar base de datos)
const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@blockchain-defense.com',
    password: '$2a$10$8D8D8D8D8D8D8D8D8D8D8O', // password: admin123
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'manage_agents', 'manage_users']
  },
  {
    id: 2,
    username: 'analyst',
    email: 'analyst@blockchain-defense.com',
    password: '$2a$10$9E9E9E9E9E9E9E9E9E9E9O', // password: analyst123
    role: 'analyst',
    permissions: ['read', 'write', 'manage_alerts']
  },
  {
    id: 3,
    username: 'operator',
    email: 'operator@blockchain-defense.com',
    password: '$2a$10$1F1F1F1F1F1F1F1F1F1F1O', // password: operator123
    role: 'operator',
    permissions: ['read']
  }
];

// POST /api/auth/login - Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username y password son requeridos'
      });
    }
    
    // Buscar usuario (simulado)
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }
    
    // Verificar password (simulado - en producción usar bcrypt)
    const validPassword = password === 'admin123' && username === 'admin' ||
                          password === 'analyst123' && username === 'analyst' ||
                          password === 'operator123' && username === 'operator';
    
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }
    
    // Generar JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions
      },
      process.env.JWT_SECRET || 'blockchain-defense-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          permissions: user.permissions
        }
      },
      message: 'Inicio de sesión exitoso'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', (req, res) => {
  // En una implementación real, agregar token a lista negra
  res.json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
});

// GET /api/auth/profile - Obtener perfil del usuario
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/auth/profile - Actualizar perfil
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    const userIndex = users.findIndex(u => u.id === req.user.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    if (email) {
      users[userIndex].email = email;
    }
    
    res.json({
      success: true,
      data: {
        id: users[userIndex].id,
        username: users[userIndex].username,
        email: users[userIndex].email,
        role: users[userIndex].role,
        permissions: users[userIndex].permissions
      },
      message: 'Perfil actualizado exitosamente'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/auth/change-password - Cambiar contraseña
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Contraseña actual y nueva contraseña son requeridas'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }
    
    const userIndex = users.findIndex(u => u.id === req.user.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    // En producción, verificar contraseña actual con bcrypt
    // y hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    users[userIndex].password = hashedPassword;
    
    res.json({
      success: true,
      message: 'Contraseña cambiada exitosamente'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/auth/users - Listar usuarios (solo admin)
router.get('/users', authenticateToken, authorize(['admin']), (req, res) => {
  try {
    const userList = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    }));
    
    res.json({
      success: true,
      data: userList,
      count: userList.length
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Middleware de autenticación
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token de acceso requerido'
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'blockchain-defense-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Token inválido'
      });
    }
    
    req.user = user;
    next();
  });
}

// Middleware de autorización por roles
function authorize(roles = []) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado - Permisos insuficientes'
      });
    }
    next();
  };
}

module.exports = router;
