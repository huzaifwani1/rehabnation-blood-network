import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Droplets, Zap, MapPin, Clock, Phone, LogIn,
  AlertTriangle, CheckCircle, Info, Filter, HeartHandshake,
  ArrowLeft, ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const URGENCY_CONFIG = {
  critical: { label: 'Critical', color: 'var(--red-600)', bg: 'var(--red-50)', border: 'rgba(220,38,38,0.2)', icon: <AlertTriangle size={13} /> },
  urgent:   { label: 'Urgent',   color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', border: 'rgba(217,119,6,0.2)', icon: <Zap size={13} /> },
  standard: { label: 'Standard', color: 'var(--color-info)',    bg: 'var(--color-info-bg)',    border: 'rgba(0,122,255,0.15)', icon: <Info size={13} /> },
};

function UrgencyBadge({ level }) {
  const cfg = URGENCY_CONFIG[level] || URGENCY_CONFIG.standard;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      fontSize: '0.72rem', fontWeight: 700,
      padding: '4px 10px', borderRadius: 99, letterSpacing: '0.02em'
    }}>
      {cfg.icon} {cfg.label}
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
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
      <Clock size={12} /> {label}
    </span>
  );
}

export default function EmergencyFeedPage() {
  const navigate = useNavigate();
  const { requests, user } = useAuth();
  const [filterUrgency, setFilterUrgency] = useState('');
  const [filterBlood, setFilterBlood] = useState('');

  const openRequests = (requests || []).filter(r => r.status === 'open');

  const filtered = openRequests.filter(r => {
    const matchUrgency = !filterUrgency || r.urgency === filterUrgency;
    const matchBlood = !filterBlood || r.blood_type === filterBlood;
    return matchUrgency && matchBlood;
  });

  const criticalCount = openRequests.filter(r => r.urgency === 'critical').length;

  const handleRespond = (req) => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Logged-in users go to dashboard to respond
    navigate('/dashboard');
  };

  return (
    <div className="landing" style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Navbar */}
      <nav className="landing-nav" style={{ justifyContent: 'space-between' }}>
        <div className="flex items-center gap-3" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="RehabNation Blood Network" style={{ height: 38, width: 'auto' }} />
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/find-blood')}>Find Blood</button>
          {user ? (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard')}>My Dashboard</button>
          ) : (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Sign In</button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Join Network</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        background: criticalCount > 0
          ? 'linear-gradient(135deg, #fff5f5 0%, #fff 60%)'
          : 'linear-gradient(135deg, #f0fdf4 0%, #fff 60%)',
        padding: 'var(--space-12) var(--space-10) var(--space-8)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }} className="animate-slideUp">
          {criticalCount > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--red-600)', color: '#fff',
              padding: '6px 16px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 700,
              marginBottom: 'var(--space-5)', animation: 'pulse 2s infinite'
            }}>
              <AlertTriangle size={14} /> {criticalCount} CRITICAL REQUEST{criticalCount !== 1 ? 'S' : ''} ACTIVE
            </div>
          )}
          <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, marginBottom: 'var(--space-3)', color: 'var(--zinc-900)' }}>
            Emergency Blood <span style={{ color: 'var(--red-600)' }}>Request Feed</span>
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto var(--space-6)' }}>
            Real-time open blood requests from the community. Register or sign in to respond as a donor.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--red-600)' }}>{openRequests.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Open Requests</div>
            </div>
            <div style={{ width: 1, background: 'var(--border-subtle)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-warning)' }}>{criticalCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Critical</div>
            </div>
            <div style={{ width: 1, background: 'var(--border-subtle)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-success)' }}>{openRequests.filter(r=>r.urgency==='standard').length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Standard</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--space-6) var(--space-6) 0' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-6)', alignItems: 'center' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-select"
            value={filterUrgency}
            onChange={e => setFilterUrgency(e.target.value)}
            style={{ width: 'auto', minWidth: 160 }}
            id="feed-filter-urgency"
          >
            <option value="">All Urgency Levels</option>
            <option value="critical">🔴 Critical</option>
            <option value="urgent">🟡 Urgent</option>
            <option value="standard">🔵 Standard</option>
          </select>
          <select
            className="form-select"
            value={filterBlood}
            onChange={e => setFilterBlood(e.target.value)}
            style={{ width: 'auto', minWidth: 160 }}
            id="feed-filter-blood"
          >
            <option value="">All Blood Groups</option>
            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => (
              <option key={bt} value={bt}>{bt}</option>
            ))}
          </select>
          {(filterUrgency || filterBlood) && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setFilterUrgency(''); setFilterBlood(''); }}
            >Clear Filters</button>
          )}
          <span style={{ marginLeft: 'auto', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--zinc-900)' }}>{filtered.length}</strong> request{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Not logged-in banner */}
        {!user && (
          <div style={{
            background: 'linear-gradient(135deg, var(--red-50) 0%, #fff5f5 100%)',
            border: '1px solid var(--red-100)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-5)',
            display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)', flexWrap: 'wrap'
          }}>
            <HeartHandshake size={28} color="var(--red-600)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 700, color: 'var(--zinc-900)', marginBottom: 4 }}>Want to Respond as a Donor?</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Sign in or register to respond to emergency requests and save lives.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>
                <LogIn size={14} /> Sign In
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>
                Join Network
              </button>
            </div>
          </div>
        )}

        {/* Feed */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: 'var(--space-16) 0',
            color: 'var(--text-muted)', background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-8)'
          }}>
            <CheckCircle size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
            <p style={{ fontSize: '1rem', fontWeight: 600 }}>No open requests found</p>
            <p style={{ fontSize: '0.875rem' }}>
              {filterUrgency || filterBlood ? 'Try different filters' : 'All current requests have been fulfilled!'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-12)' }}>
            {filtered.map(req => (
              <RequestCard
                key={req.id}
                req={req}
                onRespond={() => handleRespond(req)}
                isLoggedIn={!!user}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: 'var(--border-light)', background: 'var(--zinc-50)',
        padding: 'var(--space-6) var(--space-10)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)'
      }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--zinc-400)' }}>
          © 2026 RehabNation Blood Network
        </span>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
          <ArrowLeft size={13} /> Back to Home
        </button>
      </footer>
    </div>
  );
}

function RequestCard({ req, onRespond, isLoggedIn }) {
  const urgencyCfg = URGENCY_CONFIG[req.urgency] || URGENCY_CONFIG.standard;
  const unitsLeft = (req.units_needed || 0) - (req.units_fulfilled || 0);

  return (
    <div className="card" style={{
      padding: 'var(--space-5)',
      borderLeft: `4px solid ${urgencyCfg.color}`,
      transition: 'box-shadow 0.2s'
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        {/* Blood Type */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: urgencyCfg.bg, border: `2px solid ${urgencyCfg.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: '1.1rem', color: urgencyCfg.color, flexShrink: 0
        }}>
          {req.blood_type}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <UrgencyBadge level={req.urgency} />
            <TimeAgo dateStr={req.created_at} />
          </div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--zinc-900)', marginBottom: 4 }}>
            {req.patient_name || 'Patient'} — {req.blood_type} Blood Needed
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {req.hospital_name && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                🏥 {req.hospital_name}
              </span>
            )}
            {req.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={13} /> {req.location}
              </span>
            )}
          </div>
          {req.notes && (
            <div style={{
              marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)',
              background: 'var(--bg-elevated)', padding: '6px 10px',
              borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--border-base)'
            }}>
              {req.notes}
            </div>
          )}
        </div>

        {/* Units & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: urgencyCfg.color }}>{unitsLeft}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>units needed</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch', width: '100%', minWidth: 160 }}>
            {req.phone && (
              <a
                href={`tel:${req.phone}`}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}
                id={`call-requester-${req.id}`}
              >
                <Phone size={13} /> Call Requester
              </a>
            )}
            <button
              className="btn btn-primary btn-sm"
              onClick={onRespond}
              id={`respond-btn-${req.id}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              {isLoggedIn ? (
                <><ExternalLink size={13} /> Respond as Donor</>
              ) : (
                <><LogIn size={13} /> Sign In to Respond</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
