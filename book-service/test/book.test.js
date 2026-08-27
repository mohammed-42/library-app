const request = require('supertest');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const app = require('../app');
const Book = require('../models/bookModel');
const { connectRedis, client } = require('../config/redisClient');

const TEST_MONGO_URI = 'mongodb://localhost:27018/bookdb';

const testBook = {
  title: 'Test Book Title',
  author: 'Test Author',
  genre: 'Fiction',
  description: 'A book created for testing',
  totalCopies: 3
};

let createdBookId;

beforeAll(async () => {
  await mongoose.connect(TEST_MONGO_URI);
  await connectRedis();
});

afterAll(async () => {
  if (createdBookId) {
    await Book.findByIdAndDelete(createdBookId);
  }
  await mongoose.connection.close();
  await client.quit();
});

describe('POST /api/books', () => {
  it('should add a new book successfully', async () => {
    const res = await request(app)
      .post('/api/books')
      .send(testBook);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Book added successfully');
    expect(res.body.book.title).toBe(testBook.title);
    expect(res.body.book.availableCopies).toBe(testBook.totalCopies);

    createdBookId = res.body.book._id;
  });
});

describe('GET /api/books', () => {
  it('should return a list of books', async () => {
    const res = await request(app).get('/api/books');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should filter books by title', async () => {
    const res = await request(app).get('/api/books?title=Test Book Title');

    expect(res.statusCode).toBe(200);
    expect(res.body.some(b => b.title === testBook.title)).toBe(true);
  });
});

describe('GET /api/books/:id', () => {
  it('should return a single book by id', async () => {
    const res = await request(app).get(`/api/books/${createdBookId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(createdBookId);
  });

  it('should return 404 for a non-existent book id', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/books/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Book not found');
  });
});

describe('PUT /api/books/:id', () => {
  it('should update an existing book', async () => {
    const res = await request(app)
      .put(`/api/books/${createdBookId}`)
      .send({ description: 'Updated description' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Book updated');
    expect(res.body.book.description).toBe('Updated description');
  });

  it('should return 404 when updating a non-existent book', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/books/${fakeId}`)
      .send({ description: 'Nothing here' });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Book not found');
  });
});

describe('DELETE /api/books/:id', () => {
  it('should return 404 when deleting a non-existent book', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/books/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Book not found');
  });

  it('should delete the test book successfully', async () => {
    const res = await request(app).delete(`/api/books/${createdBookId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Book deleted');

    createdBookId = null; // already deleted, skip afterAll cleanup
  });
});