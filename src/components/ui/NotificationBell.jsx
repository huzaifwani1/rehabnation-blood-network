import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Droplets } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, notifications, markNotificationAsRead, markAllNotificationsAsRead } = useAuth();

  const donorId = user?.donor_id || user?.id;
  
  const myNotifications = (user?.role === 'user' || user?.role === 'donor')
    ? notifications.filter(n => n.donor_id === donorId)
    : [];

  const unreadCount = myNotifications.filter(n => !n.is_read).length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    markAllNotificationsAsRead();
  };

  const getNotifColor = (type) => {
    if (type === 'blood_request') return 'var(--brand-red-muted)';
    if (type === 'outcome_recorded') return 'var(--success-bg)';
    return 'var(--info-bg)';
  };

  const getNotifIconColor = (type) => {
    if (type === 'blood_request') return 'var(--brand-red-light)';
    if (type === 'outcome_recorded') return 'var(--success)';
    return 'var(--info)';
  };

  return (
    <div className="notif-bell" ref={dropdownRef}>
      <button
        className="btn-icon"
        onClick={() => setOpen(!open)}
        id="notification-bell-btn"
        style={{ position: 'relative' }}
      >
        <Bell size={18} />
        {unreadCount > 0 && <span className="notif-dot" />}
      </button>

      {open && (
        <div className="notif-dropdown animate-fadeIn">
          <div className="notif-dropdown-header">
            <div>
              <h4 style={{ fontSize: '0.9375rem' }}>Notifications</h4>
              {unreadCount > 0 && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {unreadCount} unread
                </p>
              )}
            </div>
            <div className="flex gap-2 items-center">
              {unreadCount > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
                  Mark all read
                </button>
              )}
              <button className="btn-icon" onClick={() => setOpen(false)}>
                <X size={14} />
              </button>
            </div>
          </div>

          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {myNotifications.length === 0 ? (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No notifications
              </div>
            ) : (
              myNotifications.map(notif => (
                <div key={notif.id} className={`notif-item ${!notif.is_read ? 'unread' : ''}`}
                  onClick={() => !notif.is_read && markNotificationAsRead(notif.id)}>
                  <div className="notif-icon" style={{ background: getNotifColor(notif.type) }}>
                    <Droplets size={16} color={getNotifIconColor(notif.type)} />
                  </div>
                  <div className="notif-content">
                    <div className="notif-title">{notif.title}</div>
                    <div className="notif-time">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  {!notif.is_read && (
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: 'var(--brand-red)', flexShrink: 0, marginTop: 6
                    }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
