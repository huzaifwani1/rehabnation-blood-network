import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Phone, ShieldCheck, Clock, MapPin, Eye, X, Filter, Building } from 'lucide-react';
import { BLOOD_TYPES, ALL_DISTRICTS } from '../../data/mockData';

export default function AdminEmergencySearch() {
  const { donors, fetchDonors } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodFilter, setBloodFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [selectedDonor, setSelectedDonor] = useState(null);

  useEffect(() => {
    fetchDonors();
  }, []);

  const isEligibleToDonate = (lastDonationDate) => {
    if (!lastDonationDate) return true;
    const diffTime = Math.abs(new Date() - new Date(lastDonationDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 56;
  };

  // Perform national database filtering on the frontend
  const filteredDonors = donors.filter(d => {
    const matchesSearch = !searchTerm || 
      d.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      d.phone.includes(searchTerm) ||
      d.hospital?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesBlood = !bloodFilter || d.blood_type === bloodFilter;
    const matchesDistrict = !districtFilter || d.district === districtFilter;
    
    let matchesAvailability = true;
    if (availabilityFilter === 'active') {
      matchesAvailability = d.is_available !== false;
    } else if (availabilityFilter === 'inactive') {
      matchesAvailability = d.is_available === false;
    }

    return matchesSearch && matchesBlood && matchesDistrict && matchesAvailability;
  });

  return (
    <div style={{ padding: '0 var(--space-4)', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h2 style={{ margin: '0 0 4px' }}>National Emergency Donor Lookup</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Search across all registered hospital databases for compatible donors</p>
      </div>

      {/* Filters Card */}
      <div className="card" style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--zinc-400)' }} />
            <input
              type="text"
              placeholder="Search by donor name, phone, hospital..."
              className="form-input"
              style={{ paddingLeft: 32 }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select className="form-input" value={bloodFilter} onChange={e => setBloodFilter(e.target.value)}>
              <option value="">Blood Type</option>
              {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
            </select>
          </div>
          <div>
            <select className="form-input" value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}>
              <option value="">District</option>
              {ALL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <select className="form-input" value={availabilityFilter} onChange={e => setAvailabilityFilter(e.target.value)}>
              <option value="all">Availability (All)</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Donor</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Blood Group</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Managing Hospital</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Phone</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Last Donation</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Availability</th>
              <th style={{ textAlign: 'right', padding: '12px 16px' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredDonors.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px var(--space-4)', color: 'var(--text-muted)' }}>
                  No compatible donors found matching the query.
                </td>
              </tr>
            ) : (
              filteredDonors.map(donor => (
                <tr key={donor._id || donor.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px 16px', fontWeight: 600, color: 'var(--zinc-900)' }}>
                    <div>{donor.full_name}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>{donor.gender}, {donor.dob ? (new Date().getFullYear() - new Date(donor.dob).getFullYear()) : 'N/A'} yrs</div>
                  </td>
                  <td style={{ padding: '16px 16px' }}>
                    <span style={{ background: 'var(--red-50)', color: 'var(--red-600)', padding: '4px 10px', borderRadius: 99, fontWeight: 800, fontSize: '0.85rem' }}>
                      {donor.blood_type}
                    </span>
                  </td>
                  <td style={{ padding: '16px 16px', fontWeight: 600, color: 'var(--zinc-700)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Building size={14} color="var(--red-600)" />
                      {donor.hospital?.name || 'Unknown Hospital'}
                    </div>
                  </td>
                  <td style={{ padding: '16px 16px', color: 'var(--zinc-600)' }}>{donor.phone}</td>
                  <td style={{ padding: '16px 16px', color: 'var(--zinc-600)' }}>
                    {donor.last_donation_date ? (
                      <span style={{ color: isEligibleToDonate(donor.last_donation_date) ? 'var(--green-700)' : 'var(--amber-700)', fontWeight: 600 }}>
                        {donor.last_donation_date}
                      </span>
                    ) : 'Never'}
                  </td>
                  <td style={{ padding: '16px 16px' }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
                      background: donor.is_available !== false ? 'rgba(22, 163, 74, 0.1)' : 'var(--zinc-100)',
                      color: donor.is_available !== false ? 'var(--green-700)' : 'var(--zinc-500)'
                    }}>
                      {donor.is_available !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 16px', textAlign: 'right' }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => setSelectedDonor(donor)} style={{ display: 'inline-flex', alignItems: 'center', padding: 6 }}>
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {selectedDonor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card animate-slideUp" style={{ width: '90%', maxWidth: 500, padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
              <h3 style={{ margin: 0 }}>National Donor Record</h3>
              <button onClick={() => setSelectedDonor(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Full Name', value: selectedDonor.full_name },
                { label: 'Blood Group', value: selectedDonor.blood_type },
                { label: 'District', value: selectedDonor.district },
                { label: 'Managing Hospital', value: selectedDonor.hospital?.name || 'Unknown' },
                { label: 'Hospital Phone', value: selectedDonor.hospital?.phone || 'Unknown' },
                { label: 'Donor Phone', value: selectedDonor.phone },
                { label: 'Donor Email', value: selectedDonor.email || 'None' },
                { label: 'Last Donation Date', value: selectedDonor.last_donation_date || 'Never' },
                { label: 'Total Donations', value: selectedDonor.donation_count || 0 },
                { label: 'Availability', value: selectedDonor.is_available !== false ? 'Active' : 'Inactive' }
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: 'var(--zinc-900)', fontSize: '0.85rem' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
