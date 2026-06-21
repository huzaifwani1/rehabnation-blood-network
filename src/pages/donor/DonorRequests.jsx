import React from 'react';
import { Heart, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UrgencyBadge, BloodBadge, StatusBadge, EmptyState } from '../../components/ui/Badges';
import { formatDistanceToNow } from 'date-fns';

export default function DonorRequests() {
  const { user, matches, requests, hospitals } = useAuth();

  const donorId = user?.donor_id || user?.id;
  const myMatches = matches.filter(m => m.donor_id === donorId);

  const getResponseIcon = (response) => {
    if (response === 'available') return <CheckCircle2 size={14} color="var(--success)" />;
    if (response === 'unavailable') return <XCircle size={14} color="var(--text-muted)" />;
    return <AlertCircle size={14} color="var(--warning)" />;
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Requests</h1>
          <p>All blood requests you've been matched to</p>
        </div>
      </div>

      {myMatches.length === 0 ? (
        <EmptyState
          icon={<Heart size={28} color="var(--text-muted)" />}
          title="No matched requests yet"
          description="When you're matched to a blood request, it will appear here."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {myMatches.map(match => {
            const req = requests.find(r => r.id === match.request_id);
            if (!req) return null;
            
            const hosp = hospitals?.find(h => h.id === req.hospital_id || h.name === req.hospital_name);
            const contactPhone = hosp?.primary_contact_phone || '+234-811-111-1111';
            const contactEmail = hosp?.primary_contact_email || 'contact@hospital.gov.ng';

            return (
              <div key={match.id} id={`match-${match.id}`} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <BloodBadge type={req.blood_type} />
                      <UrgencyBadge urgency={req.urgency} />
                      <StatusBadge status={req.status} />
                    </div>
                    <h4 style={{ marginBottom: 4 }}>{req.hospital_name}</h4>
                    <p style={{ fontSize: '0.875rem', margin: '0 0 var(--space-3)' }}>{req.notes}</p>

                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {getResponseIcon(match.response)}
                        <span>
                          You responded: <strong style={{ color: match.response === 'available' ? 'var(--success)' : 'var(--text-secondary)' }}>
                            {match.response === 'available' ? 'Available' : match.response === 'unavailable' ? 'Not Available' : 'No Response'}
                          </strong>
                        </span>
                      </div>
                      {match.responded_at && (
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          {formatDistanceToNow(new Date(match.responded_at), { addSuffix: true })}
                        </div>
                      )}
                    </div>

                    {/* Show hospital contact if accepted */}
                    {match.response === 'available' && (
                      <div style={{
                        marginTop: 'var(--space-4)', padding: 'var(--space-4)',
                        background: 'var(--success-bg)', borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(34,211,160,0.2)'
                      }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--success)', marginBottom: 'var(--space-2)' }}>
                          ✓ Contact Details Revealed
                        </div>
                        <div className="flex flex-col gap-1">
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>📞 {contactPhone}</span>
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>✉️ {contactEmail}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Outcome */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <StatusBadge status={match.outcome || 'pending'} />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Outcome</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
