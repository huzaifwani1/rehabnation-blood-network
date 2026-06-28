import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, Settings, LogOut, Users,
  ScrollText, BarChart3, ShieldCheck, Plus, Upload, Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function SidebarItem({ to, icon: Icon, label, badge, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
    >
      <Icon size={17} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge && <span className="sidebar-item-badge">{badge}</span>}
    </NavLink>
  );
}

function SectionLabel({ label }) {
  return <div className="sidebar-section-label">{label}</div>;
}

export default function Sidebar() {
  const { user, logout, donors, users } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Count donor records
  const donorCount = (donors || []).length;
  const pendingHospitalsCount = (users || []).filter(u => u.role === 'hospital' && u.status === 'pending').length;

  const renderNav = () => {
    if (user?.role === 'hospital') {
      return (
        <>
          <SidebarItem to="/dashboard" end icon={LayoutDashboard} label="Donor Directory" badge={donorCount > 0 ? String(donorCount) : undefined} />
          <SidebarItem to="/import-donors" icon={Upload} label="Import Donors" />
          <SectionLabel label="Organization" />
          <SidebarItem to="/profile" icon={User} label="Profile" />
          <SidebarItem to="/settings" icon={Settings} label="Settings" />
        </>
      );
    }

    if (user?.role === 'admin') {
      return (
        <>
          <SidebarItem to="/" end icon={LayoutDashboard} label="Dashboard" />
          <SectionLabel label="Operations" />
          <SidebarItem to="/hospitals" icon={Users} label="Hospitals" badge={pendingHospitalsCount > 0 ? String(pendingHospitalsCount) : undefined} />
          <SidebarItem to="/emergency-search" icon={Search} label="National Search" />
          <SectionLabel label="Platform" />
          <SidebarItem to="/reports" icon={BarChart3} label="Reports & Stats" />
          <SidebarItem to="/audit" icon={ScrollText} label="Audit Logs" />
          <SidebarItem to="/settings" icon={Settings} label="Settings" />
        </>
      );
    }

    return null;
  };

  if (!user) return null;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <NavLink to={user.role === 'admin' ? '/' : '/dashboard'} className="sidebar-logo">
        <img src="/logo.png" alt="RehabNation Blood Network" className="sidebar-logo-img" />
      </NavLink>

      {/* Role indicator */}
      <div className="sidebar-role-pill">
        {user.role === 'hospital' && <Users size={13} color="var(--red-600)" />}
        {user.role === 'admin' && <ShieldCheck size={13} color="var(--red-600)" />}
        <span style={{ textTransform: 'capitalize' }}>{user.role === 'hospital' ? 'Hospital' : 'Super Admin'}</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {renderNav()}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={handleLogout} id="sidebar-logout-btn" title="Click to logout">
          <div className="sidebar-avatar">{user.initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-role">{user.email || user.phone}</div>
          </div>
          <LogOut size={15} color="var(--zinc-400)" />
        </div>
      </div>
    </aside>
  );
}
