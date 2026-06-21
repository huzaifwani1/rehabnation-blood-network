import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Shield, MapPin, Activity, Bell, Check } from 'lucide-react';

export default function DonorSettings() {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState({
    full_name: user?.name || 'Amara Okonkwo',
    phone_number: '+234 801 234 5678',
    email: user?.email || 'amara@example.com',
    gender: 'female',
    district: 'Lagos Mainland',
    address: '12, Herbert Macaulay Way, Yaba, Lagos',
    current_city_district: 'Yaba',
    weight_kg: user?.weight_kg || '62',
    hemoglobin_level: '13.2',
    is_available: user?.is_available !== false,
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    push: true,
    email: true,
    sms: false,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Profile Settings</h1>
          <p>Update your personal information, health records, and preferences.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-8)', alignItems: 'start' }}>
        
        {/* Left Column: Quick Actions & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Availability Card */}
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={18} color="var(--red-600)" /> Availability
            </h3>
            <p style={{ color: 'var(--zinc-500)', fontSize: '0.875rem', marginBottom: 'var(--space-4)' }}>
              Toggle your status to control if you appear in emergency matching requests.
            </p>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: 'var(--zinc-50)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontWeight: 600, color: 'var(--zinc-800)' }}>
                {profile.is_available ? '🟢 Available for Matches' : '🔴 Unavailable'}
              </span>
              <input
                id="toggle-availability"
                type="checkbox"
                checked={profile.is_available}
                onChange={e => setProfile({ ...profile, is_available: e.target.checked })}
                style={{ width: 40, height: 20, accentColor: 'var(--red-600)', cursor: 'pointer' }}
              />
            </label>
          </div>

          {/* Verification Badge */}
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)' }}>Verification Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--red-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
              <Shield size={20} color="var(--red-600)" />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--red-600)', fontSize: '0.875rem' }}>Verified Donor</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--zinc-600)' }}>Verified through RehabNation Camp</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings Form */}
        <form onSubmit={handleSave} className="card" style={{ padding: 'var(--space-8)' }}>
          <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={20} color="var(--red-600)" /> Personal & Health Profile
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                id="settings-name"
                type="text"
                className="form-input"
                value={profile.full_name}
                onChange={e => setProfile({ ...profile, full_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                id="settings-gender"
                className="form-select"
                value={profile.gender}
                onChange={e => setProfile({ ...profile, gender: e.target.value })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                id="settings-phone"
                type="text"
                className="form-input"
                value={profile.phone_number}
                onChange={e => setProfile({ ...profile, phone_number: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                id="settings-email"
                type="email"
                className="form-input"
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
          </div>

          <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={20} color="var(--red-600)" /> Location Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <div className="form-group">
              <label className="form-label">District</label>
              <input
                id="settings-district"
                type="text"
                className="form-input"
                value={profile.district}
                onChange={e => setProfile({ ...profile, district: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Current City/District</label>
              <input
                id="settings-city-district"
                type="text"
                className="form-input"
                value={profile.current_city_district}
                onChange={e => setProfile({ ...profile, current_city_district: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Full Address</label>
              <textarea
                id="settings-address"
                rows={2}
                className="form-textarea"
                value={profile.address}
                onChange={e => setProfile({ ...profile, address: e.target.value })}
              />
            </div>
          </div>

          <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={20} color="var(--red-600)" /> Health Parameters
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input
                id="settings-weight"
                type="number"
                className="form-input"
                value={profile.weight_kg}
                onChange={e => setProfile({ ...profile, weight_kg: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hemoglobin Level (g/dL)</label>
              <input
                id="settings-hb"
                type="number"
                step="0.1"
                className="form-input"
                value={profile.hemoglobin_level}
                onChange={e => setProfile({ ...profile, hemoglobin_level: e.target.value })}
              />
            </div>
          </div>

          <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={20} color="var(--red-600)" /> Notification Preferences
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
            {[
              { key: 'push', label: 'Push Notifications', desc: 'Instant alerts on matching emergency blood requests' },
              { key: 'email', label: 'Email Alerts', desc: 'Periodic notifications and details on scheduled donation campaigns' },
              { key: 'sms', label: 'SMS / Text Messages', desc: 'Direct text messages for critical urgency triggers' },
            ].map(channel => (
              <label key={channel.key} style={{ display: 'flex', gap: 'var(--space-3)', cursor: 'pointer', alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  checked={notificationPrefs[channel.key]}
                  onChange={e => setNotificationPrefs({ ...notificationPrefs, [channel.key]: e.target.checked })}
                  style={{ marginTop: 4, accentColor: 'var(--red-600)', width: 16, height: 16 }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--zinc-800)', fontSize: '0.875rem' }}>{channel.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--zinc-500)' }}>{channel.desc}</div>
                </div>
              </label>
            ))}
          </div>

          <div style={{ display: 'flex', items: 'center', gap: 12 }}>
            <button id="save-settings-btn" type="submit" className="btn btn-primary btn-lg">
              Save Settings
            </button>
            {saved && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-success)', fontWeight: 600, fontSize: '0.875rem' }}>
                <Check size={16} /> Profile settings updated successfully.
              </div>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}
