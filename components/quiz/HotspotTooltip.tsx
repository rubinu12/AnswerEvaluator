// components/quiz/HotspotTooltip.tsx
import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Hotspot } from '@/lib/quizTypes';

interface HotspotTooltipProps {
  children: React.ReactNode;
  hotspot: Hotspot;
}

/**
 * Renders our "Magic UI" hotspot tooltip
 * It will show the text explanation and the handwritten note, if it exists.
 */
const HotspotTooltip: React.FC<HotspotTooltipProps> = ({ children, hotspot }) => {
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span className="text-blue-600 font-semibold underline decoration-dashed underline-offset-3 cursor-pointer">
            {children}
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            sideOffset={5}
            className="z-50 max-w-sm rounded-lg bg-gray-900 text-white shadow-lg"
          >
            <div className="p-4">
              {/* We use dangerouslySetInnerHTML for the text to support rich HTML from the admin editor */}
              <div
                className="text-sm text-gray-100 leading-relaxed prose prose-invert"
                dangerouslySetInnerHTML={{ __html: hotspot.explanation }}
              />

              {/* This is the killer feature: show the handwritten note */}
              {hotspot.handwrittenNoteUrl && (
                <div className="mt-3 border-t border-gray-700 pt-3">
                  <img
                    src={hotspot.handwrittenNoteUrl}
                    alt="Handwritten Note"
                    className="w-full h-auto rounded-md"
                  />
                </div>
              )}
            </div>
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default HotspotTooltip;