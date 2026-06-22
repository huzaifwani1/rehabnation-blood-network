// Blood type compatibility matrix
export const BLOOD_COMPATIBILITY = {
  'A+':  ['A+', 'A-', 'O+', 'O-'],
  'A-':  ['A-', 'O-'],
  'B+':  ['B+', 'B-', 'O+', 'O-'],
  'B-':  ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+':  ['O+', 'O-'],
  'O-':  ['O-'],
};

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const URGENCY_LEVELS = [
  { value: 'critical', label: 'Critical', color: 'critical' },
  { value: 'urgent',   label: 'Urgent',   color: 'urgent'   },
  { value: 'standard', label: 'Standard', color: 'standard' },
];

export const REQUEST_STATUSES = {
  open:      { label: 'Open',      color: 'info'    },
  fulfilled: { label: 'Fulfilled', color: 'success' },
  closed:    { label: 'Closed',    color: 'neutral' },
};

export const DONOR_MATCH_OUTCOMES = {
  donated:   { label: 'Donated',   color: 'success' },
  no_show:   { label: 'No-Show',   color: 'danger'  },
  cancelled: { label: 'Cancelled', color: 'neutral' },
  pending:   { label: 'Pending',   color: 'warning' },
};

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION SYSTEM — Jammu & Kashmir Districts
// Designed for future scalability: add new states/districts without code changes.
// ─────────────────────────────────────────────────────────────────────────────

export const REGIONS = [
  {
    id: 'jk',
    name: 'Jammu & Kashmir',
    districts: [
      'Srinagar',
      'Budgam',
      'Ganderbal',
      'Baramulla',
      'Kupwara',
      'Bandipora',
      'Pulwama',
      'Shopian',
      'Anantnag',
      'Kulgam',
      'Jammu',
      'Samba',
      'Kathua',
      'Udhampur',
      'Reasi',
      'Rajouri',
      'Poonch',
      'Doda',
      'Ramban',
      'Kishtwar',
    ],
  },
  // Future regions can be appended here:
  // { id: 'hp', name: 'Himachal Pradesh', districts: [...] },
];

// Flat list of all districts (from all regions) for quick access
export const ALL_DISTRICTS = REGIONS.flatMap(r => r.districts);

// ─────────────────────────────────────────────────────────────────────────────
// Clean initial database — no demo/fake data
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_DONORS = [];          // No demo donors
export const MOCK_USERS  = [];          // No demo users
export const MOCK_HOSPITALS = [];       // Hospital portal removed

export const MOCK_REQUESTS            = [];  // No demo requests
export const MOCK_MATCHES             = [];  // No demo matches
export const MOCK_DONOR_NOTIFICATIONS = [];  // No demo notifications
export const MOCK_AUDIT_LOGS          = [];  // No demo audit logs

// Platform stats are now computed dynamically from live data
// The PLATFORM_STATS object is kept for backward compat but not used for display
export const PLATFORM_STATS = {};
