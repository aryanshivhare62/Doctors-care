import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../api/appointmentService';
import SlotPicker from '../doctors/SlotPicker';
import ErrorAlert from '../common/ErrorAlert';
import SuccessAlert from '../common/SuccessAlert';
import { Calendar, DollarSign, User, ShieldCheck } from 'lucide-react';

const AppointmentFormModal = ({ doctor, isOpen, onClose, onSuccess }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Tomorrow as default date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [appointmentDate, setAppointmentDate] = useState(defaultDateStr);
  const [timeSlot, setTimeSlot] = useState('');
  const [reason, setReason] = useState('');
  const [patientNotes, setPatientNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorsList, setErrorsList] = useState([]);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen || !doctor) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setErrorsList([]);

    if (!timeSlot) {
      setError('Please choose an available time slot from the schedule.');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide the primary reason for your consultation.');
      return;
    }

    try {
      setLoading(true);
      const res = await appointmentService.bookAppointment({
        doctor: doctor._id,
        appointmentDate,
        timeSlot,
        reason,
        patientNotes,
      });

      setSuccessMsg(res.message || 'Appointment requested successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess(res.data);
        onClose();
        navigate('/dashboard/patient');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to book appointment.');
      if (err.errors) setErrorsList(err.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>Book Consultation</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              Confirm your visit with {doctor.name}
            </p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {!isAuthenticated ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
              <User size={48} />
            </div>
            <h4>Sign In Required</h4>
            <p style={{ color: 'var(--color-text-muted)', margin: '0.75rem 0 1.5rem' }}>
              Please sign in or create an account to book and manage appointments securely.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/login" className="btn btn-outline" onClick={onClose}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" onClick={onClose}>
                Register Account
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <ErrorAlert message={error} errors={errorsList} onClose={() => setError(null)} />
            <SuccessAlert message={successMsg} />

            {/* Doctor Summary Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: 'var(--color-bg-muted)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
              }}
            >
              <img
                src={doctor.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'}
                alt={doctor.name}
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ flexGrow: 1 }}>
                <h4 style={{ fontSize: '1rem' }}>{doctor.name}</h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                  {doctor.specialty} • {doctor.department?.name || 'Department'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Consultation Fee</div>
                <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.1rem' }}>
                  ${doctor.consultationFee}
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div className="form-group">
              <label className="form-label" htmlFor="appointmentDate">
                Appointment Date
              </label>
              <input
                type="date"
                id="appointmentDate"
                min={todayStr}
                value={appointmentDate}
                onChange={(e) => {
                  setAppointmentDate(e.target.value);
                  setTimeSlot(''); // Reset slot on date change
                }}
                className="form-control"
                required
              />
            </div>

            {/* Slot Picker Component */}
            <div className="form-group">
              <SlotPicker
                doctorId={doctor._id}
                selectedDate={appointmentDate}
                selectedSlot={timeSlot}
                onSelectSlot={(slot) => setTimeSlot(slot)}
              />
              {timeSlot && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600 }}>
                  Selected Slot: {timeSlot}
                </div>
              )}
            </div>

            {/* Reason for Appointment */}
            <div className="form-group">
              <label className="form-label" htmlFor="reason">
                Reason for Visit / Symptoms *
              </label>
              <input
                type="text"
                id="reason"
                className="form-control"
                placeholder="e.g. Annual cardiac review, chest fluttering, skin rash"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                minLength={5}
                maxLength={500}
              />
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label" htmlFor="notes">
                Additional Notes for Doctor (Optional)
              </label>
              <textarea
                id="notes"
                className="form-textarea"
                placeholder="Mention any medications, allergies, or past history"
                value={patientNotes}
                onChange={(e) => setPatientNotes(e.target.value)}
                rows={2}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 2 }}
                disabled={loading || !timeSlot}
              >
                {loading ? 'Confirming...' : 'Request Appointment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AppointmentFormModal;
