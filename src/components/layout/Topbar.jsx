import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../ui/NotificationBell';

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
  const { user } = useAuth();
  const location = useLocation();

  const PAGE_TITLES = user?.role === 'admin' ? ADMIN_PAGE_TITLES : USER_PAGE_TITLES;
  const page = PAGE_TITLES[location.pathname] || { title: 'RehabNation', sub: '' };

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
        <div className="sidebar-avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
          {user?.initials}
        </div>
      </div>
    </header>
  );
}
