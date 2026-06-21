import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Settings, Sliders, Bell, Check } from 'lucide-react';

export default function AdminSettings() {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState({
    name: user?.name || 'RehabNation Admin',
    email: user?.email || 'admin@rehabnation.org',
    phone: '+91 11 4050 6000',
  });

  const [systemParams, setSystemParams] = useState({
    cooldown_days: '56',
    critical_timeout_hrs: '2',
    urgent_timeout_hrs: '12',
    standard_timeout_hrs: '48',
    max_batch_size: '20',
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
          <h1>Platform Settings</h1>
          <p>Manage administrative preferences, blood network parameters, and system behaviors.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-8)', alignItems: 'start' }}>
        
        {/* Left info status summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)' }}>Platform Authorization</h3>
            <div style={{ display: 'flex', itemsCenter: 'center', gap: 10, background: 'var(--color-warning-bg)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
              <Shield size={20} color="var(--amber-700)" />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--amber-800)', fontSize: '0.875rem' }}>Global Root Administrator</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--zinc-600)' }}>Full read/write permissions enabled</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right form settings */}
        <form onSubmit={handleSave} className="card" style={{ padding: 'var(--space-8)' }}>
          <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={20} color="var(--red-600)" /> Administrator Credentials
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Full Name</label>
              <input
                id="admin-settings-name"
                type="text"
                className="form-input"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                id="admin-settings-email"
                type="email"
                className="form-input"
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Admin Contact Phone</label>
              <input
                id="admin-settings-phone"
                type="text"
                className="form-input"
                value={profile.phone}
                onChange={e => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
          </div>

          <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sliders size={20} color="var(--red-600)" /> Blood Network Rules & Cooldowns
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
            <div className="form-group">
              <label className="form-label">Donation Cooldown Interval (Days)</label>
              <input
                id="admin-settings-cooldown"
                type="number"
                className="form-input"
                value={systemParams.cooldown_days}
                onChange={e => setSystemParams({ ...systemParams, cooldown_days: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Max Notification Batch Size</label>
              <input
                id="admin-settings-batch"
                type="number"
                className="form-input"
                value={systemParams.max_batch_size}
                onChange={e => setSystemParams({ ...systemParams, max_batch_size: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Critical Urgency Timeout (Hours)</label>
              <input
                id="admin-settings-critical"
                type="number"
                className="form-input"
                value={systemParams.critical_timeout_hrs}
                onChange={e => setSystemParams({ ...systemParams, critical_timeout_hrs: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Urgent Timeout (Hours)</label>
              <input
                id="admin-settings-urgent"
                type="number"
                className="form-input"
                value={systemParams.urgent_timeout_hrs}
                onChange={e => setSystemParams({ ...systemParams, urgent_timeout_hrs: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Standard Timeout (Hours)</label>
              <input
                id="admin-settings-standard"
                type="number"
                className="form-input"
                value={systemParams.standard_timeout_hrs}
                onChange={e => setSystemParams({ ...systemParams, standard_timeout_hrs: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button id="save-admin-settings-btn" type="submit" className="btn btn-primary btn-lg">
              Save Configuration
            </button>
            {saved && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-success)', fontWeight: 600, fontSize: '0.875rem' }}>
                <Check size={16} /> Global configurations updated successfully.
              </div>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}
