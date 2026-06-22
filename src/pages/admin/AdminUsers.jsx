import React, { useState } from 'react';
import {
  Users, Search, ShieldCheck, ShieldOff, Flag, FlagOff,
  Trash2, Lock, Unlock, ChevronDown, ChevronUp, Filter,
  Phone, Mail, MapPin, Calendar, Droplets, Activity, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ALL_DISTRICTS } from '../../data/mockData';

function StatusBadge({ status }) {
  const configs = {
    approved:  { label: 'Active',    color: 'var(--color-success)', bg: 'rgba(22,163,74,0.1)' },
    suspended: { label: 'Suspended', color: 'var(--red-600)',        bg: 'var(--red-50)' },
  };
  const cfg = configs[status] || configs.approved;
  return (
    <span style={{ padding: '3px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

function VerifBadge({ status }) {
  if (status === 'camp_verified') return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(22,163,74,0.1)', color: 'var(--color-success)', fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 99 }}>
      <ShieldCheck size={10} /> Verified
    </span>
  );
  return (
    <span style={{ background: 'var(--zinc-100)', color: 'var(--zinc-500)', fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 99 }}>
      Unverified
    </span>
  );
}

export default function AdminUsers() {
  const { users, verifyDonor, flagDonor, suspendUserAccount, deleteUserAccount } = useAuth();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVerif, setFilterVerif] = useState('');
  const [filterBlood, setFilterBlood] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const regularUsers = users.filter(u => u.role === 'user');

  const filtered = regularUsers.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.blood_type?.toLowerCase().includes(q);
    const matchStatus = !filterStatus || u.status === filterStatus;
    const matchVerif = !filterVerif || u.verification_status === filterVerif;
    const matchBlood = !filterBlood || u.blood_type === filterBlood;
    return matchSearch && matchStatus && matchVerif && matchBlood;
  });

  const handleVerify = (userId, currentStatus) => {
    const newStatus = currentStatus === 'camp_verified' ? 'unverified' : 'camp_verified';
    verifyDonor(userId, newStatus);
  };

  const handleFlag = (userId, isFlagged) => {
    flagDonor(userId, !isFlagged);
  };

  const handleSuspend = (userId, currentStatus) => {
    suspendUserAccount(userId, currentStatus !== 'suspended');
  };

  const handleDelete = (userId) => {
    deleteUserAccount(userId);
    setConfirmDelete(null);
    setExpanded(null);
  };

  const age = (dob) => dob ? Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>User Management</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>
            {filtered.length} of {regularUsers.length} user{regularUsers.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto auto auto',
        gap: 'var(--space-3)', marginBottom: 'var(--space-5)', alignItems: 'end'
      }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            id="admin-users-search"
            className="form-input"
            placeholder="Search by name, email, phone, blood type…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
        </div>
        <select id="admin-users-filter-status" className="form-select" style={{ width: 140 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="approved">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <select id="admin-users-filter-verif" className="form-select" style={{ width: 150 }} value={filterVerif} onChange={e => setFilterVerif(e.target.value)}>
          <option value="">All Verification</option>
          <option value="camp_verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
        <select id="admin-users-filter-blood" className="form-select" style={{ width: 120 }} value={filterBlood} onChange={e => setFilterBlood(e.target.value)}>
          <option value="">All Blood</option>
          {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => <option key={bt} value={bt}>{bt}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-12) 0', color: 'var(--text-muted)' }}>
            <Users size={36} style={{ opacity: 0.2, marginBottom: 8 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No users found</p>
          </div>
        ) : (
          <div>
            {filtered.map((u, idx) => {
              const isExpanded = expanded === u.id;
              const isLast = idx === filtered.length - 1;
              const userAge = age(u.dob);
              return (
                <div key={u.id} style={{ borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)' }}>
                  {/* Row */}
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                      padding: 'var(--space-4) var(--space-5)',
                      cursor: 'pointer', flexWrap: 'wrap',
                      background: u.status === 'suspended' ? 'rgba(220,38,38,0.02)' : u.is_flagged ? 'rgba(217,119,6,0.03)' : '#fff',
                      transition: 'background 0.15s'
                    }}
                    onClick={() => setExpanded(isExpanded ? null : u.id)}
                    onMouseEnter={e => !isExpanded && (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    onMouseLeave={e => !isExpanded && (e.currentTarget.style.background = u.status === 'suspended' ? 'rgba(220,38,38,0.02)' : u.is_flagged ? 'rgba(217,119,6,0.03)' : '#fff')}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: u.is_available ? 'rgba(22,163,74,0.1)' : 'var(--zinc-100)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.85rem', color: u.is_available ? 'var(--color-success)' : 'var(--zinc-400)',
                      flexShrink: 0, position: 'relative'
                    }}>
                      {u.initials}
                      {u.is_flagged && (
                        <div style={{ position: 'absolute', top: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: 'var(--color-warning)', border: '2px solid #fff' }} />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontWeight: 700, color: u.status === 'suspended' ? 'var(--zinc-400)' : 'var(--zinc-900)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {u.name}
                        {u.is_flagged && <AlertTriangle size={13} color="var(--color-warning)" title="Flagged" />}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {u.email || u.phone || '—'} · {u.city || '—'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
                      {u.blood_type && (
                        <span style={{ background: 'var(--red-50)', color: 'var(--red-600)', fontWeight: 800, padding: '3px 10px', borderRadius: 99, fontSize: '0.8rem' }}>
                          {u.blood_type}
                        </span>
                      )}
                      <VerifBadge status={u.verification_status} />
                      <StatusBadge status={u.status} />
                    </div>

                    {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </div>

                  {/* Expanded Panel */}
                  {isExpanded && (
                    <div style={{
                      padding: 'var(--space-5)',
                      background: 'var(--bg-elevated)',
                      borderTop: '1px solid var(--border-subtle)'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                        {[
                          { label: 'Phone', value: u.phone, icon: <Phone size={13} /> },
                          { label: 'Email', value: u.email, icon: <Mail size={13} /> },
                          { label: 'District', value: u.district, icon: <MapPin size={13} /> },
                          { label: 'City', value: u.city || u.region, icon: <MapPin size={13} /> },
                          { label: 'Date of Birth', value: u.dob ? `${new Date(u.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}${userAge ? ` (age ${userAge})` : ''}` : '—', icon: <Calendar size={13} /> },
                          { label: 'Weight / Hb', value: [u.weight_kg ? `${u.weight_kg}kg` : null, u.hemoglobin_level ? `${u.hemoglobin_level}g/dL` : null].filter(Boolean).join(' · ') || '—', icon: <Activity size={13} /> },
                          { label: 'Donations', value: u.donation_count || 0, icon: <Droplets size={13} /> },
                          { label: 'Last Donation', value: u.last_donation_date ? new Date(u.last_donation_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—', icon: <Calendar size={13} /> },
                        ].map(item => (
                          <div key={item.label}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                              {item.icon} {item.label}
                            </div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--zinc-900)' }}>{item.value || '—'}</div>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
                        <button
                          id={`admin-verify-${u.id}`}
                          className="btn btn-sm"
                          onClick={() => handleVerify(u.id, u.verification_status)}
                          style={{
                            background: u.verification_status === 'camp_verified' ? 'rgba(22,163,74,0.1)' : 'var(--color-info-bg)',
                            color: u.verification_status === 'camp_verified' ? 'var(--color-success)' : 'var(--color-info)',
                            border: u.verification_status === 'camp_verified' ? '1px solid rgba(22,163,74,0.2)' : '1px solid rgba(0,122,255,0.15)',
                            display: 'flex', alignItems: 'center', gap: 5
                          }}
                        >
                          {u.verification_status === 'camp_verified' ? <><ShieldOff size={13} /> Revoke Verification</> : <><ShieldCheck size={13} /> Verify User</>}
                        </button>
                        <button
                          id={`admin-flag-${u.id}`}
                          className="btn btn-sm"
                          onClick={() => handleFlag(u.id, u.is_flagged)}
                          style={{
                            background: u.is_flagged ? 'var(--color-warning-bg)' : 'var(--zinc-100)',
                            color: u.is_flagged ? 'var(--color-warning)' : 'var(--zinc-600)',
                            border: u.is_flagged ? '1px solid rgba(217,119,6,0.2)' : '1px solid var(--border-base)',
                            display: 'flex', alignItems: 'center', gap: 5
                          }}
                        >
                          {u.is_flagged ? <><FlagOff size={13} /> Unflag</> : <><Flag size={13} /> Flag</>}
                        </button>
                        <button
                          id={`admin-suspend-${u.id}`}
                          className="btn btn-sm"
                          onClick={() => handleSuspend(u.id, u.status)}
                          style={{
                            background: u.status === 'suspended' ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.06)',
                            color: u.status === 'suspended' ? 'var(--color-success)' : 'var(--red-500)',
                            border: u.status === 'suspended' ? '1px solid rgba(22,163,74,0.2)' : '1px solid rgba(220,38,38,0.15)',
                            display: 'flex', alignItems: 'center', gap: 5
                          }}
                        >
                          {u.status === 'suspended' ? <><Unlock size={13} /> Unsuspend</> : <><Lock size={13} /> Suspend</>}
                        </button>
                        <div style={{ marginLeft: 'auto' }}>
                          {confirmDelete === u.id ? (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn btn-secondary btn-sm" onClick={() => setConfirmDelete(null)}>Cancel</button>
                              <button
                                id={`admin-delete-confirm-${u.id}`}
                                className="btn btn-sm"
                                style={{ background: 'var(--red-600)', color: '#fff' }}
                                onClick={() => handleDelete(u.id)}
                              >
                                <Trash2 size={12} /> Confirm Delete
                              </button>
                            </div>
                          ) : (
                            <button
                              id={`admin-delete-${u.id}`}
                              className="btn btn-sm"
                              style={{ background: 'transparent', color: 'var(--red-400)', border: '1px solid rgba(220,38,38,0.2)', display: 'flex', alignItems: 'center', gap: 5 }}
                              onClick={() => setConfirmDelete(u.id)}
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
