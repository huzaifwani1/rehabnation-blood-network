import React, { useState } from 'react';
import { Search, Phone, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BLOOD_TYPES, ALL_DISTRICTS } from '../../data/mockData';

export default function AdminEmergencySearch() {
  const { donors } = useAuth();
  const [bloodGroup, setBloodGroup] = useState('');
  const [district, setDistrict] = useState('');
  const [availability, setAvailability] = useState('');
  const [donatedBefore, setDonatedBefore] = useState('');
  const [searched, setSearched] = useState(false);

  const isEligible = (date) => {
    if (!date) return true;
    return Math.ceil(Math.abs(new Date() - new Date(date)) / (1000 * 60 * 60 * 24)) >= 56;
  };

  const results = searched ? donors.filter(d => {
    const matchBlood = !bloodGroup || d.blood_type === bloodGroup;
    const matchDist  = !district || d.district === district;
    const matchAvail = availability === 'active' ? d.is_available !== false :
                       availability === 'ready' ? isEligible(d.last_donation_date) :
                       availability === 'inactive' ? d.is_available === false : true;
    const matchDate  = !donatedBefore || (d.last_donation_date && new Date(d.last_donation_date) < new Date(donatedBefore));
    return matchBlood && matchDist && matchAvail && matchDate;
  }) : [];

  const bloodCompatibility = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+'],
  };

  return (
    <div style={{ padding: '0 var(--space-4)', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h2 style={{ margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={22} color="var(--red-600)" /> National Emergency Blood Search
        </h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Search across all registered hospitals. Results are visible to Super Admins only.</p>
      </div>

      {/* Search Panel */}
      <div className="card" style={{ padding: 'var(--space-5)' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem' }}>Search Criteria</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Blood Group</label>
            <select className="form-input" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
              <option value="">Any Blood Group</option>
              {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">District</label>
            <select className="form-input" value={district} onChange={e => setDistrict(e.target.value)}>
              <option value="">Any District</option>
              {ALL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Availability</label>
            <select className="form-input" value={availability} onChange={e => setAvailability(e.target.value)}>
              <option value="">Any</option>
              <option value="active">Active Donors</option>
              <option value="ready">Ready to Donate (56+ days)</option>
              <option value="inactive">Inactive Donors</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Last Donated Before</label>
            <input type="date" className="form-input" value={donatedBefore} onChange={e => setDonatedBefore(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 10 }}>
          {bloodGroup && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <strong>{bloodGroup}</strong> can donate to: {bloodCompatibility[bloodGroup]?.join(', ') || 'Unknown'}
            </div>
          )}
          <button className="btn btn-primary" onClick={() => setSearched(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            <Search size={15} /> Search Donors
          </button>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>
              {results.length > 0 ? `${results.length} donor${results.length !== 1 ? 's' : ''} found` : 'No donors found'}
            </h3>
            <button className="btn btn-sm btn-secondary" onClick={() => { setSearched(false); setBloodGroup(''); setDistrict(''); setAvailability(''); setDonatedBefore(''); }}>
              Clear Results
            </button>
          </div>

          {results.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              No donors found matching your search criteria. Try adjusting your filters.
            </div>
          ) : (
            <div className="card" style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    {['Donor', 'Blood Group', 'Hospital', 'Phone', 'District', 'Last Donation', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 14px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map(d => {
                    const eligible = isEligible(d.last_donation_date);
                    const active = d.is_available !== false;
                    return (
                      <tr key={d._id || d.id} style={{ borderBottom: '1px solid var(--border-light)', background: active && eligible ? 'rgba(22,163,74,0.02)' : undefined }}>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--zinc-900)' }}>{d.full_name}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ background: 'var(--red-50)', color: 'var(--red-600)', padding: '3px 10px', borderRadius: 99, fontWeight: 800, fontSize: '0.8rem' }}>{d.blood_type}</span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{d.hospital?.name || 'Unknown'}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {String(d.hospital?._id || d.hospital).slice(-8)}</div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <a href={`tel:${d.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green-700)', fontWeight: 700, textDecoration: 'none', fontSize: '0.88rem' }}>
                            <Phone size={13} /> {d.phone}
                          </a>
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--zinc-600)', fontSize: '0.88rem' }}>{d.district}</td>
                        <td style={{ padding: '12px 14px', fontSize: '0.82rem', fontWeight: 600, color: eligible ? 'var(--green-700)' : 'var(--amber-700)' }}>
                          {d.last_donation_date || 'Never'}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          {active && eligible ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--green-700)', fontWeight: 700, fontSize: '0.75rem' }}>
                              <CheckCircle size={12} /> Available
                            </span>
                          ) : !active ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--zinc-500)', fontWeight: 700, fontSize: '0.75rem' }}>
                              <AlertCircle size={12} /> Inactive
                            </span>
                          ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--amber-700)', fontWeight: 700, fontSize: '0.75rem' }}>
                              <Clock size={12} /> In Cooldown
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
