const request = require('supertest');
const app = require('../app');

describe('TC31 - Login with valid admin credentials', () => {
  it('should log in successfully with valid admin credentials', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'admin@library.com',
        password: 'admin123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Login successful');
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('admin');
  });
});