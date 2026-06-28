import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, ShieldCheck, ShieldAlert, CheckCircle, Trash2, Lock, Unlock, Phone, Mail, MapPin, Eye, AlertTriangle } from 'lucide-react';

function StatusBadge({ status }) {
  const configs = {
    approved:  { label: 'Approved',   color: 'var(--color-success)', bg: 'rgba(22,163,74,0.1)' },
    pending:   { label: 'Pending',    color: 'var(--color-warning)',  bg: 'var(--color-warning-bg)' },
    suspended: { label: 'Suspended',  color: 'var(--red-600)',        bg: 'var(--red-50)' },
  };
  const cfg = configs[status] || configs.pending;
  return (
    <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

export default function AdminHospitals() {
  const { users, suspendUserAccount, deleteUserAccount, showToast } = useAuth();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Filter to show only hospitals
  const hospitalUsers = users.filter(u => u.role === 'hospital');

  const filtered = hospitalUsers.filter(h => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      h.name?.toLowerCase().includes(q) ||
      h.email?.toLowerCase().includes(q) ||
      h.phone?.toLowerCase().includes(q) ||
      h.license_number?.toLowerCase().includes(q) ||
      h.district?.toLowerCase().includes(q);
    const matchStatus = !filterStatus || h.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleApprove = async (id) => {
    const res = await suspendUserAccount(id, 'approved');
    if (res.success) {
      showToast('Hospital approved successfully', 'success');
    } else {
      showToast(res.error || 'Operation failed', 'error');
    }
  };

  const handleSuspend = async (id, isCurrentlySuspended) => {
    const newStatus = isCurrentlySuspended ? 'approved' : 'suspended';
    const res = await suspendUserAccount(id, newStatus);
    if (res.success) {
      showToast(isCurrentlySuspended ? 'Hospital account reactivated' : 'Hospital account suspended', 'success');
    } else {
      showToast(res.error || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    const res = await deleteUserAccount(id);
    if (res.success) {
      showToast('Hospital and all associated donors deleted', 'success');
      setConfirmDelete(null);
    } else {
      showToast(res.error || 'Operation failed', 'error');
    }
  };

  return (
    <div style={{ padding: '0 var(--space-4)', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ margin: '0 0 4px' }}>Hospital & Blood Bank Management</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Approve, suspend, or remove hospital organization accounts</p>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--zinc-400)' }} />
            <input
              type="text"
              placeholder="Search by hospital name, license, email or district..."
              className="form-input"
              style={{ paddingLeft: 38 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div>
            <select className="form-input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved / Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hospital List */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Organization</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>License Number</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>District</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Contact Info</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '12px 16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px var(--space-4)', color: 'var(--text-muted)' }}>
                  No hospitals found matching the query.
                </td>
              </tr>
            ) : (
              filtered.map(hospital => (
                <tr key={hospital.id || hospital._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px 16px', fontWeight: 600, color: 'var(--zinc-900)' }}>
                    <div>{hospital.name}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>Joined {new Date(hospital.created_at).toLocaleDateString()}</div>
                  </td>
                  <td style={{ padding: '16px 16px', color: 'var(--zinc-700)' }}>{hospital.license_number}</td>
                  <td style={{ padding: '16px 16px', color: 'var(--zinc-600)' }}>{hospital.district}</td>
                  <td style={{ padding: '16px 16px', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <Phone size={12} color="var(--zinc-400)" /> {hospital.phone}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Mail size={12} color="var(--zinc-400)" /> {hospital.email}
                    </div>
                  </td>
                  <td style={{ padding: '16px 16px' }}>
                    <StatusBadge status={hospital.status} />
                  </td>
                  <td style={{ padding: '16px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      {hospital.status === 'pending' && (
                        <button className="btn btn-sm btn-primary" onClick={() => handleApprove(hospital.id || hospital._id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle size={14} /> Approve
                        </button>
                      )}
                      {hospital.status !== 'pending' && (
                        <button
                          className={`btn btn-sm ${hospital.status === 'suspended' ? 'btn-success' : 'btn-secondary'}`}
                          onClick={() => handleSuspend(hospital.id || hospital._id, hospital.status === 'suspended')}
                          style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px' }}
                        >
                          {hospital.status === 'suspended' ? <Unlock size={14} style={{ marginRight: 4 }} /> : <Lock size={14} style={{ marginRight: 4 }} />}
                          {hospital.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => setConfirmDelete(hospital.id || hospital._id)}
                        style={{ display: 'inline-flex', alignItems: 'center', padding: 6 }}
                        title="Delete Hospital"
                      >
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

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: 450, padding: 'var(--space-5)' }}>
            <h3 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--red-600)' }}>
              <AlertTriangle size={22} /> Delete Hospital Account?
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.88rem' }}>
              Warning: Deleting this hospital account will permanently delete the organization and <strong>all donor records</strong> created by this hospital. This action cannot be undone.
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
