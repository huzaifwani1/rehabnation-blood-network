import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, MapPin, ShieldCheck, ShieldAlert, Edit3, Save, X, Clock, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ALL_DISTRICTS } from '../../data/mockData';

function StatusBadge({ status }) {
  const configs = {
    approved:  { label: 'Approved Account', color: 'var(--color-success)', bg: 'rgba(22,163,74,0.1)', icon: <ShieldCheck size={14} /> },
    pending:   { label: 'Pending Approval', color: 'var(--color-warning)',  bg: 'var(--color-warning-bg)',   icon: <Clock size={14} /> },
    suspended: { label: 'Suspended',        color: 'var(--red-600)',        bg: 'var(--red-50)',             icon: <ShieldAlert size={14} /> },
  };
  const cfg = configs[status] || configs.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: cfg.bg, color: cfg.color, borderRadius: 99,
      fontSize: '0.8rem', fontWeight: 700, padding: '5px 12px'
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

export default function UserProfile() {
  const navigate = useNavigate();
  const { user, updateUserProfile, logout, showToast } = useAuth();
  const [editing, setEditing] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    license_number: user?.license_number || '',
    district: user?.district || '',
    address: user?.address || ''
  });
  
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    setError('');
    if (!form.name?.trim()) return setError('Organization name is required');
    if (!form.phone?.trim()) return setError('Phone number is required');
    if (!form.district?.trim()) return setError('District is required');
    if (!form.address?.trim()) return setError('Address is required');

    setLoading(true);
    const result = await updateUserProfile(user.id, {
      name: form.name,
      phone: form.phone,
      email: form.email,
      license_number: form.license_number,
      district: form.district,
      address: form.address,
    });
    setLoading(false);

    if (result.success) {
      setSaved(true);
      setEditing(false);
      showToast('Profile updated successfully!', 'success');
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError(result.error || 'Failed to save changes');
    }
  };

  const handleCancel = () => {
    setForm({
      name: user.name || '',
      phone: user.phone || '',
      email: user.email || '',
      license_number: user.license_number || '',
      district: user.district || '',
      address: user.address || ''
    });
    setEditing(false);
    setError('');
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 var(--space-4)' }}>
      {/* Cover / Header section */}
      <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-5)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div className="avatar avatar-xl" style={{ width: 80, height: 80, fontSize: '2rem', background: 'var(--red-600)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {user.initials}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
              <h2 style={{ margin: 0 }}>{user.name}</h2>
              <StatusBadge status={user.status} />
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={14} /> {user.district}, Physical Location
            </div>
          </div>
          <div>
            {!editing ? (
              <button className="btn btn-secondary" onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Edit3 size={15} /> Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" onClick={handleCancel} disabled={loading}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Save size={15} /> Save
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-critical" style={{ marginBottom: 'var(--space-4)' }}>
          {error}
        </div>
      )}

      {/* Main details card */}
      <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-5)' }}>
        <h3 style={{ margin: '0 0 var(--space-5)', borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>Organization Details</h3>

        {!editing ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 16px' }}>
            {[
              { label: 'Hospital/Bank Name', value: user.name, icon: <User size={16} color="var(--red-600)" /> },
              { label: 'License Number', value: user.license_number, icon: <ShieldCheck size={16} color="var(--red-600)" /> },
              { label: 'Contact Phone', value: user.phone, icon: <Phone size={16} color="var(--red-600)" /> },
              { label: 'Official Email', value: user.email, icon: <Mail size={16} color="var(--red-600)" /> },
              { label: 'District', value: user.district, icon: <MapPin size={16} color="var(--red-600)" /> },
              { label: 'Physical Address', value: user.address, icon: <MapPin size={16} color="var(--red-600)" /> },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ padding: 8, background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)', display: 'flex' }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontWeight: 600, color: 'var(--zinc-900)' }}>{item.value || '—'}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Hospital/Bank Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">License Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.license_number}
                  onChange={e => setForm({ ...form, license_number: e.target.value })}
                  disabled={true} // License number is not editable once registered
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">District</label>
                <select
                  className="form-input"
                  value={form.district}
                  onChange={e => setForm({ ...form, district: e.target.value })}
                  disabled={loading}
                >
                  {ALL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Official Email</label>
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Physical Address</label>
              <textarea
                className="form-input"
                rows="3"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <button className="btn btn-secondary text-red" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LogOut size={16} /> Sign Out of Platform
        </button>
      </div>
    </div>
  );
}
