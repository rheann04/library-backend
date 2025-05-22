const express = require('express');
const router = express.Router();
const Borrowing = require('../models/Borrowing');
const Book = require('../models/Book');
const { auth, isAdmin } = require('../middleware/auth');

// Get all borrowings (admin only)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const borrowings = await Borrowing.find()
      .populate('book')
      .populate('user', 'username');
    res.json(borrowings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching borrowings' });
  }
});

// Get user's borrowings
router.get('/my-borrowings', auth, async (req, res) => {
  try {
    const borrowings = await Borrowing.find({ user: req.user._id })
      .populate('book');
    res.json(borrowings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching borrowings' });
  }
});

// Borrow a book
router.post('/', auth, async (req, res) => {
  try {
    const { bookId, dueDate } = req.body;

    // Check if book exists and is available
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (book.available <= 0) {
      return res.status(400).json({ message: 'Book is not available' });
    }

    // Check if user already has this book borrowed
    const existingBorrowing = await Borrowing.findOne({
      user: req.user._id,
      book: bookId,
      status: 'borrowed'
    });

    if (existingBorrowing) {
      return res.status(400).json({ message: 'You have already borrowed this book' });
    }

    // Create borrowing record
    const borrowing = new Borrowing({
      book: bookId,
      user: req.user._id,
      dueDate: new Date(dueDate)
    });

    await borrowing.save();
    res.status(201).json(borrowing);
  } catch (error) {
    res.status(500).json({ message: 'Error borrowing book' });
  }
});

// Return a book
router.put('/:id/return', auth, async (req, res) => {
  try {
    const borrowing = await Borrowing.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: 'borrowed'
    });

    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }

    borrowing.status = 'returned';
    borrowing.returnDate = new Date();
    await borrowing.save();

    res.json(borrowing);
  } catch (error) {
    res.status(500).json({ message: 'Error returning book' });
  }
});

module.exports = router; 