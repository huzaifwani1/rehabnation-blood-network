import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Scale, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function TermsPage() {
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
              <FileText size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Terms & Conditions</h1>
              <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '0.875rem' }}>Effective Date: June 24, 2026</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            <section>
              <h3 style={{ color: 'var(--zinc-900)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Scale size={16} color="var(--red-600)" /> 1. User Responsibilities
              </h3>
              <p>By registering on RehabNation Blood Network, you agree to:</p>
              <ul style={{ paddingLeft: 'var(--space-5)', marginTop: 8, listStyleType: 'disc' }}>
                <li>Provide accurate, truthful, and up-to-date blood type and contact details.</li>
                <li>Verify your physical eligibility (weight above 50 kg, hemoglobin above 12.5 g/dL) before volunteering for any donation.</li>
                <li>Respect coordination protocols when contacting recipients or hospitals.</li>
              </ul>
            </section>

            <section>
              <h3 style={{ color: 'var(--zinc-900)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={16} color="var(--red-600)" /> 2. Emergency Request Policy
              </h3>
              <p>
                Emergency requests must be genuine medical requirements. Any spam, fake requests, or commercial solicitations are strictly prohibited and will lead to immediate account termination.
              </p>
            </section>

            <section>
              <h3 style={{ color: 'var(--zinc-900)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={16} color="var(--red-600)" /> 3. Liability and Donation Disclaimer
              </h3>
              <p>
                RehabNation is a voluntary coordination platform and <strong>not</strong> a medical service provider or blood bank. We do not perform medical screening on donors. The final medical screening, verification, and donation process are the sole responsibility of the certified hospital or blood transfusion center.
              </p>
              <p style={{ marginTop: 8 }}>
                RehabNation is not liable for any issues, injuries, or outcomes resulting from voluntary donations, coordination, or communication between members.
              </p>
            </section>

            <section>
              <h3 style={{ color: 'var(--zinc-900)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={16} color="var(--red-600)" /> 4. Account Suspension
              </h3>
              <p>
                We reserve the right to suspend or terminate accounts that violate our terms, provide fraudulent information, engage in abusive behavior, or fail to show up repeatedly after pledging to donate.
              </p>
            </section>

            <section style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-5)', marginTop: 'var(--space-4)' }}>
              <p>If you have any queries regarding these terms, please contact us at:</p>
              <a href="mailto:support@rehabnation.org" style={{ color: 'var(--red-600)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                support@rehabnation.org
              </a>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
