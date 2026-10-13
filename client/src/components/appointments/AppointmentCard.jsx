import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, Stethoscope, AlertTriangle, Check, XCircle } from 'lucide-react';

const AppointmentCard = ({
  appointment,
  role = 'patient',
  onCancel,
  onUpdateStatus,
}) => {
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [doctorNoteInput, setDoctorNoteInput] = useState(appointment.doctorNotes || '');

  if (!appointment) return null;

  const {
    _id,
    appointmentDate,
    timeSlot,
    status,
    reason,
    patientNotes,
    doctorNotes,
    cancellationReason,
    doctor,
    patient,
    department,
  } = appointment;

  const isCancellable = (status === 'pending' || status === 'confirmed');

  const handleCancelSubmit = () => {
    if (onCancel) {
      onCancel(_id, cancelReason);
      setShowCancelPrompt(false);
    }
  };

  return (
    <div className="appointment-card card">
      {/* Header */}
      <div className="appointment-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="appointment-datetime-badge">
            <Calendar size={15} color="var(--color-primary)" />
            <span>{appointmentDate}</span>
            <Clock size={15} style={{ marginLeft: '4px' }} color="var(--color-primary)" />
            <span>{timeSlot}</span>
          </div>
        </div>

        <span className={`badge badge-${status}`}>
          {status}
        </span>
      </div>

      {/* Doctor / Patient information */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        {role === 'patient' ? (
          <div className="appointment-doctor-info">
            <img
              src={doctor?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'}
              alt={doctor?.name}
              className="appointment-doctor-avatar"
            />
            <div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.2rem' }}>{doctor?.name || 'Doctor'}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                {doctor?.specialty} • {department?.name || 'General'}
              </p>
              {doctor?.location && (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                  <MapPin size={13} color="var(--color-primary)" />
                  {doctor.location.hospital}, {doctor.location.city}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="appointment-doctor-info">
            <img
              src={patient?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
              alt={patient?.name}
              className="appointment-doctor-avatar"
            />
            <div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.2rem' }}>{patient?.name || 'Patient'}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                {patient?.email} • {patient?.phone || 'No phone'}
              </p>
              {patient?.bloodGroup && (
                <span style={{ fontSize: '0.75rem', background: '#fee2e2', color: '#991b1b', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                  Blood: {patient.bloodGroup}
                </span>
              )}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Consultation Fee</div>
          <strong style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>
            ${doctor?.consultationFee || 100}
          </strong>
        </div>
      </div>

      {/* Clinical / Reason info */}
      <div style={{ backgroundColor: 'var(--color-bg-muted)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
        <div><strong>Reason for visit:</strong> {reason}</div>
        {patientNotes && (
          <div style={{ marginTop: '0.35rem', color: 'var(--color-text-muted)' }}>
            <strong>Patient notes:</strong> {patientNotes}
          </div>
        )}
        {doctorNotes && (
          <div style={{ marginTop: '0.35rem', color: 'var(--color-secondary-hover)' }}>
            <strong>Doctor clinical remarks:</strong> {doctorNotes}
          </div>
        )}
        {status === 'cancelled' && cancellationReason && (
          <div style={{ marginTop: '0.35rem', color: 'var(--color-danger)' }}>
            <strong>Cancellation note:</strong> {cancellationReason}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
        {/* Patient Actions */}
        {role === 'patient' && isCancellable && !showCancelPrompt && (
          <button
            type="button"
            className="btn btn-danger-outline btn-sm"
            onClick={() => setShowCancelPrompt(true)}
          >
            <XCircle size={15} />
            <span>Cancel Appointment</span>
          </button>
        )}

        {/* Doctor Actions */}
        {role === 'doctor' && status === 'pending' && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onUpdateStatus ? onUpdateStatus(_id, 'confirmed') : null}
            >
              <Check size={15} />
              <span>Confirm Appointment</span>
            </button>
            <button
              type="button"
              className="btn btn-danger-outline btn-sm"
              onClick={() => setShowCancelPrompt(true)}
            >
              <span>Reject</span>
            </button>
          </div>
        )}

        {role === 'doctor' && status === 'confirmed' && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onUpdateStatus ? onUpdateStatus(_id, 'completed', doctorNoteInput) : null}
            >
              <Check size={15} />
              <span>Mark Completed</span>
            </button>
            <button
              type="button"
              className="btn btn-danger-outline btn-sm"
              onClick={() => setShowCancelPrompt(true)}
            >
              <span>Cancel</span>
            </button>
          </div>
        )}

        {/* Admin Actions */}
        {role === 'admin' && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {status === 'pending' && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onUpdateStatus ? onUpdateStatus(_id, 'confirmed') : null}
              >
                Approve
              </button>
            )}
            {status !== 'completed' && status !== 'cancelled' && (
              <button
                type="button"
                className="btn btn-danger-outline btn-sm"
                onClick={() => setShowCancelPrompt(true)}
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cancellation Prompt Modal/Box */}
      {showCancelPrompt && (
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.85rem', marginTop: '0.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-danger)', marginBottom: '0.4rem' }}>
            Confirm Cancellation
          </div>
          <input
            type="text"
            className="form-control"
            placeholder="Reason for cancellation (optional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            style={{ marginBottom: '0.65rem' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowCancelPrompt(false)}
            >
              Back
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleCancelSubmit}
            >
              Confirm Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
