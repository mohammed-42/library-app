const request = require('supertest');

// Mock nodemailer so no real emails are sent during tests
jest.mock('nodemailer');
const nodemailer = require('nodemailer');

const mockSendMail = jest.fn();
nodemailer.createTransport = jest.fn(() => ({
  sendMail: mockSendMail
}));

const app = require('../app');
const { sendBorrowEmail } = require('../services/emailService');

beforeEach(() => {
  mockSendMail.mockClear();
});

describe('GET /', () => {
  it('should confirm the service is running', async () => {
    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Notification Service is running');
  });
});

describe('sendBorrowEmail', () => {
  it('should call sendMail with the correct recipient and subject', async () => {
    mockSendMail.mockResolvedValueOnce(true);

    await sendBorrowEmail('reader@example.com', 'Test Reader', 'Test Book', new Date());

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const callArgs = mockSendMail.mock.calls[0][0];
    expect(callArgs.to).toBe('reader@example.com');
    expect(callArgs.subject).toBe('Book Borrowed Successfully!');
  });

  it('should include the user name and book title in the email body', async () => {
    mockSendMail.mockResolvedValueOnce(true);

    await sendBorrowEmail('reader@example.com', 'Test Reader', 'Test Book', new Date());

    const callArgs = mockSendMail.mock.calls[0][0];
    expect(callArgs.html).toContain('Test Reader');
    expect(callArgs.html).toContain('Test Book');
  });

  it('should throw an error if sendMail fails', async () => {
    mockSendMail.mockRejectedValueOnce(new Error('SMTP connection failed'));

    await expect(
      sendBorrowEmail('reader@example.com', 'Test Reader', 'Test Book', new Date())
    ).rejects.toThrow('SMTP connection failed');
  });
});