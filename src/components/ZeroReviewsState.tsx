import React from 'react';
import { Sparkles, ExternalLink, Star, ShieldAlert, PlusCircle } from 'lucide-react';
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
    <div className="w-full bg-[#141417] border border-red-500/40 rounded-3xl p-6 sm:p-10 text-center glow-border relative overflow-hidden my-6">
      {/* Background glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
        {/* Visual Badge */}
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-red-500/50 flex items-center justify-center mb-5 glow-red-sm">
          {isOutOfStock ? (
            <span className="text-3xl">🔥</span>
          ) : (
            <ShieldAlert className="w-8 h-8 text-red-500" />
          )}
        </div>

        {/* 5 Golden Stars */}
        <div className="flex items-center gap-1.5 mb-3 text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
          ))}
        </div>

        {/* Customized message specified in requirements */}
        {isOutOfStock ? (
          <>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white mb-3">
              All Pre-Written Reviews Have Been Used!
            </h2>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-6">
              🔥 All pre-written reviews have been used! Feel free to write your own custom 5-star experience below.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white mb-3">
              Review Pool Ready For Setup
            </h2>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-6">
              The review pool is currently waiting for the admin to add review templates. You can still leave your own authentic 5-star experience directly on Google!
            </p>
          </>
        )}

        {/* Primary CTA: Write My Own Review on Google */}
        <a
          href={BUSINESS_CONFIG.googleReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base text-white bg-red-600 hover:bg-red-500 active:scale-95 transition-all duration-150 glow-red shadow-xl shadow-red-950/60"
        >
          <Sparkles className="w-5 h-5" />
          <span>Write My Own Review on Google</span>
          <ExternalLink className="w-4 h-4 ml-1 opacity-90" />
        </a>

        {/* Admin Quick Action helper if 0 total reviews */}
        {!isOutOfStock && (
          <div className="mt-6 pt-5 border-t border-zinc-800/80 w-full flex items-center justify-center">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="text-xs text-red-400 hover:text-red-300 underline underline-offset-4 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Lounge Admin: Click here to paste initial review batch</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
