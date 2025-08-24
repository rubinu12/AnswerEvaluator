'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

// Define the shape of the links, which includes the color data
export interface NavLink {
  name: string;
  href: string;
  gradient?: string;
  color?: string;
}

// Define the props for the navbar
interface UniversalNavbarProps {
  navLinks: NavLink[];
  actions: React.ReactNode; // Receives the fully rendered buttons/icons
  activeLink: NavLink;      // Receives the current active link object
  onLinkClick: (link: NavLink) => void; // A function to call when a link is clicked
}

export default function UniversalNavbar({ navLinks, actions, activeLink, onLinkClick }: UniversalNavbarProps) {
    return (
        <nav className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-white/80">
            <div className="flex items-center justify-between p-2 max-w-7xl mx-auto">
                <div className="text-xl font-bold text-gray-800 px-4">
                    Root & Rise
                </div>

                <div className="flex items-center bg-gray-100/80 rounded-xl p-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => onLinkClick(link)}
                            className={`relative px-5 py-2 text-sm font-medium transition-colors duration-300
                                ${activeLink.name === link.name ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}
                            `}
                        >
                            {activeLink.name === link.name && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute inset-0 rounded-lg shadow-md"
                                    style={{ 
                                        backgroundImage: activeLink.gradient || 'linear-gradient(135deg, #FFFFFF, #F1F5F9)',
                                        borderRadius: 10 
                                    }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">{link.name}</span>
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-6 px-4">
                    {actions}
                </div>
            </div>
        </nav>
    );
}