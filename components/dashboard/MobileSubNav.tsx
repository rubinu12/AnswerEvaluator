'use client';

import { LayoutDashboard, BarChart3, Activity } from 'lucide-react';

// Define the shape of the props this component expects
interface MobileSubNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'performance', label: 'Performance', icon: BarChart3 },
  { id: 'activity', label: 'Activity', icon: Activity },
];

export default function MobileSubNav({ activeTab, setActiveTab }: MobileSubNavProps) {
  return (
    // [FIX 1] Changed top-16 to top-0 to remove the gap
    <div className="sticky top-0 bg-white/70 backdrop-blur-lg z-10 border-b border-gray-200">
      <div className="flex items-center justify-around px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            // [FIX 2] Reduced vertical padding (py-2 to py-1.5) to decrease height
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 px-3 text-xs font-semibold transition-colors duration-200 border-b-2 ${
              activeTab === tab.id
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-blue-600'
            }`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}