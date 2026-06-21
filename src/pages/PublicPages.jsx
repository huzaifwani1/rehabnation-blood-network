import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, ShieldCheck, HeartHandshake, PhoneCall, ArrowLeft, Info, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function PublicFindBlood() {
  const navigate = useNavigate();
  const { users } = useAuth();
  
  // Calculate aggregate donor stats safely
  const donorList = users.filter(u => u.role === 'donor');
  const bloodGroupsCount = donorList.reduce((acc, curr) => {
    acc[curr.blood_type] = (acc[curr.blood_type] || 0) + 1;
    return acc;
  }, {});

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="landing" style={{ minHeight: '100vh', background: '#fff' }}>
      <nav className="landing-nav">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={14} /> Back to Home
        </button>
      </nav>

      <div style={{ maxWidth: 900, margin: 'var(--space-12) auto', padding: '0 var(--space-6)' }} className="animate-slideUp">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>Find Blood compatibility</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: 'var(--space-8)' }}>
          Review our voluntary donor distribution across states and compatible donor types.
        </p>

        {/* Informational Alert */}
        <div style={{
          padding: 'var(--space-5)',
          background: 'var(--color-info-bg)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(0,122,255,0.1)',
          display: 'flex',
          gap: 12,
          marginBottom: 'var(--space-8)',
          alignItems: 'flex-start'
        }}>
          <Info size={20} color="var(--color-info)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong style={{ color: 'var(--zinc-900)' }}>Secure Protocol Notice:</strong>
            <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              To protect donor privacy and prevent data mining, RehabNation does not expose the active names, phone numbers, or locations of donors publicly. Direct blood requests are initiated strictly by partner hospitals. If you are experiencing a medical emergency, please ask your admitting hospital's medical team to log in and issue a direct request.
            </p>
          </div>
        </div>

        {/* Donor counts */}
        <h3 style={{ marginBottom: 'var(--space-4)' }}>Available Donor Network Stats</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12, marginBottom: 'var(--space-8)' }}>
          {bloodTypes.map(type => (
            <div key={type} className="card" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--red-600)' }}>{type}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '8px 0 4px', color: 'var(--text-primary)' }}>
                {bloodGroupsCount[type] || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>registered</div>
            </div>
          ))}
        </div>

        {/* Compatibility table */}
        <h3 style={{ marginBottom: 'var(--space-4)' }}>Blood Compatibility Guide</h3>
        <div className="table-wrap" style={{ marginBottom: 'var(--space-8)' }}>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Patient Blood Type</th>
                <th>Compatible Donor Types</th>
              </tr>
            </thead>
            <tbody>
              {[
                { type: 'A+', donors: 'A+, A-, O+, O-' },
                { type: 'A-', donors: 'A-, O-' },
                { type: 'B+', donors: 'B+, B-, O+, O-' },
                { type: 'B-', donors: 'B-, O-' },
                { type: 'AB+', donors: 'All types (Universal Recipient)' },
                { type: 'AB-', donors: 'A-, B-, AB-, O-' },
                { type: 'O+', donors: 'O+, O-' },
                { type: 'O-', donors: 'O- (Universal Donor)' },
              ].map(row => (
                <tr key={row.type}>
                  <td style={{ fontWeight: 700, color: 'var(--red-600)' }}>{row.type}</td>
                  <td>{row.donors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function PublicEmergencyRequest() {
  const navigate = useNavigate();

  return (
    <div className="landing" style={{ minHeight: '100vh', background: '#fff' }}>
      <nav className="landing-nav">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={14} /> Back to Home
        </button>
      </nav>

      <div style={{ maxWidth: 800, margin: 'var(--space-12) auto', padding: '0 var(--space-6)' }} className="animate-slideUp">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>Emergency Request Dispatch</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: 'var(--space-8)' }}>
          How the RehabNation real-time emergency dispatch matches blood instantly.
        </p>

        <div style={{ display: 'grid', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          {[
            {
              step: '1',
              title: 'Verification & Account Setup',
              desc: 'Hospitals request access from RehabNation. An administrator registers the hospital account and issues portal credentials securely. Self-registration is disabled to enforce hospital audit verification.',
              icon: <ShieldCheck size={20} color="var(--color-info)" />
            },
            {
              step: '2',
              title: 'Creating an Emergency Request',
              desc: 'Authorized hospital staff logs in and submits a request specifying the patient\'s blood type, location, urgency tier (Critical, Urgent, or Standard), and response deadline.',
              icon: <PhoneCall size={20} color="var(--color-warning)" />
            },
            {
              step: '3',
              title: 'Instant Multi-Channel Dispatch',
              desc: 'RehabNation\'s match engine searches the database for nearby, verified, available, and compatible donors. It automatically triggers real-time dashboard notifications to the compatible matches.',
              icon: <Droplets size={20} color="var(--red-600)" />
            },
            {
              step: '4',
              title: 'Donor Confirmation & Secure Share',
              desc: 'Donors tap "Available" to accept. The hospital portal instantly receives their confirmation and displays their contact info. If a donor declines or is silent, their identity remains locked and private.',
              icon: <HeartHandshake size={20} color="var(--color-success)" />
            }
          ].map(item => (
            <div key={item.step} className="card" style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-5)' }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%', background: 'var(--zinc-100)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {item.icon}
              </div>
              <div>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.0625rem', fontWeight: 700 }}>
                  Step {item.step}: {item.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
