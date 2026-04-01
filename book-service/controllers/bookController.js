const Book = require('../models/bookModel');
const { client } = require('../config/redisClient');

const CACHE_KEY = 'all_books';
const CACHE_TTL = 60; // seconds

const addBook = async (req, res) => {
  try {
    const { title, author, genre, description, totalCopies } = req.body;
    const book = await Book.create({
      title, author, genre, description,
      totalCopies, availableCopies: totalCopies
    });

    // Clear cache when new book is added
    await client.del(CACHE_KEY);
    console.log('🗑️ Cache cleared after adding book');

    res.status(201).json({ message: 'Book added successfully', book });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllBooks = async (req, res) => {
  try {
    const { title, author, genre } = req.query;
    const isFiltered = title || author || genre;

    // Only use cache for unfiltered requests
    if (!isFiltered) {
      const cached = await client.get(CACHE_KEY);
      if (cached) {
        console.log('⚡ Serving from Redis cache');
        return res.status(200).json(JSON.parse(cached));
      }
    }

    let filter = {};
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (author) filter.author = { $regex: author, $options: 'i' };
    if (genre) filter.genre = { $regex: genre, $options: 'i' };

    const books = await Book.find(filter);

    // Save to cache only for unfiltered requests
    if (!isFiltered) {
      await client.setEx(CACHE_KEY, CACHE_TTL, JSON.stringify(books));
      console.log('💾 Books saved to Redis cache');
    }

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Clear cache when book is updated
    await client.del(CACHE_KEY);
    console.log('🗑️ Cache cleared after updating book');

    res.status(200).json({ message: 'Book updated', book });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Clear cache when book is deleted
    await client.del(CACHE_KEY);
    console.log('🗑️ Cache cleared after deleting book');

    res.status(200).json({ message: 'Book deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addBook, getAllBooks, getBookById, updateBook, deleteBook };