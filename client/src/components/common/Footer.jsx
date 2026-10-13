import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, PhoneCall, Mail, MapPin, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          {/* Brand Col */}
          <div className="footer-brand">
            <Link to="/" className="brand-logo" style={{ color: '#ffffff' }}>
              <div className="brand-icon">
                <HeartPulse size={22} />
              </div>
              <span>Doctors<span className="brand-highlight">Cares</span></span>
            </Link>
            <p>
              Leading the future of digital patient care. We connect you with board-certified
              physicians, specialized diagnostics, and seamless appointments tailored to your health.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.08)', padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)' }}>
              <PhoneCall size={20} color="var(--color-primary)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>24/7 Emergency Line</div>
                <strong style={{ color: '#ffffff', fontSize: '1rem' }}>+1 (800) 432-CARE</strong>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-col-title">Navigation</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/doctors">Find Doctors</Link></li>
              <li><Link to="/departments">Departments</Link></li>
              <li><Link to="/about">About Doctors Cares</Link></li>
              <li><Link to="/contact">Contact Support</Link></li>
            </ul>
          </div>

          {/* Departments */}
          <div>
            <h4 className="footer-col-title">Specialties</h4>
            <ul className="footer-links">
              <li><Link to="/doctors?department=cardiology">Cardiology</Link></li>
              <li><Link to="/doctors?department=neurology">Neurology</Link></li>
              <li><Link to="/doctors?department=pediatrics">Pediatrics</Link></li>
              <li><Link to="/doctors?department=orthopedics">Orthopedics</Link></li>
              <li><Link to="/doctors?department=dermatology">Dermatology</Link></li>
              <li><Link to="/doctors?department=dentistry">Dentistry</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="footer-col-title">Main Campus</h4>
            <div className="footer-contact-item">
              <MapPin size={18} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '3px' }} />
              <span>100 Medical Center Blvd, Metro City, CA 90210</span>
            </div>
            <div className="footer-contact-item">
              <Mail size={18} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '3px' }} />
              <span>care@doctorscares.com</span>
            </div>
            <div className="footer-contact-item">
              <Clock size={18} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '3px' }} />
              <span>Outpatient Clinic: Mon – Sat: 8:00 AM – 8:00 PM<br/>Emergency: 24 Hours Open</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Doctors Cares Healthcare Network. All rights reserved.</p>
          <p>Model-View-Controller (MVC) Full-Stack Healthcare Architecture.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
