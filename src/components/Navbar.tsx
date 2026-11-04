import React from 'react';
import { Sparkles, ExternalLink, Gamepad2, Lock } from 'lucide-react';
import { BUSINESS_CONFIG } from '../constants';

interface NavbarProps {
  unusedCount: number;
  totalCount: number;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ unusedCount, totalCount, onOpenAdmin }) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <a 
          href="/" 
          className="flex items-center gap-2.5 text-decoration-none group shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-red-800 p-0.5 flex items-center justify-center glow-red-sm group-hover:glow-red transition-all">
            <div className="w-full h-full bg-[#09090b] rounded-[7px] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <div>
            <div className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap font-display flex items-center gap-1.5">
              <span>Infinity Gaming</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800/50 hidden xs:inline-block">
                MP Nagar
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 tracking-wide hidden sm:block">
              5-Star Google Review Hub
            </p>
          </div>
        </a>

        {/* Zone 2: Live Pool Indicator (Quiet unboxed metadata) */}
        <div className="flex items-center gap-2 text-xs text-zinc-300 font-mono tabular-nums bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-zinc-400">Available Reviews:</span>
          <span className="font-bold text-red-400">
            {unusedCount}
          </span>
          <span className="text-zinc-500">/</span>
          <span className="text-zinc-400">{totalCount}</span>
        </div>

        {/* Zone 3: Direct Action & In-between Admin Quick Access */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={BUSINESS_CONFIG.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 px-3.5 py-2 rounded-lg transition-all glow-red-sm hover:glow-red active:scale-95 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Direct Google Review</span>
            <span className="sm:hidden">Review</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>

          {/* Quick in-between Admin Access trigger */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800/80 transition-colors cursor-pointer"
            title="Admin Login & Pool Management"
            aria-label="Admin Access"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
