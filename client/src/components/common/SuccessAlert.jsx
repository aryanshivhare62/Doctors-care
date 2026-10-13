import React from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessAlert = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="alert alert-success" role="status">
      <CheckCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flexGrow: 1 }}>{message}</div>
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

export default SuccessAlert;
