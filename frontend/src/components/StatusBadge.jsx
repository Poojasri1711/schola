import React from 'react';

const StatusBadge = ({ status, type = 'default' }) => {
  const normalized = (status || '').toLowerCase().trim();

  let badgeClass = 'badge-secondary';
  let label = status || 'N/A';

  if (
    normalized === 'verified' ||
    normalized === 'approved' ||
    normalized === 'eligible' ||
    normalized === 'active'
  ) {
    badgeClass = 'badge-success';
  } else if (
    normalized === 'rejected' ||
    normalized === 'not eligible' ||
    normalized === 'expired'
  ) {
    badgeClass = 'badge-danger';
  } else if (normalized === 'pending' || normalized === 'incomplete') {
    badgeClass = 'badge-warning';
  } else if (normalized === 'under review' || normalized === 'review') {
    badgeClass = 'badge-info';
  }

  return (
    <span className={`status-badge ${badgeClass}`}>
      <span className="badge-dot"></span>
      {label}
    </span>
  );
};

export default StatusBadge;
