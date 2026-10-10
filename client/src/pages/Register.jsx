import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, CheckSquare, AlertCircle, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
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
      await register(formData.name.trim(), formData.email.trim(), formData.password);
      toast.success('Account created successfully! Welcome to TaskFlow.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please check your details and try again.';
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
          <h2 className="auth-title">Create your Account</h2>
          <p className="auth-subtitle">Get started with your personal Kanban board</p>
        </div>

        {serverError && (
          <div className="alert-banner error" role="alert">
            <AlertCircle size={16} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="name" className="form-label required">
              Full Name
            </label>
            <div className="input-icon-wrapper">
              <User className="input-icon" size={18} />
              <input
                id="name"
                type="text"
                name="name"
                autoComplete="name"
                className={`form-input has-icon ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g. Sarah Connor"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
            {errors.name && (
              <p className="form-error-text">
                <AlertCircle size={14} />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Email Address */}
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

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="form-label required">
              Password
            </label>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                className={`form-input has-icon has-toggle ${errors.password ? 'input-error' : ''}`}
                placeholder="At least 6 characters"
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

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label required">
              Confirm Password
            </label>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                autoComplete="new-password"
                className={`form-input has-icon has-toggle ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="input-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="form-error-text">
                <AlertCircle size={14} />
                <span>{errors.confirmPassword}</span>
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
                <span>Creating Account...</span>
              </span>
            ) : (
              <span className="btn-icon-content">
                <span>Create Free Account</span>
                <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
