import React from 'react';
import { Inbox, PlusCircle, CheckCircle2, Clock, Sparkles } from 'lucide-react';

const EmptyState = ({ status, onAction, actionText = 'Create Task' }) => {
  const getIcon = () => {
    switch (status) {
      case 'To-Do':
        return <Inbox className="empty-icon text-indigo" size={40} />;
      case 'In-Progress':
        return <Clock className="empty-icon text-amber" size={40} />;
      case 'Done':
        return <CheckCircle2 className="empty-icon text-emerald" size={40} />;
      default:
        return <Sparkles className="empty-icon text-indigo" size={40} />;
    }
  };

  const getMessage = () => {
    switch (status) {
      case 'To-Do':
        return {
          title: 'No tasks to do',
          subtitle: 'Ready to kick off a new task? Add it here.',
        };
      case 'In-Progress':
        return {
          title: 'No tasks in progress',
          subtitle: 'Drag a task here or update its status to track active work.',
        };
      case 'Done':
        return {
          title: 'No completed tasks yet',
          subtitle: 'Tasks marked as Done will show up here. Keep up the momentum!',
        };
      default:
        return {
          title: 'No tasks found',
          subtitle: 'Try adjusting your search filter or create your first task.',
        };
    }
  };

  const { title, subtitle } = getMessage();

  return (
    <div className="empty-state-container">
      <div className="empty-icon-box">{getIcon()}</div>
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-subtitle">{subtitle}</p>
      {onAction && (
        <button
          type="button"
          className="btn btn-outline btn-sm empty-action-btn"
          onClick={onAction}
        >
          <PlusCircle size={16} />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
