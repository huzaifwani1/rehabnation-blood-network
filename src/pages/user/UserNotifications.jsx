import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, Droplets, Heart, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function UserNotifications() {
  const { user, notifications, requests } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const myNotifications = (notifications || [])
    .filter(n => n.donor_id === user.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const getIcon = (type) => {
    if (type === 'blood_request') return <Droplets size={18} color="var(--red-600)" />;
    if (type === 'outcome_recorded') return <Heart size={18} color="var(--color-success)" />;
    return <Bell size={18} color="var(--color-info)" />;
  };

  const getIconBg = (type) => {
    if (type === 'blood_request') return 'var(--red-50)';
    if (type === 'outcome_recorded') return 'rgba(22,163,74,0.1)';
    return 'var(--color-info-bg)';
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ margin: '0 0 4px' }}>Notifications</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>
          {myNotifications.length} notification{myNotifications.length !== 1 ? 's' : ''}
          {myNotifications.filter(n => !n.is_read).length > 0 && ` · ${myNotifications.filter(n => !n.is_read).length} unread`}
        </p>
      </div>

      {myNotifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-16) 0', color: 'var(--text-muted)' }}>
          <Bell size={48} style={{ opacity: 0.15, marginBottom: 12 }} />
          <p style={{ margin: 0, fontWeight: 600 }}>No notifications yet</p>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Blood request alerts and updates will appear here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {myNotifications.map(notif => {
            const req = notif.request_id ? requests.find(r => r.id === notif.request_id) : null;
            return (
              <div
                key={notif.id}
                style={{
                  display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  border: `1px solid ${notif.is_read ? 'var(--border-subtle)' : 'var(--red-100)'}`,
                  background: notif.is_read ? '#fff' : 'var(--red-50)',
                  cursor: 'pointer', transition: 'box-shadow 0.15s'
                }}
                onClick={() => notif.request_id && navigate('/dashboard')}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-md)',
                  background: getIconBg(notif.type),
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {getIcon(notif.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--zinc-900)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {notif.title}
                    </div>
                    {!notif.is_read && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red-600)', flexShrink: 0 }} />
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{notif.body}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatTime(notif.created_at)}</div>
                  {req && (
                    <div style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--red-600)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      View Request <ChevronRight size={12} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
