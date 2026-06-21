import React, { useState } from 'react';
import { Heart, Droplets, Clock, TrendingUp, CheckCircle2, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UrgencyBadge, BloodBadge } from '../../components/ui/Badges';
import { useNavigate } from 'react-router-dom';

export default function DonorDashboard() {
  const { user, requests, matches, notifications, respondToRequest, users } = useAuth();
  const navigate = useNavigate();
  const [isAvailable, setIsAvailable] = useState(user?.is_available ?? true);

  const donorId = user?.donor_id || user?.id;
  const myMatches = matches.filter(m => m.donor_id === donorId);
  const myPendingMatches = myMatches.filter(m => {
    const req = requests.find(r => r.id === m.request_id);
    return m.response === 'pending' && req && req.status === 'open';
  });
  
  const unreadNotifs = notifications.filter(n => n.donor_id === donorId && !n.is_read).length;

  const handleResponse = (matchId, response) => {
    respondToRequest(matchId, response);
  };

  return (
    <div className="animate-fadeIn">
      {/* Availability banner */}
      {!isAvailable && (
        <div className="alert alert-warning" style={{ marginBottom: 'var(--space-6)' }}>
          <Clock size={16} />
          <span>You are currently marked as <strong>Unavailable</strong>. You won't receive emergency request notifications.</span>
        </div>
      )}

      {/* Stats row */}
      <div className="grid-4" style={{ marginBottom: 'var(--space-8)' }}>
        {[
          { label: 'Total Donations', value: user?.donation_count || 0, icon: Heart, iconBg: 'var(--brand-red-muted)', iconColor: 'var(--brand-red-light)', change: 'Lifetime donations' },
          { label: 'Blood Type', value: user?.blood_type || 'O-', icon: Droplets, iconBg: 'var(--info-bg)', iconColor: 'var(--info)', change: 'Universal donor' },
          { label: 'Requests Waiting', value: myPendingMatches.length, icon: TrendingUp, iconBg: 'var(--warning-bg)', iconColor: 'var(--warning)', change: `${myPendingMatches.filter(m => {
              const req = requests.find(r => r.id === m.request_id);
              return req?.urgency === 'critical';
            }).length} critical` },
          { label: 'Unread Alerts', value: unreadNotifs, icon: CheckCircle2, iconBg: 'var(--success-bg)', iconColor: 'var(--success)', change: 'Click to view' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg || s.iconBg }}>
                <Icon size={20} color={s.iconColor} />
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-change up">{s.change}</div>
            </div>
          );
        })}
      </div>

      <div className="grid-2" style={{ gap: 'var(--space-6)' }}>
        {/* Availability toggle */}
        <div>
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between' }}>
              <div>
                <h4 style={{ marginBottom: 4 }}>Availability Status</h4>
                <p style={{ fontSize: '0.875rem', margin: 0 }}>
                  {isAvailable
                    ? 'You\'re visible to matching requests right now.'
                    : 'You won\'t receive notifications while unavailable.'}
                </p>
              </div>
              <label className="toggle-switch" id="availability-toggle">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={() => setIsAvailable(!isAvailable)}
                />
                <div className="toggle-track" />
                <div className="toggle-thumb" />
              </label>
            </div>
            <hr className="divider" />
            <div className="flex items-center gap-3">
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: isAvailable ? 'var(--color-success)' : 'var(--text-muted)',
                boxShadow: isAvailable ? '0 0 8px var(--color-success)' : 'none',
                animation: isAvailable ? 'pulse 2s infinite' : 'none'
              }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: isAvailable ? 'var(--color-success)' : 'var(--text-muted)' }}>
                {isAvailable ? 'Available for Donation' : 'Currently Unavailable'}
              </span>
            </div>
          </div>

          {/* Donor profile quick view */}
          <div className="card">
            <h4 style={{ marginBottom: 'var(--space-4)' }}>Your Profile</h4>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Blood Type', value: <BloodBadge type={user?.blood_type || 'O-'} /> },
                { label: 'City', value: user?.city || 'Lagos' },
                { label: 'District', value: user?.district || 'Lagos Mainland' },
                { label: 'Total Donations', value: `${user?.donation_count || 0} successful` },
                { label: 'Last Donation', value: user?.last_donation_date || 'Never' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.value}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-ghost btn-sm w-full mt-4" onClick={() => navigate('/donor/profile')}>
              Edit Profile →
            </button>
          </div>
        </div>

        {/* Active blood requests near me */}
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
            <h3 style={{ fontSize: '1.0625rem' }}>Active Requests Matching You</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/donor/notifications')}>View all</button>
          </div>
          <div className="flex flex-col gap-4">
            {myPendingMatches.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-muted)' }}>
                No pending compatibility matches found.
              </div>
            ) : myPendingMatches.map(match => {
              const req = requests.find(r => r.id === match.request_id);
              if (!req) return null;
              return (
                <div key={match.id} className={`request-card ${req.urgency}`} id={`match-card-${match.id}`}>
                  <div className="request-card-header">
                    <div>
                      <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                        <BloodBadge type={req.blood_type} />
                        <UrgencyBadge urgency={req.urgency} />
                      </div>
                      <h4 style={{ fontSize: '0.9375rem', marginTop: 6 }}>{req.hospital_name}</h4>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{req.units_needed - req.units_fulfilled}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>units needed</div>
                    </div>
                  </div>
                  <div className="request-card-meta">
                    <div className="request-meta-item">
                      <MapPin size={13} />
                      {req.city || 'Lagos'} (Compatible)
                    </div>
                    <div className="request-meta-item">
                      <Clock size={13} />
                      Respond by {new Date(req.response_deadline).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>{req.notes}</p>
                  <div className="request-card-actions">
                    <button
                      id={`accept-req-${match.id}`}
                      className="btn btn-success flex-1"
                      onClick={() => handleResponse(match.id, 'available')}
                    >
                      <CheckCircle2 size={15} />
                      I'm Available
                    </button>
                    <button
                      id={`decline-req-${match.id}`}
                      className="btn btn-secondary"
                      onClick={() => handleResponse(match.id, 'unavailable')}
                    >
                      Not Available
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
