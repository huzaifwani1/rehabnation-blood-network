import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Phone, Mail, MapPin, Calendar, Droplets, Activity,
  ShieldCheck, ShieldOff, Edit3, Save, X, AlertTriangle,
  CheckCircle, Clock, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BLOOD_TYPES, ALL_DISTRICTS } from '../../data/mockData';

function VerifBadge({ status }) {
  const configs = {
    camp_verified: { label: 'Camp Verified', color: 'var(--color-success)', bg: 'rgba(22,163,74,0.1)', icon: <ShieldCheck size={14} /> },
    unverified:    { label: 'Unverified',    color: 'var(--zinc-500)',       bg: 'var(--zinc-100)',           icon: <ShieldOff size={14} /> },
    pending:       { label: 'Pending Review',color: 'var(--color-warning)',  bg: 'var(--color-warning-bg)',   icon: <Clock size={14} /> },
  };
  const cfg = configs[status] || configs.unverified;
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
  const { user, updateUserProfile, logout } = useAuth();
  const [editing, setEditing] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const [form, setForm] = useState({ ...user });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setError('');
    if (!form.name?.trim()) return setError('Name is required');
    if (!form.phone?.trim()) return setError('Phone number is required');

    setLoading(true);
    const result = await updateUserProfile(user.id, {
      name: form.name,
      phone: form.phone,
      email: form.email,
      dob: form.dob,
      gender: form.gender,
      blood_type: form.blood_type,
      district: form.district,
      city: form.city,
      region: form.region,
      address: form.address,
      current_city_district: form.current_city_district,
      weight_kg: form.weight_kg,
      hemoglobin_level: form.hemoglobin_level,
      last_donation_date: form.last_donation_date,
      donation_count: form.donation_count,
    });
    setLoading(false);

    if (result.success) {
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError(result.error || 'Failed to save changes');
    }
  };

  const handleCancel = () => {
    setForm({ ...user });
    setEditing(false);
    setError('');
  };

  const age = user.dob
    ? Math.floor((Date.now() - new Date(user.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-5)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--red-600) 0%, #c0392b 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem', fontWeight: 900, color: '#fff', flexShrink: 0
        }}>
          {user.initials}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: '1.5rem' }}>{user.name}</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <VerifBadge status={user.verification_status} />
            {user.blood_type && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'var(--red-50)', color: 'var(--red-600)',
                fontWeight: 800, padding: '5px 12px', borderRadius: 99, fontSize: '0.85rem'
              }}>
                <Droplets size={13} /> {user.blood_type}
              </span>
            )}
            {age !== null && age >= 0 && (
              <span style={{ background: 'var(--zinc-100)', color: 'var(--zinc-600)', fontSize: '0.8rem', fontWeight: 600, padding: '5px 12px', borderRadius: 99 }}>
                {age} years old
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {editing ? (
            <>
              <button className="btn btn-secondary btn-sm" onClick={handleCancel} disabled={loading}>
                <X size={14} /> Cancel
              </button>
              <button className="btn btn-primary btn-sm" id="profile-save-btn" onClick={handleSave} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {loading ? <div className="spinner" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', margin: 0 }} /> : <><Save size={14} /> Save Changes</>}
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary btn-sm" id="profile-edit-btn" onClick={() => setEditing(true)}>
                <Edit3 size={14} /> Edit Profile
              </button>
              <button className="btn btn-outline btn-sm text-red" onClick={handleLogout} style={{ borderColor: 'var(--red-200)', color: 'var(--red-600)', display: 'flex', alignItems: 'center', gap: 5 }} id="profile-logout-btn">
                <LogOut size={14} /> Logout
              </button>
            </>
          )}
        </div>
      </div>

      {saved && (
        <div className="alert" style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', color: 'var(--color-success)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3) var(--space-4)' }}>
          <CheckCircle size={16} /> Profile saved successfully!
        </div>
      )}
      {error && (
        <div className="alert alert-critical" style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        {[
          { label: 'Total Donations', value: user.donation_count || 0, icon: <Droplets size={16} color="var(--red-600)" />, color: 'var(--red-600)' },
          { label: 'Weight (kg)', value: user.weight_kg || 'Not set', icon: <Activity size={16} color="var(--color-info)" />, color: 'var(--color-info)' },
          { label: 'Hb Level (g/dL)', value: user.hemoglobin_level || 'Not set', icon: <Activity size={16} color="var(--color-success)" />, color: 'var(--color-success)' },
          { label: 'Last Donation', value: user.last_donation_date ? new Date(user.last_donation_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'None', icon: <Calendar size={16} color="var(--color-warning)" />, color: 'var(--color-warning)' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
            <div style={{ color: stat.color, marginBottom: 6, display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Profile Sections */}
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Personal Info */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h4 style={{ margin: '0 0 var(--space-4)', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--zinc-700)' }}>
              <User size={16} color="var(--red-600)" /> Personal Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              {[
                { label: 'Full Name *', key: 'name', placeholder: 'Your legal name' },
                { label: 'Phone Number *', key: 'phone', placeholder: '+234-800-000-0000' },
                { label: 'Email (Optional)', key: 'email', placeholder: 'you@example.com', type: 'email' },
                { label: 'Date of Birth', key: 'dob', type: 'date' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input id={`profile-${f.key}`} type={f.type || 'text'} className="form-input" placeholder={f.placeholder} value={form[f.key] || ''} onChange={e => update(f.key, e.target.value)} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select id="profile-gender" className="form-select" value={form.gender || 'male'} onChange={e => update('gender', e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select id="profile-blood-type" className="form-select" value={form.blood_type || ''} onChange={e => update('blood_type', e.target.value)}>
                  <option value="">Select blood group</option>
                  {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h4 style={{ margin: '0 0 var(--space-4)', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--zinc-700)' }}>
              <MapPin size={16} color="var(--red-600)" /> Location (Jammu & Kashmir)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">District (J&K)</label>
                <select
                  id="profile-district"
                  className="form-select"
                  value={form.district || ''}
                  onChange={e => update('district', e.target.value)}
                >
                  <option value="">Select district</option>
                  {ALL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Full Address</label>
                <textarea id="profile-address" className="form-textarea" placeholder="Your full home address" value={form.address || ''} onChange={e => update('address', e.target.value)} rows={2} style={{ resize: 'vertical' }} />
              </div>
            </div>
          </div>

          {/* Health Info */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h4 style={{ margin: '0 0 var(--space-4)', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--zinc-700)' }}>
              <Activity size={16} color="var(--red-600)" /> Health & Donation Info
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              {[
                { label: 'Weight (kg)', key: 'weight_kg', type: 'number', placeholder: 'e.g. 65' },
                { label: 'Hemoglobin Level (g/dL)', key: 'hemoglobin_level', type: 'number', step: '0.1', placeholder: 'e.g. 13.5' },
                { label: 'Last Donation Date', key: 'last_donation_date', type: 'date' },
                { label: 'Total Donations', key: 'donation_count', type: 'number', placeholder: 'e.g. 5' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input id={`profile-${f.key}`} type={f.type || 'text'} step={f.step} className="form-input" placeholder={f.placeholder} value={form[f.key] || ''} onChange={e => update(f.key, e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          {/* Personal */}
          <div className="card" style={{ padding: 'var(--space-5)', gridColumn: '1 / -1' }}>
            <h4 style={{ margin: '0 0 var(--space-4)', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--zinc-700)' }}>
              <User size={16} color="var(--red-600)" /> Personal Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              {[
                { label: 'Full Name', value: user.name },
                { label: 'Phone', value: user.phone || '—' },
                { label: 'Email', value: user.email || '—' },
                { label: 'Gender', value: user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : '—' },
                { label: 'Date of Birth', value: user.dob ? new Date(user.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                { label: 'Age', value: age !== null ? `${age} years old` : '—' },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontWeight: 600, color: 'var(--zinc-900)' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h4 style={{ margin: '0 0 var(--space-4)', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--zinc-700)' }}>
              <MapPin size={16} color="var(--red-600)" /> Location (J&K)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'District', value: user.district },
                { label: 'Address', value: user.address },
              ].map(item => item.value && (
                <div key={item.label}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontWeight: 600, color: 'var(--zinc-900)' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Health */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h4 style={{ margin: '0 0 var(--space-4)', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--zinc-700)' }}>
              <Activity size={16} color="var(--red-600)" /> Health Info
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Weight', value: user.weight_kg ? `${user.weight_kg} kg` : '—' },
                { label: 'Hemoglobin Level', value: user.hemoglobin_level ? `${user.hemoglobin_level} g/dL` : '—' },
                { label: 'Total Donations', value: user.donation_count || 0 },
                { label: 'Last Donation', value: user.last_donation_date ? new Date(user.last_donation_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontWeight: 600, color: 'var(--zinc-900)' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
