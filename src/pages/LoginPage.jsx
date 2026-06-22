import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Eye, EyeOff, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const result = login(email, password, role);
    if (result.success) {
      if (role === 'user') {
        navigate('/dashboard');
      } else if (role === 'admin') {
        const { hostname, port } = window.location;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          window.location.href = `http://admin.localhost:${port || '5174'}/`;
        } else if (hostname.includes('rhfi.org.in')) {
          window.location.href = 'http://admin.rhfi.org.in';
        } else {
          window.location.href = '/admin-panel';
        }
      }
    } else {
      setError(result.error);
    }
  };

  const roles = [
    { value: 'user',  label: 'User Portal',  icon: User,   color: 'var(--red-600)' },
    { value: 'admin', label: 'Admin Portal', icon: Shield, color: 'var(--color-warning)' },
  ];

  return (
    <div className="auth-page">
      <div className="auth-bg-pattern" />
      <div className="auth-panel">
        <div className="auth-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="RehabNation Blood Network" className="auth-logo-img" />
        </div>

        <div className="auth-card animate-slideUp">
          <h2>Welcome back</h2>
          <p>Sign in to access the RehabNation Blood Network</p>

          {error && (
            <div id="login-error" className="alert alert-critical" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
              <span>{error}</span>
            </div>
          )}

          {/* Role selector */}
          <div className="role-selector" style={{ marginBottom: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
            {roles.map(r => {
              const Icon = r.icon;
              return (
                <div
                  key={r.value}
                  className={`role-option ${role === r.value ? 'selected' : ''}`}
                  onClick={() => { setRole(r.value); setError(''); }}
                  id={`role-option-${r.value}`}
                >
                  <div className="role-option-icon" style={{ background: role === r.value ? `${r.color}18` : 'var(--zinc-100)' }}>
                     <Icon size={18} color={role === r.value ? r.color : 'var(--zinc-400)'} />
                  </div>
                  <span className="role-option-label">{r.label}</span>
                </div>
              );
            })}
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
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
            Don't have an account?{' '}
            <a onClick={() => navigate('/register')} style={{ cursor: 'pointer', color: 'var(--red-600)', fontWeight: 600 }}>Register here</a>
          </div>
        </div>
      </div>
    </div>
  );
}
