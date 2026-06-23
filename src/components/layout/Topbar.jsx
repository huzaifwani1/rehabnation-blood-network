import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../ui/NotificationBell';
import { LogOut, User, Settings } from 'lucide-react';

const USER_PAGE_TITLES = {
  '/dashboard':      { title: 'Dashboard',        sub: 'Welcome back' },
  '/find-blood':     { title: 'Find Blood',        sub: 'Search the donor network' },
  '/request-blood':  { title: 'Request Blood',     sub: 'Create an emergency blood request' },
  '/my-requests':    { title: 'My Requests',       sub: 'Track your blood requests' },
  '/notifications':  { title: 'Notifications',     sub: 'Blood request alerts' },
  '/profile':        { title: 'My Profile',        sub: 'Manage your information' },
  '/settings':       { title: 'Settings',          sub: 'Account & privacy' },
};

const ADMIN_PAGE_TITLES = {
  '/':          { title: 'Admin Dashboard',  sub: 'Platform overview' },
  '/requests':  { title: 'Blood Requests',   sub: 'All platform requests' },
  '/users':     { title: 'User Management',  sub: 'Manage all registered users' },
  '/reports':   { title: 'Reports',          sub: 'Analytics & insights' },
  '/audit':     { title: 'Audit Logs',       sub: 'All system actions' },
  '/settings':  { title: 'Settings',         sub: 'Platform configuration' },
};

export default function Topbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const PAGE_TITLES = user?.role === 'admin' ? ADMIN_PAGE_TITLES : USER_PAGE_TITLES;
  const page = PAGE_TITLES[location.pathname] || { title: 'RehabNation', sub: '' };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-title">{page.title}</span>
        {page.sub && (
          <span className="topbar-breadcrumb">
            {page.sub}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </span>
        )}
      </div>
      <div className="topbar-right">
        <NotificationBell />
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            type="button"
            className="sidebar-avatar btn-clean"
            style={{ width: 34, height: 34, fontSize: 13, border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={() => setShowDropdown(prev => !prev)}
            aria-label="User menu"
            id="avatar-menu-btn"
          >
            {user?.initials}
          </button>
          
          {showDropdown && (
            <div className="topbar-dropdown animate-fadeIn">
              <div className="topbar-dropdown-header">
                <div className="dropdown-user-name">{user?.name}</div>
                <div className="dropdown-user-email">{user?.email || user?.phone}</div>
              </div>
              <div className="topbar-dropdown-divider"></div>
              {user?.role === 'user' ? (
                <>
                  <Link to="/profile" className="topbar-dropdown-item" onClick={() => setShowDropdown(false)}>
                    <User size={14} />
                    <span>My Profile</span>
                  </Link>
                  <Link to="/settings" className="topbar-dropdown-item" onClick={() => setShowDropdown(false)}>
                    <Settings size={14} />
                    <span>Settings</span>
                  </Link>
                </>
              ) : (
                <Link to="/settings" className="topbar-dropdown-item" onClick={() => setShowDropdown(false)}>
                  <Settings size={14} />
                  <span>Platform Settings</span>
                </Link>
              )}
              <div className="topbar-dropdown-divider"></div>
              <button
                onClick={handleLogout}
                className="topbar-dropdown-item btn-clean text-red"
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none' }}
                id="avatar-logout-btn"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
