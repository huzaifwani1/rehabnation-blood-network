import React from 'react';
import { Heart, Award } from 'lucide-react';
import { BloodBadge, EmptyState } from '../../components/ui/Badges';
import { useAuth } from '../../context/AuthContext';

const DONATION_HISTORY = [
  { id: 1, date: '2026-01-10', hospital: 'Lagos General Hospital', blood_type: 'O-', outcome: 'donated', units: 1 },
  { id: 2, date: '2025-09-02', hospital: 'Eko Hospital', blood_type: 'O-', outcome: 'donated', units: 1 },
  { id: 3, date: '2025-05-20', hospital: 'Lagos General Hospital', blood_type: 'O-', outcome: 'donated', units: 1 },
  { id: 4, date: '2024-12-15', hospital: 'National Orthopedic Hospital', blood_type: 'O-', outcome: 'donated', units: 1 },
];

export default function DonorHistory() {
  const { user } = useAuth();

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Donation History</h1>
          <p>Your complete contribution timeline</p>
        </div>
      </div>

      {/* Impact summary */}
      <div className="grid-3" style={{ marginBottom: 'var(--space-8)' }}>
        {[
          { label: 'Total Donations', value: user?.donation_count || 12, icon: Heart, color: 'var(--brand-red-light)', bg: 'var(--brand-red-muted)' },
          { label: 'Lives Potentially Saved', value: `~${(user?.donation_count || 12) * 3}`, icon: Award, color: 'var(--success)', bg: 'var(--success-bg)' },
          { label: 'Years Active', value: '3+', icon: Heart, color: 'var(--info)', bg: 'var(--info-bg)' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg }}>
                <Icon size={20} color={s.color} />
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      {DONATION_HISTORY.length === 0 ? (
        <EmptyState
          icon={<Heart size={28} color="var(--text-muted)" />}
          title="No donations yet"
          description="Your confirmed donations will appear here."
        />
      ) : (
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-6)' }}>Timeline</h3>
          <div className="timeline">
            {DONATION_HISTORY.map((d, i) => (
              <div key={d.id} className="timeline-item" id={`donation-${d.id}`}>
                <div className="timeline-dot" style={{ background: 'var(--success-bg)' }}>
                  <Heart size={16} color="var(--success)" />
                </div>
                <div className="timeline-content">
                  <div className="flex items-center justify-between gap-3">
                    <h4>{d.hospital}</h4>
                    <BloodBadge type={d.blood_type} />
                  </div>
                  <p style={{ marginTop: 4 }}>Successfully donated {d.units} unit(s) of blood</p>
                  <div className="timeline-date" style={{ marginTop: 6 }}>
                    {new Date(d.date).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
