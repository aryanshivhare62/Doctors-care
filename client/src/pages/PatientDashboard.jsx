import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../api/appointmentService';
import { dashboardService } from '../api/dashboardService';
import AppointmentCard from '../components/appointments/AppointmentCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import SuccessAlert from '../components/common/SuccessAlert';
import {
  Calendar,
  Clock,
  CheckCircle,
  User,
  Settings,
  PlusCircle,
  AlertCircle,
  Save,
  Lock,
} from 'lucide-react';

const PatientDashboard = () => {
  const { user, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('appointments');
  const [statusFilter, setStatusFilter] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertError, setAlertError] = useState(null);
  const [alertSuccess, setAlertSuccess] = useState(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    gender: user?.gender || 'male',
    bloodGroup: user?.bloodGroup || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postalCode: user?.address?.postalCode || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Fetch appointments and stats
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setAlertError(null);

      const [apptRes, statsRes] = await Promise.all([
        appointmentService.getMyPatientAppointments(statusFilter ? { status: statusFilter } : {}),
        dashboardService.getPatientStats(),
      ]);

      setAppointments(apptRes.data || []);
      setStats(statsRes.data?.counts || null);
    } catch (err) {
      setAlertError(err.message || 'Failed to load patient dashboard.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle appointment cancellation
  const handleCancelAppointment = async (id, reason) => {
    try {
      const res = await appointmentService.cancelAppointment(id, reason);
      setAlertSuccess(res.message || 'Appointment cancelled successfully');
      fetchData();
    } catch (err) {
      setAlertError(err.message || 'Failed to cancel appointment');
    }
  };

  // Handle profile update submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setAlertError(null);
    setAlertSuccess(null);

    try {
      setProfileSaving(true);
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        gender: profileForm.gender,
        bloodGroup: profileForm.bloodGroup,
        address: {
          street: profileForm.street,
          city: profileForm.city,
          state: profileForm.state,
          postalCode: profileForm.postalCode,
        },
      });
      setAlertSuccess('Your personal profile has been updated successfully!');
    } catch (err) {
      setAlertError(err.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="dashboard-user-greeting">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
              alt={user?.name}
              className="dashboard-avatar"
            />
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.2rem' }}>Hello, {user?.name}</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Patient ID: {user?._id?.substring(0, 8)} • Role: <span className="badge badge-role-patient">Patient</span>
              </p>
            </div>
          </div>

          <Link to="/doctors" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Book New Appointment</span>
          </Link>
        </div>

        <ErrorAlert message={alertError} onClose={() => setAlertError(null)} />
        <SuccessAlert message={alertSuccess} onClose={() => setAlertSuccess(null)} />

        {/* Top Metric Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <h4>{stats?.totalAppointments ?? appointments.length}</h4>
              <p>Total Bookings</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <h4>{stats?.upcomingAppointments ?? 0}</h4>
              <p>Upcoming Consultations</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <h4>{stats?.completedAppointments ?? 0}</h4>
              <p>Completed Visits</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="tabs-nav">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <Calendar size={18} />
            <span>My Consultations</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} />
            <span>Profile & Health Info</span>
          </button>
        </div>

        {/* Tab 1: Appointments Tab */}
        {activeTab === 'appointments' && (
          <div>
            {/* Filter buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {['', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st === '' ? 'All Statuses' : st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>

            {loading ? (
              <LoadingSpinner message="Fetching your appointments..." />
            ) : appointments.length === 0 ? (
              <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
                <Calendar size={48} color="var(--color-text-light)" style={{ margin: '0 auto 1rem' }} />
                <h3>No Appointments Found</h3>
                <p style={{ color: 'var(--color-text-muted)', margin: '0.5rem 0 1.5rem' }}>
                  {statusFilter
                    ? `You do not have any appointments with status '${statusFilter}'.`
                    : 'You haven’t booked any doctor visits yet.'}
                </p>
                <Link to="/doctors" className="btn btn-primary">
                  Find Doctors & Book Now
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {appointments.map((appt) => (
                  <AppointmentCard
                    key={appt._id}
                    appointment={appt}
                    role="patient"
                    onCancel={handleCancelAppointment}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Profile Settings */}
        {activeTab === 'profile' && (
          <div className="card" style={{ padding: '2.5rem', maxWidth: '720px' }}>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '1.5rem' }}>Patient Personal Information</h3>
            <form onSubmit={handleProfileSubmit}>
              <div className="grid-2" style={{ gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select
                    className="form-select"
                    value={profileForm.bloodGroup}
                    onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                  >
                    <option value="">Select Blood Group</option>
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
              </div>

              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileForm.street}
                  onChange={(e) => setProfileForm({ ...profileForm, street: e.target.value })}
                  placeholder="e.g. 42 Greenway Street"
                />
              </div>

              <div className="grid-3" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileForm.state}
                    onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Postal Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileForm.postalCode}
                    onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={profileSaving}
                style={{ marginTop: '1rem' }}
              >
                <Save size={18} />
                <span>{profileSaving ? 'Saving Updates...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
