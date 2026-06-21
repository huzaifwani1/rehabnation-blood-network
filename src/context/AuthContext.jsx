import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MOCK_DONORS,
  MOCK_HOSPITALS,
  MOCK_REQUESTS,
  MOCK_MATCHES,
  MOCK_DONOR_NOTIFICATIONS,
  MOCK_AUDIT_LOGS,
  BLOOD_COMPATIBILITY
} from '../data/mockData';

const AuthContext = createContext(null);

// Email validation helper
const validateEmailFormat = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

// Initial setup of users in localStorage if not exists
const initializeUsers = () => {
  const stored = localStorage.getItem('rehabnation_users');
  if (stored) return JSON.parse(stored);

  const initialUsers = [];

  // Add default admin
  initialUsers.push({
    id: 'u_admin',
    role: 'admin',
    email: 'admin@rehabnation.org',
    password: 'password123',
    name: 'RehabNation Admin',
    initials: 'RA',
  });

  // Map MOCK_DONORS
  MOCK_DONORS.forEach((donor, index) => {
    initialUsers.push({
      id: 'u_' + donor.id,
      role: 'donor',
      email: donor.email,
      password: 'password123',
      name: donor.name,
      donor_id: donor.id,
      blood_type: donor.blood_type,
      city: donor.city,
      region: donor.region,
      is_available: donor.is_available,
      donation_count: donor.donation_count,
      last_donation_date: donor.last_donation_date,
      phone: donor.phone,
      is_flagged: donor.is_flagged || false,
      weight_kg: donor.weight_kg || 65,
      created_at: donor.created_at || '2024-03-15',
      initials: donor.name.split(' ').map(n => n[0]).join(''),
      district: donor.district || (index % 2 === 0 ? 'Lagos Mainland' : 'Lagos Island'),
      current_city_district: donor.current_city_district || donor.city,
      hemoglobin_level: donor.hemoglobin_level || (12.5 + (index * 0.3)).toFixed(1),
      verification_status: donor.verification_status || (index % 3 === 0 ? 'camp_verified' : 'unverified'),
    });
  });

  // Map MOCK_HOSPITALS as users
  MOCK_HOSPITALS.forEach(hosp => {
    initialUsers.push({
      id: 'u_' + hosp.id,
      role: 'hospital',
      email: hosp.primary_contact_email,
      password: 'password123',
      name: hosp.primary_contact_name,
      hospital_id: hosp.id,
      hospital_name: hosp.name,
      city: hosp.city,
      region: hosp.region,
      initials: hosp.primary_contact_name.split(' ').map(n => n[0]).join(''),
    });
  });

  localStorage.setItem('rehabnation_users', JSON.stringify(initialUsers));
  return initialUsers;
};

// Initial setup of other models in localStorage
const getOrInitialize = (key, defaultData) => {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(key, JSON.stringify(defaultData));
  return defaultData;
};

export function AuthProvider({ children }) {
  // Initialize dynamic databases
  const [users, setUsers] = useState(() => initializeUsers());
  const [hospitals, setHospitals] = useState(() => getOrInitialize('rehabnation_hospitals', MOCK_HOSPITALS));
  const [requests, setRequests] = useState(() => getOrInitialize('rehabnation_requests', MOCK_REQUESTS));
  const [matches, setMatches] = useState(() => getOrInitialize('rehabnation_matches', MOCK_MATCHES));
  const [notifications, setNotifications] = useState(() => getOrInitialize('rehabnation_notifications', MOCK_DONOR_NOTIFICATIONS));
  const [auditLogs, setAuditLogs] = useState(() => getOrInitialize('rehabnation_audit_logs', MOCK_AUDIT_LOGS));

  // Current session user state
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('rehabnation_current_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Helper to add audit logs
  const addAuditLog = (actorName, actorRole, action, target) => {
    const newLog = {
      id: 'al' + Date.now(),
      actor: actorName,
      actor_role: actorRole,
      action,
      target,
      ip: '127.0.0.1',
      performed_at: new Date().toISOString(),
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    localStorage.setItem('rehabnation_audit_logs', JSON.stringify(updated));
  };

  // Login verification
  const login = (email, password, role) => {
    if (!email || !email.trim()) {
      return { success: false, error: 'Invalid email' };
    }
    if (!validateEmailFormat(email)) {
      return { success: false, error: 'Invalid email' };
    }
    if (!password) {
      return { success: false, error: 'Invalid password' };
    }

    const matchedUser = users.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!matchedUser) {
      return { success: false, error: 'Account does not exist' };
    }

    if (matchedUser.role !== role) {
      return { success: false, error: 'Account does not exist' };
    }

    if (matchedUser.password !== password) {
      return { success: false, error: 'Invalid password' };
    }

    // Role specific safety check: Suspended Hospitals
    if (role === 'hospital') {
      const hospitalRecord = hospitals.find(h => h.id === matchedUser.hospital_id);
      if (hospitalRecord && hospitalRecord.status === 'suspended') {
        return { success: false, error: 'Account has been suspended' };
      }
    }

    setUser(matchedUser);
    localStorage.setItem('rehabnation_current_user', JSON.stringify(matchedUser));
    
    // Add audit log
    addAuditLog(matchedUser.name, matchedUser.role + '_staff', 'LOGIN', 'Successful login');
    
    return { success: true };
  };

  // Donor registration
  const registerUser = (userData) => {
    const { email, password, role, name, ...rest } = userData;

    if (!email || !email.trim() || !validateEmailFormat(email)) {
      return { success: false, error: 'Invalid email' };
    }

    if (!password || password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    const exists = users.some(
      u => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (exists) {
      return { success: false, error: 'Account already exists' };
    }

    const initials = name
      ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : 'U';

    const newUser = {
      id: 'u_' + Date.now(),
      role,
      email: email.trim().toLowerCase(),
      password,
      name,
      initials,
      is_available: true,
      donation_count: 0,
      is_flagged: false,
      verification_status: 'unverified',
      created_at: new Date().toISOString(),
      ...rest,
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('rehabnation_users', JSON.stringify(updatedUsers));

    // Log in automatically after registration
    setUser(newUser);
    localStorage.setItem('rehabnation_current_user', JSON.stringify(newUser));

    addAuditLog(newUser.name, 'donor', 'REGISTER', 'Self registered as donor');

    return { success: true };
  };

  // Logout session
  const logout = () => {
    if (user) {
      addAuditLog(user.name, user.role + '_staff', 'LOGOUT', 'Logged out');
    }
    setUser(null);
    localStorage.removeItem('rehabnation_current_user');
  };

  // Create Hospital Account (Admin only)
  const createHospitalAccount = (hospData) => {
    const hospId = 'h_' + Date.now();
    
    // Check if user already exists
    const emailExists = users.some(u => u.email.toLowerCase() === hospData.contact_email.trim().toLowerCase());
    if (emailExists) {
      return { success: false, error: 'Account with contact email already exists' };
    }

    // 1. Create hospital record
    const newHospital = {
      id: hospId,
      name: hospData.name,
      city: hospData.city,
      region: hospData.region,
      status: 'approved',
      license_number: hospData.license_number,
      primary_contact_name: hospData.contact_name,
      primary_contact_phone: hospData.contact_phone,
      primary_contact_email: hospData.contact_email.trim().toLowerCase(),
      created_at: new Date().toISOString(),
    };

    const updatedHospitals = [...hospitals, newHospital];
    setHospitals(updatedHospitals);
    localStorage.setItem('rehabnation_hospitals', JSON.stringify(updatedHospitals));

    // 2. Create user record
    const newUser = {
      id: 'u_' + hospId,
      role: 'hospital',
      email: hospData.contact_email.trim().toLowerCase(),
      password: hospData.password || 'password123',
      name: hospData.contact_name,
      hospital_id: hospId,
      hospital_name: hospData.name,
      city: hospData.city,
      region: hospData.region,
      initials: hospData.contact_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('rehabnation_users', JSON.stringify(updatedUsers));

    if (user) {
      addAuditLog(user.name, 'admin', 'CREATE_HOSPITAL', `Created hospital: ${hospData.name}`);
    }

    return { success: true };
  };

  // Edit Hospital Account (Admin only)
  const updateHospitalAccount = (hospId, hospData) => {
    // 1. Update hospital database
    const updatedHospitals = hospitals.map(h => {
      if (h.id === hospId) {
        return {
          ...h,
          name: hospData.name,
          city: hospData.city,
          region: hospData.region,
          license_number: hospData.license_number,
          primary_contact_name: hospData.contact_name,
          primary_contact_phone: hospData.contact_phone,
          primary_contact_email: hospData.contact_email.trim().toLowerCase(),
        };
      }
      return h;
    });
    setHospitals(updatedHospitals);
    localStorage.setItem('rehabnation_hospitals', JSON.stringify(updatedHospitals));

    // 2. Update users database
    const updatedUsers = users.map(u => {
      if (u.hospital_id === hospId) {
        return {
          ...u,
          email: hospData.contact_email.trim().toLowerCase(),
          name: hospData.contact_name,
          hospital_name: hospData.name,
          city: hospData.city,
          region: hospData.region,
          initials: hospData.contact_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
          // Update password if provided
          password: hospData.password || u.password,
        };
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('rehabnation_users', JSON.stringify(updatedUsers));

    if (user) {
      addAuditLog(user.name, 'admin', 'UPDATE_HOSPITAL', `Updated hospital: ${hospData.name}`);
    }

    return { success: true };
  };

  // Suspend / Reinstate Hospital Account
  const suspendHospitalAccount = (hospId, status) => {
    const updatedHospitals = hospitals.map(h => {
      if (h.id === hospId) {
        return { ...h, status };
      }
      return h;
    });
    setHospitals(updatedHospitals);
    localStorage.setItem('rehabnation_hospitals', JSON.stringify(updatedHospitals));

    if (user) {
      addAuditLog(user.name, 'admin', status === 'suspended' ? 'SUSPEND_HOSPITAL' : 'APPROVE_HOSPITAL', `Set hospital ${hospId} status to ${status}`);
    }
  };

  // Verify Donor Verification Status
  const verifyDonor = (donorUserId, status) => {
    const updatedUsers = users.map(u => {
      if (u.id === donorUserId) {
        return { ...u, verification_status: status };
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('rehabnation_users', JSON.stringify(updatedUsers));

    if (user) {
      addAuditLog(user.name, 'admin', status === 'camp_verified' ? 'VERIFY_DONOR' : 'REVOKE_VERIFICATION', `Set donor ${donorUserId} verification to ${status}`);
    }
  };

  // Flag/Unflag Donor
  const flagDonor = (donorUserId, isFlagged) => {
    const updatedUsers = users.map(u => {
      if (u.id === donorUserId) {
        return { ...u, is_flagged: isFlagged };
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('rehabnation_users', JSON.stringify(updatedUsers));

    if (user) {
      addAuditLog(user.name, 'admin', isFlagged ? 'FLAG_DONOR' : 'UNFLAG_DONOR', `Flagged status of ${donorUserId} to ${isFlagged}`);
    }
  };

  // Create Blood Request (Hospital only)
  const createRequest = (requestData) => {
    const reqId = 'r_' + Date.now();
    const compatibilityMatrix = BLOOD_COMPATIBILITY[requestData.blood_type] || [requestData.blood_type];

    // Find compatible and available donors (exclude flagged)
    const activeDonors = users.filter(
      u => u.role === 'donor' && 
           u.is_available && 
           !u.is_flagged && 
           compatibilityMatrix.includes(u.blood_type) &&
           (!requestData.city || u.city.toLowerCase() === requestData.city.toLowerCase())
    );

    // 1. Create request record
    const newRequest = {
      id: reqId,
      hospital_id: requestData.hospital_id,
      hospital_name: requestData.hospital_name,
      blood_type: requestData.blood_type,
      compatible_types: compatibilityMatrix,
      units_needed: Number(requestData.units_needed),
      units_fulfilled: 0,
      urgency: requestData.urgency,
      status: 'open',
      notes: requestData.notes,
      response_deadline: requestData.response_deadline,
      expires_at: requestData.expires_at,
      matching_donor_count: activeDonors.length,
      created_at: new Date().toISOString()
    };

    const updatedRequests = [newRequest, ...requests];
    setRequests(updatedRequests);
    localStorage.setItem('rehabnation_requests', JSON.stringify(updatedRequests));

    // 2. Generate matches with pending responses
    const newMatches = [...matches];
    const newNotifications = [...notifications];

    activeDonors.forEach(donor => {
      // Add match record (contact details are contained, but visibility is guarded in UI)
      newMatches.push({
        id: 'm_' + Date.now() + '_' + donor.id,
        request_id: reqId,
        donor_id: donor.id,
        donor_name: donor.name,
        blood_type: donor.blood_type,
        phone: donor.phone,
        email: donor.email,
        response: 'pending',
        responded_at: null,
        outcome: null
      });

      // Add notification for donor
      newNotifications.unshift({
        id: 'n_' + Date.now() + '_' + donor.id,
        donor_id: donor.id,
        type: 'blood_request',
        title: `🚨 Emergency: ${requestData.blood_type} Needed`,
        body: `${requestData.hospital_name} has requested compatible blood. Respond availability immediately.`,
        is_read: false,
        created_at: new Date().toISOString(),
        request_id: reqId
      });
    });

    setMatches(newMatches);
    localStorage.setItem('rehabnation_matches', JSON.stringify(newMatches));

    setNotifications(newNotifications);
    localStorage.setItem('rehabnation_notifications', JSON.stringify(newNotifications));

    addAuditLog(requestData.hospital_name, 'hospital_staff', 'CREATE_REQUEST', `Created blood request ${reqId} matching ${activeDonors.length} donors`);

    return { success: true, reqId };
  };

  // Donor Responds Available/Unavailable to Request
  const respondToRequest = (matchId, response) => {
    let affectedReqId = null;
    let affectedDonorName = '';

    const updatedMatches = matches.map(m => {
      if (m.id === matchId) {
        affectedReqId = m.request_id;
        affectedDonorName = m.donor_name;
        return {
          ...m,
          response,
          responded_at: new Date().toISOString()
        };
      }
      return m;
    });

    setMatches(updatedMatches);
    localStorage.setItem('rehabnation_matches', JSON.stringify(updatedMatches));

    if (user) {
      addAuditLog(affectedDonorName, 'donor', 'RESPOND_' + response.toUpperCase(), `Responded ${response} to request ${affectedReqId}`);
    }
  };

  // Record Donation Outcome (Hospital only)
  const recordOutcome = (matchId, outcome) => {
    let donorId = null;
    let reqId = null;

    const updatedMatches = matches.map(m => {
      if (m.id === matchId) {
        donorId = m.donor_id;
        reqId = m.request_id;
        return { ...m, outcome };
      }
      return m;
    });
    setMatches(updatedMatches);
    localStorage.setItem('rehabnation_matches', JSON.stringify(updatedMatches));

    // If successfully donated, update donor profile metrics and request progress
    if (outcome === 'donated') {
      // 1. Update donor stats
      const updatedUsers = users.map(u => {
        if (u.id === donorId || u.donor_id === donorId) {
          return {
            ...u,
            donation_count: (Number(u.donation_count) || 0) + 1,
            last_donation_date: new Date().toISOString().split('T')[0]
          };
        }
        return u;
      });
      setUsers(updatedUsers);
      localStorage.setItem('rehabnation_users', JSON.stringify(updatedUsers));

      // 2. Update request progress
      const updatedRequests = requests.map(r => {
        if (r.id === reqId) {
          const newFlippedUnits = (Number(r.units_fulfilled) || 0) + 1;
          const status = newFlippedUnits >= r.units_needed ? 'fulfilled' : 'partially_fulfilled';
          return {
            ...r,
            units_fulfilled: newFlippedUnits,
            status
          };
        }
        return r;
      });
      setRequests(updatedRequests);
      localStorage.setItem('rehabnation_requests', JSON.stringify(updatedRequests));

      // 3. Add notification for donor thank you
      const newNotifications = [...notifications];
      newNotifications.unshift({
        id: 'n_thankyou_' + Date.now(),
        donor_id: donorId,
        type: 'outcome_recorded',
        title: '❤️ Thank You for Donating!',
        body: `Your blood donation has been successfully recorded. Thank you for your generosity in saving lives.`,
        is_read: false,
        created_at: new Date().toISOString(),
        request_id: reqId
      });
      setNotifications(newNotifications);
      localStorage.setItem('rehabnation_notifications', JSON.stringify(newNotifications));
    }

    if (user) {
      addAuditLog(user.name, 'hospital_staff', 'RECORD_OUTCOME', `Recorded donation outcome ${outcome} for match ${matchId}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        hospitals,
        requests,
        matches,
        notifications,
        auditLogs,
        login,
        registerUser,
        logout,
        createHospitalAccount,
        updateHospitalAccount,
        suspendHospitalAccount,
        verifyDonor,
        flagDonor,
        createRequest,
        respondToRequest,
        recordOutcome
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
