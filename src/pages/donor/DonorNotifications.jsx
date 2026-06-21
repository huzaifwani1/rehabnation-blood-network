import React, { useState } from 'react';
import { Bell, CheckCircle2, XCircle, Clock, Droplets } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UrgencyBadge, BloodBadge, StatusBadge, EmptyState } from '../../components/ui/Badges';
import { formatDistanceToNow } from 'date-fns';
import Modal from '../../components/ui/Modal';

export default function DonorNotifications() {
  const { user, notifications, requests, matches, respondToRequest } = useAuth();
  const [selectedReq, setSelectedReq] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [response, setResponse] = useState(null); // 'accepted' | 'declined'

  const donorId = user?.donor_id || user?.id;
  const myNotifications = notifications.filter(n => n.donor_id === donorId);
  const myMatches = matches.filter(m => m.donor_id === donorId);
  
  const unreadNotifs = myNotifications.filter(n => !n.is_read);

  const handleOpen = (notif) => {
    const req = requests.find(r => r.id === notif.request_id);
    // Mark as read in localStorage notifications if needed
    // In our context we don't have a direct markAsRead mutator, but we can simulate locally or implement it
    setSelectedReq({ ...req, notif_id: notif.id });
    setModalOpen(true);
    notif.is_read = true; // Mutate locally (Vite/React will re-render if we synchronize state or just leave it)
  };

  const handleRespond = (resp) => {
    const match = myMatches.find(m => m.request_id === selectedReq?.id);
    if (match) {
      respondToRequest(match.id, resp === 'accepted' ? 'available' : 'unavailable');
    }
    setResponse(resp);
    setTimeout(() => {
      setModalOpen(false);
      setResponse(null);
    }, 1500);
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Notifications</h1>
          <p>{unreadNotifs.length > 0 ? `${unreadNotifs.length} unread alerts` : 'All caught up!'}</p>
        </div>
      </div>

      {myNotifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={28} color="var(--text-muted)" />}
          title="No notifications yet"
          description="You'll be notified here when you're matched to a blood request."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {myNotifications.map(notif => {
            const req = requests.find(r => r.id === notif.request_id);
            const match = myMatches.find(m => m.request_id === notif.request_id);
            const resp = match && match.response !== 'pending' ? match.response : null;

            return (
              <div
                key={notif.id}
                id={`notif-${notif.id}`}
                className={`card ${!notif.is_read ? 'unread' : ''}`}
                style={{
                  cursor: req && !resp ? 'pointer' : 'default',
                  borderColor: !notif.is_read ? 'rgba(232,39,75,0.2)' : undefined,
                  background: !notif.is_read ? 'rgba(232,39,75,0.03)' : undefined,
                }}
                onClick={() => req && !resp && handleOpen(notif)}
              >
                <div className="flex items-start gap-4">
                  <div className="notif-icon" style={{
                    background: notif.type === 'blood_request' ? 'var(--brand-red-muted)' : 'var(--success-bg)',
                    width: 40, height: 40, borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {notif.type === 'blood_request'
                      ? <Droplets size={18} color="var(--brand-red-light)" />
                      : <CheckCircle2 size={18} color="var(--success)" />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3" style={{ marginBottom: 4 }}>
                      <h4 style={{ fontSize: '0.9375rem' }}>{notif.title}</h4>
                      <div className="flex items-center gap-2">
                        {!notif.is_read && (
                          <div style={{ width: 8, height: 8, background: 'var(--brand-red)', borderRadius: '50%' }} />
                        )}
                        <span className="text-xs text-muted">
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>{notif.body}</p>
                    {req && (
                      <div className="flex items-center gap-3 mt-3">
                        <BloodBadge type={req.blood_type} />
                        <UrgencyBadge urgency={req.urgency} />
                        {resp && <StatusBadge status={resp} />}
                      </div>
                    )}
                  </div>
                  {req && !resp && (
                    <div style={{ flexShrink: 0, fontSize: '0.8125rem', color: 'var(--brand-red-light)', fontWeight: 500 }}>
                      Respond →
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Request detail modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setResponse(null); }}
        title="Blood Request Details"
        size="lg"
      >
        {selectedReq && (
          response ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: response === 'accepted' ? 'var(--success-bg)' : 'var(--bg-hover)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto var(--space-4)'
              }}>
                {response === 'accepted'
                  ? <CheckCircle2 size={28} color="var(--success)" />
                  : <XCircle size={28} color="var(--text-muted)" />
                }
              </div>
              <h3>{response === 'accepted' ? 'Thank you! You\'re confirmed.' : 'Response recorded.'}</h3>
              {response === 'accepted' && (
                <p style={{ marginTop: 'var(--space-3)' }}>
                  The hospital has been notified and can now access your contact details to coordinate donation.
                </p>
              )}
            </div>
          ) : (
            <div>
              {selectedReq.urgency === 'critical' && (
                <div className="alert alert-critical" style={{ marginBottom: 'var(--space-5)' }}>
                  <Droplets size={16} />
                  <span><strong>CRITICAL</strong> — This is an emergency request. Immediate response needed.</span>
                </div>
              )}
              <div className="flex items-center gap-3 mb-6">
                <BloodBadge type={selectedReq.blood_type} />
                <UrgencyBadge urgency={selectedReq.urgency} />
                <span className="badge badge-neutral">{selectedReq.units_needed - selectedReq.units_fulfilled} unit(s) needed</span>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Hospital', value: selectedReq.hospital_name },
                  { label: 'Location', value: selectedReq.city || 'Lagos' },
                  { label: 'Units Required', value: `${selectedReq.units_needed} (${selectedReq.units_fulfilled} fulfilled)` },
                  { label: 'Respond By', value: new Date(selectedReq.response_deadline).toLocaleString() },
                  { label: 'Notes', value: selectedReq.notes },
                ].map(item => (
                  <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12 }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="alert alert-info" style={{ marginTop: 'var(--space-5)' }}>
                <Droplets size={15} />
                <span style={{ fontSize: '0.8125rem' }}>Hospital contact details will be revealed only after you accept this request.</span>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  id="respond-available-btn"
                  className="btn btn-success flex-1"
                  onClick={() => handleRespond('accepted')}
                >
                  <CheckCircle2 size={16} />
                  I'm Available
                </button>
                <button
                  id="respond-unavailable-btn"
                  className="btn btn-secondary"
                  onClick={() => handleRespond('declined')}
                >
                  <XCircle size={16} />
                  Not Available
                </button>
              </div>
            </div>
          )
        )}
      </Modal>
    </div>
  );
}
