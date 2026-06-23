import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, Phone, ShieldCheck, ShieldOff, Droplets,
  MapPin, Calendar, CheckCircle, XCircle, Clock, HeartHandshake, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BLOOD_TYPES, ALL_DISTRICTS } from '../data/mockData';

function VerifiedBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: 'rgba(22,163,74,0.1)', color: 'var(--color-success)',
      fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px',
      borderRadius: 99, border: '1px solid rgba(22,163,74,0.2)'
    }}>
      <ShieldCheck size={11} /> Verified
    </span>
  );
}

function BloodBadge({ type }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--red-50)', color: 'var(--red-600)',
      fontWeight: 800, fontSize: '1.1rem', width: 52, height: 52,
      borderRadius: '50%', border: '2px solid var(--red-100)',
      flexShrink: 0
    }}>
      {type}
    </span>
  );
}

function AvailablePill({ available }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: available ? 'rgba(22,163,74,0.1)' : 'var(--zinc-100)',
      color: available ? 'var(--color-success)' : 'var(--zinc-400)',
      fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px',
      borderRadius: 99
    }}>
      {available ? <CheckCircle size={11} /> : <XCircle size={11} />}
      {available ? 'Available' : 'Not Available'}
    </span>
  );
}

export default function FindBloodPage() {
  const navigate = useNavigate();

  const { user, users } = useAuth();

  const [filterBlood, setFilterBlood] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('');  // 'available' | 'unavailable' | ''
  const [filterVerification, setFilterVerification] = useState(''); // 'camp_verified' | ''
  const [searched, setSearched] = useState(false);

  const donors = (users || []).filter(u =>
    u.role === 'user' && u.status !== 'suspended' && !u.is_flagged
  );

  const filtered = donors.filter(u => {
    const matchBlood = !filterBlood || u.blood_type === filterBlood;
    const matchDistrict = !filterDistrict || (u.district || '') === filterDistrict;
    const matchAvail = !filterAvailability ||
      (filterAvailability === 'available' ? u.is_available : !u.is_available);
    const matchVerif = !filterVerification || u.verification_status === filterVerification;
    return matchBlood && matchDistrict && matchAvail && matchVerif;
  });

  const displayList = searched ? filtered : [];

  const handleSearch = () => setSearched(true);
  const handleClear = () => {
    setFilterBlood('');
    setFilterDistrict('');
    setFilterAvailability('');
    setFilterVerification('');
    setSearched(false);
  };

  // Blood group quick-stats (always from live data)
  const bloodGroupStats = BLOOD_TYPES.map(bt => ({
    type: bt,
    count: donors.filter(u => u.blood_type === bt && u.is_available).length
  }));

  const hasFilters = filterBlood || filterDistrict || filterAvailability || filterVerification;

  // Render for authenticated users (inside dashboard layout)
  if (user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Quick Stats */}
        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--zinc-700)', marginBottom: 'var(--space-3)' }}>
            Quick availability stats:
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {bloodGroupStats.map(({ type, count }) => (
              <button
                key={type}
                onClick={() => { setFilterBlood(type === filterBlood ? '' : type); setSearched(true); }}
                style={{
                  padding: '6px 10px', borderRadius: 'var(--radius-md)',
                  border: filterBlood === type ? '2px solid var(--red-600)' : '1px solid var(--border-base)',
                  background: filterBlood === type ? 'var(--red-600)' : '#fff',
                  color: filterBlood === type ? '#fff' : 'var(--zinc-700)',
                  fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                  transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 4,
                  minWidth: '50px', justifyContent: 'center'
                }}
              >
                <span>{type}</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                  ({count})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
            {/* Blood Group */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: 4 }}>Blood Group</label>
              <select
                className="form-select"
                value={filterBlood}
                onChange={e => setFilterBlood(e.target.value)}
                style={{ fontSize: '0.85rem', height: '36px', padding: '0 8px' }}
                id="filter-blood-group"
              >
                <option value="">All Groups</option>
                {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: 4 }}>District (J&K)</label>
              <select
                className="form-select"
                value={filterDistrict}
                onChange={e => setFilterDistrict(e.target.value)}
                style={{ fontSize: '0.85rem', height: '36px', padding: '0 8px' }}
                id="filter-district"
              >
                <option value="">All Districts</option>
                {ALL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Availability */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: 4 }}>Availability</label>
              <select
                className="form-select"
                value={filterAvailability}
                onChange={e => setFilterAvailability(e.target.value)}
                style={{ fontSize: '0.85rem', height: '36px', padding: '0 8px' }}
                id="filter-availability"
              >
                <option value="">All Donors</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            {/* Verification */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: 4 }}>Verification</label>
              <select
                className="form-select"
                value={filterVerification}
                onChange={e => setFilterVerification(e.target.value)}
                style={{ fontSize: '0.85rem', height: '36px', padding: '0 8px' }}
                id="filter-verification"
              >
                <option value="">All Members</option>
                <option value="camp_verified">Verified Only</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 'var(--space-4)' }}>
            <button
              id="find-blood-search-btn"
              className="btn btn-primary"
              onClick={handleSearch}
              style={{ flex: 1, height: '38px', fontSize: '0.85rem' }}
            >
              <Search size={14} /> Search Donors
            </button>
            {hasFilters && (
              <button className="btn btn-secondary" onClick={handleClear} style={{ height: '38px', fontSize: '0.85rem' }}>Clear</button>
            )}
          </div>
        </div>

        {/* Results count */}
        {searched && (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', paddingLeft: 'var(--space-2)' }}>
            <strong style={{ color: 'var(--zinc-900)' }}>{filtered.length}</strong> donor{filtered.length !== 1 ? 's' : ''} found
          </div>
        )}

        {/* Results */}
        {!searched ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-10) 0', color: 'var(--text-muted)' }}>
            <Users size={36} style={{ opacity: 0.2, marginBottom: 8 }} />
            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Select filters and press Search to find donors</p>
          </div>
        ) : displayList.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-10) 0', color: 'var(--text-muted)' }}>
            <Droplets size={36} style={{ opacity: 0.2, marginBottom: 8 }} />
            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>No donors match your search criteria</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)'
          }}>
            {displayList.map(donor => (
              <DonorCard key={donor.id} donor={donor} navigate={navigate} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render for guests (public landing page)
  return (
    <div className="landing" style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Navbar */}
      <nav className="landing-nav" style={{ justifyContent: 'space-between' }}>
        <div className="flex items-center gap-3" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="RehabNation Blood Network" style={{ height: 38, width: 'auto' }} />
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/emergency-request')}>Emergency Feed</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Join Network</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #fff5f5 0%, #fff 60%)',
        padding: 'var(--space-16) var(--space-10) var(--space-10)',
        textAlign: 'center',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }} className="animate-slideUp">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--red-50)', border: '1px solid var(--red-100)',
            borderRadius: 99, padding: '6px 16px', fontSize: '0.8rem',
            fontWeight: 700, color: 'var(--red-600)', marginBottom: 'var(--space-5)'
          }}>
            <Droplets size={14} /> Jammu & Kashmir Blood Network
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 'var(--space-4)', color: 'var(--zinc-900)' }}>
            Find Blood Donors<br />
            <span style={{ color: 'var(--red-600)' }}>Across J&K</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto var(--space-8)' }}>
            Search our donor community by blood group, district, availability, and verification status.
          </p>

          {/* Blood Group Quick Stats */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
            {bloodGroupStats.map(({ type, count }) => (
              <button
                key={type}
                onClick={() => { setFilterBlood(type === filterBlood ? '' : type); setSearched(true); }}
                style={{
                  padding: '8px 14px', borderRadius: 'var(--radius-lg)',
                  border: filterBlood === type ? '2px solid var(--red-600)' : '1px solid var(--border-base)',
                  background: filterBlood === type ? 'var(--red-600)' : '#fff',
                  color: filterBlood === type ? '#fff' : 'var(--zinc-700)',
                  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                  transition: 'all 0.15s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  minWidth: 60
                }}
              >
                <span style={{ fontSize: '1rem' }}>{type}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.8 }}>
                  {count > 0 ? `${count} avail` : 'none'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'var(--space-8) var(--space-6) 0' }}>
        <div style={{
          background: '#fff', border: '1px solid var(--border-base)',
          borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)',
          boxShadow: 'var(--shadow-sm)',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)', alignItems: 'end'
        }}>
          {/* Blood Group */}
          <div>
            <label className="form-label">Blood Group</label>
            <select
              className="form-select"
              value={filterBlood}
              onChange={e => setFilterBlood(e.target.value)}
              id="filter-blood-group"
            >
              <option value="">All Blood Groups</option>
              {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
            </select>
          </div>

          {/* District — J&K districts */}
          <div>
            <label className="form-label">District (J&K)</label>
            <select
              className="form-select"
              value={filterDistrict}
              onChange={e => setFilterDistrict(e.target.value)}
              id="filter-district"
            >
              <option value="">All Districts</option>
              {ALL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Availability Status */}
          <div>
            <label className="form-label">Availability</label>
            <select
              className="form-select"
              value={filterAvailability}
              onChange={e => setFilterAvailability(e.target.value)}
              id="filter-availability"
            >
              <option value="">All Donors</option>
              <option value="available">Available to Donate</option>
              <option value="unavailable">Not Available</option>
            </select>
          </div>

          {/* Verification Status */}
          <div>
            <label className="form-label">Verification</label>
            <select
              className="form-select"
              value={filterVerification}
              onChange={e => setFilterVerification(e.target.value)}
              id="filter-verification"
            >
              <option value="">All Members</option>
              <option value="camp_verified">Verified Only</option>
            </select>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              id="find-blood-search-btn"
              className="btn btn-primary"
              onClick={handleSearch}
              style={{ whiteSpace: 'nowrap' }}
            >
              <Search size={15} /> Search
            </button>
            {hasFilters && (
              <button className="btn btn-secondary" onClick={handleClear}>Clear</button>
            )}
          </div>
        </div>

        {/* Results count */}
        {searched && (
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--zinc-900)' }}>{filtered.length}</strong> donor{filtered.length !== 1 ? 's' : ''} found
            </span>
          </div>
        )}

        {/* Results */}
        {!searched ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-16) 0', color: 'var(--text-muted)' }}>
            <Users size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
            <p style={{ fontSize: '1rem', fontWeight: 600 }}>Select filters and press Search to find donors</p>
            <p style={{ fontSize: '0.875rem' }}>Filter by blood group, district, availability, or verification status</p>
          </div>
        ) : displayList.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: 'var(--space-16) 0',
            color: 'var(--text-muted)', background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-8)'
          }}>
            <Droplets size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
            {donors.length === 0 ? (
              <>
                <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>No registered donors yet</p>
                <p style={{ fontSize: '0.875rem', marginBottom: 'var(--space-6)' }}>
                  Be the first to join the RehabNation Blood Network.
                </p>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>
                  Join the Network
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: '1rem', fontWeight: 600 }}>No donors match your filters</p>
                <p style={{ fontSize: '0.875rem' }}>Try a different district or blood group</p>
              </>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 'var(--space-5)',
            marginBottom: 'var(--space-12)'
          }}>
            {displayList.map(donor => (
              <DonorCard key={donor.id} donor={donor} navigate={navigate} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      {searched && displayList.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, var(--red-600) 0%, #c0392b 100%)',
          padding: 'var(--space-12) var(--space-10)', textAlign: 'center'
        }}>
          <HeartHandshake size={36} color="rgba(255,255,255,0.8)" style={{ marginBottom: 12 }} />
          <h2 style={{ color: '#fff', fontWeight: 700, marginBottom: 8 }}>Need Blood Urgently?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 'var(--space-6)' }}>
            Create an emergency request and automatically notify matching donors in Jammu & Kashmir.
          </p>
          <button className="btn btn-lg" style={{ background: '#fff', color: 'var(--red-600)', fontWeight: 700 }} onClick={() => navigate('/register')}>
            Join & Create Request
          </button>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        borderTop: 'var(--border-light)', background: 'var(--zinc-50)',
        padding: 'var(--space-6) var(--space-10)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)'
      }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--zinc-400)' }}>
          © 2026 RehabNation Blood Network · Jammu & Kashmir
        </span>
        <span
          style={{ fontSize: 'var(--text-sm)', color: 'var(--zinc-400)', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Back to Home
        </span>
      </footer>
    </div>
  );
}

function DonorCard({ donor, navigate }) {
  const lastDonation = donor.last_donation_date
    ? new Date(donor.last_donation_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Not recorded';

  return (
    <div className="card" style={{
      padding: 'var(--space-4)',
      transition: 'box-shadow 0.2s, transform 0.2s',
      cursor: 'default',
      border: donor.is_available ? '1px solid rgba(22,163,74,0.15)' : '1px solid var(--border-subtle)'
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        <BloodBadge type={donor.blood_type} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--zinc-900)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {donor.name}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <AvailablePill available={donor.is_available} />
            {donor.verification_status === 'camp_verified' && <VerifiedBadge />}
          </div>
        </div>
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 'var(--space-4)' }}>
        {donor.district && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <MapPin size={12} color="var(--red-600)" />
            <span>{donor.district}</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <Calendar size={12} color="var(--zinc-400)" />
          <span>Last donation: {lastDonation}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <Droplets size={12} color="var(--zinc-400)" />
          <span>{donor.donation_count || 0} total donation{(donor.donation_count || 0) !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Action — Enforce donor privacy */}
      {donor.is_available ? (
        <button
          className="btn btn-primary w-full"
          onClick={() => navigate('/request-blood')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.85rem', minHeight: '36px' }}
          id={`request-donor-${donor.id}`}
        >
          <Droplets size={14} />
          Request Blood ({donor.blood_type})
        </button>
      ) : (
        <div style={{
          padding: 'var(--space-2)',
          background: 'var(--zinc-50)', borderRadius: 'var(--radius-md)',
          fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center'
        }}>
          <Clock size={12} style={{ marginRight: 4 }} />
          Currently not available to donate
        </div>
      )}
    </div>
  );
}
