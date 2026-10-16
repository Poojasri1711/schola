import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const Alert = ({ type = 'info', message, onClose, className = '' }) => {
  if (!message) return null;

  const iconMap = {
    info: <Info size={18} className="alert-icon" />,
    success: <CheckCircle size={18} className="alert-icon" />,
    warning: <AlertCircle size={18} className="alert-icon" />,
    danger: <XCircle size={18} className="alert-icon" />,
  };

  return (
    <div className={`alert-box alert-${type} ${className}`} role="alert">
      <div className="alert-content">
        {iconMap[type] || iconMap.info}
        <span className="alert-text">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          className="alert-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
