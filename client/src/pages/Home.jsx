import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doctorService } from '../api/doctorService';
import { departmentService } from '../api/departmentService';
import DoctorCard from '../components/doctors/DoctorCard';
import DepartmentCard from '../components/departments/DepartmentCard';
import AppointmentFormModal from '../components/appointments/AppointmentFormModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  HeartPulse,
  Calendar,
  ShieldCheck,
  Award,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  Star,
  Quote,
} from 'lucide-react';

const Home = () => {
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [docsRes, deptsRes] = await Promise.all([
          doctorService.getFeaturedDoctors(),
          departmentService.getDepartments(),
        ]);
        setFeaturedDoctors(docsRes.data || []);
        setDepartments(deptsRes.data || []);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBookClick = (doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/doctors');
    }
  };

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-tag">
                <Sparkles size={16} />
                <span>Modern Healthcare & Digital Appointments</span>
              </div>
              <h1 className="hero-title">
                Exceptional Medical Care, <span style={{ color: 'var(--color-primary)' }}>When You Need It Most.</span>
              </h1>
              <p className="hero-subtitle">
                Connect directly with board-certified physicians across 7 specialized departments.
                Schedule verified outpatient visits, track health consultations, and access compassionate care.
              </p>

              {/* Search Bar in Hero */}
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', maxWidth: '520px' }}>
                <div style={{ position: 'relative', flexGrow: 1 }}>
                  <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search doctor name, specialty, or condition..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '40px', height: '48px' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem', height: '48px' }}>
                  Search
                </button>
              </form>

              <div className="hero-cta-group">
                <Link to="/doctors" className="btn btn-primary btn-lg">
                  <Calendar size={18} />
                  <span>Book Appointment</span>
                </Link>
                <Link to="/departments" className="btn btn-outline btn-lg">
                  Explore Specialties
                </Link>
              </div>

              {/* Trust Bar */}
              <div className="hero-trust-bar">
                <div className="hero-trust-item">
                  <span className="hero-trust-num">99.4%</span>
                  <span className="hero-trust-label">Patient Satisfaction</span>
                </div>
                <div className="hero-trust-item">
                  <span className="hero-trust-num">40+</span>
                  <span className="hero-trust-label">Specialist Doctors</span>
                </div>
                <div className="hero-trust-item">
                  <span className="hero-trust-num">24/7</span>
                  <span className="hero-trust-label">Emergency Hotline</span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="hero-img-box">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80"
                alt="Healthcare doctor team"
                className="hero-main-img"
              />
              <div className="hero-floating-card">
                <div className="hero-floating-icon">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h5 style={{ fontSize: '0.95rem', margin: 0 }}>Verified Specialists</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    100% Licensed & Board Certified
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Healthcare Services / Why Choose Us */}
      <section className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div className="section-title-wrap">
            <div className="section-tag">Why Choose Us</div>
            <h2 className="section-heading">Setting The Benchmark In Patient-Centric Medicine</h2>
            <p className="section-subtitle">
              We leverage advanced clinical infrastructure, streamlined appointment scheduling,
              and dedicated medical specialists to make your healthcare journey effortless.
            </p>
          </div>

          <div className="grid-4">
            <div className="service-card">
              <div className="service-icon-wrap">
                <Calendar size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Instant Online Booking</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem' }}>
                Select your preferred doctor, date, and exact 30-minute time slot in seconds without endless waiting lines.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon-wrap" style={{ background: 'var(--color-secondary-light)', color: 'var(--color-secondary)' }}>
                <Award size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Top Medical Specialists</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem' }}>
                Access esteemed clinicians with decades of collective experience in cardiology, neurology, pediatrics, and more.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
                <Clock size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Minimal Waiting Time</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem' }}>
                Our synchronized outpatient scheduling architecture ensures appointments run on time, respecting your busy schedule.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon-wrap" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                <ShieldCheck size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Safe & Private Records</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem' }}>
                Protected with modern JWT cookie authentication, role-based authorization, and strict patient confidentiality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Doctors */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-main)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="section-tag">Featured Physicians</div>
              <h2 className="section-heading" style={{ margin: 0 }}>Consult With Top Specialists</h2>
            </div>
            <Link to="/doctors" className="btn btn-outline-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>View All Doctors</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading doctors..." />
          ) : (
            <div className="grid-3">
              {featuredDoctors.slice(0, 6).map((doc) => (
                <DoctorCard key={doc._id} doctor={doc} onBookClick={handleBookClick} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Medical Departments */}
      <section className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div className="section-title-wrap">
            <div className="section-tag">Specialized Departments</div>
            <h2 className="section-heading">Comprehensive Healthcare Departments</h2>
            <p className="section-subtitle">
              From preventative cardiovascular care to advanced neurological rehabilitation, our departments
              offer multidisciplinary care under one roof.
            </p>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading departments..." />
          ) : (
            <div className="grid-3">
              {departments.slice(0, 6).map((dept) => (
                <DepartmentCard key={dept._id} department={dept} />
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/departments" className="btn btn-outline">
              View All Departments & Services
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Patient Testimonials (Demo Data) */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
        <div className="container">
          <div className="section-title-wrap">
            <div className="section-tag">Patient Experiences</div>
            <h2 className="section-heading">What Our Patients Say</h2>
            <p className="section-subtitle">
              Real feedback from individuals and families who received care through Doctors Cares (Demo Data).
            </p>
          </div>

          <div className="grid-3">
            <div className="testimonial-card">
              <div>
                <div className="testimonial-rating">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p className="testimonial-text">
                  "Booking an appointment with Dr. Marcus Sterling took less than two minutes. The cardiology checkup was thorough, reassuring, and the clinic was running right on time."
                </p>
              </div>
              <div className="testimonial-author">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80"
                  alt="Emily Vance"
                  className="testimonial-avatar"
                />
                <div>
                  <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Emily Vance</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Cardiology Patient (Demo)</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div>
                <div className="testimonial-rating">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p className="testimonial-text">
                  "Dr. Sarah Jenkins was wonderful with our 4-year-old daughter. The patient portal makes tracking past appointments and upcoming booster shots so easy."
                </p>
              </div>
              <div className="testimonial-author">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                  alt="David Miller"
                  className="testimonial-avatar"
                />
                <div>
                  <h4 style={{ fontSize: '0.95rem', margin: 0 }}>David Miller</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Parent / Pediatrics (Demo)</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div>
                <div className="testimonial-rating">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p className="testimonial-text">
                  "After suffering from severe chronic knee pain, Dr. Chen recommended a minimally invasive arthroscopic procedure. I am now back to regular walks without pain."
                </p>
              </div>
              <div className="testimonial-author">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
                  alt="Sophia Chen"
                  className="testimonial-avatar"
                />
                <div>
                  <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Sophia Chen</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Orthopedics Patient (Demo)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call To Action Banner */}
      <section className="section" style={{ background: 'linear-gradient(135deg, var(--color-navy) 0%, #1e3a8a 100%)', color: '#ffffff', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '780px' }}>
          <h2 style={{ color: '#ffffff', fontSize: '2.5rem', marginBottom: '1rem' }}>
            Ready to Prioritize Your Well-Being?
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Book your consultation today with top doctors across specialized departments.
            Prompt consultations, verified specialists, and transparent care.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/doctors" className="btn btn-primary btn-lg">
              <Calendar size={18} />
              <span>Schedule An Appointment</span>
            </Link>
            <Link to="/contact" className="btn btn-outline" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}>
              Contact Clinic Desk
            </Link>
          </div>
        </div>
      </section>

      {/* Appointment Booking Modal */}
      {selectedDoctor && (
        <AppointmentFormModal
          doctor={selectedDoctor}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;
