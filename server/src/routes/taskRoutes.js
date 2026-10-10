const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const {
  createTaskValidator,
  updateTaskValidator,
  updateStatusValidator,
  taskIdParamValidator,
} = require('../validators/taskValidators');
const { protect } = require('../middleware/authMiddleware');

// All task routes require authentication
router.use(protect);

// GET /api/tasks - List all tasks for authenticated user
// POST /api/tasks - Create new task
router
  .route('/')
  .get(getTasks)
  .post(createTaskValidator, createTask);

// GET /api/tasks/:id - Get single task
// PUT /api/tasks/:id - Update task details
// DELETE /api/tasks/:id - Delete task
router
  .route('/:id')
  .get(taskIdParamValidator, getTaskById)
  .put(updateTaskValidator, updateTask)
  .delete(taskIdParamValidator, deleteTask);

// PATCH /api/tasks/:id/status - Update task status only
router.patch('/:id/status', updateStatusValidator, updateTaskStatus);

module.exports = router;
