import React from 'react';
import { ExternalLink, MessageSquare, Instagram, Edit3 } from 'lucide-react';
import { BUSINESS_CONFIG } from '../constants';

export const FloatingBottomBar: React.FC = () => {
  return (
    <nav 
      aria-label="Quick Actions"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 backdrop-blur-lg border-t border-zinc-800/90 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] px-4 shadow-[0_-10px_30px_rgba(0,0,0,0.85)]"
    >
      <div className="max-w-md mx-auto flex flex-col gap-2.5">
        {/* Row 1: Full-width Write Custom Review Button (Min 48px Touch Target) */}
        <a
          href={BUSINESS_CONFIG.googleReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full min-h-[48px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-500 active:scale-[0.98] transition-all glow-red-sm hover:glow-red shadow-lg shadow-red-950/50 touch-manipulation"
        >
          <Edit3 className="w-4 h-4 text-amber-300" />
          <span>Write Custom Review</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80 ml-0.5" />
        </a>

        {/* Row 2: WhatsApp and Instagram Side-by-Side (Min 48px Touch Target) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* WhatsApp Button */}
          <a
            href={BUSINESS_CONFIG.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[48px] flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-semibold text-xs sm:text-sm text-white bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] transition-all shadow-md shadow-emerald-950/40 touch-manipulation"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>

          {/* Instagram Button */}
          <a
            href={BUSINESS_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[48px] flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 active:scale-[0.98] transition-all shadow-md shadow-pink-950/40 touch-manipulation"
          >
            <Instagram className="w-4 h-4" />
            <span>Instagram</span>
          </a>
        </div>
      </div>
    </nav>
  );
};
