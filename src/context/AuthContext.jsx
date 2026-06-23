import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const validateEmailFormat = (email) => {
  if (!email) return true; // Email is optional
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const mapUserResponse = (u) => {
  if (!u) return null;
  return {
    id: u._id || u.id,
    role: u.role,
    email: u.email,
    name: u.name,
    phone: u.phone,
    dob: u.dob,
    gender: u.gender,
    blood_type: u.blood_type,
    district: u.district,
    address: u.address,
    weight_kg: u.weight_kg,
    hemoglobin_level: u.hemoglobin_level,
    last_donation_date: u.last_donation_date,
    donation_count: u.donation_count,
    verification_status: u.verification_status,
    is_available: u.is_available,
    initials: u.initials,
    status: u.status,
    is_flagged: u.is_flagged,
    created_at: u.created_at
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [matches, setMatches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState(() => {
    const stored = localStorage.getItem('rehabnation_audit_logs');
    return stored ? JSON.parse(stored) : [];
  });
  const [loading, setLoading] = useState(true);

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

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers((res.data || []).map(mapUserResponse));
    } catch (e) {
      console.error('Error fetching users:', e);
    }
  };

  const fetchAllRequestsAndMatches = async (currentUser) => {
    try {
      const res = await api.get('/requests');
      const reqList = res.data || [];
      
      const mappedRequests = reqList.map(r => ({
        id: r._id,
        requester_id: r.requester?._id || r.requester,
        requester_name: r.requester?.name || '',
        patient_name: r.patient_name,
        hospital_name: r.hospital_name,
        location: r.district,
        blood_type: r.blood_type,
        units_needed: r.units_needed,
        units_fulfilled: r.units_fulfilled || 0,
        urgency: r.urgency,
        phone: r.phone,
        notes: r.notes || '',
        status: r.status,
        matching_donor_count: r.matching_donor_count || 0,
        created_at: r.created_at
      }));
      setRequests(mappedRequests);

      // Now fetch details for relevant requests to populate matches
      let relevantRequests = [];
      if (currentUser.role === 'admin') {
        relevantRequests = reqList;
      } else {
        relevantRequests = reqList.filter(r => (r.requester?._id || r.requester) === currentUser.id);
      }

      const matchPromises = relevantRequests.map(async (r) => {
        try {
          const detailRes = await api.get(`/requests/${r._id}`);
          return detailRes.data.matches || [];
        } catch (e) {
          console.error('Error fetching request matches', r._id, e);
          return [];
        }
      });

      const allMatchesArrays = await Promise.all(matchPromises);
      let requestMatches = allMatchesArrays.flat();

      let donorMatches = [];
      if (currentUser.role === 'user') {
        try {
          const donorMatchesRes = await api.get('/users/me/matches');
          donorMatches = donorMatchesRes.data || [];
        } catch (e) {
          console.error('Error fetching donor matches', e);
        }
      }

      const allRawMatches = [...requestMatches, ...donorMatches];
      
      const uniqueMatches = [];
      const seenIds = new Set();
      for (const m of allRawMatches) {
        if (!seenIds.has(m._id)) {
          seenIds.add(m._id);
          uniqueMatches.push(m);
        }
      }

      const mappedMatches = uniqueMatches.map(m => ({
        id: m._id,
        request_id: m.request?._id || m.request,
        donor_id: m.donor?._id || m.donor,
        donor_name: m.donor?.name || m.donor_name || 'Donor',
        blood_type: m.donor?.blood_type || m.blood_type || '',
        phone: m.donor?.phone || m.donor_phone || m.phone || '',
        email: m.donor?.email || m.donor_email || m.email || '',
        response: m.response,
        responded_at: m.responded_at,
        outcome: m.outcome
      }));

      setMatches(mappedMatches);
    } catch (error) {
      console.error('Error fetching requests and matches:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      const mapped = (res.data || []).map(n => ({
        id: n._id,
        donor_id: n.recipient?._id || n.recipient,
        type: n.type,
        title: n.title,
        body: n.body,
        is_read: n.is_read,
        created_at: n.created_at,
        request_id: n.request_id
      }));
      setNotifications(mapped);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error('Error marking notification as read:', e);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error('Error marking all notifications as read:', e);
    }
  };

  const loadAllSessionData = async (currentUser) => {
    if (!currentUser) return;
    await Promise.all([
      currentUser.role === 'admin' ? fetchUsers() : Promise.resolve(),
      fetchAllRequestsAndMatches(currentUser),
      fetchNotifications()
    ]);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('rehabnation_token');
      const cachedUser = localStorage.getItem('rehabnation_current_user');
      
      if (token && cachedUser) {
        try {
          const res = await api.get('/users/me');
          const mapped = mapUserResponse(res.data);
          setUser(mapped);
          localStorage.setItem('rehabnation_current_user', JSON.stringify(mapped));
          await loadAllSessionData(mapped);
        } catch (e) {
          console.error('Token verification failed:', e);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password, role) => {
    if (!email || !email.trim()) {
      return { success: false, error: 'Invalid email' };
    }
    if (!password) {
      return { success: false, error: 'Invalid password' };
    }

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user: rawUser } = res.data;
        
        if (rawUser.role !== role) {
          return { success: false, error: 'Account does not exist' };
        }

        const mapped = mapUserResponse(rawUser);
        localStorage.setItem('rehabnation_token', token);
        localStorage.setItem('rehabnation_current_user', JSON.stringify(mapped));
        setUser(mapped);
        
        addAuditLog(mapped.name, mapped.role, 'LOGIN', 'Successful login');
        await loadAllSessionData(mapped);
        
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (e) {
      console.error('Login error', e);
      return { success: false, error: e.response?.data?.error || e.message || 'Login failed' };
    }
  };

  const registerUser = async (userData) => {
    console.log('--- AuthContext: registerUser triggered ---');
    console.log('Received userData:', userData);
    const { email, password, full_name, phone, ...rest } = userData;

    if (email && email.trim() && !validateEmailFormat(email)) {
      console.warn('registerUser failed: Invalid email format');
      return { success: false, error: 'Invalid email format' };
    }

    if (!password || password.length < 8) {
      console.warn('registerUser failed: Password length less than 8');
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    try {
      console.log('Axios sending POST request to /auth/register...');
      const res = await api.post('/auth/register', {
        email,
        password,
        full_name,
        phone,
        ...rest
      });

      console.log('Axios registration response received:', res);

      if (res.data.success) {
        const { token, user: rawUser } = res.data;
        const mapped = mapUserResponse(rawUser);
        
        localStorage.setItem('rehabnation_token', token);
        localStorage.setItem('rehabnation_current_user', JSON.stringify(mapped));
        setUser(mapped);
        
        addAuditLog(mapped.name, 'user', 'REGISTER', 'Registered as user');
        await loadAllSessionData(mapped);
        
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (e) {
      console.error('Registration error', e);
      return { success: false, error: e.response?.data?.error || e.message || 'Registration failed' };
    }
  };

  const logout = () => {
    if (user) {
      addAuditLog(user.name, user.role, 'LOGOUT', 'Logged out');
    }
    setUser(null);
    setUsers([]);
    setRequests([]);
    setMatches([]);
    setNotifications([]);
    localStorage.removeItem('rehabnation_token');
    localStorage.removeItem('rehabnation_current_user');
  };

  const updateUserProfile = async (userId, profileData) => {
    try {
      const res = await api.put('/users/me', profileData);
      const mapped = mapUserResponse(res.data);
      setUser(mapped);
      localStorage.setItem('rehabnation_current_user', JSON.stringify(mapped));
      
      // Update in local users list
      setUsers(prev => prev.map(u => u.id === userId ? mapped : u));
      return { success: true };
    } catch (e) {
      console.error('Profile update error', e);
      return { success: false, error: e.response?.data?.error || e.message || 'Profile update failed' };
    }
  };

  const suspendUserAccount = async (userId, isSuspended) => {
    const status = isSuspended ? 'suspended' : 'approved';
    try {
      const res = await api.patch(`/users/${userId}/suspend`, { status });
      if (res.data.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
        if (user) {
          addAuditLog(user.name, 'admin', isSuspended ? 'SUSPEND_USER' : 'UNSUSPEND_USER', `Suspended user ${userId} set to ${isSuspended}`);
        }
        return { success: true };
      }
      return { success: false };
    } catch (e) {
      console.error(e);
      return { success: false, error: e.response?.data?.error || e.message };
    }
  };

  const deleteUserAccount = async (userId) => {
    try {
      const res = await api.delete(`/users/${userId}`);
      if (res.data.success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        if (user) {
          addAuditLog(user.name, 'admin', 'DELETE_USER', `Deleted user account: ${userId}`);
        }
        return { success: true };
      }
      return { success: false };
    } catch (e) {
      console.error(e);
      return { success: false, error: e.response?.data?.error || e.message };
    }
  };

  const verifyDonor = async (donorUserId, statusOrIsVerified) => {
    const status = typeof statusOrIsVerified === 'boolean'
      ? (statusOrIsVerified ? 'camp_verified' : 'unverified')
      : statusOrIsVerified;
    try {
      const res = await api.patch(`/users/${donorUserId}/verify`, { verification_status: status });
      if (res.data.success) {
        setUsers(prev => prev.map(u => u.id === donorUserId ? { ...u, verification_status: status } : u));
        if (donorUserId === user?.id) {
          setUser(prev => ({ ...prev, verification_status: status }));
        }
        if (user) {
          addAuditLog(user.name, 'admin', status === 'camp_verified' ? 'VERIFY_DONOR' : 'REVOKE_VERIFICATION', `Set donor ${donorUserId} verification to ${status}`);
        }
        return { success: true };
      }
      return { success: false };
    } catch (e) {
      console.error(e);
      return { success: false, error: e.response?.data?.error || e.message };
    }
  };

  const flagDonor = async (donorUserId, isFlagged) => {
    try {
      const res = await api.patch(`/users/${donorUserId}/flag`, { is_flagged: isFlagged });
      if (res.data.success) {
        setUsers(prev => prev.map(u => u.id === donorUserId ? { ...u, is_flagged: isFlagged } : u));
        if (user) {
          addAuditLog(user.name, 'admin', isFlagged ? 'FLAG_DONOR' : 'UNFLAG_DONOR', `Flagged status of ${donorUserId} to ${isFlagged}`);
        }
        return { success: true };
      }
      return { success: false };
    } catch (e) {
      console.error(e);
      return { success: false, error: e.response?.data?.error || e.message };
    }
  };

  const toggleAvailability = async (userId) => {
    try {
      const nextVal = !user.is_available;
      const res = await api.put('/users/me', { is_available: nextVal });
      const updatedUser = {
        ...user,
        is_available: res.data.is_available
      };
      setUser(updatedUser);
      localStorage.setItem('rehabnation_current_user', JSON.stringify(updatedUser));
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_available: nextVal } : u));
      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false, error: e.response?.data?.error || e.message };
    }
  };

  const createRequest = async (requestData) => {
    try {
      const res = await api.post('/requests', {
        patient_name: requestData.patient_name,
        blood_type: requestData.blood_type,
        hospital_name: requestData.hospital_name,
        district: requestData.location,
        units_needed: Number(requestData.units_needed),
        urgency: requestData.urgency || 'standard',
        phone: requestData.phone,
        notes: requestData.notes || ''
      });

      if (res.data.success) {
        const reqId = res.data.request._id;
        if (user) {
          addAuditLog(user.name, user.role, 'CREATE_REQUEST', `Created blood request ${reqId} matching ${res.data.matched_count} donors`);
        }
        await loadAllSessionData(user);
        return { success: true, reqId };
      }
      return { success: false, error: 'Failed to create request' };
    } catch (e) {
      console.error('Request creation error', e);
      return { success: false, error: e.response?.data?.error || e.message || 'Failed to create request' };
    }
  };

  const respondToRequest = async (matchId, response) => {
    const matchObj = matches.find(m => m.id === matchId);
    if (!matchObj) {
      console.error('Match record not found locally', matchId);
      return { success: false, error: 'Match record not found' };
    }

    try {
      const res = await api.post(`/requests/${matchObj.request_id}/respond`, { response });
      if (res.data.success) {
        setMatches(prev => prev.map(m => m.id === matchId ? { ...m, response, responded_at: new Date().toISOString() } : m));
        
        if (user) {
          addAuditLog(user.name, 'user', 'RESPOND_' + response.toUpperCase(), `Responded ${response} to request ${matchObj.request_id}`);
        }

        await fetchNotifications();
        await fetchAllRequestsAndMatches(user);
        return { success: true };
      }
      return { success: false, error: 'Failed to respond to request' };
    } catch (e) {
      console.error('Response error', e);
      return { success: false, error: e.response?.data?.error || e.message };
    }
  };

  const recordOutcome = async (matchId, outcome) => {
    const matchObj = matches.find(m => m.id === matchId);
    if (!matchObj) {
      console.error('Match record not found locally', matchId);
      return { success: false, error: 'Match record not found' };
    }

    try {
      const res = await api.post(`/requests/${matchObj.request_id}/matches/${matchId}/outcome`, { outcome });
      if (res.data.success) {
        setMatches(prev => prev.map(m => m.id === matchId ? { ...m, outcome } : m));
        
        if (user) {
          addAuditLog(user.name, user.role, 'RECORD_OUTCOME', `Recorded donation outcome ${outcome} for match ${matchId}`);
        }

        await loadAllSessionData(user);
        return { success: true };
      }
      return { success: false, error: 'Failed to record outcome' };
    } catch (e) {
      console.error('Outcome recording error', e);
      return { success: false, error: e.response?.data?.error || e.message };
    }
  };

  const suspendHospitalAccount = suspendUserAccount;
  const createHospitalAccount = () => ({ success: false, error: 'Hospital Portal deprecated' });
  const updateHospitalAccount = () => ({ success: false, error: 'Hospital Portal deprecated' });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--beige-50)' }}>
        <div className="spinner" />
      </div>
    );
  }

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
        markNotificationAsRead,
        markAllNotificationsAsRead,
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
