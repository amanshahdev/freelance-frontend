/**
 * pages/NotFoundPage.js
 */
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function NotFoundPage() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100vh - var(--nav-h))', textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(80px, 15vw, 160px)', lineHeight: 1,
          color: 'var(--amber)', opacity: 0.2, marginBottom: 8 }}>
          404
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 40px)', marginBottom: 16 }}>
          Page not found
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32, maxWidth: 400, fontSize: 16 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/"    className="btn btn-primary btn-lg">Go Home</Link>
          <Link to="/jobs" className="btn btn-secondary btn-lg">Browse Jobs</Link>
        </div>
      </main>
    </div>
  );
}
