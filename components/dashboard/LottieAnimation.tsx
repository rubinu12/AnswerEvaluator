import { Image as ImageIcon } from 'lucide-react';

export default function LottieAnimation() {
  return (
    <div className="flex items-center justify-center rounded-lg bg-gray-100/80 p-6 text-gray-500 min-h-40 border border-gray-200/80">
      <div className="text-center">
        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm font-semibold">Lottie Animation Placeholder</p>
      </div>
    </div>
  );
}