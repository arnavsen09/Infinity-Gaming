import React from 'react';
import { ExternalLink, Star, PlusCircle, Edit3 } from 'lucide-react';
import { BUSINESS_CONFIG } from '../constants';

interface ZeroReviewsStateProps {
  totalInPool: number;
  onOpenAdmin: () => void;
}

export const ZeroReviewsState: React.FC<ZeroReviewsStateProps> = ({
  totalInPool,
  onOpenAdmin,
}) => {
  const isOutOfStock = totalInPool > 0;

  return (
    <div className="w-full bg-[#141417] border border-red-500/40 rounded-3xl p-5 sm:p-6 text-center glow-border relative overflow-hidden my-3">
      {/* Background glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Visual Badge */}
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-red-500/50 flex items-center justify-center mb-3 glow-red-sm">
          <span className="text-2xl">🔥</span>
        </div>

        {/* 5 Golden Stars */}
        <div className="flex items-center gap-1.5 mb-2.5 text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" 
            />
          ))}
        </div>

        {/* Customized message specified in requirements */}
        <h2 className="text-lg sm:text-xl font-bold font-display text-white mb-2 leading-tight">
          {isOutOfStock ? "Reviews Depleted!" : "Ready to Collect 5-Star Reviews"}
        </h2>

        {/* Exact prompt banner requirement */}
        <div className="bg-red-950/40 border border-red-900/60 rounded-xl p-3.5 mb-5 w-full">
          <p className="text-zinc-200 text-xs sm:text-sm leading-relaxed font-sans font-medium">
            🔥 All pre-written reviews have been claimed! Write your own custom 5-star experience below.
          </p>
        </div>

        {/* Primary CTA: Full-width Write Custom Review Button (Min 48px Height) */}
        <a
          href={BUSINESS_CONFIG.googleReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-500 active:scale-[0.98] transition-all duration-150 glow-red shadow-xl shadow-red-950/60 touch-manipulation"
        >
          <Edit3 className="w-4 h-4 text-amber-300" />
          <span>Write Custom Review</span>
          <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-90" />
        </a>

        {/* Admin Quick Action helper if 0 total reviews */}
        {!isOutOfStock && (
          <div className="mt-4 pt-4 border-t border-zinc-800/80 w-full flex items-center justify-center">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="min-h-[48px] text-xs text-red-400 hover:text-red-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer touch-manipulation"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Admin: Load initial 20 review templates to Supabase</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
