import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Droplets, LayoutDashboard, Bell, ClipboardList, History,
  User, Settings, LogOut, Users, Building2, Megaphone,
  ScrollText, BarChart3, ChevronRight, Stethoscope,
  FileText, ShieldCheck
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderNav = () => {
    if (user?.role === 'donor') {
      return (
        <>
          <SidebarItem to="/donor" end icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem to="/donor/notifications" icon={Bell} label="Notifications" badge="2" />
          <SidebarItem to="/donor/requests" icon={ClipboardList} label="My Requests" />
          <SidebarItem to="/donor/history" icon={History} label="Donation History" />
          <SectionLabel label="Account" />
          <SidebarItem to="/donor/profile" icon={User} label="My Profile" />
          <SidebarItem to="/donor/settings" icon={Settings} label="Settings" />
        </>
      );
    }

    if (user?.role === 'admin') {
      return (
        <>
          <SidebarItem to="/admin" end icon={LayoutDashboard} label="Dashboard" />
          <SectionLabel label="Operations" />
          <SidebarItem to="/admin/requests" icon={Droplets} label="Blood Requests" badge="7" />
          <SidebarItem to="/admin/donors" icon={Users} label="Donor Management" />
          <SidebarItem to="/admin/hospitals" icon={Building2} label="Hospitals" badge="3" />
          <SectionLabel label="Platform" />
          <SidebarItem to="/admin/announcements" icon={Megaphone} label="Announcements" />
          <SidebarItem to="/admin/reports" icon={BarChart3} label="Reports" />
          <SidebarItem to="/admin/audit" icon={ScrollText} label="Audit Logs" />
          <SidebarItem to="/admin/settings" icon={Settings} label="Settings" />
        </>
      );
    }

    if (user?.role === 'hospital') {
      return (
        <>
          <SidebarItem to="/hospital" end icon={LayoutDashboard} label="Dashboard" />
          <SectionLabel label="Blood Requests" />
          <SidebarItem to="/hospital/requests/new" icon={Droplets} label="Create Request" />
          <SidebarItem to="/hospital/requests" icon={ClipboardList} label="Active Requests" badge="2" />
          <SidebarItem to="/hospital/requests/past" icon={History} label="Past Requests" />
          <SectionLabel label="Hospital" />
          <SidebarItem to="/hospital/profile" icon={Building2} label="Hospital Profile" />
          <SidebarItem to="/hospital/settings" icon={Settings} label="Settings" />
        </>
      );
    }

    return null;
  };

  if (!user) return null;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <NavLink to="/" className="sidebar-logo">
        <img src="/logo.png" alt="RehabNation Blood Network" className="sidebar-logo-img" />
      </NavLink>

      {/* Role indicator */}
      <div className="sidebar-role-pill">
        {user.role === 'donor'   && <User       size={13} color="var(--red-600)" />}
        {user.role === 'admin'   && <ShieldCheck size={13} color="var(--red-600)" />}
        {user.role === 'hospital' && <Stethoscope size={13} color="var(--red-600)" />}
        <span>{user.role === 'hospital' ? 'Hospital Staff' : user.role}</span>
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
            <div className="sidebar-user-role">{user.email}</div>
          </div>
          <LogOut size={15} color="var(--zinc-400)" />
        </div>
      </div>
    </aside>
  );
}
