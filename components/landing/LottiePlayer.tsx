'use client';

import { Player } from '@lottiefiles/react-lottie-player';
import heroAnimation from '@/public/hero.json';

export default function LottiePlayer() {
  return (
    <Player
      src={heroAnimation}
      className="hero-lottie-animation"
      autoplay
      loop
    />
  );
}