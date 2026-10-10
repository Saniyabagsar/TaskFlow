import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Edit2, Trash2, GripVertical, Calendar, ArrowRightLeft } from 'lucide-react';

const STATUS_OPTIONS = ['To-Do', 'In-Progress', 'Done'];

const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  isDraggingOver = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task._id || task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'To-Do':
        return 'badge-todo';
      case 'In-Progress':
        return 'badge-progress';
      case 'Done':
        return 'badge-done';
      default:
        return 'badge-todo';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? 'is-dragging' : ''}`}
    >
      <div className="task-card-header">
        <span className={`status-badge ${getStatusBadgeClass(task.status)}`}>
          {task.status}
        </span>

        {/* Drag handle button */}
        <button
          type="button"
          {...listeners}
          {...attributes}
          className="btn-drag-handle"
          title="Drag task to another column"
          aria-label="Drag task"
        >
          <GripVertical size={16} />
        </button>
      </div>

      <h4 className="task-card-title">{task.title}</h4>

      {task.description && (
        <p className="task-card-description">{task.description}</p>
      )}

      <div className="task-card-meta">
        <div className="task-date">
          <Calendar size={13} />
          <span>{formatDate(task.updatedAt || task.createdAt)}</span>
        </div>

        {/* Quick status selector */}
        <div className="task-status-selector">
          <ArrowRightLeft size={13} className="text-muted" />
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task._id || task.id, e.target.value)}
            className="status-dropdown"
            aria-label="Change status"
          >
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="task-card-actions">
        <button
          type="button"
          className="btn-card-action btn-edit"
          onClick={() => onEdit(task)}
          title="Edit task"
          aria-label="Edit task"
        >
          <Edit2 size={14} />
          <span>Edit</span>
        </button>

        <button
          type="button"
          className="btn-card-action btn-delete"
          onClick={() => onDelete(task)}
          title="Delete task"
          aria-label="Delete task"
        >
          <Trash2 size={14} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
