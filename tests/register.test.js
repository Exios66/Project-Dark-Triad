const request = require('supertest');
const app = require('../server');

describe('POST /register', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });
});