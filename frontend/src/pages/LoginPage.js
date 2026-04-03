/**
 * pages/LoginPage.js
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import './AuthPages.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const { token, user } = res.data;
      login(token, user);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'client' ? '/dashboard/client' : '/dashboard/freelancer');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-bg-grid" />
      <div className="auth-glow" />
      <div className="auth-card page-enter">
        <div className="auth-logo">
          <Link to="/" className="auth-logo-link">
            <div className="logo-mark" style={{ width: 40, height: 40, fontSize: 22 }}>F</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>
              Freelance<span style={{ color: 'var(--amber)' }}>Hub</span>
            </span>
          </Link>
        </div>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-icon-wrap">
              <FiMail className="input-icon" size={16} />
              <input
                className="form-input input-with-icon"
                type="email" name="email"
                placeholder="you@example.com"
                value={form.email} onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrap">
              <FiLock className="input-icon" size={16} />
              <input
                className="form-input input-with-icon"
                type={showPw ? 'text' : 'password'} name="password"
                placeholder="Your password"
                value={form.password} onChange={handleChange}
                autoComplete="current-password"
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)}>
                {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <><div className="spinner" /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup" className="auth-link">Create one</Link>
        </p>
      </div>
    </div>
  );
}
