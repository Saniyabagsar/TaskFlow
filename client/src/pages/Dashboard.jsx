import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';
import { Plus, Search, RefreshCw, Filter, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';
import {
  fetchTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../api/taskApi';

import Navbar from '../components/Navbar';
import MetricCards from '../components/MetricCards';
import KanbanColumn from '../components/KanbanColumn';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';

const COLUMNS = [
  { id: 'To-Do', title: 'To-Do' },
  { id: 'In-Progress', title: 'In-Progress' },
  { id: 'Done', title: 'Done' },
];

const Dashboard = () => {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({ total: 0, todo: 0, inProgress: 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedTask, setSelectedTask] = useState(null);
  const [initialModalStatus, setInitialModalStatus] = useState('To-Do');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // DND active item
  const [activeDragTask, setActiveDragTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required to trigger drag
      },
    })
  );

  // Fetch all tasks
  const loadTasks = useCallback(async (showToast = false) => {
    try {
      if (!showToast) setLoading(true);
      else setRefreshing(true);

      const res = await fetchTasks();
      if (res.success && Array.isArray(res.data)) {
        setTasks(res.data);
        if (res.summary) {
          setSummary(res.summary);
        } else {
          // Compute summary manually if not provided
          setSummary({
            total: res.data.length,
            todo: res.data.filter((t) => t.status === 'To-Do').length,
            inProgress: res.data.filter((t) => t.status === 'In-Progress').length,
            done: res.data.filter((t) => t.status === 'Done').length,
          });
        }
        if (showToast) {
          toast.success('Tasks updated.');
        }
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
      toast.error('Failed to load tasks from server. Please check connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Recalculate summary locally whenever tasks change
  const computedSummary = useMemo(() => {
    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'To-Do').length,
      inProgress: tasks.filter((t) => t.status === 'In-Progress').length,
      done: tasks.filter((t) => t.status === 'Done').length,
    };
  }, [tasks]);

  // Filter tasks based on search & column filter
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchQuery, statusFilter]);

  // Group filtered tasks by status column
  const tasksByColumn = useMemo(() => {
    return {
      'To-Do': filteredTasks.filter((t) => t.status === 'To-Do'),
      'In-Progress': filteredTasks.filter((t) => t.status === 'In-Progress'),
      'Done': filteredTasks.filter((t) => t.status === 'Done'),
    };
  }, [filteredTasks]);

  // Handle open create modal
  const handleOpenCreateModal = (columnStatus = 'To-Do') => {
    setModalMode('create');
    setSelectedTask(null);
    setInitialModalStatus(columnStatus);
    setIsModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (task) => {
    setModalMode('edit');
    setSelectedTask(task);
    setInitialModalStatus(task.status);
    setIsModalOpen(true);
  };

  // Handle submit modal (Create or Edit)
  const handleTaskSubmit = async (formData) => {
    setIsSubmittingTask(true);
    try {
      if (modalMode === 'create') {
        const res = await createTask(formData);
        if (res.success && res.data) {
          setTasks((prev) => [res.data, ...prev]);
          toast.success('Task created successfully!');
          setIsModalOpen(false);
        }
      } else if (modalMode === 'edit' && selectedTask) {
        const taskId = selectedTask._id || selectedTask.id;
        const res = await updateTask(taskId, formData);
        if (res.success && res.data) {
          setTasks((prev) =>
            prev.map((t) => ((t._id || t.id) === taskId ? res.data : t))
          );
          toast.success('Task updated successfully!');
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Operation failed.';
      toast.error(msg);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Handle status update (Dropdown or Action)
  const handleStatusChange = async (taskId, newStatus) => {
    const currentTask = tasks.find((t) => (t._id || t.id) === taskId);
    if (!currentTask || currentTask.status === newStatus) return;

    // Optimistic UI update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => ((t._id || t.id) === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await updateTaskStatus(taskId, newStatus);
      if (res.success && res.data) {
        setTasks((prev) =>
          prev.map((t) => ((t._id || t.id) === taskId ? res.data : t))
        );
        toast.success(`Moved to ${newStatus}`);
      }
    } catch (err) {
      // Revert on error
      setTasks(previousTasks);
      const msg = err.response?.data?.message || 'Failed to update status.';
      toast.error(msg);
    }
  };

  // Handle open delete dialog
  const handleOpenDeleteDialog = (task) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    const taskId = taskToDelete._id || taskToDelete.id;

    setIsDeleting(true);
    try {
      const res = await deleteTask(taskId);
      if (res.success) {
        setTasks((prev) => prev.filter((t) => (t._id || t.id) !== taskId));
        toast.success('Task deleted successfully.');
        setIsDeleteDialogOpen(false);
        setTaskToDelete(null);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete task.';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // DND handlers
  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => (t._id || t.id) === active.id);
    if (task) {
      setActiveDragTask(task);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveDragTask(null);

    if (!over) return;

    const taskId = active.id;
    let targetStatus = over.id;

    // If dropped over another task, find that task's status
    if (!['To-Do', 'In-Progress', 'Done'].includes(targetStatus)) {
      const targetTask = tasks.find((t) => (t._id || t.id) === targetStatus);
      if (targetTask) {
        targetStatus = targetTask.status;
      } else {
        return;
      }
    }

    const task = tasks.find((t) => (t._id || t.id) === taskId);
    if (!task || task.status === targetStatus) return;

    await handleStatusChange(taskId, targetStatus);
  };

  return (
    <div className="dashboard-layout">
      {/* Top Navigation */}
      <Navbar onNewTaskClick={() => handleOpenCreateModal('To-Do')} />

      <main className="dashboard-content">
        {/* Welcome & Action Banner */}
        <section className="dashboard-banner">
          <div className="banner-text">
            <div className="welcome-greeting">
              <Sparkles size={20} className="greeting-icon" />
              <span>Hello, {user?.name || 'Developer'}!</span>
            </div>
            <h1 className="dashboard-heading">Project Task Board</h1>
            <p className="dashboard-subheading">
              Track, organize, and prioritize your team's workflow in real time.
            </p>
          </div>

          <div className="banner-actions">
            <button
              type="button"
              className="btn btn-secondary btn-refresh"
              onClick={() => loadTasks(true)}
              disabled={refreshing}
              title="Refresh tasks from server"
            >
              <RefreshCw size={16} className={refreshing ? 'spin-icon' : ''} />
              <span>Sync</span>
            </button>

            <button
              type="button"
              className="btn btn-primary btn-create-main"
              onClick={() => handleOpenCreateModal('To-Do')}
            >
              <Plus size={18} />
              <span>New Task</span>
            </button>
          </div>
        </section>

        {/* Metric Summary Cards */}
        <section className="dashboard-metrics-section">
          <MetricCards
            summary={computedSummary}
            activeFilter={statusFilter}
            onFilterChange={(val) => setStatusFilter(val)}
          />
        </section>

        {/* Filter and Search Bar */}
        <section className="dashboard-controls-bar">
          <div className="search-input-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-field"
              placeholder="Search tasks by title or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>

          <div className="filter-dropdown-box">
            <Filter size={16} className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
              aria-label="Filter by column status"
            >
              <option value="all">All Columns</option>
              <option value="To-Do">To-Do Only</option>
              <option value="In-Progress">In-Progress Only</option>
              <option value="Done">Done Only</option>
            </select>
          </div>
        </section>

        {/* Kanban Board with Drag and Drop */}
        {loading ? (
          <div className="board-loading-container">
            <LoadingSpinner size="large" message="Loading your task board..." />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="kanban-board-grid">
              {COLUMNS.map((col) => {
                if (statusFilter !== 'all' && statusFilter !== col.id) {
                  return null;
                }
                return (
                  <KanbanColumn
                    key={col.id}
                    status={col.id}
                    title={col.title}
                    tasks={tasksByColumn[col.id] || []}
                    onAddTask={handleOpenCreateModal}
                    onEditTask={handleOpenEditModal}
                    onDeleteTask={handleOpenDeleteDialog}
                    onStatusChange={handleStatusChange}
                  />
                );
              })}
            </div>

            {/* Drag Overlay for smooth visual representation */}
            <DragOverlay>
              {activeDragTask ? (
                <div className="drag-overlay-card">
                  <TaskCard
                    task={activeDragTask}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    onStatusChange={() => {}}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      {/* Create / Edit Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        mode={modalMode}
        task={selectedTask}
        initialStatus={initialModalStatus}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleTaskSubmit}
        isSubmitting={isSubmittingTask}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Task"
        message={`Are you sure you want to permanently delete "${taskToDelete?.title}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        isProcessing={isDeleting}
      />
    </div>
  );
};

export default Dashboard;
