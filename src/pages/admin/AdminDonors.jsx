import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Eye, Phone, Trash2, X, Building, Power, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BLOOD_TYPES, ALL_DISTRICTS } from '../../data/mockData';

export default function AdminDonors() {
  const { donors, fetchDonors, deleteDonorAsAdmin, updateDonorAsAdmin, showToast } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Parse optional hospital pre-filter from URL query param
  const params = new URLSearchParams(location.search);
  const preHospital = params.get('hospital') || '';
  const preHospitalName = params.get('name') || '';

  const [search, setSearch] = useState('');
  const [bloodFilter, setBloodFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [availFilter, setAvailFilter] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState(preHospital);
  const [viewDonor, setViewDonor] = useState(null);
  const [editDonor, setEditDonor] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => { fetchDonors(); }, []);

  const isEligible = (date) => {
    if (!date) return true;
    return Math.ceil(Math.abs(new Date() - new Date(date)) / (1000 * 60 * 60 * 24)) >= 56;
  };

  // Build unique hospital list from donors
  const allHospitals = [];
  const seenHospIds = new Set();
  donors.forEach(d => {
    const id = d.hospital?._id || d.hospital?.id || d.hospital;
    if (id && !seenHospIds.has(String(id))) {
      seenHospIds.add(String(id));
      allHospitals.push({ id: String(id), name: d.hospital?.name || 'Unknown Hospital' });
    }
  });

  const filtered = donors.filter(d => {
    const hid = String(d.hospital?._id || d.hospital?.id || d.hospital || '');
    const matchHosp   = !hospitalFilter || hid === hospitalFilter;
    const matchSearch = !search || d.full_name?.toLowerCase().includes(search.toLowerCase()) || d.phone?.includes(search);
    const matchBlood  = !bloodFilter || d.blood_type === bloodFilter;
    const matchDist   = !districtFilter || d.district === districtFilter;
    const matchAvail  = availFilter === 'active' ? d.is_available !== false :
                        availFilter === 'inactive' ? d.is_available === false :
                        availFilter === 'ready' ? isEligible(d.last_donation_date) :
                        availFilter === 'cooldown' ? !isEligible(d.last_donation_date) : true;
    return matchHosp && matchSearch && matchBlood && matchDist && matchAvail;
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this donor record?')) return;
    const res = await deleteDonorAsAdmin(id);
    showToast(res.success ? 'Donor deleted' : res.error || 'Failed', res.success ? 'success' : 'error');
  };

  const openEdit = (d) => {
    setEditDonor(d);
    setEditForm({ full_name: d.full_name, phone: d.phone, blood_type: d.blood_type, district: d.district, last_donation_date: d.last_donation_date || '', is_available: d.is_available !== false });
  };

  const handleEditSave = async () => {
    const res = await updateDonorAsAdmin(editDonor._id || editDonor.id, editForm);
    if (res.success) {
      showToast('Donor updated', 'success');
      setEditDonor(null);
      fetchDonors();
    } else showToast(res.error || 'Failed', 'error');
  };

  return (
    <div style={{ padding: '0 var(--space-4)', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>
            {preHospitalName ? `Donors — ${preHospitalName}` : 'National Donor Database'}
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            {filtered.length} of {donors.length} total donors{preHospitalName ? ` from ${preHospitalName}` : ' across all hospitals'}
          </p>
        </div>
        {preHospitalName && (
          <button className="btn btn-sm btn-secondary" onClick={() => navigate('/donors')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <X size={13} /> Clear hospital filter
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--zinc-400)' }} />
            <input type="text" placeholder="Search name or phone…" className="form-input" style={{ paddingLeft: 30 }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input" value={bloodFilter} onChange={e => setBloodFilter(e.target.value)}>
            <option value="">Blood Group</option>
            {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
          </select>
          <select className="form-input" value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}>
            <option value="">District</option>
            {ALL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="form-input" value={availFilter} onChange={e => setAvailFilter(e.target.value)}>
            <option value="">Availability</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="ready">Ready to Donate</option>
            <option value="cooldown">In Cooldown</option>
          </select>
          <select className="form-input" value={hospitalFilter} onChange={e => setHospitalFilter(e.target.value)}>
            <option value="">All Hospitals</option>
            {allHospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              {['Full Name', 'Blood Group', 'Hospital', 'District', 'Phone', 'Last Donation', 'Availability', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 14px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No donors found matching the filters.</td></tr>
            ) : filtered.map(d => (
              <tr key={d._id || d.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--zinc-900)' }}>
                  <div>{d.full_name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>{d.gender}, {d.dob ? new Date().getFullYear() - new Date(d.dob).getFullYear() : '—'} yrs</div>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ background: 'var(--red-50)', color: 'var(--red-600)', padding: '3px 8px', borderRadius: 99, fontWeight: 800, fontSize: '0.78rem' }}>{d.blood_type}</span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => navigate(`/hospitals/${d.hospital?._id || d.hospital}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', padding: '4px 10px' }}
                  >
                    <Building size={11} />
                    {d.hospital?.name || 'Unknown'}
                  </button>
                </td>
                <td style={{ padding: '12px 14px', color: 'var(--zinc-600)' }}>{d.district}</td>
                <td style={{ padding: '12px 14px', color: 'var(--zinc-600)' }}>{d.phone}</td>
                <td style={{ padding: '12px 14px', color: isEligible(d.last_donation_date) ? 'var(--green-700)' : 'var(--amber-700)', fontWeight: 600, fontSize: '0.82rem' }}>
                  {d.last_donation_date || 'Never'}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, background: d.is_available !== false ? 'rgba(22,163,74,0.1)' : 'var(--zinc-100)', color: d.is_available !== false ? 'var(--green-700)' : 'var(--zinc-500)' }}>
                    {d.is_available !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => setViewDonor(d)} style={{ padding: 5 }} title="View"><Eye size={12} /></button>
                    <a href={`tel:${d.phone}`} className="btn btn-sm btn-secondary" style={{ padding: 5, display: 'flex' }} title="Call"><Phone size={12} color="var(--green-600)" /></a>
                    <button className="btn btn-sm btn-secondary" onClick={() => openEdit(d)} style={{ padding: 5 }} title="Edit"><Edit size={12} /></button>
                    <button className="btn btn-sm btn-secondary" onClick={() => handleDelete(d._id || d.id)} style={{ padding: 5 }} title="Delete"><Trash2 size={12} color="var(--red-600)" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Donor Modal */}
      {viewDonor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card animate-slideUp" style={{ width: '90%', maxWidth: 520, padding: 'var(--space-5)', maxHeight: '88vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border-light)' }}>
              <h3 style={{ margin: 0 }}>Donor Details</h3>
              <button onClick={() => setViewDonor(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Full Name', value: viewDonor.full_name },
                { label: 'Blood Group', value: viewDonor.blood_type },
                { label: 'Phone', value: viewDonor.phone },
                { label: 'Email', value: viewDonor.email || '—' },
                { label: 'Managing Hospital', value: viewDonor.hospital?.name || '—' },
                { label: 'Hospital ID', value: String(viewDonor.hospital?._id || viewDonor.hospital) },
                { label: 'District', value: viewDonor.district },
                { label: 'Last Donation', value: viewDonor.last_donation_date || 'Never' },
                { label: 'Total Donations', value: viewDonor.donation_count || 0 },
                { label: 'Availability', value: viewDonor.is_available !== false ? 'Active' : 'Inactive' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: 8 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Donor Modal */}
      {editDonor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card animate-slideUp" style={{ width: '90%', maxWidth: 520, padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border-light)' }}>
              <h3 style={{ margin: 0 }}>Edit Donor</h3>
              <button onClick={() => setEditDonor(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Full Name', key: 'full_name', type: 'text' },
                { label: 'Phone', key: 'phone', type: 'text' },
                { label: 'Last Donation Date', key: 'last_donation_date', type: 'date' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input type={f.type} className="form-input" value={editForm[f.key] || ''} onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select className="form-input" value={editForm.blood_type} onChange={e => setEditForm({ ...editForm, blood_type: e.target.value })}>
                  {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">District</label>
                <select className="form-input" value={editForm.district} onChange={e => setEditForm({ ...editForm, district: e.target.value })}>
                  {ALL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="edit-available" checked={editForm.is_available} onChange={e => setEditForm({ ...editForm, is_available: e.target.checked })} />
                <label htmlFor="edit-available" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Mark as Active</label>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button className="btn btn-secondary flex-1" onClick={() => setEditDonor(null)}>Cancel</button>
                <button className="btn btn-primary flex-1" onClick={handleEditSave}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
