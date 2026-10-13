import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorService } from '../api/doctorService';
import SlotPicker from '../components/doctors/SlotPicker';
import AppointmentFormModal from '../components/appointments/AppointmentFormModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import {
  Star,
  Clock,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Award,
  CheckCircle,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

const DoctorDetails = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await doctorService.getDoctorById(id);
        setDoctor(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load doctor profile');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Loading doctor profile..." />;
  }

  if (error || !doctor) {
    return (
      <div className="container section">
        <ErrorAlert message={error || 'Doctor not found'} />
        <Link to="/doctors" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Doctor Directory</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        {/* Back Link */}
        <Link to="/doctors" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
          <ArrowLeft size={16} />
          <span>Back to All Doctors</span>
        </Link>

        {/* Doctor Hero Card */}
        <div className="doctor-hero-card">
          <div className="doctor-hero-grid">
            <img
              src={doctor.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'}
              alt={doctor.name}
              className="doctor-profile-pic"
            />

            <div>
              <div className="doctor-department-tag" style={{ fontSize: '0.85rem' }}>
                {doctor.department?.name}
              </div>
              <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>{doctor.name}</h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.75rem' }}>
                {doctor.specialty}
              </p>

              {doctor.qualifications && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  {doctor.qualifications.map((q, idx) => (
                    <span key={idx} style={{ background: 'var(--color-bg-muted)', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-navy)' }}>
                      {q}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', margin: '1rem 0 1.5rem', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Star size={18} fill="#f59e0b" color="#f59e0b" />
                  <strong style={{ color: 'var(--color-navy)' }}>{doctor.rating ? doctor.rating.toFixed(1) : '4.8'}</strong>
                  <span>({doctor.totalReviews || 0} Reviews)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={18} color="var(--color-primary)" />
                  <span>{doctor.experienceYears} Years Clinical Experience</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={18} color="var(--color-primary)" />
                  <span>{doctor.location?.hospital}, {doctor.location?.city}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Consultation Fee</div>
                  <strong style={{ fontSize: '1.65rem', color: 'var(--color-primary)' }}>${doctor.consultationFee}</strong>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={() => setIsModalOpen(true)}
                  style={{ marginLeft: 'auto' }}
                >
                  <Calendar size={18} />
                  <span>Book Appointment Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Bio and Working Schedule Grid */}
        <div className="grid-2" style={{ gap: '2rem' }}>
          {/* About Column */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} color="var(--color-primary)" />
              <span>Professional Background & Biography</span>
            </h3>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
              {doctor.about || doctor.bio}
            </p>

            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Clinical Practice Location</h4>
            <div style={{ backgroundColor: 'var(--color-bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
              <div><strong>Facility:</strong> {doctor.location?.hospital}</div>
              <div><strong>Address:</strong> {doctor.location?.address}</div>
              <div><strong>City:</strong> {doctor.location?.city}</div>
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                {doctor.phone && <span><strong>Tel:</strong> {doctor.phone}</span>}
                {doctor.email && <span><strong>Email:</strong> {doctor.email}</span>}
              </div>
            </div>
          </div>

          {/* Outpatient Schedule Column */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="var(--color-primary)" />
              <span>Weekly Outpatient Schedule</span>
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Standard operating hours for physical clinical consultations:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {doctor.availability && doctor.availability.map((day, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-muted)',
                    fontSize: '0.875rem',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{day.dayOfWeek}</span>
                  <span style={{ color: day.slots?.length > 0 ? 'var(--color-secondary)' : 'var(--color-text-light)', fontWeight: 500 }}>
                    {day.slots?.length > 0
                      ? `${day.slots[0].startTime} - ${day.slots[day.slots.length - 1].endTime} (${day.slots.length} slots)`
                      : 'Closed / Off Duty'}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.75rem' }}>
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => setIsModalOpen(true)}
              >
                <Calendar size={18} />
                <span>Check Real-Time Slot Availability & Book</span>
              </button>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        <AppointmentFormModal
          doctor={doctor}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default DoctorDetails;
