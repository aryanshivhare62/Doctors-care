import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Checking authentication session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="container section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: '520px', padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--color-danger)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <ShieldAlert size={56} />
          </div>
          <h2 style={{ marginBottom: '0.75rem' }}>Access Restricted</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Your account role (<strong>{user.role}</strong>) does not have permission to view this section.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/" className="btn btn-outline">Return to Home</Link>
            {user.role === 'doctor' && <Link to="/dashboard/doctor" className="btn btn-primary">Doctor Portal</Link>}
            {user.role === 'admin' && <Link to="/dashboard/admin" className="btn btn-primary">Admin Panel</Link>}
            {user.role === 'patient' && <Link to="/dashboard/patient" className="btn btn-primary">My Dashboard</Link>}
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
