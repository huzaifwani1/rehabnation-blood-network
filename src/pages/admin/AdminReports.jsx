import React, { useState, useEffect } from 'react';
import { BarChart3, Building2, Users, Heart, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function StatBar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justify: 'space-between', marginBottom: 6, fontSize: '0.85rem' }}>
        <span style={{ fontWeight: 600, color: 'var(--zinc-700)' }}>{label}</span>
        <span style={{ fontWeight: 700, color }}>{value}</span>
      </div>
      <div style={{ height: 8, background: 'var(--zinc-100)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}

export default function AdminReports() {
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

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const maxBloodCount = Math.max(...bloodTypes.map(bt => stats?.bloodTypeCounts?.[bt] || 0), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', padding: '0 var(--space-4)', maxWidth: 1100, margin: '0 auto' }}>
      
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        {[
          { label: 'Total Hospitals', value: stats?.totalHospitals || 0, color: 'var(--red-600)', icon: <Building2 size={18} color="var(--red-600)" /> },
          { label: 'Active Hospitals', value: stats?.approvedHospitals || 0, color: 'var(--color-success)', icon: <ShieldCheck size={18} color="var(--color-success)" /> },
          { label: 'Pending Reviews', value: stats?.pendingHospitals || 0, color: 'var(--color-warning)', icon: <ShieldAlert size={18} color="var(--color-warning)" /> },
          { label: 'Suspended Hospitals', value: stats?.suspendedHospitals || 0, color: 'var(--zinc-500)', icon: <ShieldAlert size={18} color="var(--zinc-500)" /> },
          { label: 'Total Registered Donors', value: stats?.totalDonors || 0, color: 'var(--color-info)', icon: <Users size={18} color="var(--color-info)" /> }
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
        
        {/* Blood Group Distribution */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ margin: '0 0 var(--space-5)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={18} color="var(--red-600)" /> Blood Group Stock Distribution
          </h3>
          {bloodTypes.map(bt => (
            <StatBar 
              key={bt} 
              label={`${bt} Donors`} 
              value={stats?.bloodTypeCounts?.[bt] || 0} 
              max={maxBloodCount} 
              color="var(--red-600)" 
            />
          ))}
        </div>

        {/* Info panel */}
        <div className="card" style={{ padding: 'var(--space-5)', height: '100%' }}>
          <h3 style={{ margin: '0 0 var(--space-4)' }}>Platform Analytics Summary</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6' }}>
            This platform currently monitors blood donor registers managed internally by hospital networks. 
            All statistics are computed live based on directory entries inputted or imported by accredited medical staff.
          </p>
          <div style={{ marginTop: 24, padding: '16px', background: 'var(--beige-50)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ margin: '0 0 8px' }}>Security & Auditing Note</h4>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Individual contact details are fully encrypted and only visible to the hospital that registered the donor. 
              The platform administrators can view aggregated trends and manage organization approvals, but cannot perform direct donor updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
