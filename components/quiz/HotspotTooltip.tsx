'use client';

import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Hotspot } from '@/lib/quizTypes'; // This is our new "Master Plan" type

interface HotspotTooltipProps {
  children: React.ReactNode;
  hotspot: Hotspot;
}

/**
 * Renders our "Magic UI" hotspot tooltip using Radix UI.
 * This is upgraded to use our "Pen-Based" styling.
 */
const HotspotTooltip: React.FC<HotspotTooltipProps> = ({ children, hotspot }) => {
  // Helper to get the correct colors for the "Pen Type"
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
  
  // Helper for the Radix Arrow
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
  }

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {/* The trigger is just the styled text from the editor */}
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            sideOffset={5}
            className={`z-50 max-w-sm rounded-lg shadow-lg border-2 ${getColors()}`}
          >
            <div className="p-4">
              <h4 className="text-lg font-bold mb-2">{hotspot.term}</h4>
              
              {/* We use dangerouslySetInnerHTML for the definition */}
              <div
                className="text-sm leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: hotspot.definition }}
              />

              {/* We will add this back in Phase 4 */}
              {/* {hotspot.handwrittenNoteUrl && (
                <div className="mt-3 border-t border-gray-700 pt-3">
                  <img
                    src={hotspot.handwrittenNoteUrl}
                    alt="Handwritten Note"
                    className="w-full h-auto rounded-md"
                  />
                </div>
              )} */}
            </div>
            <Tooltip.Arrow className={getArrowColor()} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default HotspotTooltip;

