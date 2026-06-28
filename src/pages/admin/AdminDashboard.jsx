import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, ShieldAlert, FileText, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { fetchStats } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStats = async () => {
      const data = await fetchStats();
      if (data) {
        setStats(data);
      }
      setLoading(false);
    };
    getStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  const bloodGroupStats = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => ({
    type: bt,
    count: stats?.bloodTypeCounts?.[bt] || 0
  }));

  const metrics = [
    { label: 'Total Registered Hospitals', value: stats?.totalHospitals || 0, sub: `${stats?.approvedHospitals || 0} active`, icon: <Building2 size={20} color="#fff" />, bg: 'linear-gradient(135deg, var(--red-600) 0%, #c0392b 100%)' },
    { label: 'Pending Approvals', value: stats?.pendingHospitals || 0, sub: 'Needs review', icon: <ShieldAlert size={20} color="#fff" />, bg: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)' },
    { label: 'Total Registered Donors', value: stats?.totalDonors || 0, sub: 'Across all hospitals', icon: <Users size={20} color="#fff" />, bg: 'linear-gradient(135deg, #27ae60 0%, #1e8449 100%)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', padding: '0 var(--space-4)', maxWidth: 1100, margin: '0 auto' }}>
      
      {/* Alert Banner for pending approvals */}
      {(stats?.pendingHospitals || 0) > 0 && (
        <div style={{
          padding: 'var(--space-4)', background: 'var(--color-warning-bg)',
          borderRadius: 'var(--radius-lg)', border: '1px solid rgba(217,119,6,0.2)',
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <ShieldAlert size={18} color="var(--color-warning)" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--color-warning)' }}>{stats.pendingHospitals} hospital registration{stats.pendingHospitals !== 1 ? 's' : ''} pending approval</strong>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginLeft: 8 }}>Please verify hospital licenses as soon as possible.</span>
          </div>
          <button className="btn btn-sm" style={{ marginLeft: 'auto', color: 'var(--color-warning)', border: '1px solid rgba(217,119,6,0.3)', background: 'transparent', whiteSpace: 'nowrap' }} onClick={() => navigate('/hospitals')}>
            Review Registrations <ChevronRight size={12} />
          </button>
        </div>
      )}

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        {metrics.map((item, idx) => (
          <div className="card" key={idx} style={{ padding: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--zinc-900)', margin: '2px 0' }}>{item.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 'var(--space-5)', alignItems: 'start' }}>
        
        {/* National Blood Type Stock Stats */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ margin: '0 0 var(--space-4)' }}>National Donor Distribution</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 20 }}>Blood type distribution of donors registered by all hospitals</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bloodGroupStats.map((item, idx) => {
              const maxCount = Math.max(...bloodGroupStats.map(s => s.count)) || 1;
              const percent = (item.count / maxCount) * 100;
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 40, fontWeight: 800, color: 'var(--red-600)' }}>{item.type}</span>
                  <div style={{ flex: 1, height: 16, background: 'var(--zinc-100)', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ height: '100%', width: `${percent}%`, background: 'var(--red-600)', borderRadius: 99, transition: 'width 0.4s ease' }} />
                  </div>
                  <span style={{ width: 30, textAlign: 'right', fontWeight: 600, color: 'var(--zinc-700)', fontSize: '0.88rem' }}>{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Admin Quick Action panel */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ margin: '0 0 var(--space-4)' }}>Platform Quick Actions</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 24 }}>System administration shortcut dashboard</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <button className="btn btn-secondary w-full" onClick={() => navigate('/hospitals')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Building2 size={18} color="var(--red-600)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600 }}>Manage Hospitals</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Approve, suspend, or view hospital accounts</div>
                </div>
              </div>
              <ChevronRight size={16} />
            </button>

            <button className="btn btn-secondary w-full" onClick={() => navigate('/reports')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FileText size={18} color="var(--red-600)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600 }}>Reports & Statistics</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Generate platform-wide summaries</div>
                </div>
              </div>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
