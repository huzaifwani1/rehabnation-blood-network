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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

      {/* Profile Summary Card */}
      <div className="card" style={{ padding: 'var(--space-4)', background: 'linear-gradient(135deg, #fff 0%, #fff9f9 100%)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <BloodBadge type={user.blood_type} size="lg" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</h2>
                <div>
                  <VerifBadge status={user.verification_status} />
                </div>
              </div>
            </div>

            {/* Availability Toggle */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              background: user.is_available ? 'rgba(22,163,74,0.06)' : 'var(--zinc-50)',
              border: `1px solid ${user.is_available ? 'rgba(22,163,74,0.2)' : 'var(--border-base)'}`,
              borderRadius: 'var(--radius-lg)', padding: '6px 10px', flexShrink: 0
            }}>
              <button
                id="availability-toggle-btn"
                onClick={() => toggleAvailability(user.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  color: user.is_available ? 'var(--color-success)' : 'var(--zinc-400)',
                  display: 'flex', alignItems: 'center', gap: 4
                }}
              >
                {user.is_available
                  ? <ToggleRight size={28} />
                  : <ToggleLeft size={28} />}
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                  {user.is_available ? 'Available' : 'Unavailable'}
                </span>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-3)' }}>
            {[
              { label: 'Blood Group', value: user.blood_type || 'Not set', highlight: true },
              { label: 'Total Donations', value: user.donation_count || 0 },
              { label: 'Last Donation', value: lastDonation },
              ...(dob ? [{ label: 'Date of Birth', value: dob }] : []),
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: item.highlight ? 'var(--red-600)' : 'var(--zinc-900)', marginTop: 2 }}>{item.value}</div>
              </div>
            ))}
          </div>

          {!isEligible && user.is_available && (
            <div style={{ fontSize: '0.7rem', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Info size={12} />
              Check cooldown & health criteria
            </div>
          )}
        </div>

        {/* Eligibility bar */}
        {!isEligible && (
          <div style={{
            marginTop: 'var(--space-3)', padding: '8px 12px',
            background: 'var(--color-warning-bg)', borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '0.78rem', color: 'var(--color-warning)'
          }}>
            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>Eligibility criteria not fully met (weight ≥ 50kg, Hb ≥ 12.5 g/dL, 56-day cooldown).</span>
          </div>
        )}
      </div>

      {/* Emergency Requests Received */}
      <div className="card" style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={16} color="var(--red-600)" />
            Nearby Emergency Requests
            {receivedRequests.length > 0 && (
              <span style={{ background: 'var(--red-600)', color: '#fff', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px' }}>
                {receivedRequests.length}
              </span>
            )}
          </h3>
          <button className="btn btn-ghost btn-xs" onClick={() => navigate('/emergency-request')} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', padding: '2px 6px', minHeight: 'unset', minWidth: 'unset' }}>
            Feed <ChevronRight size={12} />
          </button>
        </div>

        {receivedRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-6) 0', color: 'var(--text-muted)' }}>
            <Heart size={24} style={{ opacity: 0.2, marginBottom: 6 }} />
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600 }}>No matching emergency requests active</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {receivedRequests.map(({ match, req }) => {
              const myResponse = match.response;
              const requester = users.find(u => u.id === req.requester_id);
              return (
                <div key={match.id} style={{
                  border: `1px solid ${myResponse === 'available' ? 'rgba(22,163,74,0.2)' : 'var(--border-base)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3)',
                  background: myResponse === 'available' ? 'rgba(22,163,74,0.03)' : '#fff'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{
                          background: 'var(--red-50)', color: 'var(--red-600)',
                          fontWeight: 800, fontSize: '0.85rem', padding: '2px 8px', borderRadius: '4px'
                        }}>{req.blood_type}</span>
                        <UrgencyBadge level={req.urgency} />
                      </div>
                      <TimeAgo dateStr={req.created_at} />
                    </div>

                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--zinc-900)' }}>
                      Patient: {req.patient_name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      🏥 {req.hospital_name} · 📍 {req.location}
                    </div>

                    {/* Contact info (only if accepted) */}
                    {myResponse === 'available' && (
                      <div style={{
                        padding: 'var(--space-2)',
                        background: 'rgba(22,163,74,0.08)', borderRadius: 'var(--radius-sm)',
                        display: 'flex', flexDirection: 'column', gap: 4
                      }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle size={12} /> Contact Details
                        </div>
                        {req.phone && (
                          <a href={`tel:${req.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--color-success)', fontWeight: 600, textDecoration: 'none' }}>
                            <Phone size={12} /> {req.phone}
                          </a>
                        )}
                        {requester?.email && (
                          <a href={`mailto:${requester.email}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--color-success)', fontWeight: 600, textDecoration: 'none' }}>
                            <Mail size={12} /> {requester.email}
                          </a>
                        )}
                      </div>
                    )}

                    {/* Response buttons */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      {myResponse === 'pending' ? (
                        <>
                          <button
                            id={`respond-available-${match.id}`}
                            className="btn btn-primary btn-sm"
                            onClick={() => handleRespond(match.id, 'available')}
                            disabled={responding === match.id + 'available'}
                            style={{ flex: 1, fontSize: '0.8rem', padding: '6px 12px', minHeight: '32px' }}
                          >
                            I'm Available
                          </button>
                          <button
                            id={`respond-unavailable-${match.id}`}
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleRespond(match.id, 'unavailable')}
                            disabled={responding === match.id + 'unavailable'}
                            style={{ flex: 1, fontSize: '0.8rem', padding: '6px 12px', minHeight: '32px' }}
                          >
                            Decline
                          </button>
                        </>
                      ) : myResponse === 'available' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--color-success)', fontWeight: 700 }}>
                          <CheckCircle size={12} /> Response Sent: Available
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--zinc-400)', fontWeight: 700 }}>
                          <XCircle size={12} /> Response Sent: Declined
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
      <div className="card" style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Droplets size={16} color="var(--color-info)" />
            My Requests
          </h3>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-ghost btn-xs" onClick={() => navigate('/my-requests')} style={{ fontSize: '0.75rem', padding: '2px 6px', minHeight: 'unset', minWidth: 'unset' }}>
              View All
            </button>
            <button
              id="create-new-request-btn"
              className="btn btn-primary btn-xs"
              onClick={() => navigate('/request-blood')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', padding: '4px 8px', minHeight: 'unset', minWidth: 'unset' }}
            >
              <Plus size={12} /> New
            </button>
          </div>
        </div>

        {myRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-6) 0', color: 'var(--text-muted)' }}>
            <Droplets size={24} style={{ opacity: 0.2, marginBottom: 6 }} />
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600 }}>No requests created yet</p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 8, fontSize: '0.8rem', minHeight: '32px' }} onClick={() => navigate('/request-blood')}>
              Create Request
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {myRequests.slice(0, 3).map(req => {
              const reqMatches = matches.filter(m => m.request_id === req.id && m.response === 'available');
              const cfg = URGENCY_CONFIG[req.urgency] || URGENCY_CONFIG.standard;
              return (
                <div key={req.id} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  padding: '10px var(--space-3)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)', background: '#fff'
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: '0.8rem', color: cfg.color, flexShrink: 0
                  }}>
                    {req.blood_type}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'var(--zinc-900)', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {req.patient_name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span>{req.location}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-success)', fontSize: '0.9rem', lineHeight: 1.1 }}>{reqMatches.length}</div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>avail</div>
                    </div>
                    <span style={{
                      padding: '2px 6px', borderRadius: 99, fontSize: '0.65rem', fontWeight: 700,
                      background: req.status === 'open' ? 'rgba(22,163,74,0.1)' : req.status === 'fulfilled' ? 'var(--color-info-bg)' : 'var(--zinc-100)',
                      color: req.status === 'open' ? 'var(--color-success)' : req.status === 'fulfilled' ? 'var(--color-info)' : 'var(--zinc-400)'
                    }}>
                      {req.status}
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
