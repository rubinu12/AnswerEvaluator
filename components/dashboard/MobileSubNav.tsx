'use client';

import { LayoutDashboard, BarChart3 } from 'lucide-react';

// A configuration object to hold the details for all possible tabs
const tabDetails = {
  overview: { 
    label: 'Overview', 
    icon: LayoutDashboard,
    // Style for the active 'overview' tab
    activeStyle: {
      background: 'linear-gradient(135deg, #D4E9E2, #A5D6A7)',
      color: '#052e16' // A dark green for readability
    }
  },
  performance: { 
    label: 'Performance', 
    icon: BarChart3,
    // Style for the active 'performance' tab
    activeStyle: {
      background: 'linear-gradient(135deg, #FFD1B5, #E1E5F8)',
      color: '#7c2d12' // A dark orange for readability
    }
  },
};

// Define the shape of the props this component expects
interface MobileSubNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: (keyof typeof tabDetails)[];
}

export default function MobileSubNav({ activeTab, setActiveTab, tabs }: MobileSubNavProps) {
  return (
    <div>
      {/* Reduced horizontal padding to px-3 and vertical to py-1.5 */}
      <div className="flex items-center justify-center px-3 py-1.5 gap-2">
        {tabs.map((tabId) => {
          const tab = tabDetails[tabId];
          const isActive = activeTab === tabId;
          if (!tab) return null;

          return (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              // Inline style is used for the custom gradients
              style={isActive ? tab.activeStyle : {}}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold transition-all duration-300 rounded-lg ${
                isActive
                  ? 'shadow-sm' // A more subtle shadow
                  : 'text-slate-500 bg-slate-200/60 hover:bg-slate-300/60'
              }`}
            >
              <tab.icon size={16} /> {/* Slightly smaller icon */}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}