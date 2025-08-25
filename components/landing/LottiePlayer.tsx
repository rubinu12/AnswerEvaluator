'use client';

import { Player } from '@lottiefiles/react-lottie-player';

// Define an interface for the component's props
interface LottiePlayerProps {
  animationData: object;
}

export default function LottiePlayer({ animationData }: LottiePlayerProps) {
  return (
    <Player
      src={animationData} // Use the prop here instead of the direct import
      className="w-full h-auto max-w-md" // Added some basic sizing with Tailwind
      autoplay
      loop
    />
  );
}