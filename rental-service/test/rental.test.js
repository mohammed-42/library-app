const request = require('supertest');
const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const app = require('../app');
const Rental = require('../models/rentalModel');

const TEST_MONGO_URI = 'mongodb://127.0.0.1:27018/rentaldb';
const BOOK_SERVICE_URL = process.env.BOOK_SERVICE_URL || 'http://127.0.0.1:5002';

let testBookId;
let testRentalId;

const testUser = {
  userId: 'test-user-001',
  userName: 'Test Renter',
  email: 'renter@example.com'
};

beforeAll(async () => {
  await mongoose.connect(TEST_MONGO_URI);

  // Create a real book via book-service so borrowBook has something valid to work with
  const res = await axios.post(`${BOOK_SERVICE_URL}/api/books`, {
    title: 'Rental Test Book',
    author: 'Rental Tester',
    genre: 'Testing',
    description: 'Book created for rental-service tests',
    totalCopies: 1
  });
  testBookId = res.data.book._id;
});

afterAll(async () => {
  if (testRentalId) {
    await Rental.findByIdAndDelete(testRentalId);
  }
  if (testBookId) {
    await axios.delete(`${BOOK_SERVICE_URL}/api/books/${testBookId}`);
  }
  await mongoose.connection.close();
});

describe('POST /api/rentals/borrow', () => {
  it('should borrow a book successfully', async () => {
    const res = await request(app)
      .post('/api/rentals/borrow')
      .send({ ...testUser, bookId: testBookId, days: 7 });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Book borrowed successfully');
    expect(res.body.rental.bookId).toBe(testBookId);

    testRentalId = res.body.rental._id;
  });

  it('should reject borrowing when no copies are available', async () => {
    // The single copy was just taken above, so this should now fail
    const res = await request(app)
      .post('/api/rentals/borrow')
      .send({ ...testUser, bookId: testBookId, days: 7 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('No copies available');
  });
 
});

describe('GET /api/rentals', () => {
  it('should return a list of all rentals', async () => {
    const res = await request(app).get('/api/rentals');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/rentals/user/:userId', () => {
  it("should return the test user's rentals", async () => {
    const res = await request(app).get(`/api/rentals/user/${testUser.userId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.some(r => r._id === testRentalId)).toBe(true);
  });

  it('should return an empty list for a user with no rentals', async () => {
    const res = await request(app).get('/api/rentals/user/no-such-user');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('PUT /api/rentals/return/:id', () => {
  it('should return a book successfully', async () => {
    const res = await request(app).put(`/api/rentals/return/${testRentalId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Book returned successfully');
    expect(res.body.rental.status).toBe('returned');
  });

  it('should reject returning an already-returned book', async () => {
    const res = await request(app).put(`/api/rentals/return/${testRentalId}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Book already returned');
  });

  it('should return 404 for a non-existent rental id', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).put(`/api/rentals/return/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Rental not found');
  });
});
describe('POST /api/rentals/borrow - additional case', () => {
  it.only('TC19 - should borrow an available book for 3 days', async () => {
    const res = await request(app)
      .post('/api/rentals/borrow')
      .send({
        userId: 'test-user-003',
        userName: 'Test User',
        email: 'test@example.com',
        bookId: testBookId,
        days: 3
      });

    expect(res.statusCode).toBe(201);
  });
});