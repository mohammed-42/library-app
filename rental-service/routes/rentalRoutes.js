const express = require('express');
const router = express.Router();
const { borrowBook, returnBook, getAllRentals, getUserRentals } = require('../controllers/rentalController');

router.post('/borrow', borrowBook);
router.put('/return/:id', returnBook);
router.get('/', getAllRentals);
router.get('/user/:userId', getUserRentals);

module.exports = router;