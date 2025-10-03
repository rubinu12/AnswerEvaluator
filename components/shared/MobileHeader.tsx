'use client';

import { useEvaluationStore } from '@/lib/store';
import { useAuthContext } from '@/lib/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MobileHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { pageTitle } = useEvaluationStore();
  const { user } = useAuthContext();

  // Determine if the back button should be shown
  const showBackButton = ![ '/dashboard'].includes(pathname);

  return (
    <header className="flex-shrink-0 bg-white h-16 flex items-center justify-between px-4 border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="w-10">
        {showBackButton && (
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft size={24} />
          </button>
        )}
      </div>

      <h1 className="text-lg font-bold text-gray-800 truncate">
        {pageTitle || "Dashboard"}
      </h1>

      <div className="w-10 flex justify-end">
        {user ? (
          <Link href="/profile">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                {user.email?.substring(0, 2).toUpperCase()}
            </div>
          </Link>
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
        )}
      </div>
    </header>
  );
}