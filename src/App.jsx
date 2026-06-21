import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import AppLayout from './components/layout/AppLayout';

// Public pages
import LandingPage          from './pages/LandingPage';
import DonorLoginPage       from './pages/DonorLoginPage';
import HospitalLoginPage    from './pages/HospitalLoginPage';
import RegisterPage         from './pages/RegisterPage';
import ContactPage          from './pages/ContactPage';
import { PublicFindBlood, PublicEmergencyRequest } from './pages/PublicPages';

// Donor pages
import DonorDashboard      from './pages/donor/DonorDashboard';
import DonorNotifications  from './pages/donor/DonorNotifications';
import DonorRequests       from './pages/donor/DonorRequests';
import DonorHistory        from './pages/donor/DonorHistory';
import DonorProfile        from './pages/donor/DonorProfile';
import DonorSettings       from './pages/donor/DonorSettings';

// Hospital pages
import HospitalDashboard   from './pages/hospital/HospitalDashboard';
import HospitalRequests    from './pages/hospital/HospitalRequests';
import CreateRequest       from './pages/hospital/CreateRequest';
import HospitalSettings    from './pages/hospital/HospitalSettings';

// Admin pages
import AdminLoginPage      from './pages/admin/AdminLoginPage';
import AdminDashboard      from './pages/admin/AdminDashboard';
import AdminDonors         from './pages/admin/AdminDonors';
import AdminHospitals      from './pages/admin/AdminHospitals';
import AdminRequests       from './pages/admin/AdminRequests';
import AdminAuditLogs      from './pages/admin/AdminAuditLogs';
import AdminSettings       from './pages/admin/AdminSettings';
import AdminReports        from './pages/admin/AdminReports';

// Protected route wrapper for Public App
function PublicProtected({ role, children }) {
  const { user } = useAuth();
  
  if (!user) {
    if (role === 'donor') return <Navigate to="/donor-login" replace />;
    if (role === 'hospital') return <Navigate to="/hospital-login" replace />;
    return <Navigate to="/" replace />;
  }
  
  if (role && user.role !== role) {
    if (user.role === 'donor') return <Navigate to="/donor" replace />;
    if (user.role === 'hospital') return <Navigate to="/hospital" replace />;
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// Protected route wrapper for Admin Panel
function AdminProtected({ children }) {
  const { user } = useAuth();
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Public App Routes (blood.rhfi.org.in / localhost default)
function PublicAppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/donor-login" element={<DonorLoginPage />} />
      <Route path="/hospital-login" element={<HospitalLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/find-blood" element={<PublicFindBlood />} />
      <Route path="/emergency-request" element={<PublicEmergencyRequest />} />
      
      {/* Donor Area */}
      <Route path="/donor" element={
        <PublicProtected role="donor"><AppLayout /></PublicProtected>
      }>
        <Route index element={<DonorDashboard />} />
        <Route path="notifications" element={<DonorNotifications />} />
        <Route path="requests" element={<DonorRequests />} />
        <Route path="history" element={<DonorHistory />} />
        <Route path="profile" element={<DonorProfile />} />
        <Route path="settings" element={<DonorSettings />} />
      </Route>

      {/* Hospital Area */}
      <Route path="/hospital" element={
        <PublicProtected role="hospital"><AppLayout /></PublicProtected>
      }>
        <Route index element={<HospitalDashboard />} />
        <Route path="requests" element={<HospitalRequests />} />
        <Route path="requests/new" element={<CreateRequest />} />
        <Route path="settings" element={<HospitalSettings />} />
      </Route>

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
      <Route path="/" element={
        <AdminProtected><AppLayout /></AdminProtected>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="donors" element={<AdminDonors />} />
        <Route path="hospitals" element={<AdminHospitals />} />
        <Route path="requests" element={<AdminRequests />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="audit" element={<AdminAuditLogs />} />
        <Route path="settings" element={<AdminSettings />} />
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
      <BrowserRouter basename={isLocalAdmin ? "/admin-panel" : "/"}>
        <AuthProvider>
          <AdminAppRoutes />
        </AuthProvider>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <PublicAppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
