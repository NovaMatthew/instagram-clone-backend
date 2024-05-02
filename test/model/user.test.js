const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../src/Models/userModel'); 

let mongoServer;

// Set up an in-memory MongoDB instance
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

// Tear down the MongoDB instance
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear the database after each test case
afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

describe('User Model Tests', () => {
  it('should create a new user with all required fields', async () => {
    const userData = {
      username: 'johnDoe',
      email: 'john@example.com',
      password: '123456',
      role: 'user'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe(userData.username);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.password).toBe(userData.password);
    expect(savedUser.role).toBe(userData.role);
  });

  it('should not allow invalid email formats', async () => {
    const userData = {
      username: 'janeDoe',
      email: 'janeemail.com',  // Invalid email format
      password: '123456',
      role: 'user'
    };

    let err = null;
    try {
      const user = new User(userData);
      await user.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors['email']).toBeDefined();
  });

  it('should enforce minimum password length', async () => {
    const userData = {
      username: 'alexSmith',
      email: 'alex@example.com',
      password: '123',  // Too short
      role: 'user'
    };

    let err = null;
    try {
      const user = new User(userData);
      await user.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors['password']).toBeDefined();
  });
});
