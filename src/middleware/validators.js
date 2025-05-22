const { body, param, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Auth validators
const authValidators = {
  register: [
    body('username')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters long'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    validate
  ],
  login: [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ]
};

// Book validators
const bookValidators = {
  create: [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('author').trim().notEmpty().withMessage('Author is required'),
    body('isbn').trim().notEmpty().withMessage('ISBN is required'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a positive number'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    validate
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid book ID'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('author').optional().trim().notEmpty().withMessage('Author cannot be empty'),
    body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a positive number'),
    validate
  ],
  id: [
    param('id').isMongoId().withMessage('Invalid book ID'),
    validate
  ]
};

// Borrowing validators
const borrowingValidators = {
  create: [
    body('bookId').isMongoId().withMessage('Invalid book ID'),
    body('dueDate').isISO8601().withMessage('Invalid due date'),
    validate
  ],
  return: [
    param('id').isMongoId().withMessage('Invalid borrowing ID'),
    validate
  ]
};

module.exports = {
  authValidators,
  bookValidators,
  borrowingValidators
}; 