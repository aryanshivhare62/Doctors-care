import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, Calendar } from 'lucide-react';

const DoctorCard = ({ doctor, onBookClick }) => {
  if (!doctor) return null;

  return (
    <div className="card doctor-card">
      <div className="doctor-img-wrap">
        <img
          src={doctor.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'}
          alt={doctor.name}
          className="doctor-card-img"
          loading="lazy"
        />
        <div className="doctor-rating-tag">
          <Star size={14} fill="#f59e0b" color="#f59e0b" />
          <span>{doctor.rating ? doctor.rating.toFixed(1) : '4.8'}</span>
          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({doctor.totalReviews || 0})</span>
        </div>
      </div>

      <div className="doctor-card-body">
        <div className="doctor-department-tag">
          {doctor.department?.name || 'Specialist'}
        </div>
        <h3 className="doctor-name">{doctor.name}</h3>
        <p className="doctor-specialty">{doctor.specialty}</p>

        {doctor.qualifications && doctor.qualifications.length > 0 && (
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
            {doctor.qualifications.join(' • ')}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
          <MapPin size={15} color="var(--color-primary)" />
          <span>{doctor.location?.hospital || 'Main Campus'}, {doctor.location?.city || 'Metro City'}</span>
        </div>

        <div className="doctor-meta-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)' }}>
            <Clock size={16} />
            <span>{doctor.experienceYears} Years Exp</span>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginRight: '4px' }}>Fee:</span>
            <span className="doctor-fee-value">${doctor.consultationFee}</span>
          </div>
        </div>

        <div className="doctor-card-actions">
          <Link
            to={`/doctors/${doctor._id}`}
            className="btn btn-outline btn-block btn-sm"
          >
            Profile
          </Link>
          <button
            type="button"
            className="btn btn-primary btn-block btn-sm"
            onClick={() => onBookClick ? onBookClick(doctor) : null}
          >
            <Calendar size={15} />
            <span>Book</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
