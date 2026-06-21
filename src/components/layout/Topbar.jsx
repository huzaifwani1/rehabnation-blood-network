import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../ui/NotificationBell';

const PAGE_TITLES = {
  '/donor':               { title: 'Dashboard',         sub: 'Welcome back' },
  '/donor/notifications': { title: 'Notifications',     sub: 'Blood request alerts' },
  '/donor/requests':      { title: 'My Requests',       sub: 'Requests you\'ve been matched to' },
  '/donor/history':       { title: 'Donation History',  sub: 'Your contribution timeline' },
  '/donor/profile':       { title: 'My Profile',        sub: 'Manage your donor information' },
  '/donor/settings':      { title: 'Settings',          sub: 'Account & privacy' },
  '/admin':               { title: 'Admin Dashboard',   sub: 'Platform overview' },
  '/admin/requests':      { title: 'Blood Requests',    sub: 'All platform requests' },
  '/admin/donors':        { title: 'Donor Management',  sub: 'View and manage all donors' },
  '/admin/hospitals':     { title: 'Hospitals',         sub: 'Partner hospital management' },
  '/admin/announcements': { title: 'Announcements',     sub: 'Broadcast messages' },
  '/admin/reports':       { title: 'Reports',           sub: 'Analytics & insights' },
  '/admin/audit':         { title: 'Audit Logs',        sub: 'All system actions' },
  '/admin/settings':      { title: 'Settings',          sub: 'Platform configuration' },
  '/hospital':            { title: 'Hospital Dashboard', sub: 'Your blood request overview' },
  '/hospital/requests':   { title: 'Active Requests',   sub: 'Open blood requests' },
  '/hospital/requests/new':  { title: 'New Blood Request', sub: 'Submit an emergency blood request' },
  '/hospital/requests/past': { title: 'Past Requests',  sub: 'Completed and expired requests' },
  '/hospital/profile':    { title: 'Hospital Profile',  sub: 'Manage hospital information' },
  '/hospital/settings':   { title: 'Settings',          sub: 'Account settings' },
};

export default function Topbar() {
  const { user } = useAuth();
  const location = useLocation();
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
