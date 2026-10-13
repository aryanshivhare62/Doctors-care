import React from 'react';
import { Link } from 'react-router-dom';
import { HeartCrack, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="container section" style={{ minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '520px', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--color-primary)', marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
          <HeartCrack size={64} />
        </div>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', color: 'var(--color-navy)' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          The healthcare resource or page you are looking for does not exist or may have been relocated.
        </p>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Home size={18} />
          <span>Return To Homepage</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
