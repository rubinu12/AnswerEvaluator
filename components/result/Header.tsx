// components/result/Header.tsx
'use client';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white/90 px-8 py-3 backdrop-blur-sm">
            <h1 className="font-serif text-2xl font-bold text-[--primary-accent]">
                Root & Rise
            </h1>
            <nav className="flex items-center space-x-2">
                <a href="/dashboard" className="rounded-md px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100">
                    Dashboard
                </a>
                <a href="#" className="rounded-md bg-[#fdf0f0] px-4 py-2 text-sm font-bold text-[--primary-accent] transition-colors">
                    My Reports
                </a>
                <a href="#" className="rounded-md px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100">
                    Daily Practice
                </a>
                <a href="#" className="rounded-md px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100">
                    Profile
                </a>
            </nav>
        </header>
    );
}