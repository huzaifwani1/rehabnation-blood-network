import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BLOOD_TYPES, ALL_DISTRICTS } from '../data/mockData';

const STEPS_DONOR = ['Account', 'Blood Info', 'Location', 'Consent'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registerUser } = useAuth();
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);

  // Donor form state
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '',
    gender: 'male',
    blood_type: '', dob: '', weight: '', hemoglobin_level: '',
    district: '', address: '', city: '', region: '',
    last_donation_date: '', donation_count: '0',
    consent: false,
  });

  const [submitted, setSubmitted] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleDonorSubmit = () => {
    const result = registerUser({
      email: form.email,
      password: form.password,
      full_name: form.full_name,
      phone: form.phone,
      gender: form.gender,
      blood_type: form.blood_type,
      dob: form.dob,
      weight_kg: form.weight,
      hemoglobin_level: form.hemoglobin_level,
      district: form.district,
      address: form.address,
      city: form.city,
      region: form.region,
      last_donation_date: form.last_donation_date,
      donation_count: form.donation_count,
    });

    if (result.success) {
      setSubmitted(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } else {
      setError(result.error);
      setStep(0);
    }
  };

  const handleStep0Continue = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.full_name || !form.full_name.trim()) {
      setError('Full name is required');
      return;
    }
    if (!form.email || !form.email.trim() || !emailRegex.test(form.email)) {
      setError('Invalid email');
      return;
    }
    if (!form.password || form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    const currentUsers = JSON.parse(localStorage.getItem('rehabnation_users') || '[]');
    const exists = currentUsers.some(
      u => u.email.toLowerCase() === form.email.trim().toLowerCase()
    );
    if (exists) {
      setError('Account already exists');
      return;
    }

    setError('');
    setStep(1);
  };

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-bg" />
        <div className="auth-panel">
          <div className="auth-card animate-slideUp" style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'var(--success-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
              <Check size={28} color="var(--success)" />
            </div>
            <h2>You're Registered!</h2>
            <p style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              Welcome to the RehabNation Blood Network. Setting up your dashboard…
            </p>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-panel" style={{ maxWidth: 560 }}>
        <div className="auth-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="RehabNation Blood Network" className="auth-logo-img" />
        </div>

        <div className="auth-card animate-slideUp">
          {/* Step wizard */}
          <div className="step-wizard" style={{ marginBottom: 'var(--space-6)' }}>
            {STEPS_DONOR.map((s, i) => (
              <React.Fragment key={s}>
                <div className={`step ${i === step ? 'active' : i < step ? 'done' : ''}`}
                  style={{ flex: 'none', gap: 6 }}>
                  <div className="step-num">
                    {i < step ? <Check size={14} /> : i + 1}
                  </div>
                  <span className="step-label" style={{ display: window.innerWidth > 480 ? 'inline' : 'none' }}>{s}</span>
                </div>
                {i < STEPS_DONOR.length - 1 && (
                  <div style={{
                    flex: 1, height: 2,
                    background: i < step ? 'var(--brand-red)' : 'var(--border-subtle)',
                    borderRadius: 4
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step 0: Account */}
          {step === 0 && (
            <div className="auth-form">
              <h3 style={{ marginBottom: 'var(--space-4)' }}>Basic Information</h3>
              {error && (
                <div id="register-error" className="alert alert-critical" style={{ marginBottom: 'var(--space-4)' }}>
                  <span>{error}</span>
                </div>
              )}
              {[
                { label: 'Full Name', key: 'full_name', placeholder: 'Your legal name' },
                { label: 'Email', key: 'email', placeholder: 'you@example.com', type: 'email' },
                { label: 'Phone Number', key: 'phone', placeholder: '+234-800-000-0000' },
                { label: 'Password', key: 'password', placeholder: 'At least 8 characters', type: 'password' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label} <span>*</span></label>
                  <input id={`reg-${f.key}`} type={f.type || 'text'} className="form-input" placeholder={f.placeholder} value={form[f.key]} onChange={e => { update(f.key, e.target.value); setError(''); }} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Gender <span>*</span></label>
                <select id="reg-gender" className="form-select" value={form.gender} onChange={e => { update('gender', e.target.value); setError(''); }}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <button className="btn btn-secondary" onClick={() => navigate('/login')}>Back</button>
                <button id="step0-next" className="btn btn-primary flex-1" onClick={handleStep0Continue}>Continue</button>
              </div>
            </div>
          )}

          {/* Step 1: Blood Info */}
          {step === 1 && (
            <div className="auth-form">
              <h3 style={{ marginBottom: 'var(--space-4)' }}>Blood & Health Information</h3>
              <div className="form-group">
                <label className="form-label">Blood Type <span>*</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)' }}>
                  {BLOOD_TYPES.map(bt => (
                    <button
                      key={bt}
                      id={`blood-type-${bt.replace('+', 'pos').replace('-', 'neg')}`}
                      type="button"
                      className={`btn ${form.blood_type === bt ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      onClick={() => update('blood_type', bt)}
                    >
                      {bt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth <span>*</span></label>
                <input id="reg-dob" type="date" className="form-input" value={form.dob} onChange={e => update('dob', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg) <span>*</span></label>
                <input id="reg-weight" type="number" className="form-input" placeholder="e.g. 65" value={form.weight} onChange={e => update('weight', e.target.value)} />
                <span className="form-hint">Minimum 50 kg required to donate</span>
              </div>
              <div className="form-group">
                <label className="form-label">Hemoglobin Level (g/dL) <span>*</span></label>
                <input id="reg-hemoglobin" type="number" step="0.1" className="form-input" placeholder="e.g. 13.5" value={form.hemoglobin_level} onChange={e => update('hemoglobin_level', e.target.value)} />
                <span className="form-hint">Minimum 12.5 g/dL required to donate</span>
              </div>
              <div className="flex gap-3 mt-4">
                <button className="btn btn-secondary" onClick={() => setStep(0)}>Back</button>
                <button id="step1-next" className="btn btn-primary flex-1" onClick={() => setStep(2)}>Continue</button>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="auth-form">
              <h3 style={{ marginBottom: 'var(--space-4)' }}>Location in Jammu & Kashmir</h3>
              <div className="form-group">
                <label className="form-label">District <span>*</span></label>
                <select
                  id="reg-district"
                  className="form-select"
                  value={form.district}
                  onChange={e => update('district', e.target.value)}
                >
                  <option value="">Select your district</option>
                  {ALL_DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <span className="form-hint">Select the J&K district you currently reside in</span>
              </div>
              <div className="form-group">
                <label className="form-label">Full Address <span>*</span></label>
                <textarea
                  id="reg-address"
                  className="form-textarea"
                  placeholder="Enter your full home address (neighbourhood, street, etc.)"
                  value={form.address}
                  onChange={e => update('address', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                <button id="step2-next" className="btn btn-primary flex-1" onClick={() => setStep(3)}>Continue</button>
              </div>
            </div>
          )}

          {/* Step 3: Consent */}
          {step === 3 && (
            <div className="auth-form">
              <h3 style={{ marginBottom: 'var(--space-4)' }}>Consent & Privacy</h3>
              <div style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)', padding: 'var(--space-4)',
                fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 'var(--space-4)'
              }}>
                <p><strong style={{ color: 'var(--text-primary)' }}>Data Use Agreement</strong></p>
                <p style={{ marginTop: 'var(--space-2)' }}>By registering, you agree that RehabNation Blood Network may:</p>
                <ul style={{ marginTop: 'var(--space-2)', paddingLeft: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <li>• Store your blood type and health information securely</li>
                  <li>• Send you blood request notifications via your preferred channel</li>
                  <li>• Share your contact details <strong>only</strong> with hospitals you explicitly accept</li>
                  <li>• Record donation outcomes for platform statistics</li>
                </ul>
                <p style={{ marginTop: 'var(--space-3)' }}>Your data is encrypted at rest. You may withdraw consent at any time.</p>
              </div>
              <label style={{ display: 'flex', gap: 'var(--space-3)', cursor: 'pointer', alignItems: 'flex-start' }}>
                <input
                  id="reg-consent"
                  type="checkbox"
                  checked={form.consent}
                  onChange={e => update('consent', e.target.checked)}
                  style={{ marginTop: 3, accentColor: 'var(--brand-red)', width: 16, height: 16 }}
                />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  I have read and agree to the data use agreement and terms of service.
                </span>
              </label>
              <div className="flex gap-3 mt-4">
                <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
                <button
                  id="reg-submit-btn"
                  className="btn btn-primary flex-1"
                  disabled={!form.consent}
                  onClick={handleDonorSubmit}
                >
                  Complete Registration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
