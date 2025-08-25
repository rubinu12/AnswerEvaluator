'use client';

import { useEffect, Fragment } from 'react';
import { useAuthContext } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import UniversalNavbar, { NavLink } from '@/components/shared/UniversalNavbar';
import { Search, Bell, User, Settings, LogOut } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  // --- FIX: The DashboardActions component is now defined inside DashboardLayout ---
  // This gives it access to the useAuthContext hook.
  const DashboardActions = ({ activeLink }: { activeLink: NavLink }) => {
    const { logout } = useAuthContext(); // It's safe to call the hook here now

    return (
        <>
            <Search className="text-gray-600 cursor-pointer btn" size={22} />
            <div className="relative cursor-pointer">
                <Bell className="text-gray-600 btn" size={22} />
                <span className="absolute flex h-2 w-2 top-0 right-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
            </div>
            
            <Menu as="div" className="relative inline-block text-left">
                <div>
                    <Menu.Button className="relative cursor-pointer btn rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                        <img
                            src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                            alt="Avatar"
                            className="w-10 h-10 rounded-full border-2 transition-colors duration-500"
                            style={{ borderColor: activeLink.color }}
                        />
                    </Menu.Button>
                </div>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-1 py-1">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        className={`${
                                        active ? 'bg-emerald-500 text-white' : 'text-gray-900'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                    >
                                        <User className="mr-2 h-5 w-5" aria-hidden="true" />
                                        Your Profile
                                    </button>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        className={`${
                                        active ? 'bg-emerald-500 text-white' : 'text-gray-900'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                    >
                                        <Settings className="mr-2 h-5 w-5" aria-hidden="true" />
                                        Settings
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                        <div className="px-1 py-1">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={logout}
                                        className={`${
                                        active ? 'bg-emerald-500 text-white' : 'text-gray-900'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                    >
                                        <LogOut className="mr-2 h-5 w-5" aria-hidden="true" />
                                        Log Out
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        </>
    );
  };

  const dashboardNavLinks: NavLink[] = [
    { label: 'Home', href: '/dashboard', gradient: 'linear-gradient(135deg, #E1E5F8, #C5CAE9)', color: '#C5CAE9' },
    { label: 'PYQs', href: '/dashboard/pyqs', gradient: 'linear-gradient(135deg, #D4E9E2, #A5D6A7)', color: '#A5D6A7' },
    { label: 'Material', href: '/dashboard/material', gradient: 'linear-gradient(135deg, #B3D8E0, #80DEEA)', color: '#80DEEA' },
    { label: 'Performance', href: '/dashboard/performance', gradient: 'linear-gradient(135deg, #FFD1B5, #E1E5F8)', color: '#FFD1B5' },
    { label: 'Revision', href: '/dashboard/revision', gradient: 'linear-gradient(135deg, #E1E5F8, #C5CAE9)', color: '#C5CAE9' },
  ];

  useEffect(() => {
      if (!loading && !user) {
          router.push('/auth');
      }
  }, [user, loading, router]);

  if (loading || !user) {
      return null;
  }

  return (
    <>
      <UniversalNavbar
        navLinks={dashboardNavLinks}
        actions={(activeLink: NavLink) => <DashboardActions activeLink={activeLink} />}
      />
      <main>
        {children}
      </main>
    </>
  );
}