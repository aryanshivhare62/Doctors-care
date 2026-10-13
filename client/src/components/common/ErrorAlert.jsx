import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorAlert = ({ message, errors, onClose }) => {
  if (!message && (!errors || errors.length === 0)) return null;

  return (
    <div className="alert alert-danger" role="alert">
      <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flexGrow: 1 }}>
        {message && <div>{message}</div>}
        {errors && errors.length > 0 && (
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.4rem' }}>
            {errors.map((err, idx) => (
              <li key={idx}>
                {err.field ? <strong>{err.field}: </strong> : null}
                {err.message}
              </li>
            ))}
          </ul>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
