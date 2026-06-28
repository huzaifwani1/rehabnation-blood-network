import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Lock, Eye, EyeOff, Save, AlertTriangle, CheckCircle, LogOut, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function UserSettings() {
  const { user, logout, deleteSelfAccount, showToast } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [pw, setPw] = useState({ current: '', new: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!user) return null;

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPwError('');
    if (pw.new.length < 8) return setPwError('New password must be at least 8 characters');
    if (pw.new !== pw.confirm) return setPwError('Passwords do not match');
    // In a real app, this would call an API. For demo, we just show success.
    setPwSuccess(true);
    setPw({ current: '', new: '', confirm: '' });
    setTimeout(() => setPwSuccess(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    const result = await deleteSelfAccount();
    if (result.success) {
      showToast('Account deleted successfully.', 'success');
      navigate('/');
    } else {
      showToast(result.error || 'Failed to delete account.', 'error');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ margin: '0 0 4px' }}>Account Settings</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage your account security and preferences</p>
      </div>

      {/* Account Info */}
      <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
        <h4 style={{ margin: '0 0 var(--space-4)', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--zinc-700)' }}>
          <Settings size={16} color="var(--red-600)" /> Account Information
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { label: 'Name', value: user.name },
            { label: 'Email', value: user.email || '—' },
            { label: 'Role', value: user.role === 'hospital' ? 'Hospital / Blood Bank' : 'Platform Administrator' },
            { label: 'Account Status', value: user.status === 'approved' ? '✓ Active' : user.status },
            { label: 'Member Since', value: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '—' },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontWeight: 600, color: 'var(--zinc-900)' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Change Password */}
      <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
        <h4 style={{ margin: '0 0 var(--space-4)', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--zinc-700)' }}>
          <Lock size={16} color="var(--red-600)" /> Change Password
        </h4>

        {pwSuccess && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(22,163,74,0.1)', color: 'var(--color-success)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <CheckCircle size={15} /> Password updated successfully
          </div>
        )}
        {pwError && (
          <div className="alert alert-critical" style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={15} /> {pwError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {[
            { label: 'Current Password', key: 'current', id: 'settings-current-pw' },
            { label: 'New Password', key: 'new', id: 'settings-new-pw' },
            { label: 'Confirm New Password', key: 'confirm', id: 'settings-confirm-pw' },
          ].map(f => (
            <div key={f.key} className="form-group">
              <label className="form-label">{f.label}</label>
              <div style={{ position: 'relative' }}>
                <input
                  id={f.id}
                  type={showPw ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={pw[f.key]}
                  onChange={e => setPw(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ paddingRight: 44 }}
                />
                {f.key === 'new' && (
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)' }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
            </div>
          ))}
          <button id="settings-save-password" type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            <Save size={14} /> Update Password
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="card" style={{ padding: 'var(--space-5)', borderColor: 'rgba(220,38,38,0.2)' }}>
        <h4 style={{ margin: '0 0 var(--space-4)', color: 'var(--red-600)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} /> Danger Zone
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', background: 'var(--zinc-50)', borderRadius: 'var(--radius-md)', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>Sign Out</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Log out of your account on this device</div>
            </div>
            <button id="settings-logout-btn" className="btn btn-secondary btn-sm" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', background: 'rgba(220,38,38,0.04)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(220,38,38,0.1)', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--red-600)', marginBottom: 2 }}>Delete Account</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Permanently delete your account and all data</div>
            </div>
            <button id="settings-delete-btn" className="btn btn-sm" style={{ background: 'transparent', color: 'var(--red-600)', border: '1px solid rgba(220,38,38,0.3)' }} onClick={() => setConfirmDelete(true)}>
              <Trash2 size={13} /> Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: 'var(--space-4)'
        }}>
          <div className="card animate-slideUp" style={{ maxWidth: 440, width: '100%', padding: 'var(--space-6)', background: '#fff', boxShadow: 'var(--shadow-xl)' }}>
            <h3 style={{ color: 'var(--red-600)', display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 var(--space-3)' }}>
              <AlertTriangle size={20} /> Delete Account?
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-5)' }}>
              <strong>This action cannot be undone.</strong> Your user profile, emergency blood requests, compatibility matches, and alerts will be permanently removed from our production servers.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button id="settings-delete-confirm-btn" className="btn" style={{ background: 'var(--red-600)', color: '#fff' }} onClick={handleDeleteAccount}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Policy Links */}
      <div style={{ textAlign: 'center', marginTop: 'var(--space-8)', fontSize: '0.825rem', display: 'flex', justifyContent: 'center', gap: 16 }}>
        <a href="/privacy" onClick={e => { e.preventDefault(); navigate('/privacy'); }} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</a>
        <span style={{ color: 'var(--border-base)' }}>•</span>
        <a href="/terms" onClick={e => { e.preventDefault(); navigate('/terms'); }} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms & Conditions</a>
      </div>
    </div>
  );
}
