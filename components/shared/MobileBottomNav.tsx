'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, History, Plus, User, BarChart2 } from 'lucide-react';
import { useEvaluationStore } from '@/lib/store';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { resetEvaluation } = useEvaluationStore();

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/history', icon: History, label: 'History' },
    { href: '/analytics', icon: BarChart2, label: 'Analytics' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-[0_-2px_10px_-3px_rgba(0,0,0,0.1)] flex items-center justify-around z-10">
      {/* Regular Nav Links */}
      <div className="flex w-full justify-around items-center">
        {/* First two items */}
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.href} className={`flex flex-col items-center justify-center transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
              <item.icon size={24} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}

        {/* Placeholder for the center button */}
        <div className="w-1/5"></div>

        {/* Last two items */}
        {navItems.slice(2).map((item) => {
          const isActive = pathname.startsWith(item.href);
           return (
            <Link href={item.href} key={item.href} className={`flex flex-col items-center justify-center transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
              <item.icon size={24} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* --- [THE FIX] Center "New Evaluation" Button now links to /evaluate --- */}
      <Link href="/evaluate">
        <div className="absolute left-1/2 -translate-x-1/2 -top-4 w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-105 transition-transform">
            <Plus size={32} />
        </div>
      </Link>
    </nav>
  );
}