import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Check, AlertCircle, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ALL_DISTRICTS } from '../data/mockData';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registerUser } = useAuth();
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    license_number: '',
    district: '',
    address: '',
    password: '',
    confirm_password: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) return setError('Organization name is required');
    if (!form.license_number.trim()) return setError('License number is required');
    if (!form.email.trim()) return setError('Email address is required');
    if (!form.phone.trim()) return setError('Phone number is required');
    if (!form.district) return setError('District is required');
    if (!form.address.trim()) return setError('Physical address is required');
    
    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters long');
    }
    if (form.password !== form.confirm_password) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const result = await registerUser({
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone,
        license_number: form.license_number,
        district: form.district,
        address: form.address
      });

      setLoading(false);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'An unexpected error occurred');
    }
  };

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-bg-pattern" />
        <div className="auth-panel">
          <div className="auth-card animate-slideUp" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(22, 163, 74, 0.1)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-5)' }}>
              <Check size={32} />
            </div>
            <h2>Registration Submitted!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.92rem', lineHeight: '1.5' }}>
              Thank you for registering <strong>{form.name}</strong> on the RehabNation Blood Network. 
              Your organization account is pending approval by the RehabNation Super Admin. 
              You will be able to log in once your license and registration details have been verified.
            </p>
            <button className="btn btn-primary w-full" onClick={() => navigate('/login')}>
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-pattern" />
      <div className="auth-panel" style={{ maxWidth: 650 }}>
        <div className="auth-logo" style={{ cursor: 'pointer', marginBottom: 20 }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="RehabNation Blood Network" className="auth-logo-img" />
        </div>

        <div className="auth-card animate-slideUp" style={{ padding: 'var(--space-5) var(--space-6)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', margin: '0 0 4px' }}>
            <Building2 size={24} color="var(--red-600)" /> Hospital Registration
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '0 0 var(--space-5)' }}>Register your organization to manage local blood donors</p>

          {error && (
            <div className="alert alert-critical" style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} /> <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Hospital/Blood Bank Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. City General Hospital"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Registration License Number *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. HSP-78321-AB"
                  value={form.license_number}
                  onChange={e => update('license_number', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Official Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="info@hospital.org"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Phone Number *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+234..."
                  value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">District *</label>
                <select
                  className="form-input"
                  value={form.district}
                  onChange={e => update('district', e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Select District</option>
                  {ALL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Physical Address *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="123 Hospital Road, Suite A"
                  value={form.address}
                  onChange={e => update('address', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Re-enter password"
                  value={form.confirm_password}
                  onChange={e => update('confirm_password', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" style={{ marginTop: 8 }} disabled={loading}>
              {loading ? 'Submitting Registration...' : 'Register Organization'}
            </button>
          </form>

          <div className="auth-switch" style={{ marginTop: 20 }}>
            Already have an organization account?{' '}
            <a onClick={() => navigate('/login')} style={{ cursor: 'pointer', color: 'var(--red-600)', fontWeight: 600 }}>Sign In</a>
          </div>
        </div>
      </div>
    </div>
  );
}
