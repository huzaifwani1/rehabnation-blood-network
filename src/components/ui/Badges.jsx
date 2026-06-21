import React from 'react';

export function UrgencyBadge({ urgency }) {
  const map = {
    critical: { label: 'Critical', cls: 'badge-critical' },
    urgent:   { label: 'Urgent',   cls: 'badge-urgent'   },
    standard: { label: 'Standard', cls: 'badge-standard' },
  };
  const { label, cls } = map[urgency] || map.standard;
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function StatusBadge({ status }) {
  const map = {
    open:                { label: 'Open',                cls: 'badge-info'    },
    partially_fulfilled: { label: 'Partial',             cls: 'badge-warning' },
    fulfilled:           { label: 'Fulfilled',           cls: 'badge-success' },
    expired:             { label: 'Expired',             cls: 'badge-neutral' },
    cancelled:           { label: 'Cancelled',           cls: 'badge-neutral' },
    pending:             { label: 'Pending',             cls: 'badge-warning' },
    approved:            { label: 'Approved',            cls: 'badge-success' },
    rejected:            { label: 'Rejected',            cls: 'badge-danger'  },
    suspended:           { label: 'Suspended',           cls: 'badge-danger'  },
    available:           { label: 'Available',           cls: 'badge-success' },
    unavailable:         { label: 'Unavailable',         cls: 'badge-neutral' },
    donated:             { label: 'Donated',             cls: 'badge-success' },
    no_show:             { label: 'No-Show',             cls: 'badge-danger'  },
  };
  const { label, cls } = map[status] || { label: status, cls: 'badge-neutral' };
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function BloodBadge({ type }) {
  return <span className="blood-badge">{type}</span>;
}

export function Spinner({ size = 20 }) {
  return (
    <div
      className="spinner"
      style={{ width: size, height: size }}
    />
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Avatar({ initials, size = 36, color = 'brand' }) {
  return (
    <div
      className="sidebar-avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
}
