import React from 'react';

const LoadingSpinner = ({ message = 'Loading, please wait...' }) => {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
