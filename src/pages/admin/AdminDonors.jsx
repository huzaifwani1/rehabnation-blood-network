import React, { useState } from 'react';
import { Search, Flag, Shield, Eye, Users, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BloodBadge, StatusBadge, EmptyState } from '../../components/ui/Badges';
import Modal from '../../components/ui/Modal';

export default function AdminDonors() {
  const { users, verifyDonor, flagDonor } = useAuth();
  const [search, setSearch] = useState('');
  const [filterBlood, setFilterBlood] = useState('');
  const [filterAvail, setFilterAvail] = useState('');
  const [filterVerify, setFilterVerify] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [minWeight, setMinWeight] = useState('');
  const [minHb, setMinHb] = useState('');
  
  const donors = users.filter(u => u.role === 'donor');
  
  const [selectedDonor, setSelectedDonor] = useState(null);

  const filtered = donors.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.city.toLowerCase().includes(search.toLowerCase());
    const matchesBlood = filterBlood ? d.blood_type === filterBlood : true;
    const matchesAvail = filterAvail === 'available' ? d.is_available : filterAvail === 'unavailable' ? !d.is_available : true;
    const matchesVerify = filterVerify ? d.verification_status === filterVerify : true;
    const matchesDistrict = filterDistrict && d.district ? d.district.toLowerCase().includes(filterDistrict.toLowerCase()) : true;
    const matchesWeight = minWeight && d.weight_kg ? parseFloat(d.weight_kg) >= parseFloat(minWeight) : true;
    const matchesHb = minHb && d.hemoglobin_level ? parseFloat(d.hemoglobin_level) >= parseFloat(minHb) : true;
    
    return matchesSearch && matchesBlood && matchesAvail && matchesVerify && matchesDistrict && matchesWeight && matchesHb;
  });

  const toggleFlag = (id) => {
    const d = donors.find(x => x.id === id);
    if (d) {
      flagDonor(id, !d.is_flagged);
    }
  };

  const toggleVerify = (id) => {
    const d = donors.find(x => x.id === id);
    if (d) {
      const newStatus = d.verification_status === 'camp_verified' ? 'unverified' : 'camp_verified';
      verifyDonor(id, newStatus);
      if (selectedDonor && selectedDonor.id === id) {
        setSelectedDonor({ ...selectedDonor, verification_status: newStatus });
      }
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Donor Search & Management</h1>
          <p>{donors.length} registered donors database</p>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Search Name/City</label>
            <div className="search-bar" style={{ width: '100%' }}>
              <Search size={15} color="var(--text-muted)" />
              <input
                id="donor-search"
                placeholder="Search name or city…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Blood Group</label>
            <select id="filter-blood-type" className="form-select" value={filterBlood} onChange={e => setFilterBlood(e.target.value)}>
              <option value="">All Blood Types</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => <option key={bt} value={bt}>{bt}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem' }}>District</label>
            <input
              id="filter-district"
              type="text"
              className="form-input"
              placeholder="e.g. Mainland"
              value={filterDistrict}
              onChange={e => setFilterDistrict(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Availability</label>
            <select id="filter-availability" className="form-select" value={filterAvail} onChange={e => setFilterAvail(e.target.value)}>
              <option value="">All Availability</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Verification Status</label>
            <select id="filter-verification" className="form-select" value={filterVerify} onChange={e => setFilterVerify(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="camp_verified">Camp Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Min Weight (kg)</label>
            <input
              id="filter-weight"
              type="number"
              className="form-input"
              placeholder="e.g. 50"
              value={minWeight}
              onChange={e => setMinWeight(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Min Hemoglobin (g/dL)</label>
            <input
              id="filter-hb"
              type="number"
              step="0.1"
              className="form-input"
              placeholder="e.g. 12.5"
              value={minHb}
              onChange={e => setMinHb(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--zinc-500)', fontWeight: 600 }}>
            Showing {filtered.length} matching donors
          </div>
          {(search || filterBlood || filterAvail || filterVerify || filterDistrict || minWeight || minHb) && (
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setSearch('');
                setFilterBlood('');
                setFilterAvail('');
                setFilterVerify('');
                setFilterDistrict('');
                setMinWeight('');
                setMinHb('');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Donor</th>
              <th>Blood Type</th>
              <th>District / City</th>
              <th>Health Stats</th>
              <th>Availability</th>
              <th>Verification</th>
              <th>Flags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(donor => (
              <tr key={donor.id} id={`donor-row-${donor.id}`}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="sidebar-avatar" style={{ width: 34, height: 34, fontSize: 12 }}>
                      {donor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{donor.name}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{donor.email}</div>
                    </div>
                  </div>
                </td>
                <td><BloodBadge type={donor.blood_type} /></td>
                <td>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{donor.district || 'Mainland'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{donor.city}</div>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Weight: <strong>{donor.weight_kg}kg</strong><br />
                    Hb: <strong>{donor.hemoglobin_level || '13.5'} g/dL</strong>
                  </div>
                </td>
                <td>
                  <StatusBadge status={donor.is_available ? 'available' : 'unavailable'} />
                </td>
                <td>
                  {donor.verification_status === 'camp_verified' ? (
                    <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Check size={10} /> Camp Verified
                    </span>
                  ) : (
                    <span className="badge badge-neutral">Unverified</span>
                  )}
                </td>
                <td>
                  {donor.is_flagged
                    ? <span className="badge badge-danger">⚑ Flagged</span>
                    : <span className="badge badge-neutral">Clear</span>
                  }
                </td>
                <td>
                  <div className="flex gap-2">
                    <button
                      id={`view-donor-${donor.id}`}
                      className="btn-icon"
                      title="View details"
                      onClick={() => setSelectedDonor(donor)}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      id={`flag-donor-${donor.id}`}
                      className="btn-icon"
                      title={donor.is_flagged ? 'Unflag' : 'Flag'}
                      onClick={() => toggleFlag(donor.id)}
                      style={{ color: donor.is_flagged ? 'var(--color-warning)' : undefined }}
                    >
                      <Flag size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <EmptyState
            icon={<Users size={28} color="var(--text-muted)" />}
            title="No donors found"
            description="Try adjusting your search filters."
          />
        )}
      </div>

      {/* Donor Detail Modal */}
      <Modal
        isOpen={!!selectedDonor}
        onClose={() => setSelectedDonor(null)}
        title="Donor Details"
        size="lg"
      >
        {selectedDonor && (
          <div>
            <div className="flex items-center gap-4" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="sidebar-avatar" style={{ width: 52, height: 52, fontSize: 18 }}>
                {selectedDonor.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 style={{ marginBottom: 4 }}>{selectedDonor.name}</h3>
                <div className="flex gap-2 flex-wrap">
                  <BloodBadge type={selectedDonor.blood_type} />
                  <StatusBadge status={selectedDonor.is_available ? 'available' : 'unavailable'} />
                  {selectedDonor.verification_status === 'camp_verified' && (
                    <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Check size={10} /> Camp Verified
                    </span>
                  )}
                  {selectedDonor.is_flagged && <span className="badge badge-danger">Flagged</span>}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              {[
                { label: 'Phone', value: selectedDonor.phone || 'None' },
                { label: 'Email', value: selectedDonor.email },
                { label: 'District', value: selectedDonor.district || 'Lagos Mainland' },
                { label: 'City & Region', value: `${selectedDonor.city}, ${selectedDonor.region}` },
                { label: 'Weight', value: `${selectedDonor.weight_kg} kg` },
                { label: 'Hemoglobin Level', value: `${selectedDonor.hemoglobin_level || '13.5'} g/dL` },
                { label: 'Last Donation', value: selectedDonor.last_donation_date || 'Never' },
                { label: 'Total Donations', value: selectedDonor.donation_count },
                { label: 'Registered', value: new Date(selectedDonor.created_at).toLocaleDateString() },
              ].map(item => (
                <div key={item.label} className="form-group" style={{ gap: 4 }}>
                  <span className="form-label" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 500 }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                id={`modal-verify-${selectedDonor.id}`}
                className={`btn ${selectedDonor.verification_status === 'camp_verified' ? 'btn-secondary' : 'btn-success'} flex-1`}
                onClick={() => toggleVerify(selectedDonor.id)}
              >
                <Shield size={15} />
                {selectedDonor.verification_status === 'camp_verified' ? 'Revoke Verification' : 'Verify (Camp)'}
              </button>
              <button
                id={`modal-flag-${selectedDonor.id}`}
                className={`btn ${selectedDonor.is_flagged ? 'btn-secondary' : 'btn-danger'} flex-1`}
                onClick={() => { toggleFlag(selectedDonor.id); setSelectedDonor(null); }}
              >
                <Flag size={15} />
                {selectedDonor.is_flagged ? 'Remove Flag' : 'Flag Donor'}
              </button>
              <button className="btn btn-secondary flex-1" onClick={() => setSelectedDonor(null)}>Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
