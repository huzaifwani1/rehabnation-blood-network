import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ScrollText, ShieldCheck, User, Building2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ACTION_META = {
  CREATE_REQUEST:     { color: 'var(--info)', bg: 'var(--info-bg)',        label: 'Created Request' },
  RESPOND_AVAILABLE:  { color: 'var(--success)', bg: 'var(--success-bg)', label: 'Responded Available' },
  RESPOND_UNAVAILABLE:{ color: 'var(--text-secondary)', bg: 'var(--bg-hover)', label: 'Responded Unavailable' },
  APPROVE_HOSPITAL:   { color: 'var(--success)', bg: 'var(--success-bg)', label: 'Approved Hospital' },
  SUSPEND_HOSPITAL:   { color: 'var(--brand-red-light)', bg: 'var(--brand-red-muted)', label: 'Suspended Hospital' },
  CREATE_HOSPITAL:    { color: 'var(--info)', bg: 'var(--info-bg)',        label: 'Created Hospital Account' },
  UPDATE_HOSPITAL:    { color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', label: 'Updated Hospital Account' },
  FLAG_DONOR:         { color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', label: 'Flagged Donor' },
  UNFLAG_DONOR:       { color: 'var(--success)', bg: 'var(--success-bg)', label: 'Unflagged Donor' },
  VERIFY_DONOR:       { color: 'var(--success)', bg: 'var(--success-bg)', label: 'Verified Donor' },
  REVOKE_VERIFICATION:{ color: 'var(--text-secondary)', bg: 'var(--bg-hover)', label: 'Revoked Verification' },
  RECORD_OUTCOME:     { color: 'var(--brand-red-light)', bg: 'var(--brand-red-muted)', label: 'Recorded Outcome' },
  LOGIN:              { color: 'var(--success)', bg: 'var(--success-bg)', label: 'User Signed In' },
  LOGOUT:             { color: 'var(--text-secondary)', bg: 'var(--bg-hover)', label: 'User Signed Out' },
  REGISTER:           { color: 'var(--info)', bg: 'var(--info-bg)',        label: 'User Registered' },
};

const ROLE_ICON = {
  donor: User,
  admin: ShieldCheck,
  hospital_staff: Building2,
  hospital: Building2,
};

export default function AdminAuditLogs() {
  const { auditLogs } = useAuth();

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Audit Logs</h1>
          <p>Immutable record of all system actions</p>
        </div>
        <div className="badge badge-warning">Read-only</div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Actor</th>
              <th>Action</th>
              <th>Target</th>
              <th>IP Address</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                  No system logs found
                </td>
              </tr>
            ) : (
              auditLogs.map(log => {
                const meta = ACTION_META[log.action] || { color: 'var(--text-secondary)', bg: 'var(--bg-hover)', label: log.action };
                const RoleIcon = ROLE_ICON[log.actor_role] || User;
                return (
                  <tr key={log.id} id={`audit-${log.id}`}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div style={{ width: 32, height: 32, background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <RoleIcon size={14} color="var(--text-muted)" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{log.actor}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{(log.actor_role || 'user').replace('_', ' ')}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color}33`, display: 'inline-block' }}>
                        {meta.label}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{log.target}</td>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.875rem' }}>{log.ip}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                      {formatDistanceToNow(new Date(log.performed_at), { addSuffix: true })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
