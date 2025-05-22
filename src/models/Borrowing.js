const mongoose = require('mongoose');

const borrowingSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  borrowDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['borrowed', 'returned', 'overdue'],
    default: 'borrowed'
  }
});

// Update book availability when borrowing
borrowingSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Book = mongoose.model('Book');
    const book = await Book.findById(this.book);
    if (book.available > 0) {
      book.available -= 1;
      await book.save();
    } else {
      throw new Error('Book is not available');
    }
  }
  next();
});

// Update book availability when returning
borrowingSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  if (update.status === 'returned' && !update.returnDate) {
    update.returnDate = new Date();
    const Book = mongoose.model('Book');
    const borrowing = await this.model.findOne(this.getQuery());
    const book = await Book.findById(borrowing.book);
    book.available += 1;
    await book.save();
  }
  next();
});

module.exports = mongoose.model('Borrowing', borrowingSchema); 