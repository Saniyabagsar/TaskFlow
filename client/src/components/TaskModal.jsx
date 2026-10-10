import React, { useState, useEffect, useRef } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'To-Do', label: 'To-Do', colorClass: 'badge-todo' },
  { value: 'In-Progress', label: 'In-Progress', colorClass: 'badge-progress' },
  { value: 'Done', label: 'Done', colorClass: 'badge-done' },
];

const TaskModal = ({
  isOpen,
  mode = 'create', // 'create' | 'edit'
  task = null,
  initialStatus = 'To-Do',
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: initialStatus,
  });
  const [errors, setErrors] = useState({});
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && task) {
        setFormData({
          title: task.title || '',
          description: task.description || '',
          status: task.status || 'To-Do',
        });
      } else {
        setFormData({
          title: '',
          description: '',
          status: initialStatus || 'To-Do',
        });
      }
      setErrors({});

      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && !isSubmitting) {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, mode, task, initialStatus, isSubmitting, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required.';
    } else if (formData.title.trim().length > 120) {
      newErrors.title = 'Title must be 120 characters or fewer.';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters.';
    }

    if (!['To-Do', 'In-Progress', 'Done'].includes(formData.status)) {
      newErrors.status = 'Please select a valid status.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status,
    });
  };

  return (
    <div className="modal-backdrop" onClick={() => !isSubmitting && onClose()}>
      <div
        className="modal-dialog modal-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="task-modal-title" className="modal-title">
            {mode === 'edit' ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button
            type="button"
            className="btn-icon-close"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title Field */}
            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="task-title" className="form-label required">
                  Task Title
                </label>
                <span className="char-count">
                  {formData.title.length}/120
                </span>
              </div>
              <input
                id="task-title"
                ref={titleInputRef}
                type="text"
                name="title"
                className={`form-input ${errors.title ? 'input-error' : ''}`}
                placeholder="e.g. Integrate payment gateway or Update schema"
                value={formData.title}
                onChange={handleChange}
                maxLength={120}
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="form-error-text">
                  <AlertCircle size={14} />
                  <span>{errors.title}</span>
                </p>
              )}
            </div>

            {/* Description Field */}
            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="task-desc" className="form-label">
                  Description <span className="text-muted">(Optional)</span>
                </label>
                <span className="char-count">
                  {formData.description.length}/1000
                </span>
              </div>
              <textarea
                id="task-desc"
                name="description"
                rows={4}
                className={`form-textarea ${errors.description ? 'input-error' : ''}`}
                placeholder="Provide helpful details, checklist items, or context..."
                value={formData.description}
                onChange={handleChange}
                maxLength={1000}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="form-error-text">
                  <AlertCircle size={14} />
                  <span>{errors.description}</span>
                </p>
              )}
            </div>

            {/* Status Field */}
            <div className="form-group">
              <label htmlFor="task-status" className="form-label required">
                Status Column
              </label>
              <div className="status-radio-group">
                {STATUS_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`status-radio-card ${formData.status === opt.value ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={opt.value}
                      checked={formData.status === opt.value}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    <span className={`status-indicator ${opt.colorClass}`} />
                    <span className="status-label-text">{opt.label}</span>
                    {formData.status === opt.value && <Check size={16} className="check-icon" />}
                  </label>
                ))}
              </div>
              {errors.status && (
                <p className="form-error-text">
                  <AlertCircle size={14} />
                  <span>{errors.status}</span>
                </p>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? mode === 'edit'
                  ? 'Saving Changes...'
                  : 'Creating Task...'
                : mode === 'edit'
                ? 'Save Changes'
                : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
