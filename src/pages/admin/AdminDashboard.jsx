import React from 'react';
import { Users, Building2, Droplets, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UrgencyBadge, BloodBadge } from '../../components/ui/Badges';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { users, hospitals, requests, suspendHospitalAccount } = useAuth();

  const criticalRequests = requests.filter(r => r.urgency === 'critical' && (r.status === 'open' || r.status === 'partially_fulfilled'));
  const pendingHospitals = hospitals.filter(h => h.status === 'pending');
  const activeDonorsCount = users.filter(u => u.role === 'donor' && u.is_available).length;
  const totalDonorsCount = users.filter(u => u.role === 'donor').length;
  
  const handleApprove = (hospId) => {
    suspendHospitalAccount(hospId, 'approved');
  };

  const handleReject = (hospId) => {
    suspendHospitalAccount(hospId, 'rejected');
  };

  return (
    <div className="animate-fadeIn">
      {/* Critical alerts */}
      {criticalRequests.length > 0 && (
        <div className="alert alert-critical" style={{ marginBottom: 'var(--space-6)' }}>
          <AlertTriangle size={16} />
          <div>
            <strong>{criticalRequests.length} critical blood request(s)</strong> are active across the platform.
            {criticalRequests.map(r => (
              <span key={r.id} style={{ marginLeft: 8 }}>
                [{r.blood_type} — {r.hospital_name}]
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pending hospitals banner */}
      {pendingHospitals.length > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 'var(--space-6)' }}>
          <Building2 size={16} />
          <span><strong>{pendingHospitals.length} hospital application(s)</strong> pending your review.</span>
          <button className="btn btn-sm" style={{ marginLeft: 'auto', background: 'var(--warning)', color: '#000', border: 'none', fontWeight: 700 }}
            onClick={() => navigate('/hospitals')}>
            Review Now →
          </button>
        </div>
      )}

      {/* Platform stats */}
      <div className="grid-4" style={{ marginBottom: 'var(--space-8)' }}>
        {[
          { label: 'Total Donors', value: totalDonorsCount.toLocaleString(), sub: `${activeDonorsCount} active`, icon: Users, bg: 'var(--info-bg)', color: 'var(--info)' },
          { label: 'Partner Hospitals', value: hospitals.length, sub: `${pendingHospitals.length} pending`, icon: Building2, bg: 'var(--warning-bg)', color: 'var(--warning)' },
          { label: 'Open Requests', value: requests.filter(r => r.status === 'open' || r.status === 'partially_fulfilled').length, sub: `${criticalRequests.length} critical`, icon: Droplets, bg: 'var(--brand-red-muted)', color: 'var(--brand-red-light)' },
          { label: 'Total Requests Saved', value: requests.length, sub: `${requests.filter(r => r.status === 'fulfilled').length} fulfilled`, icon: TrendingUp, bg: 'var(--success-bg)', color: 'var(--success)' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg }}>
                <Icon size={20} color={s.color} />
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-change up" style={{ color: s.color }}>{s.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid-2">
        {/* All active requests */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: '1.0625rem' }}>All Active Requests</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/requests')}>See all →</button>
          </div>
          <div className="flex flex-col gap-3">
            {requests.filter(r => r.status === 'open' || r.status === 'partially_fulfilled').length === 0 ? (
              <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active requests at the moment.
              </div>
            ) : (
              requests.filter(r => r.status === 'open' || r.status === 'partially_fulfilled').map(req => (
                <div key={req.id} id={`admin-req-${req.id}`} className="card" style={{ padding: 'var(--space-4)' }}>
                  <div className="flex items-center gap-3">
                    <BloodBadge type={req.blood_type} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{req.hospital_name}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{req.units_needed - req.units_fulfilled} units remaining</div>
                    </div>
                    <UrgencyBadge urgency={req.urgency} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending hospitals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: '1.0625rem' }}>Pending Hospital Applications</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/hospitals')}>See all →</button>
          </div>
          <div className="flex flex-col gap-3">
            {pendingHospitals.map(h => (
              <div key={h.id} id={`admin-hosp-${h.id}`} className="card" style={{ padding: 'var(--space-4)' }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 40, height: 40, background: 'var(--warning-bg)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building2 size={18} color="var(--warning)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{h.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{h.city}, {h.region}</div>
                  </div>
                  <div className="flex gap-2">
                    <button id={`approve-hosp-${h.id}`} className="btn btn-success btn-sm" onClick={() => handleApprove(h.id)}>Approve</button>
                    <button id={`reject-hosp-${h.id}`} className="btn btn-danger btn-sm" onClick={() => handleReject(h.id)}>Reject</button>
                  </div>
                </div>
              </div>
            ))}
            {pendingHospitals.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                <CheckCircle2 size={28} color="var(--success)" style={{ margin: '0 auto var(--space-3)' }} />
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>All applications reviewed</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
