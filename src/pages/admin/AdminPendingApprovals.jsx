import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, CheckCircle, Trash2, Eye, Phone, Mail, MapPin, Building } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminPendingApprovals() {
  const navigate = useNavigate();
  const { users, suspendUserAccount, deleteUserAccount, showToast } = useAuth();

  const pending = users.filter(u => u.role === 'hospital' && u.status === 'pending');

  const handleApprove = async (id) => {
    const res = await suspendUserAccount(id, 'approved');
    showToast(res.success ? 'Hospital approved successfully' : res.error || 'Failed', res.success ? 'success' : 'error');
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject and delete this hospital registration?')) return;
    const res = await deleteUserAccount(id);
    showToast(res.success ? 'Hospital registration rejected and removed' : res.error || 'Failed', res.success ? 'success' : 'error');
  };

  return (
    <div style={{ padding: '0 var(--space-4)', maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'rgba(217,119,6,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldAlert size={22} color="var(--color-warning)" />
        </div>
        <div>
          <h2 style={{ margin: 0 }}>Pending Hospital Approvals</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            {pending.length > 0 ? `${pending.length} hospital registration${pending.length !== 1 ? 's' : ''} awaiting review` : 'No pending registrations'}
          </p>
        </div>
      </div>

      {/* Info Banner */}
      {pending.length > 0 && (
        <div style={{ padding: '12px 20px', background: 'rgba(217,119,6,0.06)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(217,119,6,0.2)', fontSize: '0.85rem', color: 'var(--amber-700)', lineHeight: 1.5 }}>
          <strong>Review Action Required:</strong> Verify hospital registration numbers and contact details before approving. Once approved, the hospital gains access to the donor management platform.
        </div>
      )}

      {/* Pending Cards */}
      {pending.length === 0 ? (
        <div className="card" style={{ padding: 64, textAlign: 'center', color: 'var(--text-muted)' }}>
          <ShieldAlert size={40} color="var(--zinc-300)" style={{ marginBottom: 12 }} />
          <div style={{ fontWeight: 700, marginBottom: 6 }}>All caught up!</div>
          <div>No hospitals are pending approval at this time.</div>
        </div>
      ) : pending.map(hospital => (
        <div key={hospital.id} className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-xl)', background: 'rgba(217,119,6,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building size={24} color="var(--color-warning)" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--zinc-900)', marginBottom: 2 }}>{hospital.name}</div>
                {hospital.blood_bank_name && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Blood Bank: {hospital.blood_bank_name}</div>}
                <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(217,119,6,0.1)', color: 'var(--color-warning)', padding: '2px 8px', borderRadius: 99 }}>PENDING</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/hospitals/${hospital.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Eye size={14} /> View Details
              </button>
              <button className="btn btn-sm btn-primary" onClick={() => handleApprove(hospital.id)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={14} /> Approve
              </button>
              <button className="btn btn-sm btn-secondary" onClick={() => handleReject(hospital.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--red-600)' }}>
                <Trash2 size={14} /> Reject
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
            {[
              { label: 'Registration Number', value: hospital.registration_number || '—' },
              { label: 'Hospital Type', value: hospital.hospital_type || '—' },
              { label: 'Contact Person', value: hospital.contact_person || '—' },
              { label: 'District', value: hospital.district || '—' },
              { label: 'State', value: hospital.state || '—' },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{f.label}</div>
                <div style={{ fontWeight: 700, color: 'var(--zinc-800)', fontSize: '0.88rem' }}>{f.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 20, marginTop: 14, fontSize: '0.82rem', color: 'var(--zinc-600)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={13} /> {hospital.email}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={13} /> {hospital.phone}</span>
            {hospital.address && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={13} /> {hospital.address}</span>}
          </div>
          <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Registered on {new Date(hospital.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      ))}
    </div>
  );
}
