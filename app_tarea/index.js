import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const USERS_FILE = 'users.json';
const SECRET_KEY = 'clave_secreta_no_usar_en_produccion';
const app = express();
app.use(express.json());

const ARCHIVO = 'tareas.json';

/* ======================
   Funciones auxiliares
====================== */

async function leerTareas() {
  const data = await readFile(ARCHIVO, 'utf-8');
  return JSON.parse(data);
}

async function guardarTareas(tareas) {
  await writeFile(ARCHIVO, JSON.stringify(tareas, null, 2));
}

async function leerUsuarios() {
  const data = await readFile(USERS_FILE, 'utf-8');
  return JSON.parse(data);
}

async function guardarUsuarios(usuarios) {
  await writeFile(USERS_FILE, JSON.stringify(usuarios, null, 2));
}


/* ======================
   GET /tareas
====================== */
app.get('/tareas', autenticarToken, async (req, res) => {
  const tareas = await leerTareas();
  res.json(tareas);
});


/* ======================
   POST /tareas
====================== */
app.post('/tareas', async (req, res) => {
  const { titulo, descripcion } = req.body;

  if (!titulo || !descripcion) {
    return res.status(400).json({
      message: 'Titulo y descripcion son obligatorios'
    });
  }

  const tareas = await leerTareas();

  const nuevaTarea = {
    id: tareas.length + 1,
    titulo,
    descripcion
  };

  tareas.push(nuevaTarea);
  await guardarTareas(tareas);

  res.status(201).json({
    message: 'Tarea creada correctamente',
    tarea: nuevaTarea
  });
});

/* ======================
   POST /Users
====================== */
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email y contraseña son obligatorios'
    });
  }

  const usuarios = await leerUsuarios();

  const existe = usuarios.find(u => u.email === email);
  if (existe) {
    return res.status(400).json({
      message: 'El usuario ya existe'
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const nuevoUsuario = {
    id: usuarios.length + 1,
    email,
    password: passwordHash
  };

  usuarios.push(nuevoUsuario);
  await guardarUsuarios(usuarios);

  res.status(201).json({
    message: 'Usuario registrado correctamente'
  });
});



app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const usuarios = await leerUsuarios();
  const usuario = usuarios.find(u => u.email === email);

  if (!usuario) {
    return res.status(401).json({
      message: 'Credenciales inválidas'
    });
  }

  const passwordValida = await bcrypt.compare(
    password,
    usuario.password
  );

  if (!passwordValida) {
    return res.status(401).json({
      message: 'Credenciales inválidas'
    });
  }

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email },
    SECRET_KEY,
    { expiresIn: '1h' }
  );

  res.json({
    message: 'Login exitoso',
    token
  });
});


/* ======================
   PUT /tareas/:id
====================== */
app.put('/tareas/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { titulo, descripcion } = req.body;

  const tareas = await leerTareas();
  const tarea = tareas.find(t => t.id === id);

  if (!tarea) {
    return res.status(404).json({
      message: 'Tarea no encontrada'
    });
  }

  tarea.titulo = titulo ?? tarea.titulo;
  tarea.descripcion = descripcion ?? tarea.descripcion;

  await guardarTareas(tareas);

  res.json({
    message: 'Tarea actualizada correctamente',
    tarea
  });
});

/* ======================
   DELETE /tareas/:id
====================== */
app.delete('/tareas/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  const tareas = await leerTareas();
  const nuevasTareas = tareas.filter(t => t.id !== id);

  if (tareas.length === nuevasTareas.length) {
    return res.status(404).json({
      message: 'Tarea no encontrada'
    });
  }

  await guardarTareas(nuevasTareas);

  res.json({
    message: 'Tarea eliminada correctamente'
  });
});


/* ==========================
   Autenticación Middleware
=========================== */
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Token requerido'
    });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: 'Token inválido'
      });
    }

    req.user = user;
    next();
  });
}

app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada'
  });
});


app.use((err, req, res, next) => {
  console.error('ERROR:', err.message);

  const statusCode = err.status || 500;

  res.status(statusCode).json({
    error: err.message || 'Error interno del servidor'
  });
});


/* ======================
   Servidor
====================== */
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
