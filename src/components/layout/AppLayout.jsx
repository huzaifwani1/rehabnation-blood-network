import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNavigation from './BottomNavigation';

export default function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <main className="page-content animate-fadeIn">
          <Outlet />
        </main>
      </div>
      <BottomNavigation />
    </div>
  );
}
