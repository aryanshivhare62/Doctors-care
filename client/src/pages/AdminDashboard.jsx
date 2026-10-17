import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../api/dashboardService';
import { appointmentService } from '../api/appointmentService';
import { doctorService } from '../api/doctorService';
import { departmentService } from '../api/departmentService';
import { contactService } from '../api/contactService';
import axiosClient from '../api/axiosClient';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import SuccessAlert from '../components/common/SuccessAlert';
import {
  Shield,
  Users,
  Stethoscope,
  Layers,
  Calendar,
  MessageSquare,
  PlusCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Trash2,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('appointments');
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(true);
  const [alertError, setAlertError] = useState(null);
  const [alertSuccess, setAlertSuccess] = useState(null);

  // New Doctor Modal state
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [newDoctorForm, setNewDoctorForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    specialty: '',
    qualifications: 'MBBS, MD',
    experienceYears: 5,
    consultationFee: 100,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    bio: '',
  });

  // New Department Modal state
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newDeptForm, setNewDeptForm] = useState({
    name: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    headDoctor: '',
  });

  // Fetch admin dashboard data
  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setAlertError(null);

      const [statsRes, apptRes, docRes, deptRes, msgRes] = await Promise.all([
        dashboardService.getAdminStats(),
        appointmentService.getAllAppointments(),
        doctorService.getDoctors({ limit: 50 }),
        departmentService.getDepartments(),
        contactService.getAllMessages(),
      ]);

      setStats(statsRes.data?.counts || null);
      setAppointments(apptRes.data || []);
      setDoctors(docRes.data || []);
      setDepartments(deptRes.data || []);
      setMessages(msgRes.data || []);

      // If on users tab, load users
      if (activeTab === 'users') {
        const usersRes = await axiosClient.get('/users');
        setUsers(usersRes.data || []);
      }
    } catch (err) {
      setAlertError(err.message || 'Failed to fetch admin operations data');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Appointment Status update
  const handleAppointmentStatus = async (id, status) => {
    try {
      await appointmentService.updateAppointmentStatus(id, { status });
      setAlertSuccess(`Appointment marked as ${status}`);
      fetchAdminData();
    } catch (err) {
      setAlertError(err.message || 'Failed to update status');
    }
  };

  // Appointment Cancel
  const handleCancelAppointment = async (id) => {
    try {
      await appointmentService.cancelAppointment(id, 'Cancelled by Administrator');
      setAlertSuccess('Appointment cancelled');
      fetchAdminData();
    } catch (err) {
      setAlertError(err.message || 'Failed to cancel appointment');
    }
  };

  // Delete Doctor
  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Delete this doctor?')) return;
    try {
      await doctorService.deleteDoctor(id);
      setAlertSuccess('Doctor deleted');
      fetchAdminData();
      setOpenMenuId(null);
    } catch (err) {
      alert('Could not delete doctor');
    }
  };

  // Create Doctor submit
  const handleCreateDoctorSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newDoctorForm,
        qualifications: newDoctorForm.qualifications.split(',').map((q) => q.trim()),
        experienceYears: Number(newDoctorForm.experienceYears),
        consultationFee: Number(newDoctorForm.consultationFee),
        availability: [
          {
            dayOfWeek: 'Monday',
            slots: [
              { startTime: '09:00 AM', endTime: '09:30 AM' },
              { startTime: '10:00 AM', endTime: '10:30 AM' },
              { startTime: '02:00 PM', endTime: '02:30 PM' },
            ],
          },
          {
            dayOfWeek: 'Wednesday',
            slots: [
              { startTime: '09:00 AM', endTime: '09:30 AM' },
              { startTime: '10:00 AM', endTime: '10:30 AM' },
              { startTime: '02:00 PM', endTime: '02:30 PM' },
            ],
          },
          {
            dayOfWeek: 'Friday',
            slots: [
              { startTime: '09:00 AM', endTime: '09:30 AM' },
              { startTime: '10:00 AM', endTime: '10:30 AM' },
              { startTime: '02:00 PM', endTime: '02:30 PM' },
            ],
          },
        ],
      };

      await doctorService.createDoctor(payload);
      setAlertSuccess(`Doctor profile for ${payload.name} created!`);
      setShowDoctorModal(false);
      fetchAdminData();
    } catch (err) {
      setAlertError(err.message || 'Failed to create doctor');
    }
  };

  // Create Department submit
  const handleCreateDeptSubmit = async (e) => {
    e.preventDefault();
    try {
      await departmentService.createDepartment(newDeptForm);
      setAlertSuccess(`Department '${newDeptForm.name}' created!`);
      setShowDeptModal(false);
      fetchAdminData();
    } catch (err) {
      setAlertError(err.message || 'Failed to create department');
    }
  };

  // Change user role
  const handleChangeUserRole = async (userId, newRole) => {
    try {
      await axiosClient.patch(`/users/${userId}`, { role: newRole });
      setAlertSuccess(`User role updated to ${newRole}`);
      fetchAdminData();
    } catch (err) {
      setAlertError(err.message || 'Failed to change role');
    }
  };

  // Mark message as read
  const handleMessageStatus = async (msgId, status) => {
    try {
      await contactService.updateMessageStatus(msgId, status);
      setAlertSuccess(`Inquiry marked as ${status}`);
      fetchAdminData();
    } catch (err) {
      setAlertError(err.message || 'Failed to update message status');
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-user-greeting">
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#7e22ce',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Shield size={28} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.2rem' }}>Administrator Console</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Signed in as: {user?.name} ({user?.email}) • Role:{' '}
                <span className="badge badge-role-admin">System Admin</span>
              </p>
            </div>
          </div>
        </div>

        <ErrorAlert message={alertError} onClose={() => setAlertError(null)} />
        <SuccessAlert message={alertSuccess} onClose={() => setAlertSuccess(null)} />

        {/* Global Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              <Users size={24} />
            </div>
            <div className="stat-info">
              <h4>{stats?.totalPatients || 0}</h4>
              <p>Registered Patients</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'var(--color-secondary-light)', color: 'var(--color-secondary)' }}>
              <Stethoscope size={24} />
            </div>
            <div className="stat-info">
              <h4>{stats?.totalDoctors || doctors.length}</h4>
              <p>Active Doctors</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#f3e8ff', color: '#7e22ce' }}>
              <Layers size={24} />
            </div>
            <div className="stat-info">
              <h4>{stats?.totalDepartments || departments.length}</h4>
              <p>Departments</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <h4>{stats?.totalAppointments || appointments.length}</h4>
              <p>Total Bookings</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
              <MessageSquare size={24} />
            </div>
            <div className="stat-info">
              <h4>{stats?.unreadInquiries || 0}</h4>
              <p>Unread Inquiries</p>
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
            <span>Appointments ({appointments.length})</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`}
            onClick={() => setActiveTab('doctors')}
          >
            <Stethoscope size={18} />
            <span>Doctors ({doctors.length})</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            <Layers size={18} />
            <span>Departments ({departments.length})</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            <span>Users & Roles</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'inquiries' ? 'active' : ''}`}
            onClick={() => setActiveTab('inquiries')}
          >
            <MessageSquare size={18} />
            <span>Contact Inquiries ({messages.length})</span>
          </button>
        </div>

        {/* Tab 1: Appointments */}
        {activeTab === 'appointments' && (
          <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>All System Appointments</h3>
            {loading ? (
              <LoadingSpinner />
            ) : appointments.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>No appointments recorded yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem' }}>Patient</th>
                    <th style={{ padding: '0.75rem' }}>Doctor</th>
                    <th style={{ padding: '0.75rem' }}>Date & Slot</th>
                    <th style={{ padding: '0.75rem' }}>Reason</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => (
                    <tr key={appt._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <strong>{appt.patient?.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{appt.patient?.email}</div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <strong>{appt.doctor?.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{appt.doctor?.specialty}</div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div>{appt.appointmentDate}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{appt.timeSlot}</div>
                      </td>
                      <td style={{ padding: '0.75rem', maxWidth: '200px' }}>
                        {appt.reason}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className={`badge badge-${appt.status}`}>{appt.status}</span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          {appt.status === 'pending' && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleAppointmentStatus(appt._id, 'confirmed')}
                              title="Approve"
                            >
                              Approve
                            </button>
                          )}
                          {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                            <button
                              type="button"
                              className="btn btn-danger-outline btn-sm"
                              onClick={() => handleCancelAppointment(appt._id)}
                              title="Cancel"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Doctors Management */}
        {activeTab === 'doctors' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Hospital Doctors Directory</h3>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowDoctorModal(true)}
              >
                <PlusCircle size={16} />
                <span>Add New Doctor</span>
              </button>
            </div>

            <div className="grid-3">
              {doctors.map((doc) => (
                <div key={doc._id} className="card" style={{ padding: '1.25rem', position: 'relative' }}>
                  <button onClick={() => setOpenMenuId(openMenuId === doc._id ? null : doc._id)}
                    style={{ position: 'absolute', top: '10px', right: '10px', border: 'none', background: 'transparent', fontSize: '24px', cursor: 'pointer' }}>
                    ⋮
                  </button>
                  {openMenuId === doc._id && (
                    <button onClick={() => handleDeleteDoctor(doc._id)}
                      style={{ position: 'absolute', top: '40px', right: '10px', background: 'white', color: 'red', border: '1px solid #ddd', padding: '8px 14px', cursor: 'pointer', zIndex: 10 }}>
                      Delete
                    </button>
                  )}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <img src={doc.avatar} alt={doc.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <h4 style={{ fontSize: '1.05rem', margin: 0 }}>{doc.name}</h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>{doc.specialty}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                    <div><strong>Department:</strong> {doc.department?.name || 'Assigned'}</div>
                    <div><strong>Experience:</strong> {doc.experienceYears} Years</div>
                    <div><strong>Fee:</strong> ${doc.consultationFee}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Departments */}
        {activeTab === 'departments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Medical Departments</h3>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowDeptModal(true)}
              >
                <PlusCircle size={16} />
                <span>Add Department</span>
              </button>
            </div>

            <div className="grid-3">
              {departments.map((dept) => (
                <div key={dept._id} className="card" style={{ padding: '1.5rem' }}>
                  <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{dept.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                    {dept.description}
                  </p>
                  <div style={{ fontSize: '0.825rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                    Head: {dept.headDoctor || 'Clinical Director'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Users and Roles */}
        {activeTab === 'users' && (
          <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Registered System Users</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem' }}>Name</th>
                  <th style={{ padding: '0.75rem' }}>Email</th>
                  <th style={{ padding: '0.75rem' }}>Phone</th>
                  <th style={{ padding: '0.75rem' }}>Current Role</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Modify Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '0.75rem' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem' }}>{u.phone || '—'}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge badge-role-${u.role}`}>{u.role}</span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeUserRole(u._id, e.target.value)}
                        className="form-select"
                        style={{ width: 'auto', display: 'inline-block', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                      >
                        <option value="patient">patient</option>
                        <option value="doctor">doctor</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Contact Messages */}
        {activeTab === 'inquiries' && (
          <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Patient Inquiries & Contact Forms</h3>
            {messages.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>No contact inquiries received yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    style={{
                      padding: '1.25rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      background: msg.status === 'unread' ? 'var(--color-primary-soft)' : '#ffffff',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div>
                        <strong>{msg.name}</strong> ({msg.email}) {msg.phone && `• ${msg.phone}`}
                      </div>
                      <span className={`badge badge-${msg.status === 'unread' ? 'pending' : 'completed'}`}>
                        {msg.status}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                      Subject: {msg.subject}
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                      {msg.message}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      {msg.status === 'unread' ? (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => handleMessageStatus(msg._id, 'read')}
                        >
                          Mark As Read
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => handleMessageStatus(msg._id, 'unread')}
                        >
                          Mark As Unread
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleMessageStatus(msg._id, 'replied')}
                      >
                        Mark Replied
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal: Create Doctor */}
        {showDoctorModal && (
          <div className="modal-overlay" onClick={() => setShowDoctorModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add New Physician</h3>
                <button type="button" className="modal-close-btn" onClick={() => setShowDoctorModal(false)}>&times;</button>
              </div>
              <form onSubmit={handleCreateDoctorSubmit}>
                <div className="form-group">
                  <label className="form-label">Doctor Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Dr. Full Name"
                    value={newDoctorForm.name}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="doctor@doctorscares.com"
                    value={newDoctorForm.email}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select
                    className="form-select"
                    value={newDoctorForm.department}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, department: e.target.value })}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Specialty *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Interventional Cardiology"
                    value={newDoctorForm.specialty}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, specialty: e.target.value })}
                    required
                  />
                </div>
                <div className="grid-2" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Experience (Years) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newDoctorForm.experienceYears}
                      onChange={(e) => setNewDoctorForm({ ...newDoctorForm, experienceYears: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fee ($) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newDoctorForm.consultationFee}
                      onChange={(e) => setNewDoctorForm({ ...newDoctorForm, consultationFee: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Qualifications (comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newDoctorForm.qualifications}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, qualifications: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowDoctorModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Save Doctor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Create Department */}
        {showDeptModal && (
          <div className="modal-overlay" onClick={() => setShowDeptModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Create Medical Department</h3>
                <button type="button" className="modal-close-btn" onClick={() => setShowDeptModal(false)}>&times;</button>
              </div>
              <form onSubmit={handleCreateDeptSubmit}>
                <div className="form-group">
                  <label className="form-label">Department Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Oncology, ENT, Endocrinology"
                    value={newDeptForm.name}
                    onChange={(e) => setNewDeptForm({ ...newDeptForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Department scope and facilities..."
                    value={newDeptForm.description}
                    onChange={(e) => setNewDeptForm({ ...newDeptForm, description: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Head Physician Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Dr. Clinical Director"
                    value={newDeptForm.headDoctor}
                    onChange={(e) => setNewDeptForm({ ...newDeptForm, headDoctor: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowDeptModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Create Department
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
