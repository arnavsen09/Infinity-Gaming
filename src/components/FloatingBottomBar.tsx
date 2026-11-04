import React from 'react';
import { ExternalLink, MessageSquare, Instagram, Edit3 } from 'lucide-react';
import { BUSINESS_CONFIG } from '../constants';

export const FloatingBottomBar: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 backdrop-blur-lg border-t border-zinc-800/90 py-3 px-4 shadow-[0_-10px_30px_rgba(0,0,0,0.85)]">
      <div className="max-w-lg mx-auto flex flex-col gap-2.5">
        {/* Row 1: Full-width Write My Own Review Button */}
        <a
          href={BUSINESS_CONFIG.googleReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full min-h-[46px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-500 active:scale-98 transition-all glow-red-sm hover:glow-red shadow-lg shadow-red-950/50"
        >
          <Edit3 className="w-4 h-4 text-amber-300" />
          <span>Write My Own Review</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>

        {/* Row 2: WhatsApp and Instagram Side-by-Side */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* WhatsApp Button */}
          <a
            href={BUSINESS_CONFIG.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-semibold text-xs sm:text-sm text-white bg-[#25D366] hover:bg-[#20ba59] active:scale-95 transition-all shadow-md shadow-emerald-950/40"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>

          {/* Instagram Button */}
          <a
            href={BUSINESS_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-semibold text-xs sm:text-sm text-white bg-[#E1306C] hover:bg-[#c9245c] active:scale-95 transition-all shadow-md shadow-pink-950/40"
          >
            <Instagram className="w-4 h-4" />
            <span>Instagram</span>
          </a>
        </div>
      </div>
    </div>
  );
};
