import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Droplets, Zap, Shield, Users, Heart, Clock,
  ArrowRight, ChevronRight, Search, Bell, CheckCircle, MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── Utility: format live stat numbers ──────────────────────────────────────
function formatStat(n) {
  if (n === 0) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, users, requests } = useAuth();

  // Dynamic stats derived from live database
  const registeredMembers = (users || []).filter(u => u.role === 'user').length;
  const verifiedDonors    = (users || []).filter(u => u.role === 'user' && u.verification_status === 'camp_verified').length;
  const fulfilled         = (requests || []).filter(r => r.status === 'fulfilled').length;

  const getAdminUrl = () => {
    const { hostname, port } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://admin.localhost:${port || '5174'}/`;
    }
    if (hostname.includes('rhfi.org.in')) return 'http://admin.rhfi.org.in';
    return '/admin-panel';
  };

  return (
    <div className="landing">
      {/* ── Navbar ── */}
      <nav className="landing-nav" style={{ justifyContent: 'space-between' }}>
        <div className="flex items-center gap-3" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="RehabNation Blood Network" className="auth-logo-img" style={{ height: 42, width: 'auto' }} />
        </div>
        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>Home</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/find-blood')}>Find Blood</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/emergency-request')}>Emergency Feed</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/register')}>Become a Donor</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/contact')}>Contact</button>
          {user ? (
            <button className="btn btn-primary btn-sm" id="nav-dashboard-btn" onClick={() => navigate('/dashboard')}>
              My Dashboard
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" id="nav-login-btn" onClick={() => navigate('/login')}>
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: '#ffffff', padding: 0 }}>
        <div className="landing-hero">
          {/* Left: Copy */}
          <div className="landing-hero-left animate-slideUp">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              Emergency Blood Matching · Real-Time
            </div>
            <h1 className="hero-title">
              Connecting Blood<br />Donors With{' '}
              <strong>Lives In Need.</strong>
            </h1>
            <p className="hero-subtitle">
              Join RehabNation Blood Network — one account to donate blood,
              request blood, find donors, and respond to emergencies in your community.
            </p>
            <div className="hero-ctas">
              <button
                id="hero-find-blood-btn"
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/find-blood')}
              >
                <Search size={16} />
                Find Blood Now
              </button>
              <button
                id="hero-register-btn"
                className="btn btn-secondary btn-lg"
                onClick={() => navigate('/register')}
              >
                Become a Donor
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="hero-image-wrapper animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="hero-image-inner">
              <div style={{
                width: 100, height: 100,
                background: '#ffffff',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-lg)',
              }}>
                <Droplets size={48} color="var(--red-600)" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)',
                  fontWeight: 800, color: 'var(--red-600)', letterSpacing: 'var(--tracking-tight)'
                }}>O−</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--zinc-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', marginTop: 4 }}>
                  Universal Donor
                </div>
              </div>
              {/* Floating status chip */}
              <div style={{
                position: 'absolute', bottom: 32, left: 32, right: 32,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(12px)',
                border: 'var(--border-base)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4) var(--space-5)',
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                boxShadow: 'var(--shadow-md)',
              }}>
                <div style={{
                  width: 36, height: 36, background: 'var(--red-50)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Zap size={16} color="var(--red-600)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--zinc-900)' }}>
                    4 donors matched
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--zinc-400)' }}>
                    Lagos General · O− · Critical
                  </div>
                </div>
                <div style={{
                  marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--color-success)', boxShadow: '0 0 0 3px rgba(22,163,74,0.2)'
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats row — 100% database-driven ── */}
        <div style={{ padding: '0 var(--space-10)', maxWidth: 1200, margin: '0 auto' }}>
          <div className="hero-stats-grid">
            {[
              { num: formatStat(registeredMembers), unit: '', label: 'Registered Members' },
              { num: formatStat(verifiedDonors),    unit: '', label: 'Verified Donors' },
              { num: formatStat(fulfilled),          unit: '', label: 'Blood Requests Fulfilled' },
              { num: '24/7',                         unit: '', label: 'Emergency Support' },
            ].map((s, i) => (
              <div key={i} className="hero-stat-cell">
                <div className="hero-stat-num">
                  {s.num}<span>{s.unit}</span>
                </div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ background: 'var(--zinc-50)', padding: 'var(--space-24) var(--space-10)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <div className="section-label" style={{ justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
              How It Works
            </div>
            <h2 style={{ fontWeight: 300, marginBottom: 'var(--space-3)' }}>
              One Account, <strong style={{ fontWeight: 700, color: 'var(--red-600)' }}>All Functions</strong>
            </h2>
            <p style={{ color: 'var(--zinc-500)', maxWidth: 520, margin: '0 auto' }}>
              Every registered member can donate, request blood, and respond to emergency calls — all in one place.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-5)' }}>
            {[
              {
                step: '1',
                icon: <Users size={22} color="var(--red-600)" />,
                iconBg: 'var(--red-50)',
                title: 'Register & Join',
                desc: 'Create a single unified account with your blood group, health info, and location. Verification unlocks all features.',
              },
              {
                step: '2',
                icon: <Search size={22} color="var(--color-info)" />,
                iconBg: 'var(--color-info-bg)',
                title: 'Find or Request Blood',
                desc: 'Search for compatible available donors nearby, or create an emergency request to instantly notify matching members.',
              },
              {
                step: '3',
                icon: <Bell size={22} color="var(--color-warning)" />,
                iconBg: 'var(--color-warning-bg)',
                title: 'Respond to Emergencies',
                desc: 'Get real-time notifications when your blood type is needed. Accept or decline — your details stay private unless you accept.',
              },
              {
                step: '4',
                icon: <Heart size={22} color="var(--color-success)" />,
                iconBg: 'rgba(22,163,74,0.1)',
                title: 'Connect & Save Lives',
                desc: 'Once you accept, direct contact is established. Your donation history and eligibility update automatically.',
              },
            ].map((item, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-5)', border: '1px solid var(--border-subtle)',
                position: 'relative', overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute', top: 16, right: 16,
                  fontSize: '3rem', fontWeight: 900, color: 'var(--zinc-100)', lineHeight: 1
                }}>
                  {item.step}
                </div>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-lg)',
                  background: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 'var(--space-4)'
                }}>
                  {item.icon}
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem' }}>{item.title}</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform Portals ── */}
      <section className="demo-section">
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div className="section-label" style={{ justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
            Get Started
          </div>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 300, marginBottom: 'var(--space-3)' }}>
            Join the Network
          </h2>
          <p style={{ marginBottom: 'var(--space-2)', color: 'var(--zinc-500)' }}>
            Register as a community member to get started.
          </p>
        </div>
        <div className="demo-cards" style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
          {[
            {
              id: 'portal-register-btn',
              icon: <Heart size={24} color="var(--red-600)" />,
              iconBg: 'var(--red-50)',
              title: 'Join as a Member',
              sub: 'Register, donate, and request blood',
              action: () => navigate('/register'),
            },
            {
              id: 'portal-login-btn',
              icon: <Users size={24} color="var(--color-info)" />,
              iconBg: 'var(--color-info-bg)',
              title: 'Member Sign In',
              sub: 'Access your dashboard and requests',
              action: () => navigate('/login'),
            },
          ].map(card => (
            <div
              key={card.id}
              id={card.id}
              className="demo-card"
              onClick={card.action}
              style={{ maxWidth: 300, flex: 1, minWidth: 240 }}
            >
              <div className="demo-card-icon" style={{ background: card.iconBg }}>
                {card.icon}
              </div>
              <div className="demo-card-title">{card.title}</div>
              <div className="demo-card-sub">{card.sub}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--red-600)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                Get Started <ChevronRight size={12} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: 'var(--space-24) var(--space-10)', background: '#ffffff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="features-section-header">
            <div className="section-label" style={{ justifyContent: 'center' }}>
              Platform Features
            </div>
            <h2 style={{ fontWeight: 300, marginBottom: 'var(--space-3)' }}>
              Built for <strong style={{ fontWeight: 700, color: 'var(--red-600)' }}>Emergencies</strong>
            </h2>
            <p>Every feature shortens the time between blood shortage and a matched donor.</p>
          </div>
          <div className="features-grid">
            {[
              {
                icon: <Zap size={22} color="var(--amber-600)" />,
                iconBg: 'var(--color-warning-bg)',
                title: 'Real-Time Matching',
                desc: 'Blood compatibility computed instantly. Matching donors receive dashboard alerts within seconds of a request.',
              },
              {
                icon: <Shield size={22} color="var(--color-info)" />,
                iconBg: 'var(--color-info-bg)',
                title: 'Privacy by Design',
                desc: 'Donor contact details revealed only after the donor explicitly accepts a request. No browsing, no leakage.',
              },
              {
                icon: <Clock size={22} color="var(--red-600)" />,
                iconBg: 'var(--red-50)',
                title: 'Urgency Tiers',
                desc: 'Critical requests alert matching donors simultaneously. Smart notification limits prevent donor fatigue.',
              },
              {
                icon: <Users size={22} color="var(--color-success)" />,
                iconBg: 'rgba(22,163,74,0.1)',
                title: 'Smart Donor Pool',
                desc: 'Enforces 56-day donation cooldowns, availability checks, weight and Hb eligibility criteria.',
              },
              {
                icon: <Search size={22} color="var(--red-600)" />,
                iconBg: 'var(--red-50)',
                title: 'Public Find Blood',
                desc: 'Anyone can search for available donors by blood group, district, and city with direct call buttons.',
              },
              {
                icon: <CheckCircle size={22} color="var(--color-success)" />,
                iconBg: 'rgba(22,163,74,0.1)',
                title: 'Outcome Tracking',
                desc: 'Record donation outcomes. Donor profiles update automatically with accurate donation history metrics.',
              },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon" style={{ background: f.iconBg, border: 'none' }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--red-600) 0%, #9b2335 100%)',
        padding: 'var(--space-16) var(--space-10)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Droplets size={40} color="rgba(255,255,255,0.8)" style={{ marginBottom: 12 }} />
          <h2 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: 12 }}>
            Every Donation Saves a Life
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 'var(--space-7)', fontSize: '1rem' }}>
            Join thousands of community members already part of the RehabNation Blood Network.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              id="cta-register-btn"
              className="btn btn-lg"
              style={{ background: '#fff', color: 'var(--red-600)', fontWeight: 700 }}
              onClick={() => navigate('/register')}
            >
              <Heart size={16} /> Become a Donor
            </button>
            <button
              id="cta-find-blood-btn"
              className="btn btn-lg"
              style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.5)' }}
              onClick={() => navigate('/find-blood')}
            >
              Find Blood <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: 'var(--border-light)', background: 'var(--zinc-50)',
        padding: 'var(--space-8) var(--space-10)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 'var(--space-4)',
      }}>
        <div className="flex items-center gap-2">
          <Droplets size={16} color="var(--red-600)" />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--zinc-400)' }}>
            © 2026 RehabNation Blood Network. All rights reserved.
          </span>
        </div>
        <div className="flex gap-6" style={{ marginLeft: 'auto' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--zinc-400)', cursor: 'pointer' }} onClick={() => navigate('/contact')}>Contact Us</span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--zinc-400)', cursor: 'pointer' }} onClick={() => navigate('/find-blood')}>Find Blood</span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--zinc-400)', cursor: 'pointer' }} onClick={() => navigate('/emergency-request')}>Emergency Feed</span>
        </div>
      </footer>
    </div>
  );
}
