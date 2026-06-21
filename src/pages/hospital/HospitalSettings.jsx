import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, Shield, Phone, Mail, FileText, Check } from 'lucide-react';

export default function HospitalSettings() {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState({
    name: user?.hospital_name || 'Lagos General Hospital',
    license_number: 'LGH-2024-001',
    address: '1-5, Broad Street, Lagos Island, Lagos',
    district: 'Lagos Island',
    phone: '+234 1 271 2300',
    email: 'contact@lgh.gov.ng',
    primary_contact_name: user?.name || 'Dr. Folake Oyelaran',
    primary_contact_phone: '+234 802 345 6789',
    primary_contact_email: user?.email || 'f.oyelaran@lgh.gov.ng',
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
          <h1>Hospital Settings</h1>
          <p>Configure hospital operational details, licenses, contacts, and preferences.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-8)', alignItems: 'start' }}>
        
        {/* Left column info summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Approval details */}
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)' }}>Verification Details</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-success-bg)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
              <Shield size={20} color="var(--color-success)" />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--color-success)', fontSize: '0.875rem' }}>Accredited Partner</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--zinc-600)' }}>Approved by RehabNation HQ</div>
              </div>
            </div>
          </div>

          {/* Operational guide */}
          <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--beige-100)', border: '1px solid var(--beige-200)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 8 }}><FileText size={16} /> Operational Rules</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8125rem', color: 'var(--zinc-600)', paddingLeft: 'var(--space-4)' }}>
              <li>• Only accredited hospitals can post emergency requests</li>
              <li>• Matching is restricted to your target request district</li>
              <li>• You must report outcomes within 24 hours of matching</li>
            </ul>
          </div>
        </div>

        {/* Right column settings form */}
        <form onSubmit={handleSave} className="card" style={{ padding: 'var(--space-8)' }}>
          <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={20} color="var(--red-600)" /> Hospital Identity
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Hospital Name</label>
              <input
                id="hosp-settings-name"
                type="text"
                className="form-input"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">License Number</label>
              <input
                id="hosp-settings-license"
                type="text"
                className="form-input"
                value={profile.license_number}
                readOnly
                style={{ background: 'var(--zinc-50)', color: 'var(--text-muted)' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">District</label>
              <input
                id="hosp-settings-district"
                type="text"
                className="form-input"
                value={profile.district}
                onChange={e => setProfile({ ...profile, district: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Full Address</label>
              <textarea
                id="hosp-settings-address"
                rows={2}
                className="form-textarea"
                value={profile.address}
                onChange={e => setProfile({ ...profile, address: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hospital Tel Phone</label>
              <input
                id="hosp-settings-phone"
                type="text"
                className="form-input"
                value={profile.phone}
                onChange={e => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hospital General Email</label>
              <input
                id="hosp-settings-email"
                type="email"
                className="form-input"
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
          </div>

          <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Phone size={20} color="var(--red-600)" /> Primary Contact Officer
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Contact Officer Name</label>
              <input
                id="hosp-settings-contact-name"
                type="text"
                className="form-input"
                value={profile.primary_contact_name}
                onChange={e => setProfile({ ...profile, primary_contact_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                id="hosp-settings-contact-phone"
                type="text"
                className="form-input"
                value={profile.primary_contact_phone}
                onChange={e => setProfile({ ...profile, primary_contact_phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input
                id="hosp-settings-contact-email"
                type="email"
                className="form-input"
                value={profile.primary_contact_email}
                onChange={e => setProfile({ ...profile, primary_contact_email: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button id="save-hospital-settings-btn" type="submit" className="btn btn-primary btn-lg">
              Save Settings
            </button>
            {saved && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-success)', fontWeight: 600, fontSize: '0.875rem' }}>
                <Check size={16} /> Hospital details updated successfully.
              </div>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}
