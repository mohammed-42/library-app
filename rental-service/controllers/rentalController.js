const Rental = require('../models/rentalModel');
const axios = require('axios');
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq';

const publishToQueue = async (queue, message) => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
    console.log('📨 Message published to queue:', queue);
    setTimeout(() => connection.close(), 500);
  } catch (err) {
    console.error('RabbitMQ publish error:', err.message);
  }
};

const borrowBook = async (req, res) => {
  try {
    const { userId, bookId, userName, email, days } = req.body;

    const bookResponse = await axios.get(`${process.env.BOOK_SERVICE_URL}/api/books/${bookId}`);
    const book = bookResponse.data;

    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'No copies available' });
    }

    const borrowDays = parseInt(days) || 7;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + borrowDays);

    const rental = await Rental.create({
      userId, bookId,
      bookTitle: book.title,
      userName, dueDate
    });

    await axios.put(`${process.env.BOOK_SERVICE_URL}/api/books/${bookId}`, {
      availableCopies: book.availableCopies - 1
    });

    // Publish to RabbitMQ instead of direct HTTP call
    await publishToQueue('notification_queue', {
      type: 'BOOK_BORROWED',
      userName,
      email,
      bookTitle: book.title,
      dueDate
    });

    res.status(201).json({ message: 'Book borrowed successfully', rental });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const returnBook = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ message: 'Rental not found' });
    if (rental.status === 'returned') return res.status(400).json({ message: 'Book already returned' });

    rental.status = 'returned';
    rental.returnedAt = new Date();
    await rental.save();

    const bookResponse = await axios.get(`${process.env.BOOK_SERVICE_URL}/api/books/${rental.bookId}`);
    const book = bookResponse.data;
    await axios.put(`${process.env.BOOK_SERVICE_URL}/api/books/${rental.bookId}`, {
      availableCopies: book.availableCopies + 1
    });

    res.status(200).json({ message: 'Book returned successfully', rental });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllRentals = async (req, res) => {
  try {
    const rentals = await Rental.find();
    res.status(200).json(rentals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({ userId: req.params.userId });
    res.status(200).json(rentals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { borrowBook, returnBook, getAllRentals, getUserRentals };