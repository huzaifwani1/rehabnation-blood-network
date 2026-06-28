import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Phone, Edit, Trash2, Shield, Calendar, Users, Filter, CheckCircle2, Upload, User, ArrowRight, BarChart3, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BLOOD_TYPES, ALL_DISTRICTS } from '../../data/mockData';

export default function HospitalDashboard() {
  const { donors, fetchDonors, createDonor, updateDonor, deleteDonor, showToast, fetchStats } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodFilter, setBloodFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState(null);
  const [localStats, setLocalStats] = useState(null);

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

  useEffect(() => {
    const getStats = async () => {
      const s = await fetchStats();
      if (s) {
        setLocalStats(s);
      }
    };
    getStats();
  }, [donors]);

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

  // Cooldown calculation helper
  const isEligibleToDonate = (lastDonationDate) => {
    if (!lastDonationDate) return true;
    const diffTime = Math.abs(new Date() - new Date(lastDonationDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 56;
  };

  const eligibleCount = donors.filter(d => isEligibleToDonate(d.last_donation_date)).length;
  const cooldownCount = donors.length - eligibleCount;
  const totalDonatedTimes = donors.reduce((sum, d) => sum + (d.donation_count || 0), 0);

  // Recently added (last 4)
  const recentlyAdded = [...donors]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 4);

  return (
    <div style={{ padding: '0 var(--space-4)', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Welcome Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>Hospital Workspace</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Review statistics, look up donors, and record donations</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/import-donors')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Upload size={16} /> Bulk Import
          </button>
          <button className="btn btn-primary" onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={16} /> Add Donor
          </button>
        </div>
      </div>

      {/* Grid of stats summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Donors', value: donors.length, sub: 'Registered locally', icon: <Users size={18} />, color: 'var(--red-600)' },
          { label: 'Ready Donors', value: eligibleCount, sub: 'Passed cooldown', icon: <CheckCircle2 size={18} />, color: 'var(--color-success)' },
          { label: 'In Cooldown', value: cooldownCount, sub: 'Within 56 days', icon: <Clock size={18} />, color: 'var(--color-warning)' },
          { label: 'Total Donations', value: totalDonatedTimes, sub: 'All-time logged count', icon: <Calendar size={18} />, color: 'var(--color-info)' },
        ].map((s, idx) => (
          <div className="card" key={idx} style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: `${s.color}10`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--zinc-900)' }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Distribution charts & recently added row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: 20, alignItems: 'start' }}>
        
        {/* Blood Group Distribution */}
        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <h3 style={{ margin: '0 0 var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={18} color="var(--red-600)" /> Blood Group Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {BLOOD_TYPES.map(bt => {
              const count = localStats?.bloodTypeCounts?.[bt] || 0;
              const maxCount = Math.max(...BLOOD_TYPES.map(t => localStats?.bloodTypeCounts?.[t] || 0)) || 1;
              const percent = (count / maxCount) * 100;
              return (
                <div key={bt} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 35, fontWeight: 800, color: 'var(--zinc-700)' }}>{bt}</span>
                  <div style={{ flex: 1, height: 10, background: 'var(--zinc-100)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percent}%`, background: 'var(--red-600)', borderRadius: 99 }} />
                  </div>
                  <span style={{ width: 25, textAlign: 'right', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recently Added Donors */}
        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <h3 style={{ margin: '0 0 var(--space-4)' }}>Recently Added Donors</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentlyAdded.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', padding: '24px 0' }}>No donors added yet.</div>
            ) : (
              recentlyAdded.map(d => (
                <div key={d._id || d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--beige-50)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--zinc-900)' }}>{d.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.phone}</div>
                  </div>
                  <span style={{ background: 'var(--red-50)', color: 'var(--red-600)', padding: '2px 8px', borderRadius: 99, fontWeight: 800, fontSize: '0.78rem' }}>
                    {d.blood_type}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <h3 style={{ margin: '0 0 var(--space-4)' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="btn btn-secondary w-full" onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', justify: 'flex-start', gap: 10, padding: 12 }}>
              <Plus size={16} color="var(--red-600)" /> Add Donor Record
            </button>
            <button className="btn btn-secondary w-full" onClick={() => navigate('/import-donors')} style={{ display: 'flex', alignItems: 'center', justify: 'flex-start', gap: 10, padding: 12 }}>
              <Upload size={16} color="var(--red-600)" /> Bulk Import Donors
            </button>
            <button className="btn btn-secondary w-full" onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', justify: 'flex-start', gap: 10, padding: 12 }}>
              <User size={16} color="var(--red-600)" /> Edit Hospital Profile
            </button>
          </div>
        </div>
      </div>

      {/* Donor Directory Table */}
      <div className="card" style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ margin: 0 }}>Donor Directory</h3>
          {/* Internal filter parameters */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flex: 1, justify: 'flex-end' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 240 }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--zinc-400)' }} />
              <input
                type="text"
                placeholder="Search by name..."
                className="form-input"
                style={{ paddingLeft: 32 }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="form-input" style={{ width: 130 }} value={bloodFilter} onChange={e => setBloodFilter(e.target.value)}>
              <option value="">Blood Group</option>
              {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
            </select>
            <select className="form-input" style={{ width: 130 }} value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}>
              <option value="">District</option>
              {ALL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <th style={{ textAlign: 'left', padding: '12px 12px' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px 12px' }}>Blood Group</th>
                <th style={{ textAlign: 'left', padding: '12px 12px' }}>Location</th>
                <th style={{ textAlign: 'left', padding: '12px 12px' }}>Phone</th>
                <th style={{ textAlign: 'left', padding: '12px 12px' }}>Last Donated</th>
                <th style={{ textAlign: 'left', padding: '12px 12px' }}>Verification Status</th>
                <th style={{ textAlign: 'right', padding: '12px 12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {donors.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px var(--space-4)', color: 'var(--text-muted)' }}>
                    No donor records found. Add or import to begin.
                  </td>
                </tr>
              ) : (
                donors.map(donor => (
                  <tr key={donor._id || donor.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 12px', fontWeight: 600, color: 'var(--zinc-900)' }}>
                      <div>{donor.full_name}</div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                        {donor.gender}, {donor.dob ? (new Date().getFullYear() - new Date(donor.dob).getFullYear()) : 'N/A'} yrs
                      </div>
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <span style={{ background: 'var(--red-50)', color: 'var(--red-600)', padding: '3px 8px', borderRadius: 99, fontWeight: 800, fontSize: '0.78rem' }}>
                        {donor.blood_type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--zinc-600)' }}>{donor.district}</td>
                    <td style={{ padding: '12px 12px', color: 'var(--zinc-600)' }}>{donor.phone}</td>
                    <td style={{ padding: '12px 12px', color: 'var(--zinc-600)' }}>{donor.last_donation_date || 'Never'}</td>
                    <td style={{ padding: '12px 12px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: donor.verification_status === 'camp_verified' ? 'rgba(22, 163, 74, 0.1)' : 'var(--zinc-100)',
                        color: donor.verification_status === 'camp_verified' ? 'var(--green-700)' : 'var(--zinc-500)',
                        borderRadius: 99, fontSize: '0.72rem', padding: '2px 8px', fontWeight: 700
                      }}>
                        {donor.verification_status === 'camp_verified' ? <CheckCircle2 size={10} /> : null}
                        {donor.verification_status === 'camp_verified' ? 'Camp Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <a href={`tel:${donor.phone}`} className="btn btn-sm btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', padding: 5 }} title="Call Donor">
                          <Phone size={12} color="var(--green-600)" />
                        </a>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleOpenEdit(donor)} style={{ display: 'inline-flex', alignItems: 'center', padding: 5 }} title="Edit">
                          <Edit size={12} />
                        </button>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleDelete(donor._id || donor.id)} style={{ display: 'inline-flex', alignItems: 'center', padding: 5 }} title="Delete">
                          <Trash2 size={12} color="var(--red-600)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card animate-slideUp" style={{ width: '90%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', padding: 'var(--space-5)' }}>
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
