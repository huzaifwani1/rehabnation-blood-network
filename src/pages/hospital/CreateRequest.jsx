import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, AlertTriangle, Clock, CheckCircle, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BLOOD_TYPES } from '../../data/mockData';
import { UrgencyBadge, BloodBadge } from '../../components/ui/Badges';

const URGENCY_OPTIONS = [
  { value: 'critical', label: 'Critical', desc: 'Immediate life threat. All matching donors notified at once.', color: 'var(--urgency-critical)', bg: 'var(--urgency-critical-bg)', icon: AlertTriangle },
  { value: 'urgent',   label: 'Urgent',   desc: 'Needed within 24 hours. Donors notified in batches.', color: 'var(--urgency-urgent)', bg: 'var(--urgency-urgent-bg)', icon: Clock },
  { value: 'standard', label: 'Standard', desc: 'Scheduled need. Initial batch + hourly expansion.', color: 'var(--urgency-standard)', bg: 'var(--urgency-standard-bg)', icon: CheckCircle },
];

export default function CreateRequest() {
  const { user, createRequest } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    blood_type: '', urgency: 'urgent', units: 1,
    notes: '', deadline_hours: '18',
  });
  const [submitted, setSubmitted] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.blood_type) return;

    const hours = parseInt(form.deadline_hours) || 12;
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + hours);
    const expires = new Date();
    expires.setHours(expires.getHours() + hours + 4);

    createRequest({
      hospital_id: user?.hospital_id || 'h1',
      hospital_name: user?.hospital_name || 'Lagos General Hospital',
      blood_type: form.blood_type,
      units_needed: form.units,
      urgency: form.urgency,
      notes: form.notes,
      response_deadline: deadline.toISOString(),
      expires_at: expires.toISOString()
    });

    setSubmitted(true);
    setTimeout(() => navigate('/hospital/requests'), 2500);
  };

  if (submitted) {
    return (
      <div className="animate-fadeIn" style={{ maxWidth: 520, margin: '0 auto', paddingTop: 'var(--space-12)' }}>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: form.urgency === 'critical' ? 'var(--urgency-critical-bg)' : 'var(--success-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto var(--space-5)'
          }}>
            <Send size={30} color={form.urgency === 'critical' ? 'var(--urgency-critical)' : 'var(--success)'} />
          </div>
          <h2>Request Dispatched!</h2>
          <p style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            Matching donors have been notified.{' '}
            {form.urgency === 'critical'
              ? 'All eligible donors received an immediate alert.'
              : 'Donors are being notified in batches.'}
          </p>
          <div className="flex items-center gap-3 justify-center" style={{ marginBottom: 'var(--space-6)' }}>
            <BloodBadge type={form.blood_type || 'O-'} />
            <UrgencyBadge urgency={form.urgency} />
            <span className="badge badge-neutral">{form.units} unit(s)</span>
          </div>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p style={{ fontSize: '0.875rem', marginTop: 'var(--space-4)' }}>Redirecting to Active Requests…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-header-left">
          <h1>New Blood Request</h1>
          <p>Submit an emergency blood request to notify matching donors</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Blood Type */}
        <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
          <h3 style={{ marginBottom: 'var(--space-5)' }}>Blood Type Required</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)' }}>
            {BLOOD_TYPES.map(bt => (
              <button
                key={bt}
                id={`req-bt-${bt.replace('+','pos').replace('-','neg')}`}
                type="button"
                className={`btn ${form.blood_type === bt ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flexDirection: 'column', gap: 2, padding: 'var(--space-4)', height: 'auto' }}
                onClick={() => update('blood_type', bt)}
              >
                <span style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-display)' }}>{bt}</span>
                <span style={{ fontSize: '0.6875rem', color: form.blood_type === bt ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', fontWeight: 400 }}>
                  {bt.includes('-') ? 'Negative' : 'Positive'}
                </span>
              </button>
            ))}
          </div>
          <p className="form-hint mt-4">
            Compatible donor types will be automatically included in the search.
          </p>
        </div>

        {/* Urgency */}
        <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
          <h3 style={{ marginBottom: 'var(--space-5)' }}>Urgency Level</h3>
          <div className="flex flex-col gap-3">
            {URGENCY_OPTIONS.map(opt => {
              const Icon = opt.icon;
              return (
                <label
                  key={opt.value}
                  id={`urgency-${opt.value}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                    padding: 'var(--space-4)', border: '1.5px solid',
                    borderColor: form.urgency === opt.value ? opt.color : 'var(--border-default)',
                    borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                    background: form.urgency === opt.value ? opt.bg : 'var(--bg-input)',
                    transition: 'all var(--transition-fast)'
                  }}
                  onClick={() => update('urgency', opt.value)}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: opt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color={opt.color} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: form.urgency === opt.value ? opt.color : 'var(--text-primary)' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>{opt.desc}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', border: `2px solid ${form.urgency === opt.value ? opt.color : 'var(--border-default)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {form.urgency === opt.value && <div style={{ width: 8, height: 8, borderRadius: '50%', background: opt.color }} />}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Units & Deadline */}
        <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
          <h3 style={{ marginBottom: 'var(--space-5)' }}>Request Details</h3>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Units Needed <span>*</span></label>
              <input
                id="req-units"
                type="number" min="1" max="20"
                className="form-input"
                value={form.units}
                onChange={e => update('units', parseInt(e.target.value) || 1)}
              />
              <span className="form-hint">Number of blood unit bags required</span>
            </div>
            <div className="form-group">
              <label className="form-label">Response Deadline</label>
              <select id="req-deadline" className="form-select" value={form.deadline_hours} onChange={e => update('deadline_hours', e.target.value)}>
                <option value="2">2 hours (recommended for Critical)</option>
                <option value="6">6 hours</option>
                <option value="12">12 hours</option>
                <option value="18">18 hours</option>
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
              </select>
            </div>
          </div>
          <div className="form-group mt-4">
            <label className="form-label">Additional Notes</label>
            <textarea
              id="req-notes"
              className="form-textarea"
              placeholder="Describe the medical situation, patient condition, or any special requirements…"
              value={form.notes}
              onChange={e => update('notes', e.target.value)}
            />
          </div>
        </div>

        {/* Preview & Submit */}
        {form.blood_type && (
          <div className="alert alert-warning" style={{ marginBottom: 'var(--space-5)' }}>
            <Droplets size={16} />
            <span>
              This request will notify eligible donors in Nigeria compatible with{' '}
              <strong>{form.blood_type}</strong> blood.
            </span>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/hospital')}>Cancel</button>
          <button
            id="submit-request-btn"
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={!form.blood_type}
          >
            <Send size={16} />
            Dispatch Request
          </button>
        </div>
      </form>
    </div>
  );
}
