import React from 'react';
import { Layers, ListTodo, Loader2, CheckCircle2 } from 'lucide-react';

const MetricCards = ({ summary, activeFilter, onFilterChange }) => {
  const cards = [
    {
      id: 'all',
      label: 'Total Tasks',
      count: summary?.total ?? 0,
      icon: Layers,
      colorClass: 'metric-total',
      filterValue: 'all',
    },
    {
      id: 'todo',
      label: 'To-Do',
      count: summary?.todo ?? 0,
      icon: ListTodo,
      colorClass: 'metric-todo',
      filterValue: 'To-Do',
    },
    {
      id: 'in-progress',
      label: 'In-Progress',
      count: summary?.inProgress ?? 0,
      icon: Loader2,
      colorClass: 'metric-progress',
      filterValue: 'In-Progress',
    },
    {
      id: 'done',
      label: 'Completed',
      count: summary?.done ?? 0,
      icon: CheckCircle2,
      colorClass: 'metric-done',
      filterValue: 'Done',
    },
  ];

  return (
    <div className="metric-cards-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.filterValue;

        return (
          <div
            key={card.id}
            className={`metric-card ${card.colorClass} ${isActive ? 'is-active' : ''}`}
            onClick={() => onFilterChange(card.filterValue)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onFilterChange(card.filterValue);
              }
            }}
          >
            <div className="metric-header">
              <span className="metric-label">{card.label}</span>
              <div className="metric-icon-box">
                <Icon size={20} />
              </div>
            </div>
            <div className="metric-count-row">
              <span className="metric-count">{card.count}</span>
              <span className="metric-hint">
                {isActive ? 'Filtered' : 'Click to filter'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricCards;
