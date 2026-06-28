import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Phone, Edit, Trash2, Shield, Calendar, Users, Filter, CheckCircle2 } from 'lucide-react';
import { BLOOD_TYPES, ALL_DISTRICTS } from '../../data/mockData';

export default function HospitalDashboard() {
  const { donors, fetchDonors, createDonor, updateDonor, deleteDonor, showToast } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodFilter, setBloodFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState(null);

  const [form, setForm] = useState({
    full_name: '', dob: '', gender: 'male', phone: '', email: '',
    blood_type: '', district: '', address: '', weight_kg: '',
    hemoglobin_level: '', last_donation_date: '', donation_count: '0'
  });

  useEffect(() => {
    fetchDonors({
      search: searchTerm,
      blood_type: bloodFilter,
      district: districtFilter
    });
  }, [searchTerm, bloodFilter, districtFilter]);

  const handleOpenAdd = () => {
    setEditingDonor(null);
    setForm({
      full_name: '', dob: '', gender: 'male', phone: '', email: '',
      blood_type: '', district: '', address: '', weight_kg: '',
      hemoglobin_level: '', last_donation_date: '', donation_count: '0'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (donor) => {
    setEditingDonor(donor);
    setForm({
      full_name: donor.full_name,
      dob: donor.dob || '',
      gender: donor.gender || 'male',
      phone: donor.phone,
      email: donor.email || '',
      blood_type: donor.blood_type,
      district: donor.district,
      address: donor.address || '',
      weight_kg: donor.weight_kg || '',
      hemoglobin_level: donor.hemoglobin_level || '',
      last_donation_date: donor.last_donation_date || '',
      donation_count: String(donor.donation_count || 0)
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.phone || !form.blood_type || !form.district) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    const payload = {
      ...form,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : undefined,
      hemoglobin_level: form.hemoglobin_level ? Number(form.hemoglobin_level) : undefined,
      donation_count: Number(form.donation_count || 0)
    };

    let result;
    if (editingDonor) {
      result = await updateDonor(editingDonor._id || editingDonor.id, payload);
    } else {
      result = await createDonor(payload);
    }

    if (result.success) {
      showToast(editingDonor ? 'Donor updated successfully!' : 'Donor added successfully!', 'success');
      setIsModalOpen(false);
    } else {
      showToast(result.error || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this donor record? This action is permanent.')) {
      const result = await deleteDonor(id);
      if (result.success) {
        showToast('Donor record deleted successfully', 'success');
      } else {
        showToast(result.error || 'Failed to delete donor', 'error');
      }
    }
  };

  return (
    <div style={{ padding: '0 var(--space-4)', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>Hospital Donor Directory</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage and contact your local blood donors</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Add Donor Record
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 'var(--space-6)' }}>
        <div className="card" style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justify: 'center', color: 'var(--red-600)' }}>
            <Users size={22} style={{ margin: 'auto' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL MANAGED DONORS</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--zinc-900)' }}>{donors.length}</div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--zinc-400)' }} />
            <input
              type="text"
              placeholder="Search donors by name..."
              className="form-input"
              style={{ paddingLeft: 38 }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select className="form-input" value={bloodFilter} onChange={e => setBloodFilter(e.target.value)}>
              <option value="">All Blood Types</option>
              {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
            </select>
          </div>
          <div>
            <select className="form-input" value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}>
              <option value="">All Districts</option>
              {ALL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Donor Table */}
      <div className="card" style={{ overflowX: 'auto', marginBottom: 'var(--space-6)' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Blood Group</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Location</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Phone</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Last Donated</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Verification Status</th>
              <th style={{ textAlign: 'right', padding: '12px 16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {donors.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px var(--space-4)', color: 'var(--text-muted)' }}>
                  No donor records found. Add a donor or import from CSV to begin.
                </td>
              </tr>
            ) : (
              donors.map(donor => (
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
                  <td style={{ padding: '16px 16px', color: 'var(--zinc-600)' }}>{donor.district}</td>
                  <td style={{ padding: '16px 16px', color: 'var(--zinc-600)' }}>{donor.phone}</td>
                  <td style={{ padding: '16px 16px', color: 'var(--zinc-600)' }}>{donor.last_donation_date || 'Never'}</td>
                  <td style={{ padding: '16px 16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: donor.verification_status === 'camp_verified' ? 'rgba(22, 163, 74, 0.1)' : 'var(--zinc-100)',
                      color: donor.verification_status === 'camp_verified' ? 'var(--green-700)' : 'var(--zinc-500)',
                      borderRadius: 99, fontSize: '0.78rem', padding: '3px 10px', fontWeight: 700
                    }}>
                      {donor.verification_status === 'camp_verified' ? <CheckCircle2 size={12} /> : null}
                      {donor.verification_status === 'camp_verified' ? 'Camp Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <a href={`tel:${donor.phone}`} className="btn btn-sm btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', padding: 6 }} title="Call Donor">
                        <Phone size={14} color="var(--green-600)" />
                      </a>
                      <button className="btn btn-sm btn-secondary" onClick={() => handleOpenEdit(donor)} style={{ display: 'inline-flex', alignItems: 'center', padding: 6 }} title="Edit">
                        <Edit size={14} />
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={() => handleDelete(donor._id || donor.id)} style={{ display: 'inline-flex', alignItems: 'center', padding: 6 }} title="Delete">
                        <Trash2 size={14} color="var(--red-600)" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card animate-slideUp" style={{ width: '90%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', padding: 'var(--space-6)' }}>
            <h3 style={{ margin: '0 0 var(--space-4)' }}>{editingDonor ? 'Edit Donor Record' : 'Add New Donor Record'}</h3>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.full_name}
                    onChange={e => setForm({ ...form, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">Blood Type *</label>
                  <select className="form-input" value={form.blood_type} onChange={e => setForm({ ...form, blood_type: e.target.value })} required>
                    <option value="">Select Blood Group</option>
                    {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.dob}
                    onChange={e => setForm({ ...form, dob: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">District *</label>
                  <select className="form-input" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} required>
                    <option value="">Select District</option>
                    {ALL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Address</label>
                <textarea
                  className="form-input"
                  rows="2"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={form.weight_kg}
                    onChange={e => setForm({ ...form, weight_kg: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hemoglobin Level (g/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={form.hemoglobin_level}
                    onChange={e => setForm({ ...form, hemoglobin_level: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Donations</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.donation_count}
                    onChange={e => setForm({ ...form, donation_count: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justify: 'flex-end', gap: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
