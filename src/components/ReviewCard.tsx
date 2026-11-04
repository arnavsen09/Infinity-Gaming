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
    <div className="group relative bg-[#141417] hover:bg-[#18181d] border border-zinc-800 hover:border-red-500/70 rounded-2xl p-5 sm:p-6 transition-all duration-200 glow-border flex flex-col justify-between gap-4">
      {/* Top Header of Card: Rating Stars & Unboxed Metadata */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" 
            />
          ))}
          <span className="ml-1.5 text-xs font-semibold text-zinc-300">5.0</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 tracking-wider">
          <Flame className="w-3.5 h-3.5 text-red-500" />
          <span>OPTION 0{index + 1}</span>
          <span className="text-zinc-600">·</span>
          <span className="text-emerald-400 font-medium">Unused</span>
        </div>
      </div>

      {/* Review Body Text */}
      <div className="my-1">
        <p className="text-zinc-100 text-sm sm:text-base leading-relaxed tracking-normal font-sans font-normal selection:bg-red-950 selection:text-white">
          "{review.text}"
        </p>
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-3 flex-wrap">
        <span className="text-xs text-zinc-400 font-sans">
          One-tap copy & open Google
        </span>

        <button
          type="button"
          onClick={handleAction}
          disabled={isCopying}
          className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-red-600 hover:bg-red-500 active:scale-95 transition-all duration-150 glow-red-sm hover:glow-red shadow-lg shadow-red-950/40 cursor-pointer disabled:opacity-80"
          aria-label={`Copy review ${index + 1} and post on Google`}
        >
          {isCopying ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Copied & Opening...</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-white/90" />
              <span className="font-semibold">Copy & Post</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/70 ml-0.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
