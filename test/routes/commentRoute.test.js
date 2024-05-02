const request = require('supertest');
const express = require('express');
const commentRoutes = require('../../src/routes/commentRoute'); // adjust the path as necessary

// Mock authController and commentController
jest.mock('../../src/controllers/authController', () => ({
  verify: (req, res, next) => next(),
}));

jest.mock('../../src/controllers/commentController', () => ({
  addComment: (req, res) => res.status(201).json({ message: 'Comment added' }),
  getbyPostId: (req, res) => res.status(200).json({ message: 'Comments fetched' }),
}));

const app = express();
app.use(express.json());
app.use('/api/comments', commentRoutes);

describe('Comment API', () => {
  it('should add a comment on POST /', async () => {
    const res = await request(app)
      .post('/api/comments')
      .send({
        articleId: 'testArticleId',
        comment: 'test comment',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toEqual('Comment added');
  });

  it('should get comments by article id on GET /:ArticleId', async () => {
    const res = await request(app).get('/api/comments/testArticleId');
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Comments fetched');
  });
});