import React, { useState, useEffect } from 'react';
import { doctorService } from '../../api/doctorService';
import LoadingSpinner from '../common/LoadingSpinner';
import { Clock, AlertCircle } from 'lucide-react';

const SlotPicker = ({ doctorId, selectedDate, selectedSlot, onSelectSlot }) => {
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!doctorId || !selectedDate) {
      setAvailability(null);
      return;
    }

    const fetchSlots = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await doctorService.getDoctorAvailability(doctorId, selectedDate);
        setAvailability(res.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch doctor slots');
        setAvailability(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [doctorId, selectedDate]);

  if (!selectedDate) {
    return (
      <div style={{ padding: '1rem', background: 'var(--color-bg-muted)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
        <Clock size={18} style={{ marginBottom: '4px' }} />
        <p>Please select an appointment date above to view available time slots.</p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Checking doctor schedule..." />;
  }

  if (error) {
    return (
      <div className="alert alert-danger" style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
        <AlertCircle size={16} />
        <span>{error}</span>
      </div>
    );
  }

  if (!availability || !availability.isWorkingDay || availability.slots.length === 0) {
    return (
      <div style={{ padding: '1rem', background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)', borderRadius: 'var(--radius-md)', color: '#92400e', fontSize: '0.875rem' }}>
        The doctor is not scheduled for outpatient appointments on {availability?.dayOfWeek || 'this day'}. Please pick another date.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <label className="form-label" style={{ margin: 0 }}>Available Slots ({availability.dayOfWeek}):</label>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {availability.slots.filter((s) => s.isAvailable).length} open slots
        </span>
      </div>

      <div className="slot-grid">
        {availability.slots.map((slot) => {
          const isSelected = selectedSlot === slot.timeSlot;
          const isBooked = !slot.isAvailable;

          return (
            <button
              key={slot.timeSlot}
              type="button"
              disabled={isBooked}
              className={`slot-btn ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
              onClick={() => onSelectSlot(slot.timeSlot)}
              title={isBooked ? 'Slot already booked' : 'Click to select slot'}
            >
              {slot.startTime}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SlotPicker;
