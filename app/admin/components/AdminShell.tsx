'use client';

import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  // This state controls the sidebar (open by default)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 1. The Sidebar Component */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        // We pass the "setter" function so the sidebar can close itself
        setIsOpen={setIsSidebarOpen}
      />

      {/* 2. The Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* The Top Header Component */}
        <AdminHeader
          // We pass the setter so the header can OPEN the sidebar
          setIsOpen={setIsSidebarOpen}
        />

        {/* The main page content (e.g., dashboard, topic tree) */}
        <main
          className={`flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 transition-all duration-300 ${
            isSidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}