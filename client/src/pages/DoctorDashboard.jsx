import React, { useState, useEffect, useCallback } from 'react';
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
  AlertTriangle,
  Stethoscope,
  User,
  Activity,
  FileText,
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user, doctorProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('appointments');
  const [statusFilter, setStatusFilter] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertError, setAlertError] = useState(null);
  const [alertSuccess, setAlertSuccess] = useState(null);

  const fetchDoctorData = useCallback(async () => {
    try {
      setLoading(true);
      setAlertError(null);

      const [apptRes, statsRes] = await Promise.all([
        appointmentService.getMyDoctorAppointments(statusFilter ? { status: statusFilter } : {}),
        dashboardService.getDoctorStats(),
      ]);

      setAppointments(apptRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      setAlertError(err.message || 'Failed to load doctor dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchDoctorData();
  }, [fetchDoctorData]);

  // Handle appointment status updates (confirmed, completed)
  const handleUpdateStatus = async (id, status, notes) => {
    try {
      setAlertError(null);
      const res = await appointmentService.updateAppointmentStatus(id, {
        status,
        ...(notes && { doctorNotes: notes }),
      });
      setAlertSuccess(res.message || `Appointment updated to ${status}`);
      fetchDoctorData();
    } catch (err) {
      setAlertError(err.message || 'Failed to update appointment status.');
    }
  };

  // Handle appointment cancellation / rejection
  const handleCancelAppointment = async (id, reason) => {
    try {
      setAlertError(null);
      const res = await appointmentService.cancelAppointment(id, reason);
      setAlertSuccess(res.message || 'Appointment cancelled successfully');
      fetchDoctorData();
    } catch (err) {
      setAlertError(err.message || 'Failed to cancel appointment.');
    }
  };

  const counts = stats?.counts || {};

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-user-greeting">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'}
              alt={user?.name}
              className="dashboard-avatar"
            />
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.2rem' }}>
                Dr. Portal — {user?.name}
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Role: <span className="badge badge-role-doctor">Physician</span> • Status: Active Practice
              </p>
            </div>
          </div>
        </div>

        <ErrorAlert message={alertError} onClose={() => setAlertError(null)} />
        <SuccessAlert message={alertSuccess} onClose={() => setAlertSuccess(null)} />

        {/* Doctor Metrics */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <h4>{counts.todayCount || 0}</h4>
              <p>Today's Consultations</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
              <AlertTriangle size={24} />
            </div>
            <div className="stat-info">
              <h4>{counts.pendingCount || 0}</h4>
              <p>Pending Patient Requests</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <h4>{counts.confirmedCount || 0}</h4>
              <p>Confirmed Upcoming</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <h4>{counts.completedCount || 0}</h4>
              <p>Completed Visits</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-nav">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <Calendar size={18} />
            <span>Assigned Patient Consultations</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <Stethoscope size={18} />
            <span>Physician Profile Info</span>
          </button>
        </div>

        {/* Tab 1: Assigned Appointments */}
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
                  {st === '' ? 'All Patient Appointments' : st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>

            {loading ? (
              <LoadingSpinner message="Loading physician appointments..." />
            ) : appointments.length === 0 ? (
              <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
                <Stethoscope size={48} color="var(--color-text-light)" style={{ margin: '0 auto 1rem' }} />
                <h3>No Appointments Found</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>
                  {statusFilter
                    ? `No appointments currently marked as '${statusFilter}'.`
                    : 'No patient appointments have been scheduled yet.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {appointments.map((appt) => (
                  <AppointmentCard
                    key={appt._id}
                    appointment={appt}
                    role="doctor"
                    onUpdateStatus={handleUpdateStatus}
                    onCancel={handleCancelAppointment}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Profile Info */}
        {activeTab === 'profile' && (
          <div className="card" style={{ padding: '2.5rem', maxWidth: '720px' }}>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>Physician Credentials & Clinical Schedule</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.925rem' }}>
              To modify consultation fees or adjust weekly clinic schedules, contact hospital administrative operations.
            </p>

            <div style={{ backgroundColor: 'var(--color-bg-muted)', padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.925rem' }}>
              <div><strong>Name:</strong> {user?.name}</div>
              <div><strong>Email:</strong> {user?.email}</div>
              <div><strong>Department:</strong> {doctorProfile?.department?.name || 'Assigned Specialty'}</div>
              <div><strong>Consultation Fee:</strong> ${doctorProfile?.consultationFee || 100}</div>
              <div><strong>Qualifications:</strong> {doctorProfile?.qualifications?.join(', ') || 'MBBS, MD'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
