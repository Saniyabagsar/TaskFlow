import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, CheckSquare, AlertCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isSessionExpired = new URLSearchParams(location.search).get('expired') === '1';

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      await login(formData.email.trim(), formData.password);
      toast.success('Welcome back to TaskFlow!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to sign in. Please verify your credentials.';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-brand-badge">
            <CheckSquare size={28} className="text-primary" />
          </div>
          <h2 className="auth-title">Welcome to TaskFlow</h2>
          <p className="auth-subtitle">Sign in to organize and manage your tasks</p>
        </div>

        {isSessionExpired && (
          <div className="alert-banner warning">
            <AlertCircle size={16} />
            <span>Your session has expired. Please sign in again.</span>
          </div>
        )}

        {serverError && (
          <div className="alert-banner error" role="alert">
            <AlertCircle size={16} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Email Input */}
          <div className="form-group">
            <label htmlFor="email" className="form-label required">
              Email Address
            </label>
            <div className="input-icon-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                className={`form-input has-icon ${errors.email ? 'input-error' : ''}`}
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="form-error-text">
                <AlertCircle size={14} />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="password" className="form-label required">
                Password
              </label>
            </div>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                className={`form-input has-icon has-toggle ${errors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="input-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="form-error-text">
                <AlertCircle size={14} />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="btn-loading-content">
                <span className="spinner spinner-xs"></span>
                <span>Signing in...</span>
              </span>
            ) : (
              <span className="btn-icon-content">
                <span>Sign In to Dashboard</span>
                <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don&apos;t have an account?{' '}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
