import React, { useState, useEffect } from 'react';
import { departmentService } from '../api/departmentService';
import DepartmentCard from '../components/departments/DepartmentCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Layers } from 'lucide-react';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        setLoading(true);
        const res = await departmentService.getDepartments();
        setDepartments(res.data || []);
      } catch (err) {
        console.error('Failed to load departments', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepts();
  }, []);

  return (
    <div className="section" style={{ minHeight: '80vh' }}>
      <div className="container">
        <div className="section-title-wrap" style={{ textAlign: 'left', margin: '0 0 2.5rem' }}>
          <div className="section-tag">
            <Layers size={16} />
            <span>Clinical Specialties</span>
          </div>
          <h1 className="section-heading" style={{ fontSize: '2.5rem' }}>
            Medical Departments & Centers of Excellence
          </h1>
          <p className="section-subtitle">
            Explore our multidisciplinary healthcare wings designed with cutting-edge diagnostics,
            specialized outpatient care, and dedicated clinical staff.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading medical departments..." />
        ) : (
          <div className="grid-3">
            {departments.map((dept) => (
              <DepartmentCard key={dept._id} department={dept} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Departments;
