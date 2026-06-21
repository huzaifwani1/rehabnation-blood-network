import React from 'react';
import { Droplets, CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UrgencyBadge, BloodBadge, StatusBadge } from '../../components/ui/Badges';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function HospitalDashboard() {
  const { user, requests, matches } = useAuth();
  const navigate = useNavigate();

  const myRequests = requests.filter(r => r.hospital_id === user?.hospital_id);
  const openRequests = myRequests.filter(r => r.status === 'open' || r.status === 'partially_fulfilled');
  const fulfilledRequests = myRequests.filter(r => r.status === 'fulfilled');
  const criticalRequests = myRequests.filter(r => r.urgency === 'critical' && (r.status === 'open' || r.status === 'partially_fulfilled'));

  // Filter recent responses for my requests
  const recentResponses = matches.filter(m => {
    const isMyRequest = requests.some(r => r.hospital_id === user?.hospital_id && r.id === m.request_id);
    return isMyRequest && m.response !== 'pending';
  });

  return (
    <div className="animate-fadeIn">
      {/* Critical alert */}
      {criticalRequests.length > 0 && (
        <div className="alert alert-critical" style={{ marginBottom: 'var(--space-6)' }}>
          <AlertTriangle size={16} />
          <span>
            <strong>{criticalRequests.length} critical request(s)</strong> are active and awaiting donor responses.
          </span>
          <button className="btn btn-sm" style={{ marginLeft: 'auto', background: 'var(--urgency-critical)', color: '#fff', border: 'none' }}
            onClick={() => navigate('/hospital/requests')}>
            View Now
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 'var(--space-8)' }}>
        {[
          { label: 'Open Requests', value: openRequests.length, icon: Droplets, iconBg: 'var(--info-bg)', iconColor: 'var(--info)' },
          { label: 'Critical Active', value: criticalRequests.length, icon: AlertTriangle, iconBg: 'var(--urgency-critical-bg)', iconColor: 'var(--urgency-critical)' },
          { label: 'Fulfilled (All)', value: fulfilledRequests.length, icon: CheckCircle2, iconBg: 'var(--success-bg)', iconColor: 'var(--success)' },
          { label: 'Donors Matched', value: myRequests.reduce((a, r) => a + (r.matching_donor_count || 0), 0), icon: TrendingUp, iconBg: 'var(--warning-bg)', iconColor: 'var(--warning)' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: s.iconBg }}>
                <Icon size={20} color={s.iconColor} />
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-6" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Active requests */}
        <div style={{ flex: '2 1 400px' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: '1.0625rem' }}>Active Blood Requests</h3>
            <button id="create-request-shortcut-btn" className="btn btn-primary btn-sm" onClick={() => navigate('/hospital/requests/new')}>
              + New Request
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {openRequests.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
                <p style={{ color: 'var(--text-muted)' }}>No active requests</p>
                <button className="btn btn-primary btn-sm mt-4" onClick={() => navigate('/hospital/requests/new')}>
                  Create Your First Request
                </button>
              </div>
            ) : openRequests.map(req => {
              const acceptedDonors = matches.filter(m => m.request_id === req.id && m.response === 'available');
              return (
                <div key={req.id} id={`hosp-req-${req.id}`} className={`request-card ${req.urgency}`}>
                  <div className="request-card-header">
                    <div>
                      <div className="flex items-center gap-2">
                        <BloodBadge type={req.blood_type} />
                        <UrgencyBadge urgency={req.urgency} />
                        <StatusBadge status={req.status} />
                      </div>
                      <p style={{ fontSize: '0.875rem', marginTop: 6 }}>{req.notes}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {req.units_needed - req.units_fulfilled}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>units remaining</div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ marginBottom: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', justifycontent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                      <span>{req.units_fulfilled} of {req.units_needed} units fulfilled</span>
                      <span>{acceptedDonors.length} accepted ({req.matching_donor_count} compatible)</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-hover)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 'var(--radius-full)',
                        width: `${Math.min(100, ((req.units_fulfilled || 0) / req.units_needed) * 100)}%`,
                        background: 'var(--success)',
                        transition: 'width var(--transition-slow)'
                      }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      <Clock size={13} />
                      Deadline: {new Date(req.response_deadline).toLocaleString()}
                    </div>
                    <button
                      id={`view-request-${req.id}`}
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate('/hospital/requests')}
                    >
                      View Donors →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent matches / activity */}
        <div style={{ flex: '1 1 280px' }}>
          <h3 style={{ fontSize: '1.0625rem', marginBottom: 'var(--space-4)' }}>Recent Donor Responses</h3>
          <div className="card" style={{ padding: 0 }}>
            {recentResponses.length === 0 ? (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No recent responses received
              </div>
            ) : (
              recentResponses.map((m, i) => (
                <div key={m.id} style={{
                  padding: 'var(--space-4) var(--space-5)',
                  borderBottom: i < recentResponses.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)'
                }}>
                  <div className="sidebar-avatar" style={{ width: 34, height: 34, fontSize: 12 }}>
                    {m.donor_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{m.donor_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {m.responded_at ? formatDistanceToNow(new Date(m.responded_at), { addSuffix: true }) : 'responded'}
                    </div>
                  </div>
                  <StatusBadge status={m.response} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
