import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, Trash2, Lock, Unlock, Eye, Users, AlertTriangle, Phone, Mail, MapPin, Building, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function StatusBadge({ status }) {
  const configs = {
    approved:  { label: 'Approved',  color: 'var(--color-success)', bg: 'rgba(22,163,74,0.1)' },
    pending:   { label: 'Pending',   color: 'var(--color-warning)', bg: 'rgba(217,119,6,0.1)' },
    suspended: { label: 'Suspended', color: 'var(--red-600)',       bg: 'rgba(220,38,38,0.1)' },
  };
  const cfg = configs[status] || configs.pending;
  return (
    <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

export default function AdminHospitals() {
  const navigate = useNavigate();
  const { users, suspendUserAccount, deleteUserAccount, showToast, fetchHospitalStats } = useAuth();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [hospitalStats, setHospitalStats] = useState({});

  const hospitals = users.filter(u => u.role === 'hospital');

  // Load per-hospital stats
  useEffect(() => {
    hospitals.forEach(async (h) => {
      if (!hospitalStats[h.id]) {
        const res = await fetchHospitalStats(h.id);
        if (res.success) {
          setHospitalStats(prev => ({ ...prev, [h.id]: res.stats }));
        }
      }
    });
  }, [users]);

  const filtered = hospitals.filter(h => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      h.name?.toLowerCase().includes(q) ||
      h.email?.toLowerCase().includes(q) ||
      h.phone?.includes(q) ||
      h.registration_number?.toLowerCase().includes(q) ||
      h.district?.toLowerCase().includes(q);
    const matchStatus = !filterStatus || h.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleApprove = async (id) => {
    const res = await suspendUserAccount(id, 'approved');
    showToast(res.success ? 'Hospital approved' : res.error || 'Failed', res.success ? 'success' : 'error');
  };

  const handleSuspend = async (id, isSuspended) => {
    const res = await suspendUserAccount(id, isSuspended ? 'approved' : 'suspended');
    showToast(res.success ? (isSuspended ? 'Hospital reactivated' : 'Hospital suspended') : res.error || 'Failed', res.success ? 'success' : 'error');
  };

  const handleDelete = async (id) => {
    const res = await deleteUserAccount(id);
    if (res.success) {
      showToast('Hospital and all donors deleted', 'success');
      setConfirmDelete(null);
    } else {
      showToast(res.error || 'Failed to delete', 'error');
    }
  };

  return (
    <div style={{ padding: '0 var(--space-4)', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>Hospital Management</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>{hospitals.length} registered organization{hospitals.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--zinc-400)' }} />
            <input type="text" placeholder="Search by name, registration number, email, district…" className="form-input" style={{ paddingLeft: 38 }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved / Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Hospital Cards Grid */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
          No hospitals matching the query.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
          {filtered.map(hospital => {
            const hs = hospitalStats[hospital.id] || {};
            return (
              <div key={hospital.id} className="card" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'rgba(220,38,38,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building size={20} color="var(--red-600)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--zinc-900)' }}>{hospital.name}</div>
                      {hospital.blood_bank_name && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hospital.blood_bank_name}</div>}
                    </div>
                  </div>
                  <StatusBadge status={hospital.status} />
                </div>

                {/* Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.8rem' }}>
                  {[
                    { label: 'Reg. Number', value: hospital.registration_number || '—' },
                    { label: 'Type', value: hospital.hospital_type || '—' },
                    { label: 'District', value: hospital.district || '—' },
                    { label: 'State', value: hospital.state || '—' },
                    { label: 'Total Donors', value: hs.totalDonors ?? '—' },
                    { label: 'Active Donors', value: hs.activeDonors ?? '—' },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
                      <div style={{ fontWeight: 700, color: 'var(--zinc-800)' }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Contact */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.8rem', color: 'var(--zinc-600)', borderTop: '1px solid var(--border-light)', paddingTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={12} /> {hospital.phone}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={12} /> {hospital.email}</div>
                  {hospital.contact_person && <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Users size={12} /> Contact: {hospital.contact_person}</div>}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/hospitals/${hospital.id}`)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Eye size={13} /> View Hospital
                  </button>
                  <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/donors?hospital=${hospital.id}&name=${encodeURIComponent(hospital.name)}`)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Users size={13} /> View Donors
                  </button>
                  {hospital.status === 'pending' && (
                    <button className="btn btn-sm btn-primary" onClick={() => handleApprove(hospital.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <CheckCircle size={13} /> Approve
                    </button>
                  )}
                  {hospital.status !== 'pending' && (
                    <button className={`btn btn-sm ${hospital.status === 'suspended' ? 'btn-secondary' : 'btn-secondary'}`} onClick={() => handleSuspend(hospital.id, hospital.status === 'suspended')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      {hospital.status === 'suspended' ? <Unlock size={13} /> : <Lock size={13} />}
                      {hospital.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                    </button>
                  )}
                  <button className="btn btn-sm btn-secondary" onClick={() => setConfirmDelete(hospital.id)} style={{ padding: 6 }} title="Delete Hospital">
                    <Trash2 size={14} color="var(--red-600)" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card animate-slideUp" style={{ width: '90%', maxWidth: 460, padding: 'var(--space-5)' }}>
            <h3 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--red-600)' }}>
              <AlertTriangle size={22} /> Delete Hospital Account?
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.88rem', lineHeight: 1.5 }}>
              This will permanently delete the hospital organization and <strong>all donor records</strong> created by this hospital. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ background: 'var(--red-600)', borderColor: 'var(--red-600)' }} onClick={() => handleDelete(confirmDelete)}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
