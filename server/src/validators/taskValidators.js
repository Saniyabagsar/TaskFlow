const { body, param } = require('express-validator');
const { validate } = require('./authValidators');

const ALLOWED_STATUSES = ['To-Do', 'In-Progress', 'Done'];

const createTaskValidator = validate([
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 1, max: 120 })
    .withMessage('Title must be between 1 and 120 characters'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`),
]);

const updateTaskValidator = validate([
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID format'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 1, max: 120 })
    .withMessage('Title must be between 1 and 120 characters'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`),
]);

const updateStatusValidator = validate([
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID format'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`),
]);

const taskIdParamValidator = validate([
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID format'),
]);

module.exports = {
  createTaskValidator,
  updateTaskValidator,
  updateStatusValidator,
  taskIdParamValidator,
  ALLOWED_STATUSES,
};
