import React, { useState } from 'react';
import { contactService } from '../api/contactService';
import ErrorAlert from '../components/common/ErrorAlert';
import SuccessAlert from '../components/common/SuccessAlert';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorsList, setErrorsList] = useState([]);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setErrorsList([]);
    setSuccessMsg(null);

    try {
      setLoading(true);
      const res = await contactService.submitContact(formData);
      setSuccessMsg(res.message || 'Your inquiry was sent successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      setError(err.message || 'Failed to submit contact form');
      if (err.errors) setErrorsList(err.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <div className="container">
        <div className="section-title-wrap" style={{ textAlign: 'left', margin: '0 0 2.5rem' }}>
          <div className="section-tag">
            <MessageSquare size={16} />
            <span>Support & Inquiries</span>
          </div>
          <h1 className="section-heading" style={{ fontSize: '2.5rem' }}>
            Get in Touch With Doctors Cares
          </h1>
          <p className="section-subtitle">
            Have questions about outpatient visits, department services, or corporate checkups?
            Our support desk is here to assist you.
          </p>
        </div>

        <div className="contact-grid">
          {/* Form Card */}
          <div className="card" style={{ padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>Send Us An Inquiry</h3>

            <ErrorAlert message={error} errors={errorsList} onClose={() => setError(null)} />
            <SuccessAlert message={successMsg} onClose={() => setSuccessMsg(null)} />

            <form onSubmit={handleSubmit}>
              <div className="grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control"
                    placeholder="Full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-control"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="form-control"
                    placeholder="e.g. Insurance query, second opinion"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  className="form-textarea"
                  rows={4}
                  placeholder="How can we assist you today? Provide details on your request."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  minLength={10}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={loading}
              >
                <Send size={18} />
                <span>{loading ? 'Submitting Message...' : 'Submit Inquiry'}</span>
              </button>
            </form>
          </div>

          {/* Contact Details Card */}
          <div className="contact-info-card">
            <h3 style={{ color: '#ffffff', fontSize: '1.45rem', marginBottom: '1.5rem' }}>
              Healthcare Headquarters
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <MapPin size={22} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#ffffff', display: 'block' }}>Main Medical Complex</strong>
                  <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                    100 Medical Center Blvd, Metro City, CA 90210
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <Phone size={22} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#ffffff', display: 'block' }}>Phone & Support Desk</strong>
                  <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                    +1 (800) 432-CARE / +1 (555) 019-2831
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <Mail size={22} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#ffffff', display: 'block' }}>Email Communications</strong>
                  <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                    care@doctorscares.com / appointments@doctorscares.com
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <Clock size={22} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#ffffff', display: 'block' }}>Operating Hours</strong>
                  <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                    Outpatient Clinic: Mon – Sat: 8:00 AM – 8:00 PM<br />
                    Emergency Unit: 24 Hours Open (365 Days)
                  </span>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="map-placeholder">
              <MapPin size={32} color="var(--color-primary)" style={{ marginBottom: '0.5rem' }} />
              <strong style={{ color: 'var(--color-navy)' }}>Doctors Cares Interactive Map</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                100 Medical Center Blvd, Metro City
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
