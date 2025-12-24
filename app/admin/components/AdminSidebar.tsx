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
  CheckCircle,
  PlusCircle,
  Zap, // Icon for Prelims Studio
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavLink = ({ href, icon: Icon, label }: any) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors ${
        isActive ? 'bg-gray-100 font-semibold text-indigo-600' : ''
      }`}
    >
      <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
      <span>{label}</span>
    </Link>
  );
};

export default function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transition-transform duration-300 flex flex-col border-r border-gray-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
           <LayoutDashboard className="w-6 h-6 text-indigo-600"/> 
           Admin Panel
        </h1>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
          title="Collapse Sidebar"
        >
          <ChevronsLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        
        {/* 1. GENERAL */}
        <div>
           <NavLink href="/admin" icon={LayoutDashboard} label="Dashboard" />
        </div>

        {/* 2. CONTENT ENGINES */}
        <div>
          <h2 className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Content Engines
          </h2>
          <div className="space-y-1">
            <NavLink
              href="/admin/topics"
              icon={ListTree}
              label="Topic Tree"
            />
            
            {/* --- NEW PRELIMS STUDIO SECTION --- */}
            <div className="pt-2 pb-2">
               <div className="px-3 text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Prelims Studio</div>
               <NavLink
                 href="/admin/prelims"
                 icon={Zap}
                 label="Ingestion Studio"
               />
               <NavLink
                 href="/admin/quiz"
                 icon={BookCopy}
                 label="Question Bank"
               />
            </div>

            {/* --- MAINS STUDIO SECTION --- */}
            <div className="pt-2 pb-2">
               <div className="px-3 text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Mains Studio</div>
               <NavLink
                 href="/admin/mains"
                 icon={FileText}
                 label="Mains Dashboard"
               />
               <NavLink
                 href="/admin/mains/questions" 
                 icon={PlusCircle} 
                 label="Add Questions" 
               />
               <NavLink
                 href="/admin/mains/answers" 
                 icon={CheckCircle} 
                 label="Write Answers" 
               />
            </div>

            <NavLink
              href="/admin/current-affairs"
              icon={Sparkles}
              label="Current Affairs"
            />
          </div>
        </div>

        {/* 3. KNOWLEDGE BANKS */}
        <div>
          <h2 className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Knowledge Banks
          </h2>
          <div className="space-y-1">
            <NavLink href="/admin/lexicon" icon={Database} label="Lexicon" />
            <NavLink
              href="/admin/visuals"
              icon={Image}
              label="Visuals"
            />
            <NavLink href="/admin/essay" icon={Quote} label="Essay & Ethics" />
          </div>
        </div>

        {/* 4. SYSTEM */}
        <div>
          <h2 className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            System
          </h2>
          <div className="space-y-1">
            <NavLink
              href="/admin/publish"
              icon={UploadCloud}
              label="Publish App"
            />
          </div>
        </div>

      </nav>
    </aside>
  );
}