import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Navbar } from './Navbar';
import { AdminNavbar } from './AdminNavbar';
import { Footer } from './Footer';
import { AdminSidebar } from './AdminSidebar';
import { useLocation } from 'react-router-dom';
import { cn } from '../utils';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBFB] dark:bg-zinc-950">
      {isAdminRoute ? <AdminNavbar /> : <Navbar />}
      <div className="flex-1 flex">
        {isAdminRoute && (user?.role === UserRole.ADMIN || user?.role === UserRole.FRONT_DESK) && <AdminSidebar />}
        <main className={cn(
          "flex-1 min-w-0",
          isAdminRoute ? "bg-[#FBFBFB] dark:bg-zinc-950 p-4 md:p-8" : "w-full"
        )}>
          {children}
        </main>
      </div>
      {!isAdminRoute && <Footer />}
    </div>
  );
};
