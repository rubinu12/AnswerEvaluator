// app/admin/components/AdminHeader.tsx
// This is a new CLIENT component that replaces your old one.
// It contains the "arrow" button to OPEN the sidebar.
'use client';

import { Menu, Bell, User } from 'lucide-react';

interface AdminHeaderProps {
  setIsOpen: (isOpen: boolean) => void;
}

export default function AdminHeader({ setIsOpen }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full h-16 px-6 bg-white shadow-md">
      {/* This is your "arrow key" to OPEN the sidebar.
        It only appears when the sidebar is closed (handled by ml-64/ml-0 in AdminShell).
      */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 -ml-2 rounded-full text-gray-600 hover:bg-gray-100"
        title="Open Sidebar"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Search Bar (Placeholder) */}
      <div className="flex-1 ml-6">
        <input
          type="text"
          placeholder="Search..."
          className="w-1/2 px-4 py-2 border rounded-full text-sm"
        />
      </div>

      {/* Right-side Icons (Placeholders) */}
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100">
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}