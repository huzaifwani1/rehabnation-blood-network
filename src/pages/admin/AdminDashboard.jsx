import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Droplets, Activity, Heart, AlertTriangle,
  TrendingUp, Clock, CheckCircle, ChevronRight, ShieldCheck
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
  if (diff < 3600) label = `${Math.floor(diff / 60)}m ago`;
  else if (diff < 86400) label = `${Math.floor(diff / 3600)}h ago`;
  else label = new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}><Clock size={11} style={{ marginRight: 3 }} />{label}</span>;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { users, requests, matches } = useAuth();

  const regularUsers = users.filter(u => u.role === 'user');
  const openRequests = requests.filter(r => r.status === 'open');
  const criticalRequests = requests.filter(r => r.status === 'open' && r.urgency === 'critical');
  const verifiedUsers = regularUsers.filter(u => u.verification_status === 'camp_verified');
  const suspendedUsers = regularUsers.filter(u => u.status === 'suspended');
  const availableUsers = regularUsers.filter(u => u.is_available && u.status !== 'suspended');
  const donationsDone = matches.filter(m => m.outcome === 'donated').length;
  const fulfillmentRate = requests.length > 0
    ? Math.round((requests.filter(r => r.status === 'fulfilled').length / requests.length) * 100)
    : 0;

  // Blood group distribution
  const bloodGroupStats = ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => ({
    type: bt,
    count: regularUsers.filter(u => u.blood_type === bt).length,
    available: regularUsers.filter(u => u.blood_type === bt && u.is_available).length,
  }));

  const stats = [
    { label: 'Total Users', value: regularUsers.length, icon: <Users size={20} color="#fff" />, bg: 'linear-gradient(135deg, var(--red-600) 0%, #c0392b 100%)', sub: `${availableUsers.length} available` },
    { label: 'Open Requests', value: openRequests.length, icon: <Droplets size={20} color="#fff" />, bg: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)', sub: `${criticalRequests.length} critical` },
    { label: 'Verified Users', value: verifiedUsers.length, icon: <ShieldCheck size={20} color="#fff" />, bg: 'linear-gradient(135deg, #27ae60 0%, #1e8449 100%)', sub: `${Math.round(verifiedUsers.length / (regularUsers.length || 1) * 100)}% of users` },
    { label: 'Donations', value: donationsDone, icon: <Heart size={20} color="#fff" />, bg: 'linear-gradient(135deg, #2980b9 0%, #1a5276 100%)', sub: `${fulfillmentRate}% fulfillment rate` },
  ];

  const recentRequests = [...requests].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
  const recentUsers = [...regularUsers].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

      {/* Alerts */}
      {criticalRequests.length > 0 && (
        <div style={{
          padding: 'var(--space-4)', background: 'var(--red-50)',
          borderRadius: 'var(--radius-lg)', border: '1px solid rgba(220,38,38,0.2)',
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <AlertTriangle size={18} color="var(--red-600)" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--red-600)' }}>{criticalRequests.length} critical blood request{criticalRequests.length !== 1 ? 's' : ''}</strong>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginLeft: 8 }}>require immediate attention</span>
          </div>
          <button className="btn btn-sm" style={{ marginLeft: 'auto', color: 'var(--red-600)', border: '1px solid rgba(220,38,38,0.3)', background: 'transparent', whiteSpace: 'nowrap' }} onClick={() => navigate('/requests')}>
            View Requests <ChevronRight size={12} />
          </button>
        </div>
      )}

      {suspendedUsers.length > 0 && (
        <div style={{
          padding: 'var(--space-4)', background: 'var(--color-warning-bg)',
          borderRadius: 'var(--radius-lg)', border: '1px solid rgba(217,119,6,0.2)',
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <AlertTriangle size={18} color="var(--color-warning)" style={{ flexShrink: 0 }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <strong style={{ color: 'var(--color-warning)' }}>{suspendedUsers.length} suspended account{suspendedUsers.length !== 1 ? 's' : ''}</strong> in the system
          </span>
          <button className="btn btn-sm" style={{ marginLeft: 'auto', color: 'var(--color-warning)', border: '1px solid rgba(217,119,6,0.3)', background: 'transparent', whiteSpace: 'nowrap' }} onClick={() => navigate('/users')}>
            Manage Users <ChevronRight size={12} />
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ padding: 'var(--space-5)', background: s.bg, border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.icon}
              </div>
              <TrendingUp size={16} color="rgba(255,255,255,0.6)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Blood Group Grid */}
      <div className="card" style={{ padding: 'var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ margin: 0 }}>Blood Group Distribution</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/reports')}>Full Report <ChevronRight size={12} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12 }}>
          {bloodGroupStats.map(({ type, count, available }) => (
            <div key={type} style={{
              textAlign: 'center', padding: 'var(--space-3)',
              borderRadius: 'var(--radius-lg)', background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--red-600)' }}>{type}</div>
              <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--zinc-900)', margin: '4px 0' }}>{count}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: 700 }}>{available} avail</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        {/* Recent Requests */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Recent Requests</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/requests')}>View All <ChevronRight size={12} /></button>
          </div>
          {recentRequests.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-6) 0', fontSize: '0.875rem' }}>No requests yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {recentRequests.map(req => {
                const cfg = URGENCY_CONFIG[req.urgency] || URGENCY_CONFIG.standard;
                return (
                  <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: '0.8rem', color: cfg.color, flexShrink: 0
                    }}>{req.blood_type}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--zinc-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {req.patient_name} — {req.blood_type}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontSize: '0.72rem', color: cfg.color, fontWeight: 700 }}>{cfg.label}</span>
                        <TimeAgo dateStr={req.created_at} />
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700, padding: '2px 7px', borderRadius: 99,
                      background: req.status === 'open' ? 'rgba(22,163,74,0.1)' : 'var(--zinc-100)',
                      color: req.status === 'open' ? 'var(--color-success)' : 'var(--zinc-400)'
                    }}>
                      {req.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Recent Users</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/users')}>View All <ChevronRight size={12} /></button>
          </div>
          {recentUsers.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-6) 0', fontSize: '0.875rem' }}>No users yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {recentUsers.map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--red-50)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.8rem', color: 'var(--red-600)', flexShrink: 0
                  }}>{u.initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--zinc-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {u.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {u.blood_type || '—'} · {u.city || '—'}
                    </div>
                  </div>
                  {u.verification_status === 'camp_verified' && (
                    <ShieldCheck size={15} color="var(--color-success)" title="Verified" />
                  )}
                  {u.is_available && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)', title: 'Available' }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
