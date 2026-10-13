import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';

const DepartmentCard = ({ department }) => {
  if (!department) return null;

  return (
    <div className="card department-card">
      <div className="dept-img-wrap">
        <img
          src={department.image || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'}
          alt={department.name}
          className="dept-img"
          loading="lazy"
        />
      </div>

      <div className="dept-body">
        <h3 className="dept-title">{department.name}</h3>
        <p className="dept-desc">
          {department.description?.length > 110
            ? `${department.description.substring(0, 110)}...`
            : department.description}
        </p>

        <div className="dept-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Users size={16} color="var(--color-primary)" />
            <span>{department.doctorCount || 0} Physicians</span>
          </div>

          <Link
            to={`/doctors?department=${department._id}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, color: 'var(--color-primary)' }}
          >
            <span>Doctors</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DepartmentCard;
