import React from 'react';
import { BarChart3, TrendingUp, Droplets, Users, MapPin, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ALL_DISTRICTS } from '../../data/mockData';

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
  const { users, requests, matches } = useAuth();

  const regularUsers = users.filter(u => u.role === 'user');

  // Blood group distribution
  const bloodTypes = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
  const bloodDistrib = bloodTypes.map(bt => ({
    type: bt,
    total: regularUsers.filter(u => u.blood_type === bt).length,
    available: regularUsers.filter(u => u.blood_type === bt && u.is_available).length,
    verified: regularUsers.filter(u => u.blood_type === bt && u.verification_status === 'camp_verified').length,
  }));
  const maxBloodCount = Math.max(...bloodDistrib.map(b => b.total), 1);

  // District-wise distribution — uses canonical J&K district list
  const districtDistrib = ALL_DISTRICTS.map(name => ({
    name,
    count: regularUsers.filter(u => u.district === name).length,
  })).filter(d => d.count > 0).sort((a, b) => b.count - a.count);
  const maxDistCount = Math.max(...districtDistrib.map(d => d.count), 1);

  // Requests analytics
  const openReqs = requests.filter(r => r.status === 'open').length;
  const fulfilledReqs = requests.filter(r => r.status === 'fulfilled').length;
  const criticalReqs = requests.filter(r => r.urgency === 'critical').length;
  const urgentReqs = requests.filter(r => r.urgency === 'urgent').length;
  const standardReqs = requests.filter(r => r.urgency === 'standard').length;
  const fulfillmentRate = requests.length > 0 ? Math.round(fulfilledReqs / requests.length * 100) : 0;

  // Donation stats
  const donatedMatches = matches.filter(m => m.outcome === 'donated').length;
  const noShowMatches = matches.filter(m => m.outcome === 'no_show').length;
  const pendingMatches = matches.filter(m => m.outcome === 'pending' && m.response === 'available').length;
  const totalDonations = regularUsers.reduce((acc, u) => acc + (Number(u.donation_count) || 0), 0);

  // Verification & availability
  const verifiedCount = regularUsers.filter(u => u.verification_status === 'camp_verified').length;
  const suspendedCount = regularUsers.filter(u => u.status === 'suspended').length;
  const flaggedCount = regularUsers.filter(u => u.is_flagged).length;
  const availableCount = regularUsers.filter(u => u.is_available).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
        {[
          { label: 'Total Users', value: regularUsers.length, color: 'var(--red-600)', icon: <Users size={18} color="var(--red-600)" /> },
          { label: 'Available Now', value: availableCount, color: 'var(--color-success)', icon: <Heart size={18} color="var(--color-success)" /> },
          { label: 'Total Requests', value: requests.length, color: 'var(--color-info)', icon: <Droplets size={18} color="var(--color-info)" /> },
          { label: 'Fulfillment Rate', value: `${fulfillmentRate}%`, color: 'var(--color-warning)', icon: <TrendingUp size={18} color="var(--color-warning)" /> },
          { label: 'Total Donations', value: totalDonations, color: 'var(--red-600)', icon: <Droplets size={18} color="var(--red-600)" /> },
          { label: 'Verified Users', value: verifiedCount, color: 'var(--color-success)', icon: <Users size={18} color="var(--color-success)" /> },
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

      {/* Two column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>

        {/* Blood Group Distribution */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ margin: '0 0 var(--space-5)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Droplets size={18} color="var(--red-600)" /> Blood Group Distribution
          </h3>
          {bloodDistrib.map(({ type, total, available }) => (
            <StatBar key={type} label={`${type} (${available} available)`} value={total} max={maxBloodCount} color="var(--red-600)" />
          ))}
        </div>

        {/* District-wise Distribution */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ margin: '0 0 var(--space-5)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={18} color="var(--color-info)" /> District-wise Distribution (J&K)
          </h3>
          {districtDistrib.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-muted)' }}>
              <MapPin size={32} style={{ opacity: 0.15, marginBottom: 8 }} />
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>No district data yet</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>Donors will appear here once registered</p>
            </div>
          ) : (
            districtDistrib.map(({ name, count }) => (
              <StatBar key={name} label={name} value={count} max={maxDistCount} color="var(--color-info)" />
            ))
          )}
        </div>

        {/* Request Analytics */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ margin: '0 0 var(--space-5)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={18} color="var(--color-warning)" /> Request Analytics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 'var(--space-4)' }}>
            {[
              { label: 'Open', value: openReqs, color: 'var(--color-success)' },
              { label: 'Fulfilled', value: fulfilledReqs, color: 'var(--color-info)' },
              { label: 'Critical', value: criticalReqs, color: 'var(--red-600)' },
              { label: 'Urgent', value: urgentReqs, color: 'var(--color-warning)' },
              { label: 'Standard', value: standardReqs, color: 'var(--zinc-400)' },
              { label: 'Total', value: requests.length, color: 'var(--zinc-700)' },
            ].map(item => (
              <div key={item.label} style={{ textAlign: 'center', padding: 'var(--space-3)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{item.label}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 8, background: 'var(--zinc-100)', borderRadius: 99, overflow: 'hidden', display: 'flex' }}>
            {requests.length > 0 && (
              <>
                <div style={{ height: '100%', width: `${fulfilledReqs / requests.length * 100}%`, background: 'var(--color-info)', transition: 'width 0.5s' }} />
                <div style={{ height: '100%', width: `${openReqs / requests.length * 100}%`, background: 'var(--color-success)', transition: 'width 0.5s' }} />
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: 'var(--color-info)', marginRight: 4 }} />Fulfilled ({fulfillmentRate}%)</span>
            <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: 'var(--color-success)', marginRight: 4 }} />Open</span>
          </div>
        </div>

        {/* Donation & User Health */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ margin: '0 0 var(--space-5)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Heart size={18} color="var(--color-success)" /> Donation Outcomes
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 'var(--space-5)' }}>
            {[
              { label: 'Donated', value: donatedMatches, color: 'var(--color-success)' },
              { label: 'No-Show', value: noShowMatches, color: 'var(--red-500)' },
              { label: 'Pending', value: pendingMatches, color: 'var(--color-warning)' },
              { label: 'Total Responses', value: matches.filter(m => m.response !== 'pending').length, color: 'var(--color-info)' },
            ].map(item => (
              <div key={item.label} style={{ textAlign: 'center', padding: 'var(--space-3)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{item.label}</div>
              </div>
            ))}
          </div>
          <h4 style={{ margin: '0 0 var(--space-3)', fontSize: '0.875rem', color: 'var(--zinc-700)' }}>User Account Status</h4>
          {[
            { label: 'Verified', value: verifiedCount, max: regularUsers.length, color: 'var(--color-success)' },
            { label: 'Flagged', value: flaggedCount, max: regularUsers.length, color: 'var(--color-warning)' },
            { label: 'Suspended', value: suspendedCount, max: regularUsers.length, color: 'var(--red-600)' },
          ].map(item => (
            <StatBar key={item.label} label={item.label} value={item.value} max={item.max} color={item.color} />
          ))}
        </div>
      </div>

    </div>
  );
}
