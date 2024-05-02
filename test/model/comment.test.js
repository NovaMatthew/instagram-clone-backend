const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../src/Models/userModel'); // Make sure this path is correct
const Comment = require('../../src/Models/commentModel'); // Adjust the path to your Comment model

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

describe('Comment Model Test', () => {
  it('should save a comment with a user reference and description', async () => {
    const user = new User({ username: 'testuser', email: 'test@example.com', password: 'password123' });
    const savedUser = await user.save();

    const commentData = {
      user: savedUser._id,
      description: 'This is a test comment up to 500 characters long.'
    };

    const comment = new Comment(commentData);
    const savedComment = await comment.save();

    expect(savedComment._id).toBeDefined();
    expect(savedComment.user).toEqual(savedUser._id);
    expect(savedComment.description).toBe(commentData.description);
  });

  it('should not save a comment with description longer than 500 characters', async () => {
    const user = new User({ username: 'testuser', email: 'test@example.com', password: 'password123' });
    const savedUser = await user.save();
  
    const longDescription = 'a'.repeat(501); // Create a string of length 501
    const commentData = {
      user: savedUser._id,
      description: longDescription
    };
  
    let err = null;
    try {
      const comment = new Comment(commentData);
      await comment.save();
    } catch (error) {
      err = error;
    }
  
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors['description']).toBeDefined();
  });
  
});
