import React, { useState } from 'react';
import { Building2, CheckCircle, XCircle, Eye, Ban, Plus, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, EmptyState } from '../../components/ui/Badges';
import Modal from '../../components/ui/Modal';

export default function AdminHospitals() {
  const { hospitals, createHospitalAccount, updateHospitalAccount, suspendHospitalAccount } = useAuth();
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('approved');
  
  // Modals for creation & editing
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [error, setError] = useState('');
  
  // Forms state
  const [form, setForm] = useState({
    name: '', license_number: '', city: '', region: '',
    contact_name: '', contact_phone: '', contact_email: '', password: 'password123'
  });

  const updateField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = (e) => {
    e.preventDefault();
    const res = createHospitalAccount(form);
    if (res.success) {
      setCreateOpen(false);
      setForm({
        name: '', license_number: '', city: '', region: '',
        contact_name: '', contact_phone: '', contact_email: '', password: 'password123'
      });
      setError('');
    } else {
      setError(res.error);
    }
  };

  const handleOpenEdit = (hosp) => {
    setEditTarget(hosp.id);
    setForm({
      name: hosp.name,
      license_number: hosp.license_number,
      city: hosp.city,
      region: hosp.region,
      contact_name: hosp.primary_contact_name,
      contact_phone: hosp.primary_contact_phone,
      contact_email: hosp.primary_contact_email,
      password: '' // Admin can enter new password or leave blank
    });
    setEditOpen(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const res = updateHospitalAccount(editTarget, form);
    if (res.success) {
      setEditOpen(false);
      setEditTarget(null);
      setError('');
    } else {
      setError(res.error);
    }
  };

  const updateStatus = (id, status) => {
    suspendHospitalAccount(id, status);
    setSelected(null);
  };

  const filtered = hospitals.filter(h => h.status === tab);

  const TABS = [
    { key: 'approved', label: 'Approved Portal Users', color: 'var(--success)' },
    { key: 'pending',  label: 'New Applications',  color: 'var(--warning)' },
    { key: 'suspended', label: 'Suspended Accounts', color: 'var(--danger)' },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Hospital Portal Management</h1>
          <p>Create and manage authorized hospital portal user credentials</p>
        </div>
        <button
          id="add-hospital-btn"
          className="btn btn-primary"
          onClick={() => { setError(''); setCreateOpen(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={16} />
          Create Hospital Account
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2" style={{ marginBottom: 'var(--space-6)' }}>
        {TABS.map(t => {
          const count = hospitals.filter(h => h.status === t.key).length;
          return (
            <button
              key={t.key}
              id={`tab-${t.key}`}
              className={`btn ${tab === t.key ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              <span className="sidebar-item-badge" style={{ background: tab === t.key ? 'rgba(255,255,255,0.2)' : 'var(--brand-red-muted)', color: tab === t.key ? '#fff' : 'var(--brand-red-light)' }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Building2 size={28} color="var(--text-muted)" />}
          title={`No ${tab} hospitals`}
          description={tab === 'pending' ? 'No new applications awaiting review.' : `No hospitals with ${tab} status.`}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(h => (
            <div key={h.id} id={`hosp-card-${h.id}`} className="card">
              <div className="flex items-center gap-4">
                <div style={{ width: 48, height: 48, background: 'var(--info-bg)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Building2 size={22} color="var(--info)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-3" style={{ marginBottom: 4 }}>
                    <h4 style={{ fontSize: '1rem' }}>{h.name}</h4>
                    <StatusBadge status={h.status} />
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {h.city}, {h.region} · License: {h.license_number}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Contact: {h.primary_contact_name} · {h.primary_contact_email} · {h.primary_contact_phone}
                  </div>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'right', flexShrink: 0 }}>
                  Registered {new Date(h.created_at).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <button id={`view-hosp-${h.id}`} className="btn-icon" title="View details" onClick={() => setSelected(h)}>
                    <Eye size={14} />
                  </button>
                  <button id={`edit-hosp-${h.id}`} className="btn-icon" title="Edit Hospital details" onClick={() => handleOpenEdit(h)}>
                    <Edit size={14} />
                  </button>
                  
                  {tab === 'pending' && (
                    <>
                      <button id={`approve-${h.id}`} className="btn btn-success btn-sm" onClick={() => updateStatus(h.id, 'approved')}>
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button id={`reject-${h.id}`} className="btn btn-danger btn-sm" onClick={() => updateStatus(h.id, 'rejected')}>
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  )}
                  {tab === 'approved' && (
                    <button id={`suspend-${h.id}`} className="btn btn-danger btn-sm" onClick={() => updateStatus(h.id, 'suspended')}>
                      <Ban size={14} /> Suspend
                    </button>
                  )}
                  {tab === 'suspended' && (
                    <button id={`reinstate-${h.id}`} className="btn btn-success btn-sm" onClick={() => updateStatus(h.id, 'approved')}>
                      <CheckCircle size={14} /> Reinstate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hospital Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Hospital Details" size="lg">
        {selected && (
          <div>
            <div className="flex items-center gap-4" style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ width: 52, height: 52, background: 'var(--info-bg)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={26} color="var(--info)" />
              </div>
              <div>
                <h3 style={{ marginBottom: 4 }}>{selected.name}</h3>
                <StatusBadge status={selected.status} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              {[
                { label: 'License Number', value: selected.license_number },
                { label: 'City', value: selected.city },
                { label: 'Region', value: selected.region },
                { label: 'Primary Contact', value: selected.primary_contact_name },
                { label: 'Contact Email', value: selected.primary_contact_email },
                { label: 'Contact Phone', value: selected.primary_contact_phone },
                { label: 'Registered', value: new Date(selected.created_at).toLocaleDateString() },
              ].map(item => (
                <div key={item.label} className="form-group" style={{ gap: 4 }}>
                  <span className="form-label" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 500 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Hospital Creation Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Hospital Portal User" size="lg">
        <form onSubmit={handleCreate}>
          {error && <div className="alert alert-critical mb-4"><span>{error}</span></div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Hospital Name <span>*</span></label>
              <input id="hosp-form-name" type="text" className="form-input" placeholder="e.g. general hospital" value={form.name} onChange={e => updateField('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">License Number <span>*</span></label>
              <input id="hosp-form-license" type="text" className="form-input" placeholder="e.g. LIC-2026-99" value={form.license_number} onChange={e => updateField('license_number', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">City <span>*</span></label>
              <input id="hosp-form-city" type="text" className="form-input" placeholder="e.g. Lagos" value={form.city} onChange={e => updateField('city', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Region / State <span>*</span></label>
              <input id="hosp-form-region" type="text" className="form-input" placeholder="e.g. Lagos State" value={form.region} onChange={e => updateField('region', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Primary Contact Name <span>*</span></label>
              <input id="hosp-form-contact-name" type="text" className="form-input" placeholder="Dr. Jane Doe" value={form.contact_name} onChange={e => updateField('contact_name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone <span>*</span></label>
              <input id="hosp-form-phone" type="text" className="form-input" placeholder="+234-800-0000" value={form.contact_phone} onChange={e => updateField('contact_phone', e.target.value)} required />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Portal Login Email <span>*</span></label>
              <input id="hosp-form-email" type="email" className="form-input" placeholder="portal@hospital.org" value={form.contact_email} onChange={e => updateField('contact_email', e.target.value)} required />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Temporary Password <span>*</span></label>
              <input id="hosp-form-pw" type="password" className="form-input" placeholder="Set login password (min 8 chars)" value={form.password} onChange={e => updateField('password', e.target.value)} required />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" className="btn btn-secondary" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button id="create-hospital-submit-btn" type="submit" className="btn btn-primary">Create Account</button>
          </div>
        </form>
      </Modal>

      {/* Hospital Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => { setEditOpen(false); setEditTarget(null); }} title="Edit Hospital Portal Details" size="lg">
        <form onSubmit={handleUpdate}>
          {error && <div className="alert alert-critical mb-4"><span>{error}</span></div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Hospital Name <span>*</span></label>
              <input id="hosp-edit-name" type="text" className="form-input" value={form.name} onChange={e => updateField('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">License Number <span>*</span></label>
              <input id="hosp-edit-license" type="text" className="form-input" value={form.license_number} onChange={e => updateField('license_number', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">City <span>*</span></label>
              <input id="hosp-edit-city" type="text" className="form-input" value={form.city} onChange={e => updateField('city', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Region / State <span>*</span></label>
              <input id="hosp-edit-region" type="text" className="form-input" value={form.region} onChange={e => updateField('region', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Primary Contact Name <span>*</span></label>
              <input id="hosp-edit-contact-name" type="text" className="form-input" value={form.contact_name} onChange={e => updateField('contact_name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone <span>*</span></label>
              <input id="hosp-edit-phone" type="text" className="form-input" value={form.contact_phone} onChange={e => updateField('contact_phone', e.target.value)} required />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Portal Login Email <span>*</span></label>
              <input id="hosp-edit-email" type="email" className="form-input" value={form.contact_email} onChange={e => updateField('contact_email', e.target.value)} required />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Reset Password <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Optional)</span></label>
              <input id="hosp-edit-pw" type="password" className="form-input" placeholder="Leave empty to retain current password" value={form.password} onChange={e => updateField('password', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" className="btn btn-secondary" onClick={() => { setEditOpen(false); setEditTarget(null); }}>Cancel</button>
            <button id="edit-hospital-submit-btn" type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
