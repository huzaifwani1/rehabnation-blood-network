import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Droplets, Phone, Mail, CheckCircle, Clock, XCircle,
  AlertTriangle, ChevronDown, ChevronUp, MapPin, Users, Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const URGENCY_CONFIG = {
  critical: { label: 'Critical', color: 'var(--red-600)', bg: 'var(--red-50)' },
  urgent:   { label: 'Urgent',   color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
  standard: { label: 'Standard', color: 'var(--color-info)',    bg: 'var(--color-info-bg)' },
};

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

export default function UserRequests() {
  const navigate = useNavigate();
  const { user, requests, matches, recordOutcome } = useAuth();
  const [expanded, setExpanded] = useState(null);

  if (!user) return null;

  const myRequests = (requests || []).filter(r => r.requester_id === user.id);

  const getMatchesForRequest = (reqId) =>
    (matches || []).filter(m => m.request_id === reqId);

  const handleOutcome = (matchId, outcome) => {
    recordOutcome(matchId, outcome);
  };

  if (myRequests.length === 0) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', padding: 'var(--space-16) var(--space-6)' }}>
        <Droplets size={48} style={{ opacity: 0.2, marginBottom: 12, color: 'var(--red-600)' }} />
        <h3 style={{ margin: '0 0 8px' }}>No blood requests yet</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
          Create your first blood request to start matching with compatible donors in your area.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/request-blood')}>
          <Plus size={14} /> Create Blood Request
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>My Blood Requests</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>
            {myRequests.length} request{myRequests.length !== 1 ? 's' : ''} created
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/request-blood')}>
          <Plus size={14} /> New Request
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {myRequests.map(req => {
          const reqMatches = getMatchesForRequest(req.id);
          const availableMatches = reqMatches.filter(m => m.response === 'available');
          const isExpanded = expanded === req.id;
          const cfg = URGENCY_CONFIG[req.urgency] || URGENCY_CONFIG.standard;
          const unitsLeft = (req.units_needed || 0) - (req.units_fulfilled || 0);

          return (
            <div key={req.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Request Header */}
              <div
                style={{
                  padding: 'var(--space-5)', cursor: 'pointer',
                  borderBottom: isExpanded ? '1px solid var(--border-subtle)' : 'none',
                  display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)', flexWrap: 'wrap'
                }}
                onClick={() => setExpanded(isExpanded ? null : req.id)}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '0.95rem', color: cfg.color, flexShrink: 0
                }}>
                  {req.blood_type}
                </div>

                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--zinc-900)' }}>
                      {req.patient_name} — {req.blood_type} Blood
                    </span>
                    <span style={{
                      padding: '3px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
                      background: req.status === 'open' ? 'rgba(22,163,74,0.1)' : req.status === 'fulfilled' ? 'var(--color-info-bg)' : 'var(--zinc-100)',
                      color: req.status === 'open' ? 'var(--color-success)' : req.status === 'fulfilled' ? 'var(--color-info)' : 'var(--zinc-400)'
                    }}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                    <span style={{ background: cfg.bg, color: cfg.color, fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 99 }}>
                      {cfg.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {req.hospital_name && <span>🏥 {req.hospital_name}</span>}
                    {req.location && <span><MapPin size={12} /> {req.location}</span>}
                    <TimeAgo dateStr={req.created_at} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-success)' }}>{availableMatches.length}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>donors available</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: unitsLeft === 0 ? 'var(--color-success)' : cfg.color }}>{req.units_fulfilled || 0}/{req.units_needed}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>units fulfilled</div>
                  </div>
                  {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </div>
              </div>

              {/* Expanded — donor matches */}
              {isExpanded && (
                <div style={{ padding: 'var(--space-5)' }}>
                  <h4 style={{ margin: '0 0 var(--space-4)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', color: 'var(--zinc-700)' }}>
                    <Users size={16} />
                    Matched Donors ({reqMatches.length})
                  </h4>

                  {reqMatches.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: 'var(--space-4)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                      No donors matched yet. The request is actively searching for compatible donors.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      {reqMatches.map(match => {
                        const isAvailable = match.response === 'available';
                        const isUnavailable = match.response === 'unavailable';
                        const isPending = match.response === 'pending';

                        return (
                          <div key={match.id} style={{
                            padding: 'var(--space-4)',
                            borderRadius: 'var(--radius-lg)',
                            border: `1px solid ${isAvailable ? 'rgba(22,163,74,0.2)' : 'var(--border-subtle)'}`,
                            background: isAvailable ? 'rgba(22,163,74,0.03)' : isPending ? '#fff' : 'var(--bg-elevated)',
                            display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)', flexWrap: 'wrap'
                          }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: '50%',
                              background: isAvailable ? 'rgba(22,163,74,0.1)' : 'var(--zinc-100)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 800, fontSize: '0.8rem', color: isAvailable ? 'var(--color-success)' : 'var(--zinc-400)',
                              flexShrink: 0
                            }}>
                              {(match.donor_name || 'U').charAt(0)}
                            </div>

                            <div style={{ flex: 1, minWidth: 140 }}>
                              <div style={{ fontWeight: 600, color: isUnavailable ? 'var(--zinc-400)' : 'var(--zinc-900)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                {isAvailable ? match.donor_name : isPending ? '••••• (Pending)' : '••••• (Declined)'}
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                                  background: isAvailable ? 'rgba(22,163,74,0.1)' : isPending ? 'var(--zinc-100)' : 'rgba(220,38,38,0.08)',
                                  color: isAvailable ? 'var(--color-success)' : isPending ? 'var(--zinc-400)' : 'var(--red-400)'
                                }}>
                                  {isAvailable ? 'Available' : isPending ? 'Pending' : 'Declined'}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                Blood type: {match.blood_type}
                              </div>

                              {/* Show contact only if available */}
                              {isAvailable && (
                                <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                  {match.phone && (
                                    <a
                                      href={`tel:${match.phone}`}
                                      id={`contact-donor-phone-${match.id}`}
                                      style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600, textDecoration: 'none' }}
                                    >
                                      <Phone size={13} /> {match.phone}
                                    </a>
                                  )}
                                  {match.email && (
                                    <a
                                      href={`mailto:${match.email}`}
                                      id={`contact-donor-email-${match.id}`}
                                      style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600, textDecoration: 'none' }}
                                    >
                                      <Mail size={13} /> {match.email}
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Record outcome */}
                            {isAvailable && match.outcome === 'pending' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>Record Outcome</div>
                                <button
                                  className="btn btn-sm"
                                  id={`outcome-donated-${match.id}`}
                                  onClick={() => handleOutcome(match.id, 'donated')}
                                  style={{ background: 'rgba(22,163,74,0.1)', color: 'var(--color-success)', border: '1px solid rgba(22,163,74,0.2)', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
                                >
                                  <CheckCircle size={12} /> Donated
                                </button>
                                <button
                                  className="btn btn-sm"
                                  id={`outcome-noshow-${match.id}`}
                                  onClick={() => handleOutcome(match.id, 'no_show')}
                                  style={{ background: 'rgba(220,38,38,0.06)', color: 'var(--red-500)', border: '1px solid rgba(220,38,38,0.15)', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
                                >
                                  <XCircle size={12} /> No-Show
                                </button>
                              </div>
                            )}
                            {isAvailable && match.outcome && match.outcome !== 'pending' && (
                              <span style={{
                                padding: '4px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                                background: match.outcome === 'donated' ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.08)',
                                color: match.outcome === 'donated' ? 'var(--color-success)' : 'var(--red-500)'
                              }}>
                                {match.outcome === 'donated' ? '✓ Donated' : match.outcome === 'no_show' ? '✗ No-Show' : match.outcome}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
