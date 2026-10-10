const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['To-Do', 'In-Progress', 'Done'],
        message: '{VALUE} is not a valid status. Allowed: To-Do, In-Progress, Done',
      },
      default: 'To-Do',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for fast queries by user and status
taskSchema.index({ userId: 1, status: 1, createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
