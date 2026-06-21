import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Droplets, Zap, Shield, Users, Building2,
  Heart, Clock, ArrowRight, ChevronRight, HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* ── Navbar ── */}
      <nav className="landing-nav" style={{ justifyContent: 'space-between' }}>
        {/* Brand */}
        <div className="flex items-center gap-3" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{
            width: 38, height: 38, background: 'var(--red-600)',
            borderRadius: 'var(--radius-lg)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-red)'
          }}>
            <Droplets size={18} color="#fff" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 'var(--text-sm)', color: 'var(--zinc-950)',
              letterSpacing: 'var(--tracking-tight)', lineHeight: 1.2
            }}>RehabNation</div>
            <div style={{
              fontSize: 10, color: 'var(--red-600)', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)'
            }}>Blood Network</div>
          </div>
        </div>

        {/* Navigation spec: Home, Become a Donor, Find Blood, Emergency Request, Hospital Login, Donor Login */}
        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>Home</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/register')}>Become a Donor</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/find-blood')}>Find Blood</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/emergency-request')}>Emergency Request</button>
          
          {/* Portal Logins */}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/hospital-login')}
            style={{ border: '1px solid var(--border-base)', color: 'var(--color-info)' }}
            id="nav-hospital-login-btn"
          >
            Hospital Login
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/donor-login')}
            id="nav-donor-login-btn"
          >
            Donor Login
          </button>
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
              Every Second<br />Counts. <strong>Connect.<br />Donate. Save.</strong>
            </h1>
            <p className="hero-subtitle">
              RehabNation Blood Network instantly connects verified donors
              with hospitals during emergencies — protecting privacy while
              eliminating life-threatening delays.
            </p>
            <div className="hero-ctas">
              <button
                id="hero-register-donor-btn"
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/register')}
              >
                <Heart size={16} />
                Become a Donor
              </button>
              <button
                id="hero-hospital-btn"
                className="btn btn-secondary btn-lg"
                onClick={() => navigate('/hospital-login')}
              >
                Hospital Portal
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

        {/* ── Stats row ── */}
        <div style={{ padding: '0 var(--space-10)', maxWidth: 1200, margin: '0 auto' }}>
          <div className="hero-stats-grid">
            {[
              { num: '1,284', unit: '+', label: 'Registered Donors' },
              { num: '42',    unit: '',  label: 'Partner Hospitals' },
              { num: '89',    unit: '',  label: 'Donations This Month' },
              { num: '76',    unit: '%', label: 'Fulfilment Rate' },
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

      {/* ── Platform Entries (Replaced live demo login bypass) ── */}
      <section className="demo-section">
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div className="section-label" style={{ justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
            System Portals
          </div>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 300, marginBottom: 'var(--space-3)' }}>
            Access Your Portal
          </h2>
          <p style={{ marginBottom: 'var(--space-2)', color: 'var(--zinc-500)' }}>
            Click below to sign in to your dedicated secure section.
          </p>
        </div>
        <div className="demo-cards" style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
          {[
            {
              id: 'portal-donor-btn',
              icon: <Users size={24} color="var(--red-600)" />,
              iconBg: 'var(--red-50)',
              title: 'Donor Portal',
              sub: 'Sign in / register donor account',
              url: '/donor-login',
            },
            {
              id: 'portal-hospital-btn',
              icon: <Building2 size={24} color="var(--blue-600)" />,
              iconBg: 'var(--color-info-bg)',
              title: 'Hospital Portal',
              sub: 'Requires account created by admin',
              url: '/hospital-login',
            },
            {
              id: 'portal-admin-btn',
              icon: <Shield size={24} color="var(--amber-700)" />,
              iconBg: 'var(--color-warning-bg)',
              title: 'Admin Control Panel',
              sub: 'admin.rhfi.org.in portal entry',
              url: '/admin-panel', // Local fallback or subdomain
            },
          ].map(card => (
            <div
              key={card.id}
              id={card.id}
              className="demo-card"
              onClick={() => navigate(card.url)}
              style={{ maxWidth: 300, flex: 1, minWidth: 260 }}
            >
              <div className="demo-card-icon" style={{ background: card.iconBg }}>
                {card.icon}
              </div>
              <div className="demo-card-title">{card.title}</div>
              <div className="demo-card-sub">{card.sub}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--red-600)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                Enter Portal <ChevronRight size={12} />
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
                icon: <Shield size={22} color="var(--blue-600)" />,
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
                icon: <Users size={22} color="var(--green-600)" />,
                iconBg: 'var(--color-success-bg)',
                title: 'Smart Donor Pool',
                desc: 'Enforces 56-day donation cooldowns, availability checks, and sorts donors by proximity.',
              },
              {
                icon: <Building2 size={22} color="var(--red-600)" />,
                iconBg: 'var(--red-50)',
                title: 'Hospital Onboarding',
                desc: 'Only Admin-created hospitals can access the portal and create requests. Self-registration is blocked.',
              },
              {
                icon: <Heart size={22} color="var(--red-600)" />,
                iconBg: 'var(--red-50)',
                title: 'Outcome Tracking',
                desc: 'Hospitals record donation outcomes. Donor profiles update automatically with accurate metrics.',
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

      {/* ── Footer ── */}
      <footer style={{
        borderTop: 'var(--border-light)', background: 'var(--zinc-50)',
        padding: 'var(--space-8) var(--space-10)',
        display: 'flex', alignItems: 'center', justifycontent: 'space-between',
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
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--zinc-400)', cursor: 'pointer' }} onClick={() => navigate('/admin-panel')}>System Administration</span>
        </div>
      </footer>
    </div>
  );
}
