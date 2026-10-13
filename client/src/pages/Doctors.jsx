import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { doctorService } from '../api/doctorService';
import { departmentService } from '../api/departmentService';
import DoctorCard from '../components/doctors/DoctorCard';
import SearchBar from '../components/common/SearchBar';
import FilterPanel from '../components/common/FilterPanel';
import AppointmentFormModal from '../components/appointments/AppointmentFormModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Stethoscope, ChevronLeft, ChevronRight } from 'lucide-react';

const Doctors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const initialDept = searchParams.get('department') || '';

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1, limit: 6 });
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedDept, setSelectedDept] = useState(initialDept);
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch departments list
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await departmentService.getDepartments();
        setDepartments(res.data || []);
      } catch (err) {
        console.error('Failed to load departments', err);
      }
    };
    fetchDepts();
  }, []);

  // Fetch doctors based on active filters
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 6,
        ...(searchQuery && { q: searchQuery }),
        ...(selectedDept && { department: selectedDept }),
        ...(sortBy && { sortBy }),
      };

      const res = await doctorService.getDoctors(params);
      setDoctors(res.data || []);
      setMeta(res.meta || { total: 0, page: 1, pages: 1 });
    } catch (err) {
      console.error('Failed to fetch doctors', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedDept, sortBy]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDept('');
    setSortBy('');
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleBook = (doc) => {
    setBookingDoctor(doc);
    setIsModalOpen(true);
  };

  return (
    <div className="section" style={{ minHeight: '80vh' }}>
      <div className="container">
        {/* Page Header */}
        <div className="section-title-wrap" style={{ textAlign: 'left', margin: '0 0 2rem' }}>
          <div className="section-tag">
            <Stethoscope size={16} />
            <span>Doctor Directory</span>
          </div>
          <h1 className="section-heading" style={{ fontSize: '2.5rem' }}>
            Find Your Specialist Doctor
          </h1>
          <p className="section-subtitle">
            Browse through board-certified clinicians, review qualifications and consultation fees, and schedule an appointment.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="search-filter-card">
          <div className="search-grid">
            <div>
              <label className="form-label">Search Doctors</label>
              <SearchBar
                value={searchQuery}
                onChange={(val) => {
                  setSearchQuery(val);
                  setCurrentPage(1);
                }}
                onClear={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
              />
            </div>

            <div style={{ gridColumn: 'span 3' }}>
              <label className="form-label">Refine By Specialty & Sort</label>
              <FilterPanel
                departments={departments}
                selectedDepartment={selectedDept}
                onSelectDepartment={(dept) => {
                  setSelectedDept(dept);
                  setCurrentPage(1);
                }}
                sortBy={sortBy}
                onSelectSort={(sort) => {
                  setSortBy(sort);
                  setCurrentPage(1);
                }}
                onReset={handleResetFilters}
              />
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <LoadingSpinner message="Searching doctor directory..." />
        ) : doctors.length === 0 ? (
          <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <Stethoscope size={48} color="var(--color-text-light)" style={{ margin: '0 auto 1rem' }} />
            <h3>No Doctors Found</h3>
            <p style={{ color: 'var(--color-text-muted)', margin: '0.5rem 0 1.5rem' }}>
              No doctors matched your current search filters. Try clearing your query or selecting another department.
            </p>
            <button type="button" className="btn btn-outline" onClick={handleResetFilters}>
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '1.25rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Showing <strong>{doctors.length}</strong> of <strong>{meta.total}</strong> qualified doctors
            </div>

            <div className="grid-3" style={{ marginBottom: '3rem' }}>
              {doctors.map((doc) => (
                <DoctorCard key={doc._id} doctor={doc} onBookClick={handleBook} />
              ))}
            </div>

            {/* Pagination */}
            {meta.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  Page <strong>{currentPage}</strong> of <strong>{meta.pages}</strong>
                </span>

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={currentPage >= meta.pages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}

        {/* Booking Modal */}
        {bookingDoctor && (
          <AppointmentFormModal
            doctor={bookingDoctor}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Doctors;
