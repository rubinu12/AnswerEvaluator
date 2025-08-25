'use client';

import Link from 'next/link';
import UniversalNavbar, { NavLink } from '@/components/shared/UniversalNavbar';
import DetailedFeatures from '@/components/landing/DetailedFeatures';

export default function FeaturesPage() {
  // ADDED: "Home" link and updated other links
  const navLinks: NavLink[] = [
    { label: 'Home', href: '/', gradient: 'linear-gradient(135deg, #E1E5F8, #C5CAE9)' },
    { label: 'Features', href: '/features', gradient: 'linear-gradient(135deg, #D4E9E2, #A5D6A7)' },
    { label: 'Pricing', href: '/pricing', gradient: 'linear-gradient(135deg, #B3D8E0, #80DEEA)' },
  ];

  return (
    <div className="bg-white">
      <UniversalNavbar 
        navLinks={navLinks}
        actions={(activeLink) => (
          <>
            <Link href="/auth" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
              Log In
            </Link>
            <Link href="/auth" className="btn px-5 py-2 text-sm font-semibold text-white bg-gray-800 rounded-lg hover:bg-gray-900">
              Sign Up
            </Link>
          </>
        )}
      />

      <main className="pt-16">
        <DetailedFeatures />
      </main>
    </div>
  );
}