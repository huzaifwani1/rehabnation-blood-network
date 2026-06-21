import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UrgencyBadge, BloodBadge, StatusBadge, EmptyState } from '../../components/ui/Badges';
import Modal from '../../components/ui/Modal';
import { Droplets } from 'lucide-react';

export default function HospitalRequests() {
  const { user, requests, matches, recordOutcome } = useAuth();
  const navigate = useNavigate();
  const [expandedReq, setExpandedReq] = useState(null);
  const [outcomeModal, setOutcomeModal] = useState(null);

  const myRequests = requests.filter(
    r => r.hospital_id === user?.hospital_id && 
         (r.status === 'open' || r.status === 'partially_fulfilled')
  );

  const acceptedDonors = (reqId) => matches.filter(
    m => m.request_id === reqId && m.response === 'available'
  );

  const handleOutcome = (matchId, outcome) => {
    recordOutcome(matchId, outcome);
    setOutcomeModal(null);
  };

  // Default to expand first active request
  React.useEffect(() => {
    if (myRequests.length > 0 && !expandedReq) {
      setExpandedReq(myRequests[0].id);
    }
  }, [myRequests, expandedReq]);

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Active Requests</h1>
          <p>Monitor donors and record outcomes</p>
        </div>
        <button id="new-request-btn" className="btn btn-primary" onClick={() => navigate('/hospital/requests/new')}>
          + New Request
        </button>
      </div>

      {myRequests.length === 0 ? (
        <EmptyState
          icon={<Droplets size={28} color="var(--text-muted)" />}
          title="No active requests"
          description="Create a blood request to start matching donors."
          action={<button className="btn btn-primary" onClick={() => navigate('/hospital/requests/new')}>Create Request</button>}
        />
      ) : (
        <div className="flex flex-col gap-5">
          {myRequests.map(req => {
            const donors = acceptedDonors(req.id);
            const isExpanded = expandedReq === req.id;
            return (
              <div key={req.id} id={`active-req-${req.id}`} className="card"
                style={{ padding: 0, overflow: 'hidden', borderColor: req.urgency === 'critical' ? 'rgba(255,45,85,0.3)' : undefined }}>
                {req.urgency === 'critical' && (
                  <div style={{ height: 3, background: 'var(--urgency-critical)', animation: 'urgencyPulse 2s ease infinite' }} />
                )}

                {/* Header */}
                <div
                  className="flex items-center gap-4"
                  style={{ padding: 'var(--space-5)', cursor: 'pointer' }}
                  onClick={() => setExpandedReq(isExpanded ? null : req.id)}
                >
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-3 mb-2">
                      <BloodBadge type={req.blood_type} />
                      <UrgencyBadge urgency={req.urgency} />
                      <StatusBadge status={req.status} />
                    </div>
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>{req.notes}</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0 var(--space-4)', borderLeft: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                      {donors.length}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Accepted</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0 var(--space-4)', borderLeft: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                      {Math.max(0, req.units_needed - req.units_fulfilled)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Remaining</div>
                  </div>
                  <div style={{ padding: '0 var(--space-2)' }}>
                    {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                  </div>
                </div>

                {/* Expanded donor list */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ padding: 'var(--space-4) var(--space-5)', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div className="flex items-center gap-2" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        <Clock size={13} />
                        Deadline: {new Date(req.response_deadline).toLocaleString()}
                        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
                          {req.matching_donor_count} compatible donors notified
                        </span>
                      </div>
                    </div>

                    {donors.length === 0 ? (
                      <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Waiting for compatible donors to accept…
                      </div>
                    ) : (
                      <div>
                        <div style={{ padding: 'var(--space-3) var(--space-5)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Accepted Donors — Contact Information
                        </div>
                        {donors.map(match => {
                          const outcome = match.outcome;
                          return (
                            <div key={match.id} id={`donor-match-${match.id}`} style={{
                              display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                              padding: 'var(--space-4) var(--space-5)',
                              borderBottom: '1px solid var(--border-subtle)'
                            }}>
                              <div className="sidebar-avatar" style={{ width: 40, height: 40 }}>
                                {match.donor_name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                                  <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{match.donor_name}</span>
                                  <BloodBadge type={match.blood_type} />
                                </div>
                                <div className="flex items-center gap-4">
                                  <a href={`tel:${match.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--info)' }}>
                                    <Phone size={12} /> {match.phone}
                                  </a>
                                  <a href={`mailto:${match.email}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                    <Mail size={12} /> {match.email}
                                  </a>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <StatusBadge status={outcome || 'pending'} />
                                {(!outcome || outcome === 'pending') && (
                                  <button
                                    id={`record-outcome-${match.id}`}
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setOutcomeModal(match)}
                                  >
                                    Record Outcome
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Outcome Modal */}
      <Modal
        isOpen={!!outcomeModal}
        onClose={() => setOutcomeModal(null)}
        title="Record Donation Outcome"
        footer={
          <button className="btn btn-ghost" onClick={() => setOutcomeModal(null)}>Cancel</button>
        }
      >
        {outcomeModal && (
          <div>
            <p style={{ marginBottom: 'var(--space-5)' }}>
              What was the outcome for <strong>{outcomeModal.donor_name}</strong>?
            </p>
            <div className="flex flex-col gap-3">
              {[
                { value: 'donated', label: '✓ Successfully Donated', cls: 'btn-success', desc: 'Donor arrived and successfully donated blood.' },
                { value: 'no_show', label: '✗ No-Show', cls: 'btn-danger', desc: 'Donor accepted but did not arrive.' },
                { value: 'cancelled', label: '⊘ Cancelled', cls: 'btn-secondary', desc: 'Donation was cancelled for another reason.' },
              ].map(o => (
                <button
                  key={o.value}
                  id={`outcome-${o.value}-btn`}
                  className={`btn ${o.cls}`}
                  style={{ justifyContent: 'flex-start', flexDirection: 'column', gap: 2, height: 'auto', padding: 'var(--space-4)' }}
                  onClick={() => handleOutcome(outcomeModal.id, o.value)}
                >
                  <span style={{ fontWeight: 700 }}>{o.label}</span>
                  <span style={{ fontSize: '0.8125rem', opacity: 0.8, fontWeight: 400 }}>{o.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
