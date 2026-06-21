import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Mail, Phone, MapPin, Clock, Send, Check } from 'lucide-react';

export default function ContactPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 4000);
  };

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
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
              lineHeight: 1.2
            }}>RehabNation</div>
            <div style={{
              fontSize: 10, color: 'var(--red-600)', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)'
            }}>Blood Network</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--zinc-600)', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/')}>Home</span>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>Sign In</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ background: 'var(--beige-100)', padding: 'var(--space-20) var(--space-6)', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <span className="hero-eyebrow" style={{ display: 'inline-flex', margin: '0 auto var(--space-4)' }}>
            <span className="hero-eyebrow-dot" /> Get in Touch
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(2rem, 5vw, 3.25rem)', marginBottom: 'var(--space-4)', color: 'var(--zinc-950)' }}>
            We'd Love to <strong style={{ fontWeight: 700, color: 'var(--red-600)' }}>Hear From You</strong>
          </h1>
          <p style={{ color: 'var(--zinc-500)', fontSize: '1.125rem', maxWidth: 600, margin: '0 auto' }}>
            Have questions about blood donation camps, hospital partnerships, or need emergency assistance? Reach out to us.
          </p>
        </div>
      </section>

      {/* Content Form & Sidebar info */}
      <section style={{ padding: 'var(--space-16) var(--space-6)', background: '#ffffff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-12)' }}>
          
          {/* Contact Details */}
          <div>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 300, marginBottom: 'var(--space-6)', color: 'var(--zinc-950)' }}>
              Contact <strong style={{ fontWeight: 700 }}>Information</strong>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              
              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <div style={{ width: 44, height: 44, background: 'var(--red-50)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={20} color="var(--red-600)" />
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, color: 'var(--zinc-900)', marginBottom: 4 }}>Our Headquarters</h4>
                  <p style={{ color: 'var(--zinc-500)', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                    Healthcare Foundation of India (RehabNation)<br />
                    15, Lal Bahadur Shastri Marg, Sector 4,<br />
                    New Delhi, India
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <div style={{ width: 44, height: 44, background: 'var(--red-50)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={20} color="var(--red-600)" />
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, color: 'var(--zinc-900)', marginBottom: 4 }}>Emergency Helpline</h4>
                  <p style={{ color: 'var(--zinc-500)', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                    Helpline: +91 11 4050 6070<br />
                    Toll-Free: 1800-120-4560 (24/7 Support)
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <div style={{ width: 44, height: 44, background: 'var(--red-50)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={20} color="var(--red-600)" />
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, color: 'var(--zinc-900)', marginBottom: 4 }}>Email Support</h4>
                  <p style={{ color: 'var(--zinc-500)', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                    General: info@rehabnation.org<br />
                    Blood Queries: bloodnet@rehabnation.org
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <div style={{ width: 44, height: 44, background: 'var(--red-50)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={20} color="var(--red-600)" />
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, color: 'var(--zinc-900)', marginBottom: 4 }}>Operating Hours</h4>
                  <p style={{ color: 'var(--zinc-500)', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                    Monday – Saturday: 9:00 AM – 6:00 PM IST<br />
                    Emergency Support: Open 24/7
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Form */}
          <div className="card" style={{ padding: 'var(--space-8)' }}>
            <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>Send us a Message</h3>
            
            {submitted ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
                <div style={{ width: 56, height: 56, background: 'var(--color-success-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
                  <Check size={24} color="var(--color-success)" />
                </div>
                <h4 style={{ color: 'var(--zinc-900)', marginBottom: 8 }}>Message Sent Successfully!</h4>
                <p style={{ color: 'var(--zinc-500)', fontSize: '0.875rem' }}>We will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Full Name <span>*</span></label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    className="form-input"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address <span>*</span></label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    className="form-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    id="contact-subject"
                    type="text"
                    className="form-input"
                    placeholder="What is this regarding?"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Message <span>*</span></label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    className="form-textarea"
                    placeholder="Write your message here..."
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                  />
                </div>
                <button id="contact-submit-btn" type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 'var(--space-2)' }}>
                  <Send size={14} /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
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
        <div className="flex gap-6">
          {['Privacy Policy', 'Terms of Use'].map(l => (
            <span key={l} style={{ fontSize: 'var(--text-sm)', color: 'var(--zinc-400)', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
