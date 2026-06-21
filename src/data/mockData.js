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
  open:                 { label: 'Open',                color: 'info'    },
  partially_fulfilled:  { label: 'Partially Fulfilled', color: 'warning' },
  fulfilled:            { label: 'Fulfilled',           color: 'success' },
  expired:              { label: 'Expired',             color: 'neutral' },
  cancelled:            { label: 'Cancelled',           color: 'neutral' },
};

export const DONOR_MATCH_OUTCOMES = {
  donated:   { label: 'Donated',   color: 'success' },
  no_show:   { label: 'No-Show',   color: 'danger'  },
  cancelled: { label: 'Cancelled', color: 'neutral' },
  pending:   { label: 'Pending',   color: 'warning' },
};

// Mock data — donors
export const MOCK_DONORS = [
  { id: 'd1', name: 'Amara Okonkwo',    blood_type: 'O-',  city: 'Lagos',   region: 'Lagos State',    is_available: true,  donation_count: 12, last_donation_date: '2026-01-10', phone: '+234-801-234-5678', email: 'amara@example.com', is_flagged: false, weight_kg: 68, created_at: '2024-03-15' },
  { id: 'd2', name: 'Chidi Eze',         blood_type: 'A+',  city: 'Lagos',   region: 'Lagos State',    is_available: true,  donation_count: 5,  last_donation_date: '2025-11-22', phone: '+234-802-345-6789', email: 'chidi@example.com',  is_flagged: false, weight_kg: 75, created_at: '2024-06-20' },
  { id: 'd3', name: 'Fatima Al-Sayed',   blood_type: 'B+',  city: 'Abuja',   region: 'FCT',            is_available: false, donation_count: 8,  last_donation_date: '2026-05-30', phone: '+234-803-456-7890', email: 'fatima@example.com', is_flagged: false, weight_kg: 62, created_at: '2024-07-11' },
  { id: 'd4', name: 'Emeka Nwosu',       blood_type: 'AB+', city: 'Enugu',   region: 'Enugu State',    is_available: true,  donation_count: 2,  last_donation_date: '2025-08-15', phone: '+234-804-567-8901', email: 'emeka@example.com',  is_flagged: false, weight_kg: 80, created_at: '2025-01-03' },
  { id: 'd5', name: 'Ngozi Adeyemi',     blood_type: 'O+',  city: 'Lagos',   region: 'Lagos State',    is_available: true,  donation_count: 20, last_donation_date: '2026-03-05', phone: '+234-805-678-9012', email: 'ngozi@example.com',  is_flagged: true,  weight_kg: 58, created_at: '2023-09-18' },
  { id: 'd6', name: 'Bashir Usman',      blood_type: 'B-',  city: 'Kano',    region: 'Kano State',     is_available: true,  donation_count: 6,  last_donation_date: '2025-10-10', phone: '+234-806-789-0123', email: 'bashir@example.com', is_flagged: false, weight_kg: 72, created_at: '2024-02-28' },
  { id: 'd7', name: 'Chioma Obi',        blood_type: 'A-',  city: 'Port Harcourt', region: 'Rivers State', is_available: true, donation_count: 3, last_donation_date: '2025-12-01', phone: '+234-807-890-1234', email: 'chioma@example.com', is_flagged: false, weight_kg: 55, created_at: '2025-03-10' },
  { id: 'd8', name: 'Tunde Alabi',       blood_type: 'O-',  city: 'Ibadan',  region: 'Oyo State',      is_available: false, donation_count: 15, last_donation_date: '2026-06-01', phone: '+234-808-901-2345', email: 'tunde@example.com',  is_flagged: false, weight_kg: 78, created_at: '2023-05-22' },
];

// Mock data — hospitals
export const MOCK_HOSPITALS = [
  { id: 'h1', name: 'Lagos General Hospital',       city: 'Lagos',   region: 'Lagos State',   status: 'approved',  license_number: 'LGH-2023-001', primary_contact_name: 'Dr. Folake Oyelaran', primary_contact_phone: '+234-811-111-1111', primary_contact_email: 'contact@lgh.gov.ng', created_at: '2024-01-15' },
  { id: 'h2', name: 'National Orthopedic Hospital', city: 'Enugu',   region: 'Enugu State',   status: 'approved',  license_number: 'NOH-2022-045', primary_contact_name: 'Dr. Chukwuma Okafor', primary_contact_phone: '+234-812-222-2222', primary_contact_email: 'contact@noh.gov.ng', created_at: '2024-03-20' },
  { id: 'h3', name: 'Eko Hospital',                 city: 'Lagos',   region: 'Lagos State',   status: 'pending',   license_number: 'EKO-2024-012', primary_contact_name: 'Mr. Segun Adebayo',   primary_contact_phone: '+234-813-333-3333', primary_contact_email: 'admin@ekohospital.com', created_at: '2026-05-10' },
  { id: 'h4', name: 'Aminu Kano Teaching Hospital', city: 'Kano',    region: 'Kano State',    status: 'approved',  license_number: 'AKT-2023-078', primary_contact_name: 'Dr. Maryam Bello',    primary_contact_phone: '+234-814-444-4444', primary_contact_email: 'info@akth.edu.ng', created_at: '2024-02-08' },
  { id: 'h5', name: 'Rivers State University Hospital', city: 'Port Harcourt', region: 'Rivers State', status: 'suspended', license_number: 'RSU-2021-099', primary_contact_name: 'Dr. Okechukwu Eze', primary_contact_phone: '+234-815-555-5555', primary_contact_email: 'contact@rsuh.edu.ng', created_at: '2023-11-01' },
];

// Mock data — blood requests
export const MOCK_REQUESTS = [
  { id: 'r1', hospital_id: 'h1', hospital_name: 'Lagos General Hospital', blood_type: 'O-', compatible_types: ['O-'], units_needed: 3, units_fulfilled: 1, urgency: 'critical', status: 'open', notes: 'Trauma surgery patient — critical blood loss. Immediate requirement.', response_deadline: '2026-06-20T16:00:00', expires_at: '2026-06-20T20:00:00', matching_donor_count: 4, created_at: '2026-06-20T14:00:00' },
  { id: 'r2', hospital_id: 'h2', hospital_name: 'National Orthopedic Hospital', blood_type: 'A+', compatible_types: ['A+', 'A-', 'O+', 'O-'], units_needed: 2, units_fulfilled: 0, urgency: 'urgent', status: 'open', notes: 'Pre-operative blood reserve for scheduled hip replacement.', response_deadline: '2026-06-21T08:00:00', expires_at: '2026-06-22T08:00:00', matching_donor_count: 12, created_at: '2026-06-20T10:00:00' },
  { id: 'r3', hospital_id: 'h1', hospital_name: 'Lagos General Hospital', blood_type: 'B+', compatible_types: ['B+', 'B-', 'O+', 'O-'], units_needed: 1, units_fulfilled: 1, urgency: 'standard', status: 'fulfilled', notes: 'Elective surgery support.', response_deadline: '2026-06-19T18:00:00', expires_at: '2026-06-19T18:00:00', matching_donor_count: 8, created_at: '2026-06-18T09:00:00' },
  { id: 'r4', hospital_id: 'h4', hospital_name: 'Aminu Kano Teaching Hospital', blood_type: 'AB-', compatible_types: ['A-', 'B-', 'AB-', 'O-'], units_needed: 2, units_fulfilled: 0, urgency: 'urgent', status: 'open', notes: 'Rare blood type required for paediatric patient.', response_deadline: '2026-06-21T12:00:00', expires_at: '2026-06-21T12:00:00', matching_donor_count: 2, created_at: '2026-06-20T06:00:00' },
];

// Mock matches (donor responses to requests)
export const MOCK_MATCHES = [
  { id: 'm1', request_id: 'r1', donor_id: 'd1', donor_name: 'Amara Okonkwo', blood_type: 'O-', phone: '+234-801-234-5678', email: 'amara@example.com', response: 'available', responded_at: '2026-06-20T14:30:00', outcome: 'pending' },
  { id: 'm2', request_id: 'r1', donor_id: 'd8', donor_name: 'Tunde Alabi',    blood_type: 'O-', phone: '+234-808-901-2345', email: 'tunde@example.com',  response: 'unavailable', responded_at: '2026-06-20T14:15:00', outcome: null },
  { id: 'm3', request_id: 'r2', donor_id: 'd2', donor_name: 'Chidi Eze',      blood_type: 'A+', phone: '+234-802-345-6789', email: 'chidi@example.com',  response: 'available', responded_at: '2026-06-20T11:00:00', outcome: 'pending' },
  { id: 'm4', request_id: 'r3', donor_id: 'd3', donor_name: 'Fatima Al-Sayed', blood_type: 'B+', phone: '+234-803-456-7890', email: 'fatima@example.com', response: 'available', responded_at: '2026-06-18T12:00:00', outcome: 'donated' },
];

// Mock donor notifications
export const MOCK_DONOR_NOTIFICATIONS = [
  { id: 'n1', type: 'blood_request', title: '🚨 Critical: O- Blood Needed', body: 'Lagos General Hospital urgently needs O- blood. 3 units required. Respond by 4:00 PM today.', is_read: false, created_at: '2026-06-20T14:02:00', request_id: 'r1' },
  { id: 'n2', type: 'blood_request', title: '⚠️ Urgent: A+ Blood Needed', body: 'National Orthopedic Hospital needs A+ blood for surgery. 2 units. Respond within 18 hours.', is_read: false, created_at: '2026-06-20T10:05:00', request_id: 'r2' },
  { id: 'n3', type: 'outcome_recorded', title: '❤️ Thank You, Amara!', body: 'Your donation on Jun 18 was recorded successfully. You may have saved a life today!', is_read: true, created_at: '2026-06-18T15:00:00', request_id: 'r3' },
];

// Mock audit logs
export const MOCK_AUDIT_LOGS = [
  { id: 'al1', actor: 'Dr. Folake Oyelaran', actor_role: 'hospital_staff', action: 'CREATE_REQUEST',     target: 'Blood Request #r1', ip: '196.10.0.1',   performed_at: '2026-06-20T14:00:00' },
  { id: 'al2', actor: 'Amara Okonkwo',       actor_role: 'donor',          action: 'RESPOND_AVAILABLE',  target: 'Blood Request #r1', ip: '41.58.0.2',    performed_at: '2026-06-20T14:30:00' },
  { id: 'al3', actor: 'Admin RehabNation',   actor_role: 'admin',          action: 'APPROVE_HOSPITAL',   target: 'Hospital h1',       ip: '10.0.0.1',     performed_at: '2026-06-15T09:00:00' },
  { id: 'al4', actor: 'Admin RehabNation',   actor_role: 'admin',          action: 'FLAG_DONOR',         target: 'Donor d5',          ip: '10.0.0.1',     performed_at: '2026-06-10T11:30:00' },
  { id: 'al5', actor: 'Dr. Chukwuma Okafor', actor_role: 'hospital_staff', action: 'RECORD_OUTCOME',     target: 'Match #m4 (donated)', ip: '196.10.5.3', performed_at: '2026-06-18T15:00:00' },
  { id: 'al6', actor: 'Dr. Folake Oyelaran', actor_role: 'hospital_staff', action: 'CREATE_REQUEST',     target: 'Blood Request #r3', ip: '196.10.0.1',   performed_at: '2026-06-18T09:00:00' },
];

// Platform stats for admin
export const PLATFORM_STATS = {
  total_donors: 1284,
  active_donors: 947,
  total_hospitals: 42,
  pending_hospitals: 3,
  open_requests: 7,
  critical_requests: 2,
  donations_this_month: 89,
  fulfillment_rate: 0.76,
};
