import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="landing" style={{ minHeight: '100vh', background: 'var(--beige-50)', paddingBottom: 'var(--space-12)' }}>
      <nav className="landing-nav" style={{ justifyContent: 'space-between' }}>
        <div className="flex items-center gap-3" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="RehabNation Blood Network" style={{ height: 38, width: 'auto' }} />
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => window.history.back()} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={14} /> Back
        </button>
      </nav>

      <div style={{ maxWidth: 800, margin: 'var(--space-8) auto', padding: '0 var(--space-6)' }} className="animate-slideUp">
        <div className="card" style={{ padding: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-6)' }}>
            <div style={{ width: 44, height: 44, background: 'var(--red-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red-600)' }}>
              <Shield size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Privacy Policy</h1>
              <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '0.875rem' }}>Effective Date: June 24, 2026</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            <section>
              <h3 style={{ color: 'var(--zinc-900)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Eye size={16} color="var(--red-600)" /> 1. Information We Collect
              </h3>
              <p>RehabNation Blood Network collects information necessary to coordinate life-saving blood donations. This includes:</p>
              <ul style={{ paddingLeft: 'var(--space-5)', marginTop: 8, listStyleType: 'disc' }}>
                <li><strong>Profile Details:</strong> Full name, date of birth, gender, and weight/hemoglobin levels (to verify donation eligibility).</li>
                <li><strong>Medical Information:</strong> Blood group and last donation dates to monitor the 56-day safety cooldown.</li>
                <li><strong>Contact Information:</strong> Phone number and email address.</li>
                <li><strong>Location Information:</strong> District and address (residing in Jammu & Kashmir) to match you with nearby emergencies.</li>
              </ul>
            </section>

            <section>
              <h3 style={{ color: 'var(--zinc-900)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lock size={16} color="var(--red-600)" /> 2. How We Use Your Data
              </h3>
              <p>We use your information strictly for blood donor matching and notification delivery:</p>
              <ul style={{ paddingLeft: 'var(--space-5)', marginTop: 8, listStyleType: 'disc' }}>
                <li><strong>Emergency Matching:</strong> When an emergency blood request is submitted, our system filters available donors matching the compatible blood types and district.</li>
                <li><strong>Privacy Guard:</strong> Your contact details (phone and email) are <strong>never</strong> shared publicly. They are revealed to a request owner only after you explicitly click "I'm Available" on a notification match.</li>
                <li><strong>FCM Tokens:</strong> We register push notification tokens on your device to send critical emergency alerts when compatibility matches occur.</li>
              </ul>
            </section>

            <section>
              <h3 style={{ color: 'var(--zinc-900)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={16} color="var(--red-600)" /> 3. Data Storage and Security
              </h3>
              <p>
                All data is transmitted securely and stored in our production database hosted on MongoDB Atlas. Passwords are securely hashed using bcrypt encryption. We do not store plaintext passwords on our servers.
              </p>
            </section>

            <section>
              <h3 style={{ color: 'var(--zinc-900)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={16} color="var(--red-600)" /> 4. Data Control & Account Deletion
              </h3>
              <p>
                You retain complete control over your account. You can toggle your donation availability status on or off at any time. If you decide to remove your account, you can do so from the Settings page. This will permanently delete your user profile and cascade delete all owned requests, matches, and notifications from our database.
              </p>
            </section>

            <section style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-5)', marginTop: 'var(--space-4)' }}>
              <h3 style={{ color: 'var(--zinc-900)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={16} color="var(--red-600)" /> Contact Us
              </h3>
              <p>If you have any questions about this Privacy Policy, please contact us at:</p>
              <a href="mailto:privacy@rehabnation.org" style={{ color: 'var(--red-600)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                privacy@rehabnation.org
              </a>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
