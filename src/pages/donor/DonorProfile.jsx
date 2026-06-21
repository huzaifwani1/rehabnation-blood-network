import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BloodBadge } from '../../components/ui/Badges';
import { BLOOD_TYPES } from '../../data/mockData';
import { User, Save } from 'lucide-react';

export default function DonorProfile() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Profile</h1>
          <p>Update your donor information</p>
        </div>
        <button id="save-profile-btn" className="btn btn-primary" onClick={handleSave}>
          <Save size={15} />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid-2">
        {/* Personal Info */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-6)' }}>Personal Information</h3>
          <div className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input id="profile-name" type="text" className="form-input" defaultValue={user?.name} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input id="profile-email" type="email" className="form-input" defaultValue={user?.email} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input id="profile-phone" type="tel" className="form-input" defaultValue="+234-801-234-5678" />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input id="profile-dob" type="date" className="form-input" defaultValue="1993-04-15" />
            </div>
          </div>
        </div>

        {/* Blood & Location */}
        <div className="flex flex-col gap-6">
          <div className="card">
            <h3 style={{ marginBottom: 'var(--space-6)' }}>Blood Information</h3>
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">Blood Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)' }}>
                {BLOOD_TYPES.map(bt => (
                  <button
                    key={bt}
                    id={`profile-bt-${bt.replace('+','pos').replace('-','neg')}`}
                    type="button"
                    className={`btn btn-sm ${user?.blood_type === bt ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {bt}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">Weight (kg)</label>
              <input id="profile-weight" type="number" className="form-input" defaultValue="68" />
            </div>
            <div className="form-group">
              <label className="form-label">Last Donation Date</label>
              <input id="profile-last-donation" type="date" className="form-input" defaultValue="2026-01-10" />
              <span className="form-hint">Next eligible: March 7, 2026 (56-day rule)</span>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 'var(--space-6)' }}>Location & Preferences</h3>
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">City</label>
              <input id="profile-city" type="text" className="form-input" defaultValue={user?.city} />
            </div>
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">Region / State</label>
              <input id="profile-region" type="text" className="form-input" defaultValue="Lagos State" />
            </div>
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">Max Travel Distance</label>
              <select id="profile-travel" className="form-select" defaultValue="25">
                {['5', '10', '25', '50', '100'].map(v => <option key={v} value={v}>{v} km</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Preferred Contact</label>
              <select id="profile-contact-pref" className="form-select" defaultValue="phone">
                <option value="phone">Phone Call</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
