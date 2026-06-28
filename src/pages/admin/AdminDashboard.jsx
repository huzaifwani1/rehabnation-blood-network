import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, ShieldAlert, ShieldCheck, ChevronRight, Search, Clock, AlertCircle, BarChart3, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { fetchStats, donors, users } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats().then(data => { if (data) setStats(data); setLoading(false); });
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}><div className="spinner" /></div>;
  }

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const maxBlood = Math.max(...bloodTypes.map(bt => stats?.bloodTypeCounts?.[bt] || 0), 1);

  const metrics = [
    { label: 'Total Hospitals', value: stats?.totalHospitals || 0, sub: `${stats?.approvedHospitals || 0} active`, icon: <Building2 size={20} color="#fff" />, bg: 'linear-gradient(135deg,#dc2626,#991b1b)', click: '/hospitals' },
    { label: 'Pending Approvals', value: stats?.pendingHospitals || 0, sub: 'Awaiting review', icon: <ShieldAlert size={20} color="#fff" />, bg: 'linear-gradient(135deg,#d97706,#b45309)', click: '/pending' },
    { label: 'Suspended', value: stats?.suspendedHospitals || 0, sub: 'Restricted access', icon: <AlertCircle size={20} color="#fff" />, bg: 'linear-gradient(135deg,#6b7280,#4b5563)', click: '/hospitals' },
    { label: 'National Donors', value: stats?.totalDonors || 0, sub: 'Across all hospitals', icon: <Users size={20} color="#fff" />, bg: 'linear-gradient(135deg,#16a34a,#15803d)', click: '/donors' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', padding: '0 var(--space-4)', maxWidth: 1100, margin: '0 auto' }}>

      {/* Pending alert banner */}
      {(stats?.pendingHospitals || 0) > 0 && (
        <div style={{ padding: '14px 20px', background: 'var(--color-warning-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(217,119,6,0.25)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <ShieldAlert size={18} color="var(--color-warning)" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--color-warning)' }}>{stats.pendingHospitals} hospital registration{stats.pendingHospitals !== 1 ? 's' : ''} pending approval</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: 8 }}>Verify registration details before granting platform access.</span>
          </div>
          <button className="btn btn-sm" onClick={() => navigate('/pending')} style={{ whiteSpace: 'nowrap', color: 'var(--color-warning)', border: '1px solid rgba(217,119,6,0.35)', background: 'transparent', display: 'flex', alignItems: 'center', gap: 6 }}>
            Review <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
        {metrics.map((m, i) => (
          <div key={i} className="card" onClick={() => navigate(m.click)} style={{ padding: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'transform 0.15s', ':hover': { transform: 'translateY(-2px)' } }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {m.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--zinc-900)', lineHeight: 1.1 }}>{m.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 20, alignItems: 'start' }}>

        {/* Blood Group Distribution */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={18} color="var(--red-600)" /> National Blood Distribution
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 20px' }}>Combined donor blood types across all registered hospitals</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bloodTypes.map(bt => {
              const count = stats?.bloodTypeCounts?.[bt] || 0;
              const pct = (count / maxBlood) * 100;
              return (
                <div key={bt} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 38, fontWeight: 800, color: 'var(--red-600)', fontSize: '0.88rem' }}>{bt}</span>
                  <div style={{ flex: 1, height: 10, background: 'var(--zinc-100)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--red-600)', borderRadius: 99, transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ width: 28, textAlign: 'right', fontWeight: 700, fontSize: '0.82rem', color: 'var(--zinc-600)' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ margin: '0 0 4px' }}>Platform Quick Actions</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 20px' }}>Jump directly to critical admin functions</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Manage Hospitals', sub: 'Approve, suspend, or remove organization accounts', icon: <Building2 size={18} color="var(--red-600)" />, to: '/hospitals' },
              { label: 'All Donors Database', sub: 'View & search national donor registry', icon: <Users size={18} color="var(--red-600)" />, to: '/donors' },
              { label: 'Emergency Blood Search', sub: 'Find compatible donors across all hospitals', icon: <Search size={18} color="var(--red-600)" />, to: '/emergency-search' },
              { label: 'National Analytics', sub: 'Platform-wide blood stock statistics', icon: <BarChart3 size={18} color="var(--red-600)" />, to: '/reports' },
              { label: 'Pending Approvals', sub: `${stats?.pendingHospitals || 0} hospitals waiting for review`, icon: <ShieldAlert size={18} color={stats?.pendingHospitals > 0 ? 'var(--color-warning)' : 'var(--red-600)'} />, to: '/pending' },
            ].map((action, i) => (
              <button key={i} className="btn btn-secondary w-full" onClick={() => navigate(action.to)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {action.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{action.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>{action.sub}</div>
                  </div>
                </div>
                <ChevronRight size={16} color="var(--zinc-400)" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
