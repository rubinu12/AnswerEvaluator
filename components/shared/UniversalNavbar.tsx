'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import React from 'react';

export interface NavLink {
  name: string;
  href: string;
  gradient?: string;
  color?: string;
}

const landingNavLinks: NavLink[] = [
  { name: 'Features', href: '#features', gradient: 'linear-gradient(135deg, #E1E5F8, #C5CAE9)', color: '#E1E5F8' },
  { name: 'How It Works', href: '#how-it-works', gradient: 'linear-gradient(135deg, #D4E9E2, #A5D6A7)', color: '#D4E9E2' },
  { name: 'Pricing', href: '#pricing', gradient: 'linear-gradient(135deg, #B3D8E0, #80DEEA)', color: '#B3D8E0' },
];

const dashboardNavLinks: NavLink[] = [
  { name: 'Dashboard', href: '/dashboard', gradient: 'linear-gradient(135deg, #FFD1B5, #E1E5F8)', color: '#FFD1B5' },
  { name: 'My Evaluations', href: '#', gradient: 'linear-gradient(135deg, #B3D8E0, #80DEEA)', color: '#B3D8E0' },
  { name: 'Study Plan', href: '#', gradient: 'linear-gradient(135deg, #D4E9E2, #A5D6A7)', color: '#D4E9E2' },
  { name: 'Resources', href: '#', gradient: 'linear-gradient(135deg, #E1E5F8, #C5CAE9)', color: '#E1E5F8' },
];

interface UniversalNavbarProps {
  pageType: 'landing' | 'dashboard';
  actions: (activeLink: NavLink) => React.ReactNode;
}

export default function UniversalNavbar({ pageType, actions }: UniversalNavbarProps) {
    const [navLinks, setNavLinks] = useState<NavLink[]>([]);
    const [activeLink, setActiveLink] = useState<NavLink | null>(null);

    useEffect(() => {
        if (pageType === 'landing') {
            setNavLinks(landingNavLinks);
            setActiveLink(landingNavLinks[0]);
        } else {
            setNavLinks(dashboardNavLinks);
            setActiveLink(dashboardNavLinks[0]);
        }
    }, [pageType]);

    if (!activeLink) return null;

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
                            onClick={() => setActiveLink(link)}
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
                    {actions(activeLink)}
                </div>
            </div>
        </nav>
    );
}