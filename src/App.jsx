import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import AppLayout from './components/layout/AppLayout';

// Public pages
import LandingPage      from './pages/LandingPage';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import ContactPage      from './pages/ContactPage';
import FindBloodPage    from './pages/FindBloodPage';
import EmergencyFeedPage from './pages/EmergencyFeedPage';

// User pages
import UserDashboard    from './pages/user/UserDashboard';
import UserNotifications from './pages/user/UserNotifications';
import UserRequests     from './pages/user/UserRequests';
import CreateRequest    from './pages/user/CreateRequest';
import UserProfile      from './pages/user/UserProfile';
import UserSettings     from './pages/user/UserSettings';

// Admin pages
import AdminLoginPage   from './pages/admin/AdminLoginPage';
import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminUsers       from './pages/admin/AdminUsers';
import AdminRequests    from './pages/admin/AdminRequests';
import AdminAuditLogs   from './pages/admin/AdminAuditLogs';
import AdminSettings    from './pages/admin/AdminSettings';
import AdminReports     from './pages/admin/AdminReports';

// Protected route wrapper for User App
function UserProtected({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'user') return <Navigate to="/" replace />;
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
  if (user?.role === 'user') return <Navigate to="/dashboard" replace />;
  if (user?.role === 'admin') return <Navigate to="/" replace />;
  return children;
}

// Public App Routes (blood.rhfi.org.in / localhost default)
function PublicAppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
      <Route path="/contact" element={<ContactPage />} />
      
      <Route 
        path="/find-blood" 
        element={
          user && user.role === 'user' ? (
            <UserProtected><AppLayout /></UserProtected>
          ) : (
            <FindBloodPage />
          )
        }
      >
        <Route index element={<FindBloodPage />} />
      </Route>

      <Route path="/emergency-request" element={<EmergencyFeedPage />} />

      {/* User Dashboard */}
      <Route path="/" element={<UserProtected><AppLayout /></UserProtected>}>
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="notifications" element={<UserNotifications />} />
        <Route path="my-requests" element={<UserRequests />} />
        <Route path="request-blood" element={<CreateRequest />} />
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
        <Route path="users" element={<AdminUsers />} />
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
      <BrowserRouter basename={isLocalAdmin ? '/admin-panel' : '/'}>
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
