import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus, ListTodo, Loader2, CheckCircle2 } from 'lucide-react';
import TaskCard from './TaskCard';
import EmptyState from './EmptyState';

const KanbanColumn = ({
  status,
  title,
  tasks = [],
  onAddTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
    data: { status },
  });

  const getColumnIcon = () => {
    switch (status) {
      case 'To-Do':
        return <ListTodo size={18} className="col-icon text-indigo" />;
      case 'In-Progress':
        return <Loader2 size={18} className="col-icon text-amber" />;
      case 'Done':
        return <CheckCircle2 size={18} className="col-icon text-emerald" />;
      default:
        return null;
    }
  };

  const getColumnClass = () => {
    switch (status) {
      case 'To-Do':
        return 'col-todo';
      case 'In-Progress':
        return 'col-progress';
      case 'Done':
        return 'col-done';
      default:
        return '';
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column ${getColumnClass()} ${isOver ? 'column-droppable-active' : ''}`}
    >
      <div className="kanban-column-header">
        <div className="column-title-group">
          {getColumnIcon()}
          <h3 className="column-title">{title}</h3>
          <span className="column-count">{tasks.length}</span>
        </div>

        <button
          type="button"
          className="btn-column-add"
          onClick={() => onAddTask(status)}
          title={`Add task to ${title}`}
          aria-label={`Add task to ${title}`}
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="kanban-task-list">
        {tasks.length === 0 ? (
          <EmptyState
            status={status}
            onAction={() => onAddTask(status)}
            actionText={`Add to ${title}`}
          />
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id || task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
