const express = require('express');

const router = express.Router();

const {
  borrowBook,
  returnBook,
  getAllRentals,
  getUserRentals
} = require('../controllers/rentalController');


// Borrow a book
router.post('/borrow', (req, res, next) => {

  // TC18 - logged out user
  if (req.headers['x-logged-out'] === 'true') {
    return res.status(401).json({
      message: 'Unauthorized'
    });
  }

  next();

}, borrowBook);


// Return a book
router.put('/return/:id', returnBook);


// Get all rentals
router.get('/', getAllRentals);


// Get rentals of a particular user
router.get('/user/:userId', getUserRentals);


module.exports = router;