const request = require('supertest');
const express = require('express');
const router = require('../../src/routes/userRoute');

// Mock controllers
jest.mock('../../src/controllers/userController', () => ({
  signup: jest.fn().mockResolvedValue({
    status: 'success',
    message: 'User has been signed up',
  }),
}));

jest.mock('../../src/controllers/authController');

const app = express();
app.use(express.json());


describe('User Routes', () => {
  test('POST /signup', async () => {
    const response = await request(app)
      .post('/signup')
      .send({
        username: 'testuser',
        password: 'testpassword',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      message: 'User has been signed up',
    });
  }, 10000); 
});
