import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  const sizeClass = {
    small: 'spinner-sm',
    medium: 'spinner-md',
    large: 'spinner-lg',
  }[size] || 'spinner-md';

  return (
    <div className="spinner-wrapper" role="status" aria-live="polite">
      <div className={`spinner ${sizeClass}`}></div>
      {message && <p className="spinner-message">{message}</p>}
      <span className="sr-only">Loading</span>
    </div>
  );
};

export default LoadingSpinner;
