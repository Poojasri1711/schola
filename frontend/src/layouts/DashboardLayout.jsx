import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout-root">
      <Navbar />
      <div className="dashboard-layout-body">
        <Sidebar />
        <main className="dashboard-main-content">
          <div className="dashboard-content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
