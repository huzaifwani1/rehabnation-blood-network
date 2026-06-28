import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, ShieldCheck, Users, BarChart3, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav" style={{ justifyContent: 'space-between' }}>
        <div className="flex items-center gap-3" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="RehabNation Blood Network" className="auth-logo-img" style={{ height: 42, width: 'auto' }} />
        </div>
        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>Home</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/contact')}>Contact</button>
          {user ? (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
          ) : (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Sign In</button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Register Hospital</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: '#ffffff', padding: 0 }}>
        <div className="landing-hero" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 'var(--space-6)', minHeight: 'calc(100vh - 72px)', alignItems: 'center' }}>
          <div className="landing-hero-left animate-slideUp">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              Hospital & Blood Bank Donor Directory Management
            </div>
            <h1 className="hero-title" style={{ fontSize: '2.5rem', lineHeight: 1.2, margin: '16px 0' }}>
              Donor Management <br />
              <strong>Made Smart and Secure.</strong>
            </h1>
            <p className="hero-subtitle" style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
              A centralized platform for hospitals and blood banks to manage internal donor records, 
              upload directories in bulk via CSV/Excel, search local contact pools, and coordinate emergencies instantly.
            </p>
            <div className="hero-ctas" style={{ display: 'flex', gap: 12 }}>
              {user ? (
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
                    Register Hospital
                    <ArrowRight size={16} style={{ marginLeft: 8 }} />
                  </button>
                  <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login')}>
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="hero-image-wrapper animate-fadeIn" style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ padding: 32, background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-2xl)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={180} color="var(--red-600)" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: 'var(--beige-50)', padding: 'var(--space-6) 0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 var(--space-4)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 40 }}>Features for Healthcare Institutions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { title: 'Secure Donor Records', desc: 'Maintain complete physical profile logs, historical records, and donation counts.', icon: <Users size={24} /> },
              { title: 'Excel/CSV Bulk Import', desc: 'Migrate thousands of local donor details in seconds using spreadsheet uploads.', icon: <ArrowRight size={24} /> },
              { title: 'Direct Calling', desc: 'Trigger manual emergency calls directly from donor profile cards on your dashboard.', icon: <ShieldCheck size={24} /> }
            ].map((f, i) => (
              <div className="card" key={i} style={{ padding: 'var(--space-5)' }}>
                <div style={{ color: 'var(--red-600)', marginBottom: 12 }}>{f.icon}</div>
                <h4>{f.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
