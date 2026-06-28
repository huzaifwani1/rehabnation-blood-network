import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

// Layout
import AppLayout from './components/layout/AppLayout';

// Public pages
import LandingPage      from './pages/LandingPage';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import ContactPage      from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage         from './pages/TermsPage';

// Hospital pages
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import ImportDonorsPage  from './pages/hospital/ImportDonorsPage';
import UserProfile      from './pages/user/UserProfile';
import UserSettings     from './pages/user/UserSettings';

// Admin pages
import AdminLoginPage   from './pages/admin/AdminLoginPage';
import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminHospitals   from './pages/admin/AdminHospitals';
import AdminHospitalDetail from './pages/admin/AdminHospitalDetail';
import AdminDonors      from './pages/admin/AdminDonors';
import AdminEmergencySearch from './pages/admin/AdminEmergencySearch';
import AdminAuditLogs   from './pages/admin/AdminAuditLogs';
import AdminSettings    from './pages/admin/AdminSettings';
import AdminReports     from './pages/admin/AdminReports';
import AdminPendingApprovals from './pages/admin/AdminPendingApprovals';

// Protected route wrapper for Hospital Platform
function HospitalProtected({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'hospital') return <Navigate to="/" replace />;
  return children;
}

// Protected route wrapper for Admin Panel
function AdminProtected({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  return children;
}

// Redirect logged-in users away from login/register
function PublicOnly({ children }) {
  const { user } = useAuth();
  if (user?.role === 'hospital') return <Navigate to="/dashboard" replace />;
  if (user?.role === 'admin') return <Navigate to="/" replace />;
  return children;
}

// Global ToastNotification component
function ToastNotification() {
  const { toast } = useAuth();
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={16} color="var(--green-700)" />,
    error: <AlertCircle size={16} color="var(--red-700)" />,
    warning: <AlertTriangle size={16} color="var(--amber-700)" />,
    info: <Info size={16} color="var(--blue-700)" />
  };

  const bgStyles = {
    success: 'rgba(22, 163, 74, 0.08)',
    error: 'rgba(220, 38, 38, 0.08)',
    warning: 'rgba(217, 119, 6, 0.08)',
    info: 'rgba(37, 99, 235, 0.08)'
  };

  const borderStyles = {
    success: '1px solid rgba(22, 163, 74, 0.2)',
    error: '1px solid rgba(220, 38, 38, 0.2)',
    warning: '1px solid rgba(217, 119, 6, 0.2)',
    info: '1px solid rgba(37, 99, 235, 0.2)'
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 'calc(24px + env(safe-area-inset-top))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        border: borderStyles[toast.type] || '1px solid var(--border-base)',
        padding: '12px 20px',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontWeight: 600,
        color: 'var(--zinc-900)',
        fontSize: '0.875rem',
        animation: 'slideUp 0.3s ease-out',
        maxWidth: '90vw',
        width: 'max-content'
      }}
    >
      <div style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: bgStyles[toast.type] || 'var(--zinc-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {icons[toast.type] || <Info size={16} />}
      </div>
      <div style={{ flexGrow: 1, paddingRight: 4 }}>{toast.message}</div>
    </div>
  );
}

// Public App Routes (hospital workspace default)
function PublicAppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      
      {/* Hospital Workspace */}
      <Route path="/" element={<HospitalProtected><AppLayout /></HospitalProtected>}>
        <Route path="dashboard" element={<HospitalDashboard />} />
        <Route path="import-donors" element={<ImportDonorsPage />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="settings" element={<UserSettings />} />
      </Route>

      {/* Legacy redirects */}
      <Route path="/donor-login" element={<Navigate to="/login" replace />} />
      <Route path="/hospital-login" element={<Navigate to="/login" replace />} />
      <Route path="/donor" element={<Navigate to="/dashboard" replace />} />
      <Route path="/donor/*" element={<Navigate to="/dashboard" replace />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Admin App Routes (admin.rhfi.org.in / localhost:5174/admin-panel)
function AdminAppRoutes() {
  return (
    <Routes>
      {/* Admin Login */}
      <Route path="/login" element={<AdminLoginPage />} />

      {/* Admin Panel Dashboard */}
      <Route path="/" element={<AdminProtected><AppLayout /></AdminProtected>}>
        <Route index element={<AdminDashboard />} />
        <Route path="hospitals" element={<AdminHospitals />} />
        <Route path="hospitals/:id" element={<AdminHospitalDetail />} />
        <Route path="donors" element={<AdminDonors />} />
        <Route path="emergency-search" element={<AdminEmergencySearch />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="audit" element={<AdminAuditLogs />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="pending" element={<AdminPendingApprovals />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  const isLocalAdmin = window.location.pathname.startsWith('/admin-panel');
  const isAdminPanel = window.location.hostname.startsWith('admin.') || isLocalAdmin;

  if (isAdminPanel) {
    return (
      <BrowserRouter basename={isLocalAdmin ? '/admin-panel' : '/'}>
        <AuthProvider>
          <ToastNotification />
          <AdminAppRoutes />
        </AuthProvider>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastNotification />
        <PublicAppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
