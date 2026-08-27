const request = require('supertest');
const app = require('../app');

describe('TC18 - Borrow book while logged out', () => {
  it('should reject borrowing when user is logged out', async () => {
    const res = await request(app)
  .post('/api/rentals/borrow')
  .set('x-logged-out', 'true')
  .send({
    bookId: '000000000000000000000000',
    days: 7
  });

    expect(res.statusCode).toBe(401);
  });
});