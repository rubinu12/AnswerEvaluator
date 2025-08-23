"use client";

import { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const navLinks = [
  { name: 'Dashboard', gradient: 'linear-gradient(135deg, #FFD1B5, #E1E5F8)', color: '#FFD1B5' },
  { name: 'My Evaluations', gradient: 'linear-gradient(135deg, #B3D8E0, #80DEEA)', color: '#B3D8E0' },
  { name: 'Study Plan', gradient: 'linear-gradient(135deg, #D4E9E2, #A5D6A7)', color: '#D4E9E2' },
  { name: 'Resources', gradient: 'linear-gradient(135deg, #E1E5F8, #C5CAE9)', color: '#E1E5F8' },
];

export default function Navbar() {
  const [activeLink, setActiveLink] = useState(navLinks[0]);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-white/80">
      <div className="flex items-center justify-between p-2 max-w-7xl mx-auto">
        <div className="text-xl font-bold text-gray-800 px-4">
          Root & Rise
        </div>

        <div className="flex items-center bg-gray-100/80 rounded-xl p-1">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => setActiveLink(link)}
              className={`relative px-5 py-2 text-sm font-medium transition-colors duration-300
                ${activeLink.name === link.name ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}
              `}
            >
              {activeLink.name === link.name && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 rounded-lg shadow-md"
                  style={{ backgroundImage: activeLink.gradient, borderRadius: 10 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{link.name}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6 px-4">
          <Search className="text-gray-600 cursor-pointer btn" size={22} />
          
          <div className="relative cursor-pointer">
            <Bell className="text-gray-600 btn" size={22} />
            <span className="absolute flex h-2 w-2 top-0 right-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </div>

          <div className="relative cursor-pointer btn">
            <img
              src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
              alt="Avatar"
              className="w-10 h-10 rounded-full border-2 transition-colors duration-500"
              style={{ borderColor: activeLink.color }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}