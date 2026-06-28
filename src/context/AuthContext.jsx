import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const validateEmailFormat = (email) => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const mapUserResponse = (u) => {
  if (!u) return null;

  const name = u.name || 'User';
  const initials = u.initials || name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return {
    id: u._id || u.id,
    role: u.role || 'hospital',
    email: u.email,
    name: name,
    phone: u.phone,
    license_number: u.license_number,
    district: u.district,
    address: u.address,
    initials: initials,
    status: u.status || 'pending',
    created_at: u.created_at
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [donors, setDonors] = useState([]);
  const [auditLogs, setAuditLogs] = useState(() => {
    const stored = localStorage.getItem('rehabnation_audit_logs');
    return stored ? JSON.parse(stored) : [];
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      showToast('Session expired. Please log in again.', 'error');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('rehabnation:unauthorized', handleUnauthorized);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('rehabnation:unauthorized', handleUnauthorized);
      }
    };
  }, []);

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
      console.error('Error fetching hospitals:', e);
    }
  };

  const fetchDonors = async (filters = {}) => {
    try {
      const res = await api.get('/donors', { params: filters });
      setDonors(res.data || []);
    } catch (e) {
      console.error('Error fetching donors:', e);
    }
  };

  const createDonor = async (donorData) => {
    try {
      const res = await api.post('/donors', donorData);
      if (res.data.success) {
        if (user) {
          addAuditLog(user.name, user.role, 'CREATE_DONOR', `Created donor record for ${donorData.full_name}`);
        }
        await fetchDonors();
        return { success: true };
      }
      return { success: false, error: 'Failed to create donor record' };
    } catch (e) {
      console.error('Error creating donor:', e);
      return { success: false, error: e.response?.data?.error || e.message || 'Failed to create donor' };
    }
  };

  const updateDonor = async (donorId, donorData) => {
    try {
      const res = await api.put(`/donors/${donorId}`, donorData);
      if (res.data.success) {
        if (user) {
          addAuditLog(user.name, user.role, 'UPDATE_DONOR', `Updated donor record for ${donorData.full_name}`);
        }
        await fetchDonors();
        return { success: true };
      }
      return { success: false, error: 'Failed to update donor record' };
    } catch (e) {
      console.error('Error updating donor:', e);
      return { success: false, error: e.response?.data?.error || e.message || 'Failed to update donor' };
    }
  };

  const deleteDonor = async (donorId) => {
    try {
      const res = await api.delete(`/donors/${donorId}`);
      if (res.data.success) {
        if (user) {
          addAuditLog(user.name, user.role, 'DELETE_DONOR', `Deleted donor record: ${donorId}`);
        }
        await fetchDonors();
        return { success: true };
      }
      return { success: false, error: 'Failed to delete donor record' };
    } catch (e) {
      console.error('Error deleting donor:', e);
      return { success: false, error: e.response?.data?.error || e.message || 'Failed to delete donor' };
    }
  };

  const importDonors = async (donorsArray) => {
    try {
      const res = await api.post('/donors/import', { donors: donorsArray });
      if (res.data.success) {
        if (user) {
          addAuditLog(user.name, user.role, 'IMPORT_DONORS', `Imported ${res.data.count} donor records`);
        }
        await fetchDonors();
        return { success: true, count: res.data.count };
      }
      return { success: false, error: 'Failed to import donor records' };
    } catch (e) {
      console.error('Error importing donors:', e);
      return { success: false, error: e.response?.data?.error || e.message || 'Failed to import donors' };
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/donors/stats');
      return res.data;
    } catch (e) {
      console.error('Error fetching statistics:', e);
      return null;
    }
  };

  const loadAllSessionData = async (currentUser) => {
    if (!currentUser) return;
    await Promise.all([
      currentUser.role === 'admin' ? fetchUsers() : Promise.resolve(),
      fetchDonors()
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
        
        if (rawUser && rawUser.role !== role) {
          return { success: false, error: `Account does not have the ${role} role` };
        }

        const mapped = mapUserResponse(rawUser);
        if (!mapped) {
          return { success: false, error: 'Invalid server response' };
        }

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
    const { email, password, name, phone, license_number, district, address } = userData;

    if (!email || !email.trim() || !validateEmailFormat(email)) {
      return { success: false, error: 'Invalid email format' };
    }

    if (!password || password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    try {
      const res = await api.post('/auth/register', {
        email,
        password,
        name,
        phone,
        license_number,
        district,
        address
      });

      if (res.data.success) {
        const { token, user: rawUser } = res.data;
        const mapped = mapUserResponse(rawUser);
        
        if (!mapped) {
          return { success: false, error: 'Invalid server response' };
        }

        // Do not auto-login hospitals that are pending approval
        addAuditLog(mapped.name, 'hospital', 'REGISTER', 'Registered organization account');
        
        return { success: true, pendingApproval: true };
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
    setDonors([]);
    localStorage.removeItem('rehabnation_token');
    localStorage.removeItem('rehabnation_current_user');
  };

  const updateUserProfile = async (userId, profileData) => {
    try {
      const res = await api.put('/users/me', profileData);
      const mapped = mapUserResponse(res.data);
      setUser(mapped);
      localStorage.setItem('rehabnation_current_user', JSON.stringify(mapped));
      
      setUsers(prev => prev.map(u => u.id === userId ? mapped : u));
      return { success: true };
    } catch (e) {
      console.error('Profile update error', e);
      return { success: false, error: e.response?.data?.error || e.message || 'Profile update failed' };
    }
  };

  const deleteSelfAccount = async () => {
    try {
      const res = await api.delete('/users/me');
      if (res.data.success) {
        logout();
        return { success: true };
      }
      return { success: false, error: 'Failed to delete account' };
    } catch (e) {
      console.error('Account deletion error', e);
      return { success: false, error: e.response?.data?.error || e.message || 'Deletion failed' };
    }
  };

  const suspendUserAccount = async (userId, isSuspendedOrStatus) => {
    // isSuspendedOrStatus can be a boolean or a status string
    let status = isSuspendedOrStatus;
    if (typeof isSuspendedOrStatus === 'boolean') {
      status = isSuspendedOrStatus ? 'suspended' : 'approved';
    }
    
    try {
      const res = await api.patch(`/users/${userId}/suspend`, { status });
      if (res.data.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
        if (user) {
          addAuditLog(user.name, 'admin', status.toUpperCase() + '_HOSPITAL', `Updated status of hospital ${userId} to ${status}`);
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
          addAuditLog(user.name, 'admin', 'DELETE_HOSPITAL', `Deleted hospital account: ${userId}`);
        }
        return { success: true };
      }
      return { success: false };
    } catch (e) {
      console.error(e);
      return { success: false, error: e.response?.data?.error || e.message };
    }
  };

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
        donors,
        auditLogs,
        login,
        registerUser,
        logout,
        updateUserProfile,
        deleteSelfAccount,
        suspendUserAccount,
        deleteUserAccount,
        fetchDonors,
        createDonor,
        updateDonor,
        deleteDonor,
        importDonors,
        fetchStats,
        toast,
        showToast
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
