import React from 'react';
import { Instagram, Heart, ExternalLink, Sparkles } from 'lucide-react';
import { BUSINESS_CONFIG } from '../constants';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-6 pt-6 pb-4 border-t border-zinc-800/80 text-center flex flex-col items-center gap-3">
      {/* Eleva Badge & Contact */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
          <span>Made with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline animate-pulse" />
          <span>by</span>
          <span className="font-bold text-white tracking-wide font-display">Eleva</span>
        </div>

        {/* Contact Eleva Button */}
        <a
          href={BUSINESS_CONFIG.elevaInstagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-pink-500/50 text-xs font-semibold text-zinc-300 hover:text-white transition-all duration-200 group glow-red-sm touch-manipulation"
          title="Contact Eleva on Instagram"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center p-0.5">
            <Instagram className="w-3.5 h-3.5 text-white" />
          </div>
          <span>Contact Eleva</span>
          <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-pink-400 transition-colors" />
        </a>
      </div>

      {/* Copyright & Info */}
      <div className="text-[11px] text-zinc-500 space-y-1">
        <p>© {new Date().getFullYear()} Infinity Gaming MP Nagar. All rights reserved.</p>
        <p className="text-[10px] text-zinc-600">
          Premier Esports & Console Gaming Lounge · Zone II, Bhopal
        </p>
      </div>
    </footer>
  );
};
