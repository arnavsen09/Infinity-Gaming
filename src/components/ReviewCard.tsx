import React, { useState } from 'react';
import { Star, Copy, Check } from 'lucide-react';
import { ReviewItem } from '../types';

interface ReviewCardProps {
  review: ReviewItem;
  index: number;
  onCopyAndPost: (review: ReviewItem) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  index,
  onCopyAndPost,
}) => {
  const [isCopying, setIsCopying] = useState(false);

  const handleAction = async () => {
    setIsCopying(true);
    await onCopyAndPost(review);
    setTimeout(() => {
      setIsCopying(false);
    }, 1500);
  };

  return (
    <div className="group relative bg-[#131316] hover:bg-[#18181d] border border-zinc-800/90 hover:border-red-500/60 rounded-2xl p-4 sm:p-5 transition-all duration-200 glow-border flex flex-col gap-3.5">
      {/* Top Header: 5 Stars + Index Label */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className="w-3.5 h-3.5 fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]" 
            />
          ))}
          <span className="text-[11px] font-bold text-amber-300 ml-1">5.0</span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500 font-medium">
          Option #{index + 1}
        </span>
      </div>

      {/* Review Text */}
      <div className="min-w-0">
        <p className="text-zinc-100 text-sm sm:text-base leading-relaxed tracking-normal font-sans font-normal selection:bg-red-950 selection:text-white break-words">
          "{review.text}"
        </p>
      </div>

      {/* Touch Target Optimized Copy & Post Button (Min 48px Height, Full Width) */}
      <button
        type="button"
        onClick={handleAction}
        disabled={isCopying}
        className="w-full min-h-[48px] py-3 px-4 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-500 active:scale-[0.98] transition-all duration-150 glow-red-sm hover:glow-red shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80 touch-manipulation select-none"
        aria-label={`Copy review option ${index + 1} and post on Google`}
      >
        {isCopying ? (
          <>
            <Check className="w-4 h-4 text-white animate-bounce" />
            <span>Copied! Opening Google...</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 text-white/90" />
            <span>Copy & Post</span>
          </>
        )}
      </button>
    </div>
  );
};
