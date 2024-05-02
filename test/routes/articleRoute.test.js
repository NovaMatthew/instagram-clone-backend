const request = require('supertest');
const express = require('express');
const router = require('../../src/routes/articleRoute');

jest.mock('../../src/controllers/articleController');
jest.mock('../../src/controllers/authController');

const app = express();
app.use(express.json());
app.use('/', router);

describe('Article Routes', () => {
  test('POST /', async () => {
    const response = await request(app).post('/').send({
      title: 'Test Article',
      content: 'Test Content',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      message: 'article has been created',
    });
  });

  // Add other tests as needed
});