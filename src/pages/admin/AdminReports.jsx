import React, { useState, useEffect } from 'react';
import { BarChart3, Building2, Users, MapPin, Layers, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function StatBar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.85rem' }}>
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
  const { fetchStats, donors, users } = useAuth();
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

  // 1. Blood type stats
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const maxBloodCount = Math.max(...bloodTypes.map(bt => stats?.bloodTypeCounts?.[bt] || 0), 1);

  // 2. District-wise donor distribution (computed from donors array)
  const districtCounts = {};
  donors.forEach(d => {
    if (d.district) {
      districtCounts[d.district] = (districtCounts[d.district] || 0) + 1;
    }
  });
  const districtStats = Object.keys(districtCounts).map(name => ({
    name,
    count: districtCounts[name]
  })).sort((a, b) => b.count - a.count);
  const maxDistrictCount = Math.max(...districtStats.map(d => d.count), 1);

  // 3. Hospital donor statistics
  const hospitalCounts = {};
  donors.forEach(d => {
    const name = d.hospital?.name || 'Unknown Hospital';
    hospitalCounts[name] = (hospitalCounts[name] || 0) + 1;
  });
  const hospitalStats = Object.keys(hospitalCounts).map(name => ({
    name,
    count: hospitalCounts[name]
  })).sort((a, b) => b.count - a.count);
  const maxHospitalCount = Math.max(...hospitalStats.map(h => h.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', padding: '0 var(--space-4)', maxWidth: 1100, margin: '0 auto' }}>
      
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        {[
          { label: 'Total Hospitals', value: stats?.totalHospitals || 0, color: 'var(--red-600)', icon: <Building2 size={18} color="var(--red-600)" /> },
          { label: 'Active Hospitals', value: stats?.approvedHospitals || 0, color: 'var(--color-success)', icon: <ShieldCheck size={18} color="var(--color-success)" /> },
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

      {/* Two Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', alignItems: 'start' }}>
        
        {/* Blood Group Distribution */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ margin: '0 0 var(--space-5)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={18} color="var(--red-600)" /> Blood Group Stock Distribution
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

        {/* District-wise Distribution */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ margin: '0 0 var(--space-5)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={18} color="var(--red-600)" /> District Distribution
          </h3>
          {districtStats.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', padding: '24px 0' }}>No location data logged.</div>
          ) : (
            districtStats.map(d => (
              <StatBar 
                key={d.name} 
                label={d.name} 
                value={d.count} 
                max={maxDistrictCount} 
                color="var(--color-info)" 
              />
            ))
          )}
        </div>
      </div>

      {/* Hospital Distribution Stats */}
      <div className="card" style={{ padding: 'var(--space-5)' }}>
        <h3 style={{ margin: '0 0 var(--space-5)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Building2 size={18} color="var(--red-600)" /> Hospital Donor Registry Sizes
        </h3>
        {hospitalStats.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', padding: '24px 0' }}>No registered hospitals.</div>
        ) : (
          hospitalStats.map(h => (
            <StatBar 
              key={h.name} 
              label={h.name} 
              value={h.count} 
              max={maxHospitalCount} 
              color="var(--color-success)" 
            />
          ))
        )}
      </div>
    </div>
  );
}
