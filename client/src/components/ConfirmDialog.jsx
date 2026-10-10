import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  title = 'Delete Task',
  message = 'Are you sure you want to delete this task? This action cannot be undone.',
  confirmText = 'Delete Task',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isProcessing = false,
}) => {
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Focus confirm button when dialog opens
      setTimeout(() => confirmBtnRef.current?.focus(), 50);

      // Close on Escape
      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && !isProcessing) {
          onCancel();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isProcessing, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={() => !isProcessing && onCancel()}>
      <div
        className="modal-dialog modal-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <div className="icon-badge danger">
              <AlertTriangle size={20} />
            </div>
            <h3 id="dialog-title" className="modal-title">
              {title}
            </h3>
          </div>
          <button
            type="button"
            className="btn-icon-close"
            onClick={onCancel}
            disabled={isProcessing}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="dialog-message">{message}</p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isProcessing}
          >
            {cancelText}
          </button>
          <button
            type="button"
            ref={confirmBtnRef}
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
