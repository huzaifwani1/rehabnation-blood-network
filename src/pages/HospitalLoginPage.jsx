import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Building2, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function HospitalLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const result = login(email, password, 'hospital');
    if (result.success) {
      navigate('/hospital');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-pattern" style={{ opacity: 0.08, filter: 'hue-rotate(180deg)' }} />
      <div className="auth-panel">
        <div className="auth-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="RehabNation Blood Network" className="auth-logo-img" />
        </div>

        <div className="auth-card animate-slideUp">
          <button onClick={() => navigate('/')} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 0, color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
            <ArrowLeft size={14} /> Back to Home
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-2)' }}>
            <div style={{ width: 34, height: 34, background: 'var(--color-info-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={18} color="var(--color-info)" />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Hospital Portal</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sign in to create blood requests and coordinate matching donors</p>

          {error && (
            <div id="login-error" className="alert alert-critical" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleLogin} style={{ marginTop: 'var(--space-6)' }}>
            <div className="form-group">
              <label className="form-label">Hospital Contact Email</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="contact@hospital.org"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter portal password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  style={{ paddingRight: 44 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button id="login-submit-btn" type="submit" className="btn w-full btn-lg" style={{ marginTop: 'var(--space-4)', background: 'var(--color-info)', color: '#fff' }}>
              Hospital Sign In
            </button>
          </form>

          {/* Secure Signup Notice */}
          <div style={{
            marginTop: 'var(--space-6)',
            padding: 'var(--space-4)',
            background: 'var(--zinc-50)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start'
          }}>
            <ShieldAlert size={18} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong>Registration Notice:</strong> Partner hospital portals must be created manually by a RehabNation administrator. Self-registration is restricted to prevent unauthorized database access. If your institution requires a portal, please contact the central administrator.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
