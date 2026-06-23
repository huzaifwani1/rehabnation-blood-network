import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const result = login(email, password, 'user');
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('Password recovery information has been sent to your registered email/phone.');
  };

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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ margin: 0 }}>Password</label>
                <a 
                  href="#forgot" 
                  onClick={handleForgotPassword} 
                  style={{ color: 'var(--red-600)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}
                  id="forgot-pwd-link"
                >
                  Forgot Password?
                </a>
              </div>
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
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button id="login-submit-btn" type="submit" className="btn btn-primary w-full btn-lg" style={{ marginTop: 'var(--space-6)' }}>
              Sign In
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account?{' '}
            <a onClick={() => navigate('/register')} style={{ cursor: 'pointer', color: 'var(--red-600)', fontWeight: 600 }} id="create-account-link">Create Account</a>
          </div>
        </div>
      </div>
    </div>
  );
}
