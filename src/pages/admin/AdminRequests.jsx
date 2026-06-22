import React, { useState } from 'react';
import {
  Droplets, Search, Filter, MapPin, Phone, Clock,
  CheckCircle, XCircle, Eye, ChevronDown, ChevronUp, Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const URGENCY_CONFIG = {
  critical: { label: 'Critical', color: 'var(--red-600)', bg: 'var(--red-50)', border: '2px solid rgba(220,38,38,0.25)' },
  urgent:   { label: 'Urgent',   color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', border: '2px solid rgba(217,119,6,0.2)' },
  standard: { label: 'Standard', color: 'var(--color-info)',    bg: 'var(--color-info-bg)',    border: '2px solid rgba(0,122,255,0.1)' },
};

function TimeAgo({ dateStr }) {
  if (!dateStr) return null;
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  let label;
  if (diff < 3600) label = `${Math.floor(diff / 60)}m ago`;
  else if (diff < 86400) label = `${Math.floor(diff / 3600)}h ago`;
  else label = new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}><Clock size={11} style={{ marginRight: 3 }} />{label}</span>;
}

export default function AdminRequests() {
  const { requests, matches, users, recordOutcome } = useAuth();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('open');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [filterBlood, setFilterBlood] = useState('');
  const [expanded, setExpanded] = useState(null);

  const filtered = requests.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      r.patient_name?.toLowerCase().includes(q) ||
      r.hospital_name?.toLowerCase().includes(q) ||
      r.location?.toLowerCase().includes(q) ||
      r.blood_type?.toLowerCase().includes(q);
    const matchStatus = !filterStatus || r.status === filterStatus;
    const matchUrgency = !filterUrgency || r.urgency === filterUrgency;
    const matchBlood = !filterBlood || r.blood_type === filterBlood;
    return matchSearch && matchStatus && matchUrgency && matchBlood;
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const getMatchesForRequest = (reqId) => matches.filter(m => m.request_id === reqId);
  const getRequester = (reqId) => {
    const req = requests.find(r => r.id === reqId);
    return req ? users.find(u => u.id === req.requester_id) : null;
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <h2 style={{ margin: '0 0 4px' }}>Blood Requests</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>
          {filtered.length} of {requests.length} request{requests.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', alignItems: 'end' }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            id="admin-req-search"
            className="form-input"
            placeholder="Search by patient, hospital, location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
        </div>
        <select className="form-select" style={{ width: 130 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="closed">Closed</option>
        </select>
        <select className="form-select" style={{ width: 130 }} value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)}>
          <option value="">All Urgency</option>
          <option value="critical">Critical</option>
          <option value="urgent">Urgent</option>
          <option value="standard">Standard</option>
        </select>
        <select className="form-select" style={{ width: 120 }} value={filterBlood} onChange={e => setFilterBlood(e.target.value)}>
          <option value="">All Blood</option>
          {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => <option key={bt} value={bt}>{bt}</option>)}
        </select>
      </div>

      {/* List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-12) 0', color: 'var(--text-muted)' }}>
            <Droplets size={36} style={{ opacity: 0.2, marginBottom: 8 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No requests found</p>
          </div>
        ) : (
          filtered.map((req, idx) => {
            const cfg = URGENCY_CONFIG[req.urgency] || URGENCY_CONFIG.standard;
            const reqMatches = getMatchesForRequest(req.id);
            const availableCount = reqMatches.filter(m => m.response === 'available').length;
            const isExpanded = expanded === req.id;
            const isLast = idx === filtered.length - 1;
            return (
              <div key={req.id} style={{ borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)' }}>
                <div
                  style={{
                    padding: 'var(--space-4) var(--space-5)',
                    display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)',
                    cursor: 'pointer', flexWrap: 'wrap', transition: 'background 0.15s'
                  }}
                  onClick={() => setExpanded(isExpanded ? null : req.id)}
                  onMouseEnter={e => !isExpanded && (e.currentTarget.style.background = 'var(--bg-elevated)')}
                  onMouseLeave={e => !isExpanded && (e.currentTarget.style.background = '#fff')}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: '0.95rem', color: cfg.color, flexShrink: 0
                  }}>
                    {req.blood_type}
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: 'var(--zinc-900)' }}>{req.patient_name}</span>
                      <span style={{ background: cfg.bg, color: cfg.color, fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 99 }}>{cfg.label}</span>
                      <span style={{ padding: '3px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
                        background: req.status === 'open' ? 'rgba(22,163,74,0.1)' : req.status === 'fulfilled' ? 'var(--color-info-bg)' : 'var(--zinc-100)',
                        color: req.status === 'open' ? 'var(--color-success)' : req.status === 'fulfilled' ? 'var(--color-info)' : 'var(--zinc-400)'
                      }}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
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
                      <div style={{ fontWeight: 800, color: 'var(--color-success)', fontSize: '1.1rem' }}>{availableCount}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>donors</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, color: cfg.color, fontSize: '1.1rem' }}>{req.units_fulfilled || 0}/{req.units_needed}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>units</div>
                    </div>
                    {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div style={{ padding: 'var(--space-5)', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                      {[
                        { label: 'Contact Phone', value: req.phone },
                        { label: 'Units Needed', value: `${req.units_needed} (${req.units_fulfilled || 0} fulfilled)` },
                        { label: 'Notes', value: req.notes || '—' },
                      ].map(item => (
                        <div key={item.label}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{item.label}</div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--zinc-900)' }}>{item.value || '—'}</div>
                        </div>
                      ))}
                    </div>

                    <h4 style={{ margin: '0 0 var(--space-3)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--zinc-700)' }}>
                      <Users size={15} /> Matched Donors ({reqMatches.length})
                    </h4>
                    {reqMatches.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No donors matched</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {reqMatches.map(m => (
                          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: '#fff', border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--zinc-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: 'var(--zinc-600)', flexShrink: 0 }}>
                              {(m.donor_name || 'U').charAt(0)}
                            </div>
                            <div style={{ flex: 1, minWidth: 120 }}>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{m.donor_name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.blood_type} · {m.phone}</div>
                            </div>
                            <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
                              background: m.response === 'available' ? 'rgba(22,163,74,0.1)' : m.response === 'pending' ? 'var(--zinc-100)' : 'rgba(220,38,38,0.08)',
                              color: m.response === 'available' ? 'var(--color-success)' : m.response === 'pending' ? 'var(--zinc-400)' : 'var(--red-500)'
                            }}>
                              {m.response}
                            </span>
                            {m.outcome && m.outcome !== 'pending' && (
                              <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
                                background: m.outcome === 'donated' ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.08)',
                                color: m.outcome === 'donated' ? 'var(--color-success)' : 'var(--red-500)'
                              }}>
                                {m.outcome}
                              </span>
                            )}
                            {m.response === 'available' && m.outcome === 'pending' && (
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  className="btn btn-sm"
                                  id={`admin-outcome-donated-${m.id}`}
                                  style={{ background: 'rgba(22,163,74,0.1)', color: 'var(--color-success)', border: '1px solid rgba(22,163,74,0.2)', padding: '4px 10px', fontSize: '0.72rem' }}
                                  onClick={() => recordOutcome(m.id, 'donated')}
                                >
                                  <CheckCircle size={11} /> Donated
                                </button>
                                <button
                                  className="btn btn-sm"
                                  id={`admin-outcome-noshow-${m.id}`}
                                  style={{ background: 'rgba(220,38,38,0.06)', color: 'var(--red-500)', border: '1px solid rgba(220,38,38,0.15)', padding: '4px 10px', fontSize: '0.72rem' }}
                                  onClick={() => recordOutcome(m.id, 'no_show')}
                                >
                                  <XCircle size={11} /> No-Show
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
