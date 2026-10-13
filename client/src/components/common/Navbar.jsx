import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HeartPulse,
  Calendar,
  LogOut,
  User,
  Shield,
  Stethoscope,
  Menu,
  X,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isDoctor, isPatient } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/dashboard/admin';
    if (isDoctor) return '/dashboard/doctor';
    return '/dashboard/patient';
  };

  const getDashboardLabel = () => {
    if (isAdmin) return 'Admin Panel';
    if (isDoctor) return 'Doctor Portal';
    return 'My Appointments';
  };

  const getDashboardIcon = () => {
    if (isAdmin) return <Shield size={16} />;
    if (isDoctor) return <Stethoscope size={16} />;
    return <Calendar size={16} />;
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon">
            <HeartPulse size={22} />
          </div>
          <span>Doctors<span className="brand-highlight">Cares</span></span>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="nav-links">
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/doctors" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Doctors
            </NavLink>
          </li>
          <li>
            <NavLink to="/departments" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Departments
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              About Us
            </NavLink>
          </li>
          <li>
            <NavLink to="/contact" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Contact
            </NavLink>
          </li>
        </ul>

        {/* Auth Group */}
        <div className="nav-auth-group">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to={getDashboardPath()} className="btn btn-outline-primary btn-sm">
                {getDashboardIcon()}
                <span>{getDashboardLabel()}</span>
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                  alt={user?.name}
                  className="nav-user-avatar"
                />
                <span className="nav-user-name" style={{ display: 'none', '@media (min-width: 768px)': { display: 'inline' } }}>
                  {user?.name?.split(' ')[0]}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-outline btn-sm"
                  title="Logout"
                  style={{ padding: '0.4rem 0.6rem' }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                <User size={15} />
                <span>Log In</span>
              </Link>
              <Link to="/doctors" className="btn btn-primary btn-sm">
                <Calendar size={15} />
                <span>Book Appointment</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--color-border)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className="nav-link">
            Home
          </NavLink>
          <NavLink to="/doctors" onClick={() => setMobileMenuOpen(false)} className="nav-link">
            Doctors
          </NavLink>
          <NavLink to="/departments" onClick={() => setMobileMenuOpen(false)} className="nav-link">
            Departments
          </NavLink>
          <NavLink to="/about" onClick={() => setMobileMenuOpen(false)} className="nav-link">
            About Us
          </NavLink>
          <NavLink to="/contact" onClick={() => setMobileMenuOpen(false)} className="nav-link">
            Contact
          </NavLink>
          {isAuthenticated && (
            <NavLink to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)} className="nav-link" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              {getDashboardLabel()}
            </NavLink>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
