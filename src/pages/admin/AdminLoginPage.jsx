import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const result = login(email, password, 'admin');
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page" style={{ background: 'var(--zinc-900)' }}>
      {/* Dark admin theme overlay */}
      <div className="auth-bg-pattern" style={{ opacity: 0.05, backgroundImage: 'radial-gradient(var(--zinc-700) 1px, transparent 0)' }} />
      <div className="auth-panel">
        <div className="auth-logo" style={{ marginBottom: 'var(--space-6)' }}>
          <img src="/logo.png" alt="RehabNation Blood Network" className="auth-logo-img" style={{ filter: 'brightness(0.95) contrast(1.05)' }} />
        </div>

        <div className="auth-card animate-slideUp" style={{ background: '#ffffff', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--zinc-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-2)' }}>
            <div style={{ width: 34, height: 34, background: 'var(--zinc-800)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} color="#ffffff" />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--zinc-900)' }}>Admin Control Panel</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Authorize to access platform audits, stats, and portal management</p>

          {error && (
            <div id="login-error" className="alert alert-critical" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleLogin} style={{ marginTop: 'var(--space-6)' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--zinc-700)' }}>Admin Email</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="admin@rehabnation.org"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                style={{ borderColor: 'var(--zinc-300)' }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--zinc-700)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter administrator password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  style={{ paddingRight: 44, borderColor: 'var(--zinc-300)' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--zinc-500)' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button id="login-submit-btn" type="submit" className="btn w-full btn-lg" style={{ marginTop: 'var(--space-4)', background: 'var(--zinc-900)', color: '#ffffff', fontWeight: 700 }}>
              System Sign In
            </button>
          </form>

          {/* Secure Login Note */}
          <div style={{
            marginTop: 'var(--space-6)',
            padding: 'var(--space-4)',
            background: 'var(--zinc-50)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            gap: 10,
            alignItems: 'center'
          }}>
            <HelpCircle size={16} color="var(--zinc-400)" />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Authorized RehabNation administrators only. System access is actively logged and monitored.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
