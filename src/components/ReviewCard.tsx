import React, { useState } from 'react';
import { Star, Copy, ExternalLink, Check, Flame } from 'lucide-react';
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
    <div className="group relative bg-[#131316] hover:bg-[#18181d] border border-zinc-800/90 hover:border-red-500/60 rounded-2xl p-4 sm:p-5 transition-all duration-200 glow-border flex items-center justify-between gap-3.5 sm:gap-4">
      {/* Review Text */}
      <div className="flex-1 min-w-0">
        <p className="text-zinc-100 text-xs sm:text-sm md:text-base leading-relaxed tracking-normal font-sans font-normal selection:bg-red-950 selection:text-white">
          "{review.text}"
        </p>
      </div>

      {/* Copy & Post Button (Right side, glowing red) */}
      <div className="shrink-0">
        <button
          type="button"
          onClick={handleAction}
          disabled={isCopying}
          className="min-h-[44px] min-w-[110px] flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-red-600 hover:bg-red-500 active:scale-95 transition-all duration-150 glow-red-sm hover:glow-red shadow-lg shadow-red-950/40 cursor-pointer disabled:opacity-80 whitespace-nowrap"
          aria-label={`Copy review ${index + 1} and post on Google`}
        >
          {isCopying ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>Copied...</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-white/90" />
              <span>Copy & Post</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
