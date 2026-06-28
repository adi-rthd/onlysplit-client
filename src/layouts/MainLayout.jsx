import React from 'react';
import { Outlet } from 'react-router-dom';
import SideNavBar from '../components/navigation/SideNavBar';
import BottomNav from '../components/navigation/BottomNav';
import PullToRefresh from '../components/common/PullToRefresh';

const MainLayout = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-surface-charcoal">
      <SideNavBar />
      <main className="flex-1 md:ml-50 p-4 md:p-container-padding-desktop pb-20 md:pb-4">
        <PullToRefresh>
          <Outlet />
        </PullToRefresh>
      </main>
      <BottomNav />
    </div>
  );
};

export default MainLayout;
