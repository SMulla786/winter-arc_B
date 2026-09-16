process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_1234567890';
process.env.PORT = '5001';

// Suppress console error output during tests if desired
jest.setTimeout(10000);
