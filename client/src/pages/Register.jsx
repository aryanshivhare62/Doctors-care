import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorAlert from '../components/common/ErrorAlert';
import { HeartPulse, User, Mail, Lock, Phone, Droplet } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    phone: '',
    gender: 'male',
    bloodGroup: 'O+',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorsList, setErrorsList] = useState([]);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setErrorsList([]);

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const res = await register(formData);
      const user = res.data.user;

      if (user.role === 'doctor') {
        navigate('/dashboard/doctor', { replace: true });
      } else {
        navigate('/dashboard/patient', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
      if (err.errors) setErrorsList(err.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div className="brand-icon">
              <HeartPulse size={20} />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy)' }}>
              Doctors<span style={{ color: 'var(--color-primary)' }}>Cares</span>
            </span>
          </Link>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join Doctors Cares for personalized digital patient management</p>
        </div>

        <ErrorAlert message={error} errors={errorsList} onClose={() => setError(null)} />

        <form onSubmit={handleSubmit}>
          {/* Account Role Selector */}
          <div className="form-group">
            <label className="form-label">I am registering as a:</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem',
                  border: formData.role === 'patient' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  background: formData.role === 'patient' ? 'var(--color-primary-soft)' : '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="patient"
                  checked={formData.role === 'patient'}
                  onChange={handleChange}
                />
                <span>Patient</span>
              </label>

              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem',
                  border: formData.role === 'doctor' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  background: formData.role === 'doctor' ? 'var(--color-primary-soft)' : '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="doctor"
                  checked={formData.role === 'doctor'}
                  onChange={handleChange}
                />
                <span>Doctor / Clinician</span>
              </label>
            </div>
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name *</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                placeholder={formData.role === 'doctor' ? 'Dr. Jane Doe' : 'Jane Doe'}
                value={formData.name}
                onChange={handleChange}
                style={{ paddingLeft: '38px' }}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleChange}
                style={{ paddingLeft: '38px' }}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password (min 6 characters) *</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                style={{ paddingLeft: '38px' }}
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Phone & Gender Row */}
          <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-control"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                className="form-select"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Blood Group */}
          {formData.role === 'patient' && (
            <div className="form-group">
              <label className="form-label" htmlFor="bloodGroup">Blood Group</label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                className="form-select"
                value={formData.bloodGroup}
                onChange={handleChange}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
