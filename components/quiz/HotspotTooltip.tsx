// components/quiz/HotspotTooltip.tsx
'use client';

import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Hotspot } from '@/lib/quizTypes';
import { RenderWithRadixHotspots } from './UltimateExplanationUI';

interface HotspotTooltipProps {
  children: React.ReactNode;
  hotspot: Hotspot;
  onClick?: (hotspot: Hotspot) => void;
}

const HotspotTooltip: React.FC<HotspotTooltipProps> = ({
  children,
  hotspot,
  onClick,
}) => {
  // ... (getColors and getArrowColor functions are unchanged) ...
  const getColors = () => {
    switch (hotspot.type) {
      case 'green':
        return 'bg-green-50 border-green-500 text-green-900';
      case 'blue':
        return 'bg-blue-50 border-blue-500 text-blue-900';
      case 'red':
        return 'bg-red-50 border-red-500 text-red-900';
      default:
        return 'bg-gray-900 border-gray-700 text-white';
    }
  };

  const getArrowColor = () => {
    switch (hotspot.type) {
      case 'green':
        return 'fill-green-50';
      case 'blue':
        return 'fill-blue-50';
      case 'red':
        return 'fill-red-50';
      default:
        return 'fill-gray-900';
    }
  };

  return (
    // --- 1. THE <Tooltip.Provider> IS REMOVED FROM HERE ---
    <Tooltip.Root>
      <Tooltip.Trigger asChild onClick={() => onClick && onClick(hotspot)}>
        {/*
          The 'asChild' prop passes the trigger's functionality
          down to the {children}, which is the <span>
          RenderWithRadixHotspots creates.
        */}
        {children}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          sideOffset={5}
          className={`z-[99] max-w-sm rounded-lg shadow-xl border-2 ProseMirror ${getColors()} ${
            onClick ? 'cursor-pointer' : ''
          }`}
        >
          <div className="p-4">
            <h4 className="text-lg font-bold !mt-0 !mb-2">{hotspot.term}</h4>
            <RenderWithRadixHotspots
              html={hotspot.definition}
              hotspotBank={[]}
            />
          </div>
          <Tooltip.Arrow className={getArrowColor()} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
    // --- 2. END OF REMOVAL ---
  );
};

export default HotspotTooltip;