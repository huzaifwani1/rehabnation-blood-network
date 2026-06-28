import React, { useEffect, useState } from 'react';
import { BarChart3, Users, Building2, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BLOOD_TYPES } from '../../data/mockData';

export default function AdminReports() {
  const { fetchStats, donors, users } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats().then(data => { if (data) setStats(data); setLoading(false); });
  }, []);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}><div className="spinner" /></div>;

  // Compute district breakdown from donors
  const districtMap = {};
  donors.forEach(d => { if (d.district) districtMap[d.district] = (districtMap[d.district] || 0) + 1; });
  const districtList = Object.entries(districtMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const maxDistrict = districtList[0]?.[1] || 1;

  // Blood type max for chart
  const maxBlood = Math.max(...BLOOD_TYPES.map(bt => stats?.bloodTypeCounts?.[bt] || 0), 1);

  // Hospital donor breakdown
  const hospitals = users.filter(u => u.role === 'hospital');

  return (
    <div style={{ padding: '0 var(--space-4)', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h2 style={{ margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <BarChart3 size={22} color="var(--red-600)" /> National Analytics
        </h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Platform-wide statistics and blood stock analytics</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Hospitals', value: stats?.totalHospitals || 0, sub: `${stats?.approvedHospitals || 0} active`, icon: <Building2 size={18} color="#fff" />, bg: 'linear-gradient(135deg,#dc2626,#991b1b)' },
          { label: 'Total Donors', value: stats?.totalDonors || 0, sub: 'National registry', icon: <Users size={18} color="#fff" />, bg: 'linear-gradient(135deg,#16a34a,#15803d)' },
          { label: 'Pending Approvals', value: stats?.pendingHospitals || 0, sub: 'Awaiting review', icon: <TrendingUp size={18} color="#fff" />, bg: 'linear-gradient(135deg,#d97706,#b45309)' },
          { label: 'Suspended', value: stats?.suspendedHospitals || 0, sub: 'Restricted access', icon: <Award size={18} color="#fff" />, bg: 'linear-gradient(135deg,#6b7280,#4b5563)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--zinc-900)', lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Blood Group Chart */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ margin: '0 0 4px' }}>National Blood Group Distribution</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 20px' }}>Total donors per blood type across all hospitals</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {BLOOD_TYPES.map(bt => {
              const count = stats?.bloodTypeCounts?.[bt] || 0;
              const pct = (count / maxBlood) * 100;
              return (
                <div key={bt} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 38, fontWeight: 800, color: 'var(--red-600)', fontSize: '0.85rem' }}>{bt}</span>
                  <div style={{ flex: 1, height: 14, background: 'var(--zinc-100)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: `hsl(${360 - (BLOOD_TYPES.indexOf(bt) * 30)}, 80%, 45%)`, borderRadius: 99, transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ width: 30, textAlign: 'right', fontWeight: 700, fontSize: '0.82rem', color: 'var(--zinc-600)' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* District Chart */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ margin: '0 0 4px' }}>Top Districts by Donor Count</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 20px' }}>Districts with the highest registered donor populations</p>
          {districtList.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No data available yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {districtList.map(([dist, count]) => {
                const pct = (count / maxDistrict) * 100;
                return (
                  <div key={dist} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 90, fontSize: '0.8rem', fontWeight: 600, color: 'var(--zinc-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={dist}>{dist}</span>
                    <div style={{ flex: 1, height: 14, background: 'var(--zinc-100)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--red-600)', borderRadius: 99 }} />
                    </div>
                    <span style={{ width: 28, textAlign: 'right', fontWeight: 700, fontSize: '0.82rem', color: 'var(--zinc-600)' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Hospital Registry Table */}
      <div className="card" style={{ padding: 'var(--space-5)' }}>
        <h3 style={{ margin: '0 0 4px' }}>Hospital Registry</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 16px' }}>Breakdown of all registered hospital organizations</p>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                {['Hospital Name', 'District', 'State', 'Type', 'Status', 'Joined'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hospitals.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No hospitals registered yet.</td></tr>
              ) : hospitals.map(h => (
                <tr key={h.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>{h.name}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--zinc-600)', fontSize: '0.85rem' }}>{h.district}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--zinc-600)', fontSize: '0.85rem' }}>{h.state}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--zinc-600)', fontSize: '0.85rem' }}>{h.hospital_type || '—'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, background: h.status === 'approved' ? 'rgba(22,163,74,0.1)' : h.status === 'suspended' ? 'rgba(220,38,38,0.1)' : 'rgba(217,119,6,0.1)', color: h.status === 'approved' ? 'var(--green-700)' : h.status === 'suspended' ? 'var(--red-600)' : 'var(--amber-700)' }}>{h.status}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{h.created_at ? new Date(h.created_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
