const Task = require('../models/Task');

// @desc    Get all tasks for current authenticated user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const query = { userId: req.user._id };

    // Support status filter if provided in query string
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Support search query if provided
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });

    // Compute task counts by status for summary cards
    const totalCount = await Task.countDocuments({ userId: req.user._id });
    const todoCount = await Task.countDocuments({ userId: req.user._id, status: 'To-Do' });
    const inProgressCount = await Task.countDocuments({ userId: req.user._id, status: 'In-Progress' });
    const doneCount = await Task.countDocuments({ userId: req.user._id, status: 'Done' });

    res.status(200).json({
      success: true,
      count: tasks.length,
      summary: {
        total: totalCount,
        todo: todoCount,
        inProgress: inProgressCount,
        done: doneCount,
      },
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to view it.',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      status: status || 'To-Do',
      userId: req.user._id, // Strictly derived from JWT
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details (title, description, status)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to modify it.',
      });
    }

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status !== undefined) task.status = status;

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status only
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to modify it.',
      });
    }

    task.status = status;
    await task.save();

    res.status(200).json({
      success: true,
      message: `Task status updated to ${status}.`,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to delete it.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
