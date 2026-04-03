/**
 * components/Navbar.js
 *
 * WHAT: Top navigation bar — logo, links, auth state, mobile menu.
 * HOW:  Reads user from AuthContext; shows role-specific links.
 *       Mobile hamburger toggles a drawer. Transparent on scroll-top,
 *       solid on scroll-down.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBriefcase, FiUser, FiLogOut, FiMenu, FiX, FiChevronDown, FiPlus } from 'react-icons/fi';
import AvatarPlaceholder from './AvatarPlaceholder';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [dropOpen,    setDropOpen]    = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); setDropOpen(false); setMenuOpen(false); };

  const dashboardPath = user?.role === 'client' ? '/dashboard/client' : '/dashboard/freelancer';

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-mark">F</span>
          <span className="logo-text">Freelance<span className="logo-accent">Hub</span></span>
        </Link>

        {/* Desktop links */}
        <div className="navbar-links">
          <NavLink to="/jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Browse Jobs
          </NavLink>
          <NavLink to="/freelancers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Find Talent
          </NavLink>
          {user?.role === 'client' && (
            <NavLink to="/my-jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              My Jobs
            </NavLink>
          )}
          {user?.role === 'freelancer' && (
            <NavLink to="/my-applications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Applications
            </NavLink>
          )}
        </div>

        {/* Desktop auth */}
        <div className="navbar-auth">
          {user ? (
            <>
              {user.role === 'client' && (
                <Link to="/jobs/create" className="btn btn-primary btn-sm">
                  <FiPlus size={14} /> Post Job
                </Link>
              )}
              <div className="user-dropdown" ref={dropRef}>
                <button className="user-trigger" onClick={() => setDropOpen(v => !v)}>
                  <AvatarPlaceholder name={user.name} size={32} />
                  <span className="user-name">{user.name.split(' ')[0]}</span>
                  <FiChevronDown size={14} className={`drop-arrow ${dropOpen ? 'open' : ''}`} />
                </button>
                {dropOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <AvatarPlaceholder name={user.name} size={40} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</div>
                        <span className={`badge ${user.role === 'client' ? 'badge-amber' : 'badge-blue'}`} style={{ marginTop: 4 }}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to={dashboardPath} className="dropdown-item" onClick={() => setDropOpen(false)}>
                      <FiBriefcase size={15} /> Dashboard
                    </Link>
                    <Link to={`/profile/${user._id}`} className="dropdown-item" onClick={() => setDropOpen(false)}>
                      <FiUser size={15} /> My Profile
                    </Link>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item danger" onClick={handleLogout}>
                      <FiLogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login"  className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="mobile-drawer">
          <NavLink to="/jobs"        className="mobile-link" onClick={() => setMenuOpen(false)}>Browse Jobs</NavLink>
          <NavLink to="/freelancers" className="mobile-link" onClick={() => setMenuOpen(false)}>Find Talent</NavLink>
          {user?.role === 'client' && (
            <NavLink to="/my-jobs"   className="mobile-link" onClick={() => setMenuOpen(false)}>My Jobs</NavLink>
          )}
          {user?.role === 'freelancer' && (
            <NavLink to="/my-applications" className="mobile-link" onClick={() => setMenuOpen(false)}>Applications</NavLink>
          )}
          <div className="mobile-drawer-divider" />
          {user ? (
            <>
              <NavLink to={dashboardPath}       className="mobile-link" onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
              <NavLink to={`/profile/${user._id}`} className="mobile-link" onClick={() => setMenuOpen(false)}>Profile</NavLink>
              {user.role === 'client' && (
                <Link to="/jobs/create" className="btn btn-primary btn-sm" style={{ margin: '8px 16px' }} onClick={() => setMenuOpen(false)}>
                  <FiPlus size={14} /> Post Job
                </Link>
              )}
              <button className="mobile-link danger" onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 8, padding: '8px 16px' }}>
              <Link to="/login"  className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm"   style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
