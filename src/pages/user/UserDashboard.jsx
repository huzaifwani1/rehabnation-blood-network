import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Droplets, ShieldCheck, ShieldOff, Heart, Phone, Mail,
  Clock, CheckCircle, XCircle, AlertTriangle, Zap,
  ToggleLeft, ToggleRight, Plus, ChevronRight, Info,
  Calendar, Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function BloodBadge({ type, size = 'md' }) {
  const sz = size === 'lg' ? { w: 72, h: 72, fs: '1.5rem' } : { w: 48, h: 48, fs: '1rem' };
  return (
    <div style={{
      width: sz.w, height: sz.h, borderRadius: '50%',
      background: 'var(--red-50)', border: '2px solid var(--red-100)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 900, fontSize: sz.fs, color: 'var(--red-600)', flexShrink: 0
    }}>
      {type || '?'}
    </div>
  );
}

function VerifBadge({ status }) {
  const configs = {
    camp_verified: { label: 'Camp Verified', color: 'var(--color-success)', bg: 'rgba(22,163,74,0.1)', icon: <ShieldCheck size={12} /> },
    unverified:    { label: 'Unverified',    color: 'var(--zinc-500)',       bg: 'var(--zinc-100)',           icon: <ShieldOff size={12} /> },
    pending:       { label: 'Pending Review',color: 'var(--color-warning)',  bg: 'var(--color-warning-bg)',   icon: <Clock size={12} /> },
  };
  const cfg = configs[status] || configs.unverified;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: cfg.bg, color: cfg.color, borderRadius: 99,
      fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px'
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

const URGENCY_CONFIG = {
  critical: { label: 'Critical', color: 'var(--red-600)', bg: 'var(--red-50)' },
  urgent:   { label: 'Urgent',   color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
  standard: { label: 'Standard', color: 'var(--color-info)',    bg: 'var(--color-info-bg)' },
};

function UrgencyBadge({ level }) {
  const cfg = URGENCY_CONFIG[level] || URGENCY_CONFIG.standard;
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      fontSize: '0.72rem', fontWeight: 700,
      padding: '3px 8px', borderRadius: 99
    }}>
      {cfg.label}
    </span>
  );
}

function TimeAgo({ dateStr }) {
  if (!dateStr) return null;
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  let label;
  if (diff < 60) label = `${Math.floor(diff)}s ago`;
  else if (diff < 3600) label = `${Math.floor(diff / 60)}m ago`;
  else if (diff < 86400) label = `${Math.floor(diff / 3600)}h ago`;
  else label = new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}><Clock size={11} style={{ marginRight: 3 }} />{label}</span>;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, users, requests, matches, toggleAvailability, respondToRequest } = useAuth();
  const [responding, setResponding] = useState(null);

  if (!user) return null;

  // Eligibility check
  const isEligible = (() => {
    const w = parseFloat(user.weight_kg) || 0;
    const hb = parseFloat(user.hemoglobin_level) || 0;
    const cooldownOk = !user.last_donation_date ||
      (Date.now() - new Date(user.last_donation_date).getTime()) / (1000 * 60 * 60 * 24) >= 56;
    return w >= 50 && hb >= 12.5 && cooldownOk;
  })();

  // Emergency requests received by this user (as potential donor)
  const myMatches = matches.filter(m => m.donor_id === user.id);
  const receivedRequests = myMatches.map(m => {
    const req = requests.find(r => r.id === m.request_id);
    return req ? { match: m, req } : null;
  }).filter(Boolean).filter(({ req }) => req.status === 'open');

  // Requests created by this user
  const myRequests = requests.filter(r => r.requester_id === user.id);

  const handleRespond = (matchId, response) => {
    setResponding(matchId + response);
    respondToRequest(matchId, response);
    setTimeout(() => setResponding(null), 500);
  };

  const lastDonation = user.last_donation_date
    ? new Date(user.last_donation_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not recorded';

  const dob = user.dob
    ? new Date(user.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

      {/* Profile Summary Card */}
      <div className="card" style={{ padding: 'var(--space-6)', background: 'linear-gradient(135deg, #fff 0%, #fff9f9 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
          <BloodBadge type={user.blood_type} size="lg" />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{user.name}</h2>
              <VerifBadge status={user.verification_status} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              {[
                { label: 'Blood Group', value: user.blood_type || 'Not set', highlight: true },
                { label: 'Total Donations', value: user.donation_count || 0 },
                { label: 'Last Donation', value: lastDonation },
                ...(dob ? [{ label: 'Date of Birth', value: dob }] : []),
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                  <div style={{ fontWeight: 700, color: item.highlight ? 'var(--red-600)' : 'var(--zinc-900)', marginTop: 2 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Availability Toggle */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            background: user.is_available ? 'rgba(22,163,74,0.06)' : 'var(--zinc-50)',
            border: `1px solid ${user.is_available ? 'rgba(22,163,74,0.2)' : 'var(--border-base)'}`,
            borderRadius: 'var(--radius-xl)', padding: 'var(--space-4) var(--space-5)'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Availability
            </div>
            <button
              id="availability-toggle-btn"
              onClick={() => toggleAvailability(user.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                color: user.is_available ? 'var(--color-success)' : 'var(--zinc-400)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6
              }}
            >
              {user.is_available
                ? <ToggleRight size={40} />
                : <ToggleLeft size={40} />}
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                {user.is_available ? 'Available' : 'Not Available'}
              </span>
            </button>
            {!isEligible && user.is_available && (
              <div style={{ fontSize: '0.7rem', color: 'var(--color-warning)', textAlign: 'center', maxWidth: 120 }}>
                <Info size={11} style={{ marginRight: 2 }} />
                Check eligibility criteria
              </div>
            )}
          </div>
        </div>

        {/* Eligibility bar */}
        {!isEligible && (
          <div style={{
            marginTop: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)',
            background: 'var(--color-warning-bg)', borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--color-warning)'
          }}>
            <AlertTriangle size={16} />
            You may not currently meet all donation eligibility criteria (weight ≥ 50kg, Hb ≥ 12.5 g/dL, 56-day cooldown). Update your profile to reflect current health info.
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-4)' }}>
        {[
          { label: 'Emergency Requests', value: receivedRequests.length, icon: <AlertTriangle size={18} color="var(--red-600)" />, color: 'var(--red-600)', bg: 'var(--red-50)' },
          { label: 'My Blood Requests', value: myRequests.length, icon: <Droplets size={18} color="var(--color-info)" />, color: 'var(--color-info)', bg: 'var(--color-info-bg)' },
          { label: 'Donations Made', value: user.donation_count || 0, icon: <Heart size={18} color="var(--color-success)" />, color: 'var(--color-success)', bg: 'rgba(22,163,74,0.1)' },
          { label: 'Active Matches', value: myMatches.filter(m => m.response === 'available' && m.outcome === 'pending').length, icon: <Activity size={18} color="var(--color-warning)" />, color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Requests Received */}
      <div className="card" style={{ padding: 'var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} color="var(--red-600)" />
            Emergency Requests Received
            {receivedRequests.length > 0 && (
              <span style={{ background: 'var(--red-600)', color: '#fff', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px' }}>
                {receivedRequests.length}
              </span>
            )}
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/emergency-request')}>
            View Public Feed <ChevronRight size={13} />
          </button>
        </div>

        {receivedRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-muted)' }}>
            <Heart size={32} style={{ opacity: 0.2, marginBottom: 8 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No active emergency requests for your blood group</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>You'll be notified when a compatible request is created</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {receivedRequests.map(({ match, req }) => {
              const myResponse = match.response;
              const requester = users.find(u => u.id === req.requester_id);
              return (
                <div key={match.id} style={{
                  border: `1px solid ${myResponse === 'available' ? 'rgba(22,163,74,0.2)' : 'var(--border-base)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  background: myResponse === 'available' ? 'rgba(22,163,74,0.03)' : '#fff'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: 'var(--red-50)', border: '2px solid var(--red-100)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: '0.95rem', color: 'var(--red-600)', flexShrink: 0
                    }}>
                      {req.blood_type}
                    </div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <UrgencyBadge level={req.urgency} />
                        <TimeAgo dateStr={req.created_at} />
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--zinc-900)' }}>{req.blood_type} blood needed — {req.patient_name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        🏥 {req.hospital_name || 'Unknown'} · 📍 {req.location || 'Unknown'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Units needed: {(req.units_needed || 0) - (req.units_fulfilled || 0)} of {req.units_needed}
                      </div>

                      {/* Contact info (only if accepted) */}
                      {myResponse === 'available' && (
                        <div style={{
                          marginTop: 'var(--space-3)', padding: 'var(--space-3)',
                          background: 'rgba(22,163,74,0.08)', borderRadius: 'var(--radius-md)',
                          display: 'flex', flexWrap: 'wrap', gap: 12
                        }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-success)', marginBottom: 4, width: '100%' }}>
                            <CheckCircle size={13} style={{ marginRight: 4 }} />
                            Requester Contact Details
                          </div>
                          {req.phone && (
                            <a href={`tel:${req.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600, textDecoration: 'none' }}>
                              <Phone size={13} /> {req.phone}
                            </a>
                          )}
                          {requester?.email && (
                            <a href={`mailto:${requester.email}`} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600, textDecoration: 'none' }}>
                              <Mail size={13} /> {requester.email}
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Response buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                      {myResponse === 'pending' ? (
                        <>
                          <button
                            id={`respond-available-${match.id}`}
                            className="btn btn-primary btn-sm"
                            onClick={() => handleRespond(match.id, 'available')}
                            disabled={responding === match.id + 'available'}
                            style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                          >
                            <CheckCircle size={13} /> I'm Available
                          </button>
                          <button
                            id={`respond-unavailable-${match.id}`}
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleRespond(match.id, 'unavailable')}
                            disabled={responding === match.id + 'unavailable'}
                            style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                          >
                            <XCircle size={13} /> Not Available
                          </button>
                        </>
                      ) : myResponse === 'available' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 700 }}>
                          <CheckCircle size={14} /> Accepted
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--zinc-400)', fontWeight: 700 }}>
                          <XCircle size={14} /> Declined
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My Blood Requests */}
      <div className="card" style={{ padding: 'var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Droplets size={18} color="var(--color-info)" />
            My Blood Requests
          </h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/my-requests')}>
              View All <ChevronRight size={13} />
            </button>
            <button
              id="create-new-request-btn"
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/request-blood')}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <Plus size={14} /> New Request
            </button>
          </div>
        </div>

        {myRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-muted)' }}>
            <Droplets size={32} style={{ opacity: 0.2, marginBottom: 8 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No blood requests yet</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Create a request to find compatible donors</p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/request-blood')}>
              <Plus size={13} /> Create First Request
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {myRequests.slice(0, 3).map(req => {
              const reqMatches = matches.filter(m => m.request_id === req.id && m.response === 'available');
              const cfg = URGENCY_CONFIG[req.urgency] || URGENCY_CONFIG.standard;
              return (
                <div key={req.id} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                  padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)', flexWrap: 'wrap'
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: '0.9rem', color: cfg.color, flexShrink: 0
                  }}>
                    {req.blood_type}
                  </div>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontWeight: 600, color: 'var(--zinc-900)', fontSize: '0.9rem' }}>
                      {req.patient_name} — {req.blood_type}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <UrgencyBadge level={req.urgency} />
                      <TimeAgo dateStr={req.created_at} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-success)', fontSize: '1.1rem' }}>{reqMatches.length}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>donors</div>
                    </div>
                    <span style={{
                      padding: '3px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700,
                      background: req.status === 'open' ? 'rgba(22,163,74,0.1)' : req.status === 'fulfilled' ? 'var(--color-info-bg)' : 'var(--zinc-100)',
                      color: req.status === 'open' ? 'var(--color-success)' : req.status === 'fulfilled' ? 'var(--color-info)' : 'var(--zinc-400)'
                    }}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
