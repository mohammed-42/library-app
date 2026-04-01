const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  bookId: { type: String, required: true },
  bookTitle: { type: String, required: true },
  userName: { type: String, required: true },
  borrowedAt: { type: Date, default: Date.now },
  dueDate: { type: Date },
  returnedAt: { type: Date, default: null },
  status: { type: String, enum: ['borrowed', 'returned'], default: 'borrowed' }
}, { timestamps: true });

module.exports = mongoose.model('Rental', rentalSchema);
