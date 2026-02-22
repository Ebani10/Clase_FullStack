process.env.NODE_ENV = 'test';
require('dotenv').config({ path: '.env.test' });

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const connectDB = require('../src/config/db');

describe('Auth Endpoints', () => {

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('Debe registrar un usuario', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        nombre: 'Test',
        email: 'test@example.com',
        password: '123456'
      });

    expect(res.statusCode).toBe(201);
  });

  it('Debe hacer login correctamente', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: '123456'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('Debe devolver 404 en ruta inexistente', async () => {
  const res = await request(app).get('/ruta-que-no-existe');
  expect(res.statusCode).toBe(404);
});

  it('No debe loguear con contraseña incorrecta', async () => {
  await request(app).post('/auth/register').send({
    nombre: 'Test2',
    email: 'test2@example.com',
    password: '123456'
  });

  const res = await request(app)
    .post('/auth/login')
    .send({
      email: 'test2@example.com',
      password: 'wrongpassword'
    });

  expect(res.statusCode).toBe(400);
});

});