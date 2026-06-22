import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Droplets, LayoutDashboard, Bell, ClipboardList,
  User, Settings, LogOut, Users,
  ScrollText, BarChart3, ShieldCheck, Search, Plus
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
  const { user, logout, notifications, requests } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Count unread notifications for current user
  const unreadCount = user?.role === 'user'
    ? (notifications || []).filter(n => n.donor_id === user.id && !n.is_read).length
    : 0;

  // Count open requests for admin badge
  const openRequestCount = (requests || []).filter(r => r.status === 'open').length;

  const renderNav = () => {
    if (user?.role === 'user') {
      return (
        <>
          <SidebarItem to="/dashboard" end icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem to="/find-blood" icon={Search} label="Find Blood" />
          <SidebarItem to="/request-blood" icon={Plus} label="Request Blood" />
          <SidebarItem to="/my-requests" icon={ClipboardList} label="My Requests" />
          <SidebarItem
            to="/notifications"
            icon={Bell}
            label="Notifications"
            badge={unreadCount > 0 ? String(unreadCount) : undefined}
          />
          <SectionLabel label="Account" />
          <SidebarItem to="/profile" icon={User} label="My Profile" />
          <SidebarItem to="/settings" icon={Settings} label="Settings" />
        </>
      );
    }

    if (user?.role === 'admin') {
      return (
        <>
          <SidebarItem to="/" end icon={LayoutDashboard} label="Dashboard" />
          <SectionLabel label="Operations" />
          <SidebarItem
            to="/requests"
            icon={Droplets}
            label="Blood Requests"
            badge={openRequestCount > 0 ? String(openRequestCount) : undefined}
          />
          <SidebarItem to="/users" icon={Users} label="User Management" />
          <SectionLabel label="Platform" />
          <SidebarItem to="/reports" icon={BarChart3} label="Reports" />
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
        {user.role === 'user'  && <User size={13} color="var(--red-600)" />}
        {user.role === 'admin' && <ShieldCheck size={13} color="var(--red-600)" />}
        <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
        {user.role === 'user' && user.blood_type && (
          <span style={{ marginLeft: 'auto', background: 'var(--red-50)', color: 'var(--red-600)', fontWeight: 800, padding: '2px 8px', borderRadius: 99, fontSize: '0.78rem' }}>
            {user.blood_type}
          </span>
        )}
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
