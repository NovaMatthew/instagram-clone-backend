const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../src/Models/userModel');  
const Comment = require('../../src/Models/commentModel');  
const Article = require('../../src/Models/articleModel');  

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

describe('Article Model Test', () => {
  it('should create a new article with user and comments', async () => {
    const user = new User({ username: 'testuser', email: 'test@example.com', password: 'password123' });
    const savedUser = await user.save();

    const comment = new Comment({ user: savedUser._id, description: 'Nice article' });
    const savedComment = await comment.save();

    const articleData = {
      user: savedUser._id,
      description: 'This is a test article',
      imgurl: 'http://example.com/image.jpg',
      likes: [savedUser._id],
      comment: [savedComment._id]
    };

    const article = new Article(articleData);
    const savedArticle = await article.save();

    expect(savedArticle._id).toBeDefined();
    expect(savedArticle.user.toString()).toBe(savedUser._id.toString());
    expect(savedArticle.comment[0].toString()).toBe(savedComment._id.toString());
    expect(savedArticle.likes[0].toString()).toBe(savedUser._id.toString());
  });
});
