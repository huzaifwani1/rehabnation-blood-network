import React, { useState } from 'react';
import { Droplets, Users, Building2, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BloodBadge, StatusBadge, UrgencyBadge, EmptyState } from '../../components/ui/Badges';

export default function AdminRequests() {
  const { requests } = useAuth();
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');

  const filtered = requests.filter(r => {
    const matchesStatus = filterStatus ? r.status === filterStatus : true;
    const matchesUrgency = filterUrgency ? r.urgency === filterUrgency : true;
    return matchesStatus && matchesUrgency;
  });

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>All Blood Requests</h1>
          <p>Platform-wide request monitoring</p>
        </div>
        <div className="badge badge-info">{requests.length} total</div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)' }}>
        <div className="flex items-center gap-3 flex-wrap">
          <select id="admin-filter-status" className="form-select" style={{ width: 180 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="partially_fulfilled">Partially Fulfilled</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select id="admin-filter-urgency" className="form-select" style={{ width: 160 }} value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)}>
            <option value="">All Urgency</option>
            <option value="critical">Critical</option>
            <option value="urgent">Urgent</option>
            <option value="standard">Standard</option>
          </select>
          <div className="badge badge-neutral">{filtered.length} shown</div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filtered.map(req => (
          <div key={req.id} id={`admin-req-detail-${req.id}`} className={`request-card ${req.urgency}`}>
            <div className="request-card-header">
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <BloodBadge type={req.blood_type} />
                  <UrgencyBadge urgency={req.urgency} />
                  <StatusBadge status={req.status} />
                </div>
                <h4 style={{ fontSize: '1rem', marginBottom: 4 }}>{req.hospital_name}</h4>
                <p style={{ fontSize: '0.875rem', margin: 0 }}>{req.notes}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{req.units_needed}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>units needed</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>{req.units_fulfilled}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>fulfilled</div>
                </div>
              </div>
            </div>
            <div className="request-card-meta">
              <div className="request-meta-item">
                <Users size={13} />
                {req.matching_donor_count} compatible donors matched
              </div>
              <div className="request-meta-item">
                <Clock size={13} />
                Deadline: {new Date(req.response_deadline).toLocaleString()}
              </div>
              <div className="request-meta-item">
                <Building2 size={13} />
                Created {new Date(req.created_at).toLocaleDateString()}
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ height: 6, background: 'var(--bg-hover)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 'var(--radius-full)',
                width: `${Math.min(100, ((req.units_fulfilled || 0) / req.units_needed) * 100)}%`,
                background: req.urgency === 'critical' ? 'var(--urgency-critical)' : req.urgency === 'urgent' ? 'var(--urgency-urgent)' : 'var(--success)',
              }} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <EmptyState
            icon={<Droplets size={28} color="var(--text-muted)" />}
            title="No requests found"
            description="Try adjusting the filters."
          />
        )}
      </div>
    </div>
  );
}
