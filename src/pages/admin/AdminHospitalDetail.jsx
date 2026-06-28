import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, Users, Phone, Mail, MapPin, ShieldCheck, Clock, Eye, Edit, Trash2, Power, BarChart3, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BLOOD_TYPES } from '../../data/mockData';

function StatusBadge({ status }) {
  const c = { approved: ['var(--color-success)', 'rgba(22,163,74,0.1)'], pending: ['var(--color-warning)', 'rgba(217,119,6,0.1)'], suspended: ['var(--red-600)', 'rgba(220,38,38,0.1)'] };
  const [color, bg] = c[status] || c.pending;
  return <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, background: bg, color }}>{status}</span>;
}

const TABS = ['Donors', 'Analytics', 'Activity', 'Settings'];

export default function AdminHospitalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchHospitalById, fetchHospitalStats, fetchHospitalDonors, suspendUserAccount, deleteUserAccount, updateDonorAsAdmin, deleteDonorAsAdmin, showToast } = useAuth();

  const [hospital, setHospital] = useState(null);
  const [stats, setStats] = useState(null);
  const [donors, setDonors] = useState([]);
  const [activeTab, setActiveTab] = useState('Donors');
  const [loading, setLoading] = useState(true);
  const [viewDonor, setViewDonor] = useState(null);
  const [search, setSearch] = useState('');
  const [bloodFilter, setBloodFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      const [hospRes, statsRes, donorsRes] = await Promise.all([
        fetchHospitalById(id),
        fetchHospitalStats(id),
        fetchHospitalDonors(id),
      ]);
      if (hospRes.success) setHospital(hospRes.hospital);
      if (statsRes.success) setStats(statsRes.stats);
      if (donorsRes.success) setDonors(donorsRes.donors);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}><div className="spinner" /></div>;
  if (!hospital) return <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Hospital not found.</div>;

  const maxBlood = Math.max(...BLOOD_TYPES.map(bt => stats?.bloodTypeCounts?.[bt] || 0), 1);

  const filteredDonors = donors.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !search || d.full_name?.toLowerCase().includes(q) || d.phone?.includes(q);
    const matchBlood = !bloodFilter || d.blood_type === bloodFilter;
    return matchSearch && matchBlood;
  });

  const handleSuspend = async () => {
    const newStatus = hospital.status === 'suspended' ? 'approved' : 'suspended';
    const res = await suspendUserAccount(id, newStatus);
    if (res.success) {
      setHospital(h => ({ ...h, status: newStatus }));
      showToast(`Hospital ${newStatus}`, 'success');
    } else showToast(res.error || 'Failed', 'error');
  };

  const handleDeleteDonor = async (donorId) => {
    if (!window.confirm('Permanently delete this donor record?')) return;
    const res = await deleteDonorAsAdmin(donorId);
    if (res.success) {
      setDonors(prev => prev.filter(d => (d._id || d.id) !== donorId));
      showToast('Donor deleted', 'success');
    } else showToast(res.error || 'Failed', 'error');
  };

  return (
    <div style={{ padding: '0 var(--space-4)', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Back + Header */}
      <div>
        <button className="btn btn-sm btn-secondary" onClick={() => navigate('/hospitals')} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <ArrowLeft size={14} /> Back to Hospitals
        </button>
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-xl)', background: 'rgba(220,38,38,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Building size={28} color="var(--red-600)" />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0 }}>{hospital.name}</h2>
                <StatusBadge status={hospital.status} />
              </div>
              {hospital.blood_bank_name && <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 4 }}>Blood Bank: {hospital.blood_bank_name}</div>}
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--zinc-600)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} /> {hospital.district}, {hospital.state}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={13} /> {hospital.phone}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={13} /> {hospital.email}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-sm btn-secondary" onClick={handleSuspend} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Power size={14} /> {hospital.status === 'suspended' ? 'Reactivate' : 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Donors', value: stats?.totalDonors ?? '—', color: 'var(--red-600)' },
          { label: 'Active Donors', value: stats?.activeDonors ?? '—', color: 'var(--color-success)' },
          { label: 'Registration No.', value: hospital.registration_number || '—', color: 'var(--color-info)' },
          { label: 'Hospital Type', value: hospital.hospital_type || '—', color: 'var(--zinc-600)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 'var(--space-4)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div>
        <div style={{ display: 'flex', borderBottom: '2px solid var(--border-light)', marginBottom: 20 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: activeTab === tab ? 700 : 400, color: activeTab === tab ? 'var(--red-600)' : 'var(--text-muted)', borderBottom: activeTab === tab ? '2px solid var(--red-600)' : '2px solid transparent', marginBottom: -2, fontSize: '0.88rem', transition: 'color 0.15s' }}>
              {tab}
            </button>
          ))}
        </div>

        {/* DONORS TAB */}
        {activeTab === 'Donors' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <input type="text" placeholder="Search by name or phone…" className="form-input" style={{ flex: 1, minWidth: 200 }} value={search} onChange={e => setSearch(e.target.value)} />
              <select className="form-input" style={{ width: 140 }} value={bloodFilter} onChange={e => setBloodFilter(e.target.value)}>
                <option value="">Blood Group</option>
                {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
              </select>
            </div>

            <div className="card" style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    {['Full Name', 'Blood Group', 'Phone', 'District', 'Last Donation', 'Availability', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 14px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredDonors.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No donors found.</td></tr>
                  ) : filteredDonors.map(d => (
                    <tr key={d._id || d.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{d.full_name}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: 'var(--red-50)', color: 'var(--red-600)', padding: '2px 8px', borderRadius: 99, fontWeight: 800, fontSize: '0.78rem' }}>{d.blood_type}</span>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--zinc-600)' }}>{d.phone}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--zinc-600)' }}>{d.district}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--zinc-600)' }}>{d.last_donation_date || 'Never'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, background: d.is_available !== false ? 'rgba(22,163,74,0.1)' : 'var(--zinc-100)', color: d.is_available !== false ? 'var(--green-700)' : 'var(--zinc-500)' }}>
                          {d.is_available !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-sm btn-secondary" onClick={() => setViewDonor(d)} style={{ padding: 5 }} title="View"><Eye size={12} /></button>
                          <a href={`tel:${d.phone}`} className="btn btn-sm btn-secondary" style={{ padding: 5, display: 'flex' }} title="Call"><Phone size={12} color="var(--green-600)" /></a>
                          <button className="btn btn-sm btn-secondary" onClick={() => handleDeleteDonor(d._id || d.id)} style={{ padding: 5 }} title="Delete"><Trash2 size={12} color="var(--red-600)" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'Analytics' && (
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ margin: '0 0 var(--space-5)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={18} color="var(--red-600)" /> Blood Group Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {BLOOD_TYPES.map(bt => {
                const count = stats?.bloodTypeCounts?.[bt] || 0;
                const pct = (count / maxBlood) * 100;
                return (
                  <div key={bt} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ width: 38, fontWeight: 800, color: 'var(--red-600)' }}>{bt}</span>
                    <div style={{ flex: 1, height: 12, background: 'var(--zinc-100)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--red-600)', borderRadius: 99 }} />
                    </div>
                    <span style={{ width: 28, textAlign: 'right', fontWeight: 700, fontSize: '0.85rem', color: 'var(--zinc-600)' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === 'Activity' && (
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ margin: '0 0 16px' }}>Recent Activity</h3>
            {donors.slice(0, 10).map((d, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontWeight: 600 }}>{d.full_name}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Added {d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Unknown'}</span>
              </div>
            ))}
            {donors.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No activity recorded yet.</div>}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'Settings' && (
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ margin: '0 0 20px' }}>Hospital Account Settings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Hospital Name', value: hospital.name },
                { label: 'Blood Bank Name', value: hospital.blood_bank_name || '—' },
                { label: 'Registration Number', value: hospital.registration_number },
                { label: 'Hospital Type', value: hospital.hospital_type },
                { label: 'Contact Person', value: hospital.contact_person },
                { label: 'Phone', value: hospital.phone },
                { label: 'Email', value: hospital.email },
                { label: 'District', value: hospital.district },
                { label: 'State', value: hospital.state },
                { label: 'Address', value: hospital.address },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontWeight: 600, color: 'var(--zinc-800)' }}>{f.value || '—'}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, borderTop: '1px solid var(--border-light)', paddingTop: 20 }}>
              <button className="btn btn-secondary" onClick={handleSuspend} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Power size={15} /> {hospital.status === 'suspended' ? 'Reactivate Hospital' : 'Suspend Hospital'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Donor Details Modal */}
      {viewDonor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card animate-slideUp" style={{ width: '90%', maxWidth: 500, padding: 'var(--space-5)', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border-light)' }}>
              <h3 style={{ margin: 0 }}>Donor Record</h3>
              <button onClick={() => setViewDonor(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Full Name', value: viewDonor.full_name },
                { label: 'Blood Group', value: viewDonor.blood_type },
                { label: 'Phone', value: viewDonor.phone },
                { label: 'Email', value: viewDonor.email || '—' },
                { label: 'Gender', value: viewDonor.gender },
                { label: 'Date of Birth', value: viewDonor.dob || '—' },
                { label: 'District', value: viewDonor.district },
                { label: 'Address', value: viewDonor.address || '—' },
                { label: 'Last Donation', value: viewDonor.last_donation_date || 'Never' },
                { label: 'Total Donations', value: viewDonor.donation_count || 0 },
                { label: 'Status', value: viewDonor.is_available !== false ? 'Active' : 'Inactive' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: 8 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
