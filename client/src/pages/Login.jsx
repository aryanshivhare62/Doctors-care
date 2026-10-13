import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorAlert from '../components/common/ErrorAlert';
import { HeartPulse, LogIn, Lock, Mail, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const res = await login(email, password);
      const user = res.data.user;

      // Navigate to intended page or role dashboard
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'admin') {
        navigate('/dashboard/admin', { replace: true });
      } else if (user.role === 'doctor') {
        navigate('/dashboard/doctor', { replace: true });
      } else {
        navigate('/dashboard/patient', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo accounts autofill helper
  const handleFillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div className="brand-icon">
              <HeartPulse size={20} />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy)' }}>
              Doctors<span style={{ color: 'var(--color-primary)' }}>Cares</span>
            </span>
          </Link>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to manage your appointments and health records</p>
        </div>

        <ErrorAlert message={error} onClose={() => setError(null)} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '38px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Accounts Bar */}
        <div className="demo-account-pills">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.785rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            <Sparkles size={14} color="var(--color-primary)" />
            <span>Click To Autofill Demo Credentials:</span>
          </div>
          <div className="demo-pills-wrap">
            <button
              type="button"
              className="demo-pill"
              onClick={() => handleFillDemo('patient@doctorscares.com', 'Patient@123')}
            >
              👤 Patient (Alex)
            </button>
            <button
              type="button"
              className="demo-pill"
              onClick={() => handleFillDemo('marcus.sterling@doctorscares.com', 'Doctor@123')}
            >
              🩺 Doctor (Dr. Sterling)
            </button>
            <button
              type="button"
              className="demo-pill"
              onClick={() => handleFillDemo('admin@doctorscares.com', 'Admin@123')}
            >
              👑 Admin (System)
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
