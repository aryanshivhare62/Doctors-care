import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HeartHandshake, Award, Users, Stethoscope, Clock, CheckCircle } from 'lucide-react';

const About = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-muted)', padding: '4rem 0' }}>
        <div className="container" style={{ maxWidth: '840px', textAlign: 'center' }}>
          <div className="section-tag">About Doctors Cares</div>
          <h1 className="section-heading" style={{ fontSize: '2.75rem', marginBottom: '1.25rem' }}>
            Transforming Healthcare Through Empathy & Technology
          </h1>
          <p className="section-subtitle" style={{ fontSize: '1.15rem' }}>
            Founded with a vision to eliminate healthcare friction, Doctors Cares unites accredited medical
            specialists, responsive appointment scheduling, and patient-first digital medical records.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div className="grid-2" style={{ gap: '3.5rem', alignItems: 'center' }}>
            <div>
              <div className="section-tag">Our Mission</div>
              <h2 style={{ fontSize: '2rem', marginBottom: '1.25rem' }}>
                Compassionate Medicine Powered By Digital Innovation
              </h2>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.8', marginBottom: '1.25rem' }}>
                Our mission is to provide accessible, high-caliber, and prompt medical attention to every patient.
                We believe that scheduling a doctor visit should be transparent, straightforward, and dignified.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <CheckCircle size={18} color="var(--color-success)" />
                  <span>Verified credentials and continuous medical education for all clinicians</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <CheckCircle size={18} color="var(--color-success)" />
                  <span>Real-time slot scheduling without double-booking or long lobby queues</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <CheckCircle size={18} color="var(--color-success)" />
                  <span>Confidential, HIPAA-compliant patient communication and profile protection</span>
                </div>
              </div>
            </div>

            <div>
              <img
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80"
                alt="Hospital campus"
                style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-main)' }}>
        <div className="container">
          <div className="section-title-wrap">
            <div className="section-tag">Core Principles</div>
            <h2 className="section-heading">Values That Drive Every Consultation</h2>
          </div>

          <div className="grid-3">
            <div className="service-card">
              <div className="service-icon-wrap">
                <HeartHandshake size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Patient Empathy</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem' }}>
                We listen attentively to understand every symptom, concern, and preference before delivering care.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon-wrap" style={{ background: 'var(--color-secondary-light)', color: 'var(--color-secondary)' }}>
                <ShieldCheck size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Integrity & Transparency</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem' }}>
                Clear consultation fees, transparent clinical recommendations, and zero hidden hospital charges.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon-wrap" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                <Award size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Clinical Excellence</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem' }}>
                Adhering to gold-standard medical diagnostic guidelines and evidence-backed therapy protocols.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ background: 'linear-gradient(135deg, var(--color-navy) 0%, #1e3a8a 100%)', color: '#ffffff', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '650px' }}>
          <h2 style={{ color: '#ffffff', fontSize: '2.25rem', marginBottom: '1rem' }}>
            Consult With Our Physicians
          </h2>
          <p style={{ color: '#cbd5e1', marginBottom: '2rem' }}>
            Book an appointment online or contact our main hospital support desk anytime.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/doctors" className="btn btn-primary btn-lg">
              Find Doctors
            </Link>
            <Link to="/contact" className="btn btn-outline" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)' }}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
