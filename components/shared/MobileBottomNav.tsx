'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, History, Plus, User, BarChart2 } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/history', icon: History, label: 'History' },
    { href: '/analytics', icon: BarChart2, label: 'Analytics' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    // [FIX] Reduced nav bar height from h-16 to h-14 for a more compact feel
    <nav className="fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-200 shadow-[0_-2px_10px_-3px_rgba(0,0,0,0.1)] flex items-center justify-around z-10">
      <div className="flex w-full justify-around items-center">
        {/* First two items */}
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.href} className={`flex flex-col items-center justify-center transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
              {/* [FIX] Icons are now smaller */}
              <item.icon size={22} />
              {/* [FIX] Text is smaller to prevent wrapping */}
              <span className="text-[11px] mt-1 font-medium">{item.label}</span>
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
                <item.icon size={22} />
                <span className="text-[11px] mt-1 font-medium">{item.label}</span>
              </Link>
            );
        })}
      </div>

      {/* [FIX] Center "+" button is now smaller and more proportional */}
      <Link href="/evaluate">
        <div className="absolute left-1/2 -translate-x-1/2 -top-3 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-105 transition-transform">
          <Plus size={28} />
        </div>
      </Link>
    </nav>
  );
}