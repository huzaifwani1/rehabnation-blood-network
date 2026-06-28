import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BarChart3, Settings, LogOut, ScrollText, Menu, X, Upload, User, Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BottomNavigation() {
  const { user, logout, donors, users } = useAuth();
  const navigate = useNavigate();
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const donorCount = (donors || []).length;
  const pendingHospitalsCount = (users || []).filter(u => u.role === 'hospital' && u.status === 'pending').length;

  if (user.role === 'admin') {
    return (
      <>
        <div className="bottom-nav admin-bottom-nav">
          <NavLink to="/" end className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Home</span>
          </NavLink>
          <NavLink to="/hospitals" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <div style={{ position: 'relative' }}>
              <Users size={20} />
              {pendingHospitalsCount > 0 && <span className="bottom-nav-badge">{pendingHospitalsCount}</span>}
            </div>
            <span>Hospitals</span>
          </NavLink>
          <NavLink to="/emergency-search" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <Search size={20} />
            <span>Search</span>
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

  // Hospital role bottom nav
  return (
    <div className="bottom-nav user-bottom-nav">
      <NavLink to="/dashboard" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={20} />
        <span>Directory</span>
      </NavLink>
      <NavLink to="/import-donors" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Upload size={20} />
        <span>Import</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <User size={20} />
        <span>Profile</span>
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Settings size={20} />
        <span>Settings</span>
      </NavLink>
    </div>
  );
}
