import React from 'react';
import { Gamepad2, Lock } from 'lucide-react';

interface NavbarProps {
  unusedCount: number;
  totalCount: number;
  onOpenAdmin: () => void;
  isLoading?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  unusedCount, 
  totalCount, 
  onOpenAdmin,
  isLoading = false
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between gap-2.5">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-800 p-0.5 flex items-center justify-center glow-red-sm shrink-0">
            <div className="w-full h-full bg-[#09090b] rounded-[9px] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-sm sm:text-base font-bold tracking-tight text-white truncate font-display flex items-center gap-1.5">
              <span>Infinity Gaming</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-red-950/60 text-red-400 border border-red-800/50">
                MP Nagar
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 truncate">
              Bhopal Google Review Hub
            </p>
          </div>
        </div>

        {/* Right Section: Live Pool Counter & Admin Toggle (Touch-Target Optimized) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Live Supabase Counter Header */}
          <div 
            className="flex items-center gap-1.5 text-xs text-zinc-300 font-mono tabular-nums bg-zinc-900/90 border border-zinc-800 px-2.5 py-1.5 rounded-full"
            title="Live reviews count from cloud database"
          >
            <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-spin' : unusedCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[11px] text-zinc-400 hidden xs:inline">Available:</span>
            <span className="font-bold text-red-400 text-xs">
              {isLoading ? '...' : unusedCount}
            </span>
            <span className="text-zinc-500 text-xs">/</span>
            <span className="text-zinc-400 text-xs">
              {isLoading ? '...' : totalCount}
            </span>
          </div>

          {/* Admin Toggle (Touch target minimum 48px) */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="w-12 h-12 flex items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 active:scale-95 transition-all cursor-pointer touch-manipulation"
            title="Admin Login & Database Management"
            aria-label="Admin Settings and Pool Management"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-center">
              <Lock className="w-4 h-4 text-zinc-400" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
