import React from 'react';
import { CheckCircle2, ExternalLink, Star, Copy, X } from 'lucide-react';
import { BUSINESS_CONFIG } from '../constants';

interface SuccessModalProps {
  copiedText: string;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ copiedText, onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[#141417] border border-red-500/80 rounded-2xl p-6 sm:p-7 glow-red shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with success check */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-red-950/80 border border-red-500 flex items-center justify-center shrink-0 glow-red-sm">
            <CheckCircle2 className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-white">
              Review Copied to Clipboard!
            </h3>
            <p className="text-xs text-zinc-400">
              Google Review page opened in a new tab
            </p>
          </div>
        </div>

        {/* Copied Review Preview Box */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 mb-5">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1.5">
            <span className="flex items-center gap-1 text-red-400">
              <Copy className="w-3 h-3" /> Ready on your clipboard:
            </span>
            <div className="flex items-center gap-0.5 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
          <p className="text-xs text-zinc-200 italic line-clamp-3">
            "{copiedText}"
          </p>
        </div>

        {/* Quick 2-Step Instructions */}
        <div className="space-y-2 mb-6 text-xs sm:text-sm text-zinc-300">
          <div className="flex items-start gap-2.5">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-600/30 text-red-400 font-bold text-xs shrink-0 mt-0.5 border border-red-500/40">
              1
            </span>
            <span>Switch to the opened <strong>Google Review tab</strong> (or tap the button below).</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-600/30 text-red-400 font-bold text-xs shrink-0 mt-0.5 border border-red-500/40">
              2
            </span>
            <span>Tap the review box, <strong>Paste</strong>, select <strong>5 Stars ⭐⭐⭐⭐⭐</strong> and submit!</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <a
            href={BUSINESS_CONFIG.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-red-600 hover:bg-red-500 active:scale-95 transition-all glow-red-sm shadow-lg shadow-red-950/50"
          >
            <span>Switch to Google Review</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl font-medium text-sm text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
