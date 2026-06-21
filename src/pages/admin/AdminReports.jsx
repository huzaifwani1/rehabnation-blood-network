import React, { useState } from 'react';
import { BarChart3, Users, Heart, ClipboardList, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BloodBadge } from '../../components/ui/Badges';

export default function AdminReports() {
  const { users, requests, matches } = useAuth();
  const [activeTab, setActiveTab] = useState('blood-groups');

  const donors = users.filter(u => u.role === 'donor');

  // Compute Blood Group distribution
  const bloodGroupsCount = donors.reduce((acc, curr) => {
    acc[curr.blood_type] = (acc[curr.blood_type] || 0) + 1;
    return acc;
  }, {});

  const totalDonors = donors.length;

  // Compute District distribution
  const districtCount = donors.reduce((acc, curr) => {
    const d = curr.district || 'Mainland';
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  const districts = Object.keys(districtCount).map(name => ({
    name,
    count: districtCount[name],
    percentage: totalDonors > 0 ? Math.round((districtCount[name] / totalDonors) * 100) : 0
  })).sort((a,b) => b.count - a.count);

  // Compute Donation metrics
  const totalRequests = requests.length;
  const fulfilledRequests = requests.filter(r => r.status === 'fulfilled').length;
  const openRequests = requests.filter(r => r.status === 'open' || r.status === 'partially_fulfilled').length;
  
  const totalMatches = matches.length;
  const successfulDonations = matches.filter(m => m.outcome === 'donated').length;
  const noShows = matches.filter(m => m.outcome === 'no_show').length;
  const cancelledDonations = matches.filter(m => m.outcome === 'cancelled').length;

  const TABS = [
    { id: 'blood-groups', label: 'Blood Group Statistics', icon: Heart },
    { id: 'districts', label: 'District Distribution', icon: MapPin },
    { id: 'donations', label: 'Donation Reports', icon: ClipboardList }
  ];

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Reports & Analytics</h1>
          <p>Real-time platform insights and demographic reports</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2" style={{ marginBottom: 'var(--space-6)' }}>
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="card">
        {activeTab === 'blood-groups' && (
          <div>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>Blood Group Statistics</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 'var(--space-6)' }}>
              Demographic distribution of blood types among registered voluntary donors.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => {
                const count = bloodGroupsCount[type] || 0;
                const percentage = totalDonors > 0 ? Math.round((count / totalDonors) * 100) : 0;
                return (
                  <div key={type} className="card" style={{ padding: 'var(--space-5)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
                      <BloodBadge type={type} />
                      <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{count}</span>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                        <span>Share of total donors</span>
                        <span>{percentage}%</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--zinc-200)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'var(--red-600)', width: `${percentage}%`, borderRadius: 3 }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'districts' && (
          <div>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>District Statistics</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 'var(--space-6)' }}>
              Analysis of registered donors based on geographic districts.
            </p>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>District Name</th>
                    <th>Donor Count</th>
                    <th>Percentage Distribution</th>
                    <th>Visualization</th>
                  </tr>
                </thead>
                <tbody>
                  {districts.map(d => (
                    <tr key={d.name}>
                      <td style={{ fontWeight: 600 }}>{d.name}</td>
                      <td>{d.count}</td>
                      <td>{d.percentage}%</td>
                      <td style={{ width: '40%' }}>
                        <div style={{ height: 8, background: 'var(--zinc-100)', borderRadius: 4, overflow: 'hidden', width: '100%' }}>
                          <div style={{ height: '100%', background: 'var(--color-info)', width: `${d.percentage}%`, borderRadius: 4 }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {districts.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)' }}>
                        No district data logged.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'donations' && (
          <div>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>Donation Reports</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 'var(--space-6)' }}>
              Analysis of emergency blood request fulfillment and volunteer response outcomes.
            </p>

            <div className="grid-2" style={{ gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
              {/* Request metrics */}
              <div className="card" style={{ padding: 'var(--space-5)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ marginBottom: 'var(--space-4)' }}>Emergency Requests Overview</h4>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Total Requests Dispatched', value: totalRequests },
                    { label: 'Requests Fulfilled', value: fulfilledRequests, color: 'var(--success)' },
                    { label: 'Currently Active Requests', value: openRequests, color: 'var(--info)' },
                    { label: 'Fulfillment Rate', value: totalRequests > 0 ? `${Math.round((fulfilledRequests / totalRequests) * 100)}%` : '0%' }
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Match outcome metrics */}
              <div className="card" style={{ padding: 'var(--space-5)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ marginBottom: 'var(--space-4)' }}>Donor Outcome Analytics</h4>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Total Matches Generated', value: totalMatches },
                    { label: 'Successful Donations', value: successfulDonations, color: 'var(--success)' },
                    { label: 'Donor No-Shows', value: noShows, color: 'var(--urgency-critical)' },
                    { label: 'Donation Cancellations', value: cancelledDonations, color: 'var(--text-muted)' }
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
