'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import React from 'react';

export interface NavLink {
  label: string;
  href: string;
  gradient?: string;
  color?: string;
}

interface UniversalNavbarProps {
  navLinks: NavLink[];
  actions: (activeLink: NavLink) => React.ReactNode;
}

export default function UniversalNavbar({ navLinks, actions }: UniversalNavbarProps) {
    const [activeLink, setActiveLink] = useState<NavLink | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        // [FIX] More robust active link detection.
        // It sorts the links by length descending, so it checks for more specific paths first (e.g., '/features' before '/').
        const currentActiveLink = [...navLinks]
            .sort((a, b) => b.href.length - a.href.length)
            .find(link => pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)));

        setActiveLink(currentActiveLink || navLinks[0]);
    }, [pathname, navLinks]);

    if (!activeLink) {
        return null;
    }

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-white/80">
            <div className="flex items-center justify-between p-2 max-w-7xl mx-auto">
                <div className="text-xl font-bold text-gray-800 px-4">
                    <Link href="/">Root & Rise</Link>
                </div>
                <div className="hidden md:flex items-center bg-gray-100/80 rounded-xl p-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            // [FIX] Removed the onClick handler. The useEffect now correctly handles state.
                            className={`relative px-5 py-2 text-sm font-medium transition-colors duration-300
                                ${activeLink.label === link.label ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}
                            `}
                        >
                            {activeLink.label === link.label && (
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
                            <span className="relative z-10">{link.label}</span>
                        </Link>
                    ))}
                </div>
                <div className="flex items-center gap-6 px-4">
                    {actions(activeLink)}
                </div>
            </div>
        </nav>
    );
}