import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DonorLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const result = login(email, password, 'donor');
    if (result.success) {
      navigate('/donor');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-pattern" style={{ opacity: 0.08 }} />
      <div className="auth-panel">
        <div className="auth-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="RehabNation Blood Network" className="auth-logo-img" />
        </div>

        <div className="auth-card animate-slideUp">
          <button onClick={() => navigate('/')} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 0, color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
            <ArrowLeft size={14} /> Back to Home
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-2)' }}>
            <div style={{ width: 34, height: 34, background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="var(--red-600)" />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Donor Portal</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sign in to respond to blood requests or manage your profile</p>

          {error && (
            <div id="login-error" className="alert alert-critical" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleLogin} style={{ marginTop: 'var(--space-6)' }}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
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
                  placeholder="Enter your password"
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

            <button id="login-submit-btn" type="submit" className="btn btn-primary w-full btn-lg" style={{ marginTop: 'var(--space-4)' }}>
              Sign In
            </button>
          </form>

          <div className="auth-switch">
            Become a voluntary donor?{' '}
            <a onClick={() => navigate('/register')}>Register here</a>
          </div>
        </div>
      </div>
    </div>
  );
}
