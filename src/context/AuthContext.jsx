import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MOCK_DONORS,
  MOCK_REQUESTS,
  MOCK_MATCHES,
  MOCK_DONOR_NOTIFICATIONS,
  MOCK_AUDIT_LOGS,
  BLOOD_COMPATIBILITY
} from '../data/mockData';

const AuthContext = createContext(null);

const validateEmailFormat = (email) => {
  if (!email) return true; // Email is optional now
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

// Initial setup of users in localStorage if not exists or if legacy exists
const initializeUsers = () => {
  const stored = localStorage.getItem('rehabnation_users');
  if (stored) {
    const parsed = JSON.parse(stored);
    // Auto-detect and migrate legacy role schemas ('donor' or 'hospital')
    const hasLegacy = parsed.some(u => u.role === 'donor' || u.role === 'hospital');
    if (!hasLegacy) return parsed;
  }

  const initialUsers = [];

  // Add default admin
  initialUsers.push({
    id: 'u_admin',
    role: 'admin',
    email: 'admin@rehabnation.org',
    password: 'password123',
    name: 'RehabNation Admin',
    initials: 'RA',
    status: 'approved',
  });

  // Map MOCK_DONORS to unified 'user' role
  MOCK_DONORS.forEach((donor, index) => {
    initialUsers.push({
      id: 'u_' + donor.id,
      role: 'user',
      email: donor.email || '',
      password: 'password123',
      name: donor.name,
      dob: donor.dob || '1995-05-15',
      gender: donor.gender || (index % 2 === 0 ? 'male' : 'female'),
      phone: donor.phone,
      blood_type: donor.blood_type,
      city: donor.city,
      region: donor.region,
      district: donor.district || (index % 2 === 0 ? 'Lagos Mainland' : 'Lagos Island'),
      address: donor.address || 'No. 12 Health Way Road',
      current_city_district: donor.current_city_district || donor.city,
      weight_kg: donor.weight_kg || 65,
      hemoglobin_level: donor.hemoglobin_level || '13.5',
      last_donation_date: donor.last_donation_date || '',
      donation_count: donor.donation_count || 0,
      is_available: donor.is_available,
      is_flagged: donor.is_flagged || false,
      verification_status: donor.verification_status || (index % 3 === 0 ? 'camp_verified' : 'unverified'),
      status: donor.status || 'approved',
      created_at: donor.created_at || '2024-03-15',
      initials: donor.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
    });
  });

  localStorage.setItem('rehabnation_users', JSON.stringify(initialUsers));
  return initialUsers;
};

const getOrInitialize = (key, defaultData) => {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(key, JSON.stringify(defaultData));
  return defaultData;
};

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => initializeUsers());
  const [requests, setRequests] = useState(() => getOrInitialize('rehabnation_requests', MOCK_REQUESTS));
  const [matches, setMatches] = useState(() => getOrInitialize('rehabnation_matches', MOCK_MATCHES));
  const [notifications, setNotifications] = useState(() => getOrInitialize('rehabnation_notifications', MOCK_DONOR_NOTIFICATIONS));
  const [auditLogs, setAuditLogs] = useState(() => getOrInitialize('rehabnation_audit_logs', MOCK_AUDIT_LOGS));

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('rehabnation_current_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

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

  const login = (email, password, role) => {
    if (!email || !email.trim()) {
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

    if (matchedUser.status === 'suspended') {
      return { success: false, error: 'Account has been suspended' };
    }

    setUser(matchedUser);
    localStorage.setItem('rehabnation_current_user', JSON.stringify(matchedUser));
    addAuditLog(matchedUser.name, matchedUser.role, 'LOGIN', 'Successful login');
    return { success: true };
  };

  const registerUser = (userData) => {
    const { email, password, full_name, phone, ...rest } = userData;

    if (email && email.trim() && !validateEmailFormat(email)) {
      return { success: false, error: 'Invalid email format' };
    }

    if (!password || password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    if (email && email.trim()) {
      const exists = users.some(
        u => u.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (exists) {
        return { success: false, error: 'Account already exists' };
      }
    }

    const initials = full_name
      ? full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : 'U';

    const newUser = {
      id: 'u_' + Date.now(),
      role: 'user',
      email: email ? email.trim().toLowerCase() : '',
      password,
      name: full_name,
      phone,
      initials,
      is_available: true,
      donation_count: Number(userData.donation_count) || 0,
      is_flagged: false,
      verification_status: 'unverified',
      status: 'approved',
      created_at: new Date().toISOString(),
      ...rest,
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('rehabnation_users', JSON.stringify(updatedUsers));

    setUser(newUser);
    localStorage.setItem('rehabnation_current_user', JSON.stringify(newUser));
    addAuditLog(newUser.name, 'user', 'REGISTER', 'Registered as user');
    return { success: true };
  };

  const logout = () => {
    if (user) {
      addAuditLog(user.name, user.role, 'LOGOUT', 'Logged out');
    }
    setUser(null);
    localStorage.removeItem('rehabnation_current_user');
  };

  const updateUserProfile = (userId, profileData) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        const updated = { ...u, ...profileData };
        if (userId === user?.id) {
          setUser(updated);
          localStorage.setItem('rehabnation_current_user', JSON.stringify(updated));
        }
        return updated;
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('rehabnation_users', JSON.stringify(updatedUsers));
    return { success: true };
  };

  const suspendUserAccount = (userId, isSuspended) => {
    const status = isSuspended ? 'suspended' : 'approved';
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, status };
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('rehabnation_users', JSON.stringify(updatedUsers));
    if (user) {
      addAuditLog(user.name, 'admin', isSuspended ? 'SUSPEND_USER' : 'UNSUSPEND_USER', `Suspended user ${userId} set to ${isSuspended}`);
    }
  };

  const deleteUserAccount = (userId) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('rehabnation_users', JSON.stringify(updatedUsers));
    if (user) {
      addAuditLog(user.name, 'admin', 'DELETE_USER', `Deleted user account: ${userId}`);
    }
  };

  const verifyDonor = (donorUserId, statusOrIsVerified) => {
    const status = typeof statusOrIsVerified === 'boolean'
      ? (statusOrIsVerified ? 'camp_verified' : 'unverified')
      : statusOrIsVerified;
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

  const toggleAvailability = (userId) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        const updated = { ...u, is_available: !u.is_available };
        if (userId === user?.id) {
          setUser(updated);
          localStorage.setItem('rehabnation_current_user', JSON.stringify(updated));
        }
        return updated;
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('rehabnation_users', JSON.stringify(updatedUsers));
  };

  // Cooldown calculation (56-day rule)
  const isEligibleToDonate = (u) => {
    if (!u.last_donation_date) return true;
    const diffTime = Math.abs(new Date() - new Date(u.last_donation_date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 56;
  };

  const createRequest = (requestData) => {
    const reqId = 'r_' + Date.now();
    const compatibilityMatrix = BLOOD_COMPATIBILITY[requestData.blood_type] || [requestData.blood_type];

    // Find eligible matching users
    const activeUsers = users.filter(u => {
      const isUser = u.role === 'user';
      const isNotRequester = u.id !== user?.id && u.id !== requestData.requester_id;
      const isAvailable = u.is_available;
      const isNotSuspended = u.status !== 'suspended';
      const isNotFlagged = !u.is_flagged;
      const isCompatible = compatibilityMatrix.includes(u.blood_type);
      const isWeightEligible = (parseFloat(u.weight_kg) || 0) >= 50;
      const isHbEligible = (parseFloat(u.hemoglobin_level) || 0) >= 12.5;
      const isCooldownEligible = isEligibleToDonate(u);
      
      let isLocationMatch = true;
      if (requestData.location) {
        const locLower = requestData.location.toLowerCase();
        const cityLower = u.city?.toLowerCase() || '';
        const distLower = u.district?.toLowerCase() || '';
        isLocationMatch = cityLower.includes(locLower) || distLower.includes(locLower) || locLower.includes(cityLower) || locLower.includes(distLower);
      }

      return isUser && isNotRequester && isAvailable && isNotSuspended && isNotFlagged && isCompatible && isWeightEligible && isHbEligible && isCooldownEligible && isLocationMatch;
    });

    const newRequest = {
      id: reqId,
      requester_id: user?.id || requestData.requester_id || 'u_guest',
      patient_name: requestData.patient_name,
      hospital_name: requestData.hospital_name,
      location: requestData.location,
      blood_type: requestData.blood_type,
      units_needed: Number(requestData.units_needed),
      units_fulfilled: 0,
      urgency: requestData.urgency,
      phone: requestData.phone,
      notes: requestData.notes,
      status: 'open',
      matching_donor_count: activeUsers.length,
      created_at: new Date().toISOString()
    };

    const updatedRequests = [newRequest, ...requests];
    setRequests(updatedRequests);
    localStorage.setItem('rehabnation_requests', JSON.stringify(updatedRequests));

    const newMatches = [...matches];
    const newNotifications = [...notifications];

    activeUsers.forEach(matchingUser => {
      newMatches.push({
        id: 'm_' + Date.now() + '_' + matchingUser.id,
        request_id: reqId,
        donor_id: matchingUser.id,
        donor_name: matchingUser.name,
        blood_type: matchingUser.blood_type,
        phone: matchingUser.phone,
        email: matchingUser.email,
        response: 'pending',
        responded_at: null,
        outcome: null
      });

      newNotifications.unshift({
        id: 'n_' + Date.now() + '_' + matchingUser.id,
        donor_id: matchingUser.id,
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

    if (user) {
      addAuditLog(user.name, user.role, 'CREATE_REQUEST', `Created blood request ${reqId} matching ${activeUsers.length} donors`);
    }

    return { success: true, reqId };
  };

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
      addAuditLog(affectedDonorName, 'user', 'RESPOND_' + response.toUpperCase(), `Responded ${response} to request ${affectedReqId}`);
    }
  };

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

    if (outcome === 'donated') {
      const updatedUsers = users.map(u => {
        if (u.id === donorId) {
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

      const updatedRequests = requests.map(r => {
        if (r.id === reqId) {
          const newFlippedUnits = (Number(r.units_fulfilled) || 0) + 1;
          const status = newFlippedUnits >= r.units_needed ? 'fulfilled' : 'open';
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
      addAuditLog(user.name, user.role, 'RECORD_OUTCOME', `Recorded donation outcome ${outcome} for match ${matchId}`);
    }
  };

  // Legacy mappings for compile protection
  const suspendHospitalAccount = suspendUserAccount;
  const createHospitalAccount = () => ({ success: false, error: 'Hospital Portal deprecated' });
  const updateHospitalAccount = () => ({ success: false, error: 'Hospital Portal deprecated' });

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        requests,
        matches,
        notifications,
        auditLogs,
        login,
        registerUser,
        logout,
        updateUserProfile,
        suspendUserAccount,
        deleteUserAccount,
        verifyDonor,
        flagDonor,
        toggleAvailability,
        createRequest,
        respondToRequest,
        recordOutcome,
        // Legacy mappings
        suspendHospitalAccount,
        createHospitalAccount,
        updateHospitalAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
