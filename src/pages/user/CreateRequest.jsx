import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, CheckCircle, AlertTriangle, Phone, MapPin, Users, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BLOOD_TYPES, URGENCY_LEVELS, ALL_DISTRICTS } from '../../data/mockData';

const INITIAL = {
  patient_name: '',
  blood_type: '',
  hospital_name: '',
  location: '',
  units_needed: '1',
  urgency: 'urgent',
  phone: '',
  notes: '',
};

export default function CreateRequest() {
  const navigate = useNavigate();
  const { user, createRequest } = useAuth();
  const [form, setForm] = useState({ ...INITIAL, phone: user?.phone || '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.patient_name.trim()) return setError('Patient name is required');
    if (!form.blood_type) return setError('Please select a blood group');
    if (!form.hospital_name.trim()) return setError('Hospital or location name is required');
    if (!form.location) return setError('Please select a district');
    if (!form.phone.trim()) return setError('Contact phone number is required');

    setLoading(true);
    const result = await createRequest(form);
    setLoading(false);

    if (result.success) {
      setSuccess(result);
    } else {
      setError(result.error || 'Failed to create request');
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: 'var(--space-10) var(--space-6)' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(22,163,74,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto var(--space-5)'
        }}>
          <CheckCircle size={36} color="var(--color-success)" />
        </div>
        <h2 style={{ marginBottom: 'var(--space-3)' }}>Request Created!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
          Your blood request has been published. Compatible donors in your area have been notified.
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
          Request ID: <strong>{success.reqId}</strong>
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/my-requests')}>
            View My Requests
          </button>
          <button className="btn btn-secondary" onClick={() => { setSuccess(null); setForm({ ...INITIAL, phone: user?.phone || '' }); }}>
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ margin: '0 0 6px' }}>Create Blood Request</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          Submit an emergency blood request. Compatible donors in your area will be notified instantly.
        </p>
      </div>

      {error && (
        <div id="create-req-error" className="alert alert-critical" style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Patient & Blood Info */}
        <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
          <h4 style={{ margin: '0 0 var(--space-4)', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--zinc-700)' }}>
            <Droplets size={16} color="var(--red-600)" /> Patient Information
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Patient Name <span>*</span></label>
              <input
                id="req-patient-name"
                type="text"
                className="form-input"
                placeholder="e.g. John Doe"
                value={form.patient_name}
                onChange={e => update('patient_name', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group Required <span>*</span></label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {BLOOD_TYPES.map(bt => (
                  <button
                    key={bt}
                    type="button"
                    id={`req-blood-${bt.replace('+', 'pos').replace('-', 'neg')}`}
                    className={`btn btn-sm ${form.blood_type === bt ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => update('blood_type', bt)}
                  >
                    {bt}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Units Required <span>*</span></label>
              <select
                id="req-units"
                className="form-select"
                value={form.units_needed}
                onChange={e => update('units_needed', e.target.value)}
              >
                {['1','2','3','4','5','6','7','8','9','10'].map(n => (
                  <option key={n} value={n}>{n} unit{n !== '1' ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
          <h4 style={{ margin: '0 0 var(--space-4)', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--zinc-700)' }}>
            <MapPin size={16} color="var(--red-600)" /> Location & Hospital
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Hospital / Clinic Name <span>*</span></label>
              <input
                id="req-hospital"
                type="text"
                className="form-input"
                placeholder="e.g. SMHS Hospital Srinagar"
                value={form.hospital_name}
                onChange={e => update('hospital_name', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">District (J&K) <span>*</span></label>
              <select
                id="req-location"
                className="form-select"
                value={form.location}
                onChange={e => update('location', e.target.value)}
                required
              >
                <option value="">Select district</option>
                {ALL_DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Urgency & Contact */}
        <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
          <h4 style={{ margin: '0 0 var(--space-4)', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--zinc-700)' }}>
            <Phone size={16} color="var(--red-600)" /> Urgency & Contact
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Urgency Level <span>*</span></label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {URGENCY_LEVELS.map(u => {
                  const colors = { critical: 'var(--red-600)', urgent: 'var(--color-warning)', standard: 'var(--color-info)' };
                  const bgs = { critical: 'var(--red-50)', urgent: 'var(--color-warning-bg)', standard: 'var(--color-info-bg)' };
                  const isSelected = form.urgency === u.value;
                  return (
                    <label key={u.value} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${isSelected ? colors[u.value] : 'var(--border-subtle)'}`,
                      background: isSelected ? bgs[u.value] : '#fff',
                      cursor: 'pointer', transition: 'all 0.15s'
                    }}>
                      <input
                        type="radio"
                        name="urgency"
                        value={u.value}
                        checked={isSelected}
                        onChange={() => update('urgency', u.value)}
                        style={{ accentColor: colors[u.value] }}
                        id={`req-urgency-${u.value}`}
                      />
                      <span style={{ fontWeight: 700, color: isSelected ? colors[u.value] : 'var(--zinc-700)', fontSize: '0.9rem' }}>
                        {u.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone Number <span>*</span></label>
              <input
                id="req-phone"
                type="tel"
                className="form-input"
                placeholder="+234-800-000-0000"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                required
              />
              <span className="form-hint">This number will be shared with accepting donors</span>

              <label className="form-label" style={{ marginTop: 'var(--space-4)' }}>Additional Notes</label>
              <textarea
                id="req-notes"
                className="form-textarea"
                placeholder="Any additional details about the requirement…"
                value={form.notes}
                onChange={e => update('notes', e.target.value)}
                rows={4}
                style={{ resize: 'vertical', minHeight: 80 }}
              />
            </div>
          </div>
        </div>

        {/* Info about matching */}
        <div style={{
          padding: 'var(--space-4)', background: 'var(--color-info-bg)',
          borderRadius: 'var(--radius-lg)', border: '1px solid rgba(0,122,255,0.1)',
          marginBottom: 'var(--space-5)', display: 'flex', gap: 10, alignItems: 'flex-start',
          fontSize: '0.85rem', color: 'var(--text-secondary)'
        }}>
          <Users size={16} color="var(--color-info)" style={{ flexShrink: 0, marginTop: 2 }} />
          <span>
            Our matching engine will search for compatible, available donors in your area — based on blood type, location, weight (≥ 50kg), Hb level (≥ 12.5 g/dL), and the 56-day donation cooldown.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
          <button
            id="submit-request-btn"
            type="submit"
            className="btn btn-primary flex-1"
            disabled={loading}
          >
            {loading ? 'Creating…' : 'Create Blood Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
