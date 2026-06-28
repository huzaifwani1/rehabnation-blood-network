import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, Settings, LogOut, Users,
  ScrollText, BarChart3, ShieldCheck, ShieldAlert, Upload, Search, Building2, Database
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

  const donorCount = (donors || []).length;
  const pendingCount = (users || []).filter(u => u.role === 'hospital' && u.status === 'pending').length;

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
          <SidebarItem to="/" end icon={LayoutDashboard} label="National Dashboard" />
          <SectionLabel label="Hospital Management" />
          <SidebarItem to="/hospitals" icon={Building2} label="Hospitals" badge={pendingCount > 0 ? String(pendingCount) : undefined} />
          <SidebarItem to="/pending" icon={ShieldAlert} label="Pending Approvals" badge={pendingCount > 0 ? String(pendingCount) : undefined} />
          <SectionLabel label="Donor Registry" />
          <SidebarItem to="/donors" icon={Database} label="All Donors" badge={donorCount > 0 ? String(donorCount) : undefined} />
          <SidebarItem to="/emergency-search" icon={Search} label="Emergency Search" />
          <SectionLabel label="Platform" />
          <SidebarItem to="/reports" icon={BarChart3} label="National Analytics" />
          <SidebarItem to="/audit" icon={ScrollText} label="Audit Logs" />
          <SidebarItem to="/settings" icon={Settings} label="System Settings" />
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
