const request = require('supertest');
const express = require('express');
const Article = require('../../src/Models/articleModel');
const Comment = require('../../src/Models/commentModel');
const controller = require('../../src/controllers/articleController');

jest.mock('../../src/Models/articleModel');
jest.mock('../../src/Models/commentModel');
jest.mock('../../src/Models/userModel', () => {
  const mockUserModel = jest.fn().mockImplementation(() => {
    return { 
      generateAuthToken: jest.fn().mockReturnValue('mocked_token'),
      save: jest.fn().mockResolvedValue(true),
      followings: [],
    };
  });

  mockUserModel.create = jest.fn().mockImplementation((userData) => {
    return {
      ...userData,
      _id: 'mocked_id',
      followings: [],
      save: jest.fn().mockResolvedValue(true),
    };
  });
  jest.mock('../..//src/controllers/authController', () => ({
    verify: (req, res, next) => {
      req.user = {
        _id: 'mocked_id',
        // Add any other properties that your application expects the user object to have
      };
      next();
    },
  }));

  mockUserModel.deleteMany = jest.fn().mockResolvedValue(true);

  return mockUserModel;
});

const User = require('../../src/Models/userModel');

const app = express();
app.use(express.json());
app.post('/articles', controller.createArticle);
app.put('/articles/:id', controller.updateArticle);
app.get('/timeline', controller.getTimeline);
// Add other routes as needed


describe('Article Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createArticle', async () => {
    const mockArticle = { save: jest.fn() };
    Article.mockReturnValue(mockArticle);

    const mockReq = {
      body: { title: 'Test Article', content: 'Test Content' },
      user: { _id: '123' },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await controller.createArticle(mockReq, mockRes);

    expect(mockArticle.save).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      status: 'success',
      message: 'article has been created',
    });
  });
  // Continue from the previous test suite
  test('updateArticle', async () => {
    const mockArticle = {
      user: { toString: jest.fn().mockReturnValue('123') },
      updateOne: jest.fn(),
    };
    Article.findById = jest.fn().mockResolvedValue(mockArticle);

    const mockReq = {
      params: { id: '456' },
      body: { title: 'Updated Article', content: 'Updated Content' },
      user: { _id: '123' },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await controller.updateArticle(mockReq, mockRes);

    expect(Article.findById).toHaveBeenCalledWith('456');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      status: 'success',
      message: 'Article has been updated',
    });
  });

  test('deleteArticle', async () => {
    const mockArticle = {
      user: { toString: () => '123' },
    };
    Article.findById = jest.fn().mockResolvedValue(mockArticle);
    Article.findByIdAndDelete = jest.fn().mockResolvedValue(true);
    Comment.deleteMany = jest.fn().mockResolvedValue(true);

    const mockReq = {
      params: { id: '456' },
      user: { _id: '123', role: 'admin' },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await controller.deleteArticle(mockReq, mockRes);

    expect(Article.findById).toHaveBeenCalledWith('456');
    expect(Article.findByIdAndDelete).toHaveBeenCalledWith('456');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      status: 'success',
      message: 'article has been deleted',
    });
  });

  test('getArticle', async () => {
    const mockArticle = {};
    const mockFindOne = {
      populate: jest.fn().mockResolvedValue(mockArticle),
    };
    Article.findOne = jest.fn().mockReturnValue(mockFindOne);

    const mockReq = {
      params: { id: '456' },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await controller.getArticle(mockReq, mockRes);

    expect(Article.findOne).toHaveBeenCalledWith({ _id: '456' });
    expect(mockFindOne.populate).toHaveBeenCalledWith('comment');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockArticle);
  });





  describe('GET /timeline', () => {
    let user, otherUser, userToken, otherUserToken;

    beforeAll(async () => {
      // Create and authenticate two users
      user = await User.create({ username: 'user', password: 'password' });
      otherUser = await User.create({ username: 'otherUser', password: 'password' });
      userToken = 'Bearer mocked_token';
      otherUserToken = 'Bearer mocked_token';

      // User follows otherUser
      user.followings.push(otherUser._id);
      await user.save();

      // otherUser creates an article
      await Article.create({ user: otherUser._id, title: 'Article', content: 'Content', tags: ['tag1', 'tag2'] });
    });


    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return the articles of the users that the authenticated user follows', async () => {
      const res = await request(app)
        .get('/timeline')
        .set('Authorization', userToken)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.Articles).toHaveLength(1);
      expect(res.body.Articles[0].user.username).toBe('otherUser');
    });

    it('should return an empty array if the user does not follow anyone', async () => {
      const res = await request(app)
        .get('/timeline')
        .set('Authorization', otherUserToken)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.Articles).toHaveLength(0);
    });

    afterAll(async () => {
      // Clean up the database
      await User.deleteMany({});
      await Article.deleteMany({});
    });
  });

});