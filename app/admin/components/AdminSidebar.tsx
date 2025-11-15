'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ListTree,
  BookCopy,
  FileText,
  Database,
  Sparkles,
  Quote,
  Image,
  UploadCloud,
  ChevronsLeft,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

// Helper component for nav links
const NavLink = ({ href, icon: Icon, label }: any) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100 ${
        isActive ? 'bg-gray-100 font-semibold' : ''
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{label}</span>
    </Link>
  );
};

export default function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transition-transform duration-300 flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Mission Control</h1>
        {/* This is your "arrow key" to CLOSE the sidebar */}
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
          title="Collapse Sidebar"
        >
          <ChevronsLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <NavLink href="/admin" icon={LayoutDashboard} label="Dashboard" />

        <div className="pt-4">
          <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Content
          </h2>
          <div className="space-y-2 mt-2">
            <NavLink
              href="/admin/topics"
              icon={ListTree}
              label="Master Topic Tree"
            />
            <NavLink
              href="/admin/quiz"
              icon={BookCopy}
              label="Prelims Quiz Engine"
            />
            <NavLink
              href="/admin/mains"
              icon={FileText}
              label="Mains Evaluator"
            />
            <NavLink
              href="/admin/current-affairs"
              icon={Sparkles}
              label="Current Affairs"
            />
          </div>
        </div>

        <div className="pt-4">
          <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Tools
          </h2>
          <div className="space-y-2 mt-2">
            <NavLink href="/admin/lexicon" icon={Database} label="Lexicon Bank" />
            <NavLink
              href="/admin/visuals"
              icon={Image}
              label="Visual Bank"
            />
            <NavLink href="/admin/essay" icon={Quote} label="Essay & Ethics Bank" />
          </div>
        </div>

        <div className="pt-4">
          <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Publishing
          </h2>
          <div className="space-y-2 mt-2">
            <NavLink
              href="/admin/publish"
              icon={UploadCloud}
              label="Publish Content"
            />
          </div>
        </div>
      </nav>
    </aside>
  );
}