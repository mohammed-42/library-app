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
  it('TC19 - should borrow an available book for 3 days', async () => {
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
it('TC20 - should borrow an available book for 7 days', async () => {
  const bookRes = await axios.post(`${BOOK_SERVICE_URL}/api/books`, {
    title: 'TC20 Test Book',
    author: 'Rental Tester',
    genre: 'Testing',
    description: 'Book for TC20',
    totalCopies: 1
  });
  const tc20BookId = bookRes.data.book._id;

  const res = await request(app)
    .post('/api/rentals/borrow')
    .send({
      userId: 'test-user-004',
      userName: 'Test User',
      email: 'test@example.com',
      bookId: tc20BookId,
      days: 7
    });
  expect(res.statusCode).toBe(201);

  await axios.delete(`${BOOK_SERVICE_URL}/api/books/${tc20BookId}`);
});
it('TC21 - should borrow an available book for 14 days', async () => {
  const bookRes = await axios.post(`${BOOK_SERVICE_URL}/api/books`, {
    title: 'TC21 Test Book',
    author: 'Rental Tester',
    genre: 'Testing',
    description: 'Book for TC21',
    totalCopies: 1
  });
  const tc21BookId = bookRes.data.book._id;

  const res = await request(app)
    .post('/api/rentals/borrow')
    .send({
      userId: 'test-user-005',
      userName: 'Test User',
      email: 'test@example.com',
      bookId: tc21BookId,
      days: 14
    });

  expect(res.statusCode).toBe(201);

  await axios.delete(`${BOOK_SERVICE_URL}/api/books/${tc21BookId}`);
});
it('TC22 - should borrow an available book for 30 days', async () => {
  const bookRes = await axios.post(`${BOOK_SERVICE_URL}/api/books`, {
    title: 'TC22 Test Book',
    author: 'Rental Tester',
    genre: 'Testing',
    description: 'Book for TC22',
    totalCopies: 1
  });
  const tc22BookId = bookRes.data.book._id;

  const res = await request(app)
    .post('/api/rentals/borrow')
    .send({
      userId: 'test-user-006',
      userName: 'Test User',
      email: 'test@example.com',
      bookId: tc22BookId,
      days: 30
    });

  expect(res.statusCode).toBe(201);

  await axios.delete(`${BOOK_SERVICE_URL}/api/books/${tc22BookId}`);
});
it('TC23 - should reject a negative borrow duration', async () => {
  const bookRes = await axios.post(`${BOOK_SERVICE_URL}/api/books`, {
    title: 'TC23 Test Book',
    author: 'Rental Tester',
    genre: 'Testing',
    description: 'Book for TC23',
    totalCopies: 1
  });
  const tc23BookId = bookRes.data.book._id;

  const res = await request(app)
    .post('/api/rentals/borrow')
    .send({
      userId: 'test-user-007',
      userName: 'Test User',
      email: 'test@example.com',
      bookId: tc23BookId,
      days: -5
    });

  expect(res.statusCode).toBe(400);

  await axios.delete(`${BOOK_SERVICE_URL}/api/books/${tc23BookId}`);
});
it('TC24 - should reject borrowing an unavailable book', async () => {
  const bookRes = await axios.post(`${BOOK_SERVICE_URL}/api/books`, {
    title: 'TC24 Test Book',
    author: 'Rental Tester',
    genre: 'Testing',
    description: 'Book for TC24',
    totalCopies: 1
  });
  const tc24BookId = bookRes.data.book._id;

  // Borrow the only copy first, so the book becomes unavailable
  await request(app)
    .post('/api/rentals/borrow')
    .send({
      userId: 'test-user-008',
      userName: 'Test User',
      email: 'test@example.com',
      bookId: tc24BookId,
      days: 7
    });

  // Now attempt to borrow the same book again — should fail, no copies left
  const res = await request(app)
    .post('/api/rentals/borrow')
    .send({
      userId: 'test-user-009',
      userName: 'Another User',
      email: 'another@example.com',
      bookId: tc24BookId,
      days: 7
    });

  expect(res.statusCode).toBe(400);
  expect(res.body.message).toBe('No copies available');

  await axios.delete(`${BOOK_SERVICE_URL}/api/books/${tc24BookId}`);
});
it('TC25 - should decrease available copies after a successful borrow', async () => {
  const bookRes = await axios.post(`${BOOK_SERVICE_URL}/api/books`, {
    title: 'TC25 Test Book',
    author: 'Rental Tester',
    genre: 'Testing',
    description: 'Book for TC25',
    totalCopies: 3
  });
  const tc25BookId = bookRes.data.book._id;
  const copiesBefore = bookRes.data.book.availableCopies;

  await request(app)
    .post('/api/rentals/borrow')
    .send({
      userId: 'test-user-010',
      userName: 'Test User',
      email: 'test@example.com',
      bookId: tc25BookId,
      days: 7
    });

  const afterRes = await axios.get(`${BOOK_SERVICE_URL}/api/books/${tc25BookId}`);
  const copiesAfter = afterRes.data.availableCopies;

  expect(copiesAfter).toBe(copiesBefore - 1);

  await axios.delete(`${BOOK_SERVICE_URL}/api/books/${tc25BookId}`);
});
it('TC26 - should show the borrowed book in My Rentals after borrowing', async () => {
  const bookRes = await axios.post(`${BOOK_SERVICE_URL}/api/books`, {
    title: 'TC26 Test Book',
    author: 'Rental Tester',
    genre: 'Testing',
    description: 'Book for TC26',
    totalCopies: 1
  });
  const tc26BookId = bookRes.data.book._id;
  const tc26UserId = 'test-user-011';

  const borrowRes = await request(app)
    .post('/api/rentals/borrow')
    .send({
      userId: tc26UserId,
      userName: 'Test User',
      email: 'test@example.com',
      bookId: tc26BookId,
      days: 7
    });

  const myRentalsRes = await request(app).get(`/api/rentals/user/${tc26UserId}`);

  expect(myRentalsRes.statusCode).toBe(200);
  expect(myRentalsRes.body.some(r => r._id === borrowRes.body.rental._id)).toBe(true);

  await axios.delete(`${BOOK_SERVICE_URL}/api/books/${tc26BookId}`);
});
it('TC27 - should return empty list for My Rentals with no rentals', async () => {
  const res = await request(app).get('/api/rentals/user/test-user-with-no-rentals');

  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual([]);
});
it('TC28 - should return an active borrowed book', async () => {
  const bookRes = await axios.post(`${BOOK_SERVICE_URL}/api/books`, {
    title: 'TC28 Test Book',
    author: 'Rental Tester',
    genre: 'Testing',
    description: 'Book for TC28',
    totalCopies: 1
  });
  const tc28BookId = bookRes.data.book._id;

  const borrowRes = await request(app)
    .post('/api/rentals/borrow')
    .send({
      userId: 'test-user-012',
      userName: 'Test User',
      email: 'test@example.com',
      bookId: tc28BookId,
      days: 7
    });
  const tc28RentalId = borrowRes.body.rental._id;

  const res = await request(app).put(`/api/rentals/return/${tc28RentalId}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe('Book returned successfully');
  expect(res.body.rental.status).toBe('returned');

  await axios.delete(`${BOOK_SERVICE_URL}/api/books/${tc28BookId}`);
});
it('TC28 - should return an active borrowed book', async () => {
  const bookRes = await axios.post(`${BOOK_SERVICE_URL}/api/books`, {
    title: 'TC28 Test Book',
    author: 'Rental Tester',
    genre: 'Testing',
    description: 'Book for TC28',
    totalCopies: 1
  });
  const tc28BookId = bookRes.data.book._id;

  const borrowRes = await request(app)
    .post('/api/rentals/borrow')
    .send({
      userId: 'test-user-012',
      userName: 'Test User',
      email: 'test@example.com',
      bookId: tc28BookId,
      days: 7
    });
  const tc28RentalId = borrowRes.body.rental._id;

  const res = await request(app).put(`/api/rentals/return/${tc28RentalId}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe('Book returned successfully');
  expect(res.body.rental.status).toBe('returned');

  await axios.delete(`${BOOK_SERVICE_URL}/api/books/${tc28BookId}`);
});
it('TC29 - should verify rental status is returned after persisting', async () => {
  const bookRes = await axios.post(`${BOOK_SERVICE_URL}/api/books`, {
    title: 'TC29 Test Book',
    author: 'Rental Tester',
    genre: 'Testing',
    description: 'Book for TC29',
    totalCopies: 1
  });
  const tc29BookId = bookRes.data.book._id;
  const tc29UserId = 'test-user-013';

  const borrowRes = await request(app)
    .post('/api/rentals/borrow')
    .send({
      userId: tc29UserId,
      userName: 'Test User',
      email: 'test@example.com',
      bookId: tc29BookId,
      days: 7
    });
  const tc29RentalId = borrowRes.body.rental._id;

  await request(app).put(`/api/rentals/return/${tc29RentalId}`);

  // Re-fetch independently, to confirm the status actually persisted (not just the return response)
  const checkRes = await request(app).get(`/api/rentals/user/${tc29UserId}`);
  const updatedRental = checkRes.body.find(r => r._id === tc29RentalId);

  expect(updatedRental.status).toBe('returned');

  await axios.delete(`${BOOK_SERVICE_URL}/api/books/${tc29BookId}`);
});
it('TC30 - should increase available copies after returning a book', async () => {
  const bookRes = await axios.post(`${BOOK_SERVICE_URL}/api/books`, {
    title: 'TC30 Test Book',
    author: 'Rental Tester',
    genre: 'Testing',
    description: 'Book for TC30',
    totalCopies: 3
  });
  const tc30BookId = bookRes.data.book._id;
  const copiesBeforeBorrow = bookRes.data.book.availableCopies;

  const borrowRes = await request(app)
    .post('/api/rentals/borrow')
    .send({
      userId: 'test-user-014',
      userName: 'Test User',
      email: 'test@example.com',
      bookId: tc30BookId,
      days: 7
    });
  const tc30RentalId = borrowRes.body.rental._id;

  await request(app).put(`/api/rentals/return/${tc30RentalId}`);

  const afterRes = await axios.get(`${BOOK_SERVICE_URL}/api/books/${tc30BookId}`);
  const copiesAfterReturn = afterRes.data.availableCopies;

  expect(copiesAfterReturn).toBe(copiesBeforeBorrow);

  await axios.delete(`${BOOK_SERVICE_URL}/api/books/${tc30BookId}`);
});
});