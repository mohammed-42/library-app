const request = require('supertest');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const app = require('../app');
const User = require('../models/userModel');

// A unique test email so it doesn't collide with real data
const testUser = {
  name: 'Test User',
  email: `testuser_${Date.now()}@example.com`,
  password: 'Password123'
};

const TEST_MONGO_URI = 'mongodb://localhost:27018/userdb';

beforeAll(async () => {
  await mongoose.connect(TEST_MONGO_URI);
});

afterAll(async () => {
  // Clean up the test user we created, then close the connection
  await User.deleteOne({ email: testUser.email });
  await mongoose.connection.close();
});

describe('POST /api/users/register', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('should not allow registering the same email twice', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send(testUser);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });
  it('should not allow to register empty', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('please fill credentials to register');
  });
  it('should not allow registration with empty email', async () => {
  const res = await request(app)
    .post('/api/users/register')
    .send({
      name: 'Test User',
      email: '',
      password: 'Password123'
    });

  expect(res.statusCode).toBe(400);
  expect(res.body.message).toBe('please fill credentials to register');
});
it('should not allow registration with empty password', async () => {
  const res = await request(app)
    .post('/api/users/register')
    .send({
      name: 'Test User',
      email: `testpassword_${Date.now()}@example.com`,
      password: ''
    });

  expect(res.statusCode).toBe(400);
  expect(res.body.message).toBe('please fill credentials to register');
});
it('should not allow registration with invalid email format', async () => {
  const res = await request(app)
    .post('/api/users/register')
    .send({
      name: 'Test User',
      email: 'invalid-email',
      password: 'Password123'
    });

  expect(res.statusCode).toBe(400);
  expect(res.body.message).toBe('Invalid email format');
});
});

describe('POST /api/users/login', () => {
  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Login successful');
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
  const email = `wrongpass_${Date.now()}@example.com`;

  // Create user first
  await request(app)
    .post('/api/users/register')
    .send({
      name: 'Test User',
      email: email,
      password: 'Password123'
    });

  // Try login with incorrect password
  const res = await request(app)
    .post('/api/users/login')
    .send({
      email: email,
      password: 'WrongPassword'
    });

  expect(res.statusCode).toBe(400);
  expect(res.body.message).toBe('Invalid credentials');
});

  it('should reject login for a non-existent email', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'doesnotexist@example.com', password: 'whatever' });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('User not found');
  });
  it.only('should not allow login with blank credentials', async () => {
  const res = await request(app)
    .post('/api/users/login')
    .send({});

  expect(res.statusCode).toBe(400);
  expect(res.body.message).toBe('Please fill credentials to login');
});
});