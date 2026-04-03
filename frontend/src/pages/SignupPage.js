/**
 * pages/SignupPage.js
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiBriefcase } from 'react-icons/fi';
import './AuthPages.css';

export default function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'freelancer' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const res = await authAPI.signup(form);
      const { token, user } = res.data;
      login(token, user);
      toast.success('Account created! Welcome to FreelanceHub 🎉');
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
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Join thousands of clients and freelancers</p>

        {/* Role selector */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${form.role === 'freelancer' ? 'active' : ''}`}
            onClick={() => setForm(f => ({ ...f, role: 'freelancer' }))}
          >
            <FiUser size={18} />
            <div>
              <div style={{ fontWeight: 600 }}>Freelancer</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>I'm looking for work</div>
            </div>
          </button>
          <button
            type="button"
            className={`role-btn ${form.role === 'client' ? 'active' : ''}`}
            onClick={() => setForm(f => ({ ...f, role: 'client' }))}
          >
            <FiBriefcase size={18} />
            <div>
              <div style={{ fontWeight: 600 }}>Client</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>I'm hiring talent</div>
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-icon-wrap">
              <FiUser className="input-icon" size={16} />
              <input className="form-input input-with-icon" type="text" name="name"
                placeholder="Alice Johnson" value={form.name} onChange={handleChange} autoComplete="name" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-icon-wrap">
              <FiMail className="input-icon" size={16} />
              <input className="form-input input-with-icon" type="email" name="email"
                placeholder="you@example.com" value={form.email} onChange={handleChange} autoComplete="email" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrap">
              <FiLock className="input-icon" size={16} />
              <input className="form-input input-with-icon" type={showPw ? 'text' : 'password'}
                name="password" placeholder="Min. 8 characters, 1 uppercase, 1 number"
                value={form.password} onChange={handleChange} autoComplete="new-password" />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)}>
                {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <><div className="spinner" /> Creating account…</> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
