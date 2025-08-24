'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Define the navigation links for the landing page
const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Pricing', href: '#pricing' },
];

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeLink, setActiveLink] = useState(navLinks[0].name);

    useEffect(() => {
        const pageContainer = document.getElementById('page-container');
        if (!pageContainer) return;

        const handleScroll = () => {
            setIsScrolled(pageContainer.scrollTop > 20);
        };

        pageContainer.addEventListener('scroll', handleScroll);
        return () => pageContainer.removeEventListener('scroll', handleScroll);
    }, []);

    const headerClasses = isScrolled
        ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/80'
        : 'bg-transparent';

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerClasses}`}>
            <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
                {/* Logo */}
                <div className="text-xl font-bold text-slate-900">
                    Root & Rise
                </div>

                {/* Centered Navigation */}
                <div className="hidden md:flex items-center bg-slate-100/80 rounded-full p-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setActiveLink(link.name)}
                            className={`relative rounded-full px-5 py-2 text-sm font-medium transition-colors duration-300
                                ${activeLink === link.name ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}
                            `}
                        >
                            {activeLink === link.name && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute inset-0 bg-white shadow-md"
                                    style={{ borderRadius: 9999 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">{link.name}</span>
                        </Link>
                    ))}
                </div>

                {/* Login/Sign Up Buttons */}
                <div className="flex items-center space-x-2">
                    <Link href="/auth" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors rounded-full hover:bg-slate-100">
                        Login
                    </Link>
                    <Link href="/auth" className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-900">
                        Sign Up
                    </Link>
                </div>
            </div>
        </header>
    );
}