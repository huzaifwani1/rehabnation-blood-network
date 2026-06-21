-- ============================================================================
-- REHABNATION BLOOD NETWORK - DATABASE SCHEMA (PostgreSQL)
-- ============================================================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- ENUMS DEFINITIONS
-- ----------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('donor', 'hospital', 'admin');
CREATE TYPE blood_group AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE verification_status AS ENUM ('unverified', 'camp_verified');
CREATE TYPE hospital_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE urgency_tier AS ENUM ('critical', 'urgent', 'standard');
CREATE TYPE request_status AS ENUM ('open', 'fulfilled', 'expired', 'cancelled');
CREATE TYPE match_response AS ENUM ('pending', 'available', 'unavailable');
CREATE TYPE match_outcome AS ENUM ('pending', 'donated', 'no_show', 'cancelled');
CREATE TYPE notification_type AS ENUM ('blood_request', 'match_alert', 'outcome_recorded', 'announcement');

-- ----------------------------------------------------------------------------
-- TABLES
-- ----------------------------------------------------------------------------

-- 1. users Table (Authentication & Role management)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. donors Table (Donor profile and health stats)
CREATE TABLE donors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(200) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender gender_type NOT NULL,
    phone_number VARCHAR(20) NOT NULL, -- Encrypted at application level in production
    email VARCHAR(255) NOT NULL,
    blood_group blood_group NOT NULL,
    district VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    current_city_district VARCHAR(100) NOT NULL,
    weight_kg DECIMAL(5,2) NOT NULL CHECK (weight_kg >= 0.00),
    hemoglobin_level DECIMAL(4,2) NOT NULL CHECK (hemoglobin_level >= 0.00),
    last_donation_date DATE,
    total_donations INTEGER DEFAULT 0 NOT NULL CHECK (total_donations >= 0),
    verification_status verification_status DEFAULT 'unverified' NOT NULL,
    is_available BOOLEAN DEFAULT TRUE NOT NULL,
    is_flagged BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT check_donor_age CHECK (
        date_of_birth <= CURRENT_DATE - INTERVAL '18 years' AND 
        date_of_birth >= CURRENT_DATE - INTERVAL '65 years'
    )
);

-- 3. hospitals Table (Accredited hospital data)
CREATE TABLE hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    district VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    status hospital_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. admins Table (RehabNation platform administrators)
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. emergency_requests Table (Blood donation requests by hospitals)
CREATE TABLE emergency_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE RESTRICT,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    blood_group blood_group NOT NULL,
    units_needed INTEGER NOT NULL CHECK (units_needed > 0),
    units_fulfilled INTEGER DEFAULT 0 NOT NULL CHECK (units_fulfilled <= units_needed),
    urgency urgency_tier DEFAULT 'standard' NOT NULL,
    district VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    status request_status DEFAULT 'open' NOT NULL,
    expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. request_donor_matches Table (Matching and responding queue)
CREATE TABLE request_donor_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES emergency_requests(id) ON DELETE CASCADE,
    donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
    notified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    response match_response DEFAULT 'pending' NOT NULL,
    responded_at TIMESTAMP WITH TIME ZONE,
    outcome match_outcome DEFAULT 'pending' NOT NULL,
    outcome_recorded_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (request_id, donor_id)
);

-- 7. notifications Table (In-app notifications audit trail)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 8. donation_history Table (Logs of actual donation outcomes)
CREATE TABLE donation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE RESTRICT,
    request_id UUID REFERENCES emergency_requests(id) ON DELETE SET NULL,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
    donation_date DATE NOT NULL,
    weight_at_donation DECIMAL(5,2),
    hb_at_donation DECIMAL(4,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ----------------------------------------------------------------------------
-- INDEXES FOR OPTIMIZED SEARCH & SMART MATCHING
-- ----------------------------------------------------------------------------
CREATE INDEX idx_donors_matching_compound ON donors (blood_group, current_city_district, is_available, is_flagged);
CREATE INDEX idx_donors_cooldown ON donors (last_donation_date);
CREATE INDEX idx_emergency_requests_status ON emergency_requests (status, urgency);
CREATE INDEX idx_matches_request_donor ON request_donor_matches (request_id, donor_id);
CREATE INDEX idx_notifications_recipient_read ON notifications (recipient_id, is_read);

-- ----------------------------------------------------------------------------
-- SMART MATCHING LOGIC (PostgreSQL Stored Function)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION find_compatible_donors(
    p_blood_group blood_group,
    p_district VARCHAR,
    p_min_weight DECIMAL DEFAULT 50.0,
    p_min_hb DECIMAL DEFAULT 12.5
)
RETURNS TABLE (
    donor_id UUID,
    full_name VARCHAR,
    phone_number VARCHAR,
    email VARCHAR,
    blood_group blood_group,
    current_city_district VARCHAR,
    last_donation_date DATE,
    verification_status verification_status
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id as donor_id,
        d.full_name,
        d.phone_number,
        d.email,
        d.blood_group,
        d.current_city_district,
        d.last_donation_date,
        d.verification_status
    FROM donors d
    JOIN users u ON d.user_id = u.id
    WHERE u.is_active = TRUE
      AND d.is_available = TRUE
      AND d.is_flagged = FALSE
      -- Age eligibility: 18 - 65
      AND d.date_of_birth <= CURRENT_DATE - INTERVAL '18 years'
      AND d.date_of_birth >= CURRENT_DATE - INTERVAL '65 years'
      -- Health eligibility checks
      AND d.weight_kg >= p_min_weight
      AND d.hemoglobin_level >= p_min_hb
      -- Cooldown check: 56 days whole-blood interval
      AND (d.last_donation_date IS NULL OR d.last_donation_date <= CURRENT_DATE - INTERVAL '56 days')
      -- Location Proximity Match (either home district or current location district)
      AND (d.district = p_district OR d.current_city_district = p_district)
      -- Blood Compatibility Rules
      AND d.blood_group IN (
          CASE p_blood_group
              WHEN 'A+'  THEN ARRAY['A+', 'A-', 'O+', 'O-']::blood_group[]
              WHEN 'A-'  THEN ARRAY['A-', 'O-']::blood_group[]
              WHEN 'B+'  THEN ARRAY['B+', 'B-', 'O+', 'O-']::blood_group[]
              WHEN 'B-'  THEN ARRAY['B-', 'O-']::blood_group[]
              WHEN 'AB+' THEN ARRAY['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']::blood_group[]
              WHEN 'AB-' THEN ARRAY['AB-', 'A-', 'B-', 'O-']::blood_group[]
              WHEN 'O+'  THEN ARRAY['O+', 'O-']::blood_group[]
              WHEN 'O-'  THEN ARRAY['O-']::blood_group[]
          END
      )
    -- Priority Sorting:
    -- 1. Verified donors first (camp verified)
    -- 2. Ready donors with no recent donation first (longest cooldown duration)
    ORDER BY 
        CASE d.verification_status WHEN 'camp_verified' THEN 1 ELSE 2 END,
        d.last_donation_date NULLS FIRST;
END;
$$ LANGUAGE plpgsql;
