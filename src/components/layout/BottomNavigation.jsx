import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Search, Plus, Bell, User,
  Droplets, Users, BarChart3, Settings, LogOut, ScrollText, Menu, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BottomNavigation() {
  const { user, logout, notifications, requests } = useAuth();
  const navigate = useNavigate();
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Notification count
  const unreadCount = user?.role === 'user'
    ? (notifications || []).filter(n => n.donor_id === user.id && !n.is_read).length
    : 0;

  // Requests count
  const openRequestsCount = (requests || []).filter(r => r.status === 'open').length;

  if (user.role === 'admin') {
    return (
      <>
        <div className="bottom-nav admin-bottom-nav">
          <NavLink to="/" end className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Home</span>
          </NavLink>
          <NavLink to="/requests" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <div style={{ position: 'relative' }}>
              <Droplets size={20} />
              {openRequestsCount > 0 && <span className="bottom-nav-badge">{openRequestsCount}</span>}
            </div>
            <span>Requests</span>
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            <span>Users</span>
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <BarChart3 size={20} />
            <span>Reports</span>
          </NavLink>
          <button 
            type="button" 
            onClick={() => setShowAdminMenu(prev => !prev)} 
            className={`bottom-nav-item btn-clean ${showAdminMenu ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            <Menu size={20} />
            <span>More</span>
          </button>
        </div>

        {/* More admin actions menu overlay */}
        {showAdminMenu && (
          <div className="admin-menu-overlay" onClick={() => setShowAdminMenu(false)}>
            <div className="admin-menu-sheet animate-slideUp" onClick={e => e.stopPropagation()}>
              <div className="admin-menu-header">
                <h3>Admin Actions</h3>
                <button type="button" className="btn-close" onClick={() => setShowAdminMenu(false)}>
                  <X size={18} />
                </button>
              </div>
              <div className="admin-menu-list">
                <NavLink to="/audit" className="admin-menu-link" onClick={() => setShowAdminMenu(false)}>
                  <ScrollText size={18} />
                  <span>System Audit Logs</span>
                </NavLink>
                <NavLink to="/settings" className="admin-menu-link" onClick={() => setShowAdminMenu(false)}>
                  <Settings size={18} />
                  <span>Platform Settings</span>
                </NavLink>
                <button onClick={() => { handleLogout(); setShowAdminMenu(false); }} className="admin-menu-link btn-clean text-red" style={{ width: '100%', textAlign: 'left' }}>
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // User role
  return (
    <div className="bottom-nav user-bottom-nav">
      <NavLink to="/dashboard" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={20} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/find-blood" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Search size={20} />
        <span>Find Blood</span>
      </NavLink>
      <NavLink to="/request-blood" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <div className="bottom-nav-center-btn">
          <Plus size={24} color="#ffffff" />
        </div>
        <span style={{ marginTop: 4 }}>Request</span>
      </NavLink>
      <NavLink to="/notifications" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <div style={{ position: 'relative' }}>
          <Bell size={20} />
          {unreadCount > 0 && <span className="bottom-nav-badge">{unreadCount}</span>}
        </div>
        <span>Alerts</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <User size={20} />
        <span>Profile</span>
      </NavLink>
    </div>
  );
}
