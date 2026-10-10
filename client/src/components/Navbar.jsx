import React from 'react';
import { LogOut, CheckSquare, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onNewTaskClick }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="app-navbar">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <div className="navbar-brand">
          <div className="brand-logo-icon">
            <CheckSquare size={22} className="logo-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-title">TaskFlow</span>
            <span className="brand-badge">PRO</span>
          </div>
        </div>

        {/* User profile & actions */}
        <div className="navbar-actions">
          {user && (
            <div className="user-profile-widget">
              <div className="user-avatar" title={user.name}>
                {getInitials(user.name)}
              </div>
              <div className="user-info-text">
                <span className="user-name">{user.name}</span>
                <span className="user-email">{user.email}</span>
              </div>
            </div>
          )}

          <button
            type="button"
            className="btn btn-logout"
            onClick={handleLogout}
            title="Log out of TaskFlow"
            aria-label="Log out"
          >
            <LogOut size={16} />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
