/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Instagram, 
  ExternalLink, 
  Lock, 
  Flame, 
  Shuffle, 
  MapPin, 
  CheckCircle2, 
  Gamepad2,
  Tv,
  Cpu,
  Trophy,
  Star
} from 'lucide-react';
import { ReviewItem, ReviewStats } from './types';
import { BUSINESS_CONFIG } from './constants';
import { copyTextToClipboard } from './utils/clipboard';
import { Navbar } from './components/Navbar';
import { ReviewCard } from './components/ReviewCard';
import { ZeroReviewsState } from './components/ZeroReviewsState';
import { SuccessModal } from './components/SuccessModal';
import { AdminModal } from './components/AdminModal';
import { FloatingBottomBar } from './components/FloatingBottomBar';

export default function App() {
  // 1. Initialize review pool from localStorage (defaults strictly to [] empty array as instructed)
  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    try {
      const saved = localStorage.getItem(BUSINESS_CONFIG.localStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading review pool from localStorage:', e);
    }
    return [];
  });

  // Persistent storage synchronizer
  useEffect(() => {
    try {
      localStorage.setItem(BUSINESS_CONFIG.localStorageKey, JSON.stringify(reviews));
    } catch (e) {
      console.error('Error saving review pool to localStorage:', e);
    }
  }, [reviews]);

  // Modals & UI States
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [successReviewText, setSuccessReviewText] = useState<string | null>(null);

  // Compute Unused Reviews
  const unusedReviews = useMemo(() => {
    return reviews.filter((r) => !r.is_used);
  }, [reviews]);

  // Overall Statistics
  const stats: ReviewStats = useMemo(() => {
    const total = reviews.length;
    const unused = unusedReviews.length;
    const used = total - unused;
    const percentUsed = total > 0 ? Math.round((used / total) * 100) : 0;
    return { total, used, unused, percentUsed };
  }, [reviews, unusedReviews]);

  // 2. Dynamic 5-Stack of unused reviews
  // We maintain a list of active 5 review IDs that are currently shown
  const [currentStackIds, setCurrentStackIds] = useState<string[]>([]);

  // Function to pick a fresh random subset of up to 5 unused reviews
  const refreshStack = useCallback((availableList: ReviewItem[]) => {
    if (availableList.length === 0) {
      setCurrentStackIds([]);
      return;
    }
    // Shuffle copy of unused reviews
    const shuffled = [...availableList].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5).map((r) => r.id);
    setCurrentStackIds(selected);
  }, []);

  // Update stack when unused reviews change (e.g. initial load or bulk add)
  useEffect(() => {
    // If current stack contains IDs that are no longer unused or valid, reconcile
    const validCurrent = currentStackIds.filter((id) =>
      unusedReviews.some((r) => r.id === id)
    );

    if (validCurrent.length < Math.min(5, unusedReviews.length)) {
      // Need to fill up to 5
      const availableNotInStack = unusedReviews.filter(
        (r) => !validCurrent.includes(r.id)
      );
      const needed = Math.min(5, unusedReviews.length) - validCurrent.length;
      const additional = [...availableNotInStack]
        .sort(() => 0.5 - Math.random())
        .slice(0, needed)
        .map((r) => r.id);

      setCurrentStackIds([...validCurrent, ...additional]);
    } else if (validCurrent.length === 0 && unusedReviews.length > 0) {
      refreshStack(unusedReviews);
    }
  }, [unusedReviews, currentStackIds, refreshStack]);

  // Active reviews in the 5-stack
  const displayedReviews = useMemo(() => {
    return currentStackIds
      .map((id) => unusedReviews.find((r) => r.id === id))
      .filter((r): r is ReviewItem => Boolean(r));
  }, [currentStackIds, unusedReviews]);

  // 3. One-Tap Copy & Depletion Logic
  const handleCopyAndPost = async (review: ReviewItem) => {
    // A. Copy review text to clipboard
    await copyTextToClipboard(review.text);

    // B. Mark review as is_used: true in state and record timestamp
    setReviews((prev) =>
      prev.map((item) =>
        item.id === review.id
          ? { ...item, is_used: true, used_at: new Date().toISOString() }
          : item
      )
    );

    // C. Remove that review from current stack
    setCurrentStackIds((prev) => prev.filter((id) => id !== review.id));

    // D. Open direct Google Review page in a new browser tab
    window.open(BUSINESS_CONFIG.googleReviewUrl, '_blank', 'noopener,noreferrer');

    // E. Show feedback confirmation modal
    setSuccessReviewText(review.text);
  };

  // Admin Actions
  const handleAddBulkReviews = (lines: string[]) => {
    const newItems: ReviewItem[] = lines.map((text, idx) => ({
      id: `rev-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
      text,
      is_used: false,
      used_at: null,
      created_at: new Date().toISOString(),
    }));

    setReviews((prev) => [...prev, ...newItems]);
  };

  const handleResetPool = () => {
    setReviews((prev) =>
      prev.map((r) => ({
        ...r,
        is_used: false,
        used_at: null,
      }))
    );
  };

  const handleDeleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setCurrentStackIds((prev) => prev.filter((stackId) => stackId !== id));
  };

  const handleToggleReviewStatus = (id: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              is_used: !r.is_used,
              used_at: !r.is_used ? new Date().toISOString() : null,
            }
          : r
      )
    );
  };

  const handleClearAll = () => {
    setReviews([]);
    setCurrentStackIds([]);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar
        unusedCount={stats.unused}
        totalCount={stats.total}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 pt-5 pb-36 flex flex-col gap-5">
        
        {/* Top Header Card - Exact layout as user screenshot */}
        <div className="text-center flex flex-col items-center pt-2">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/70 border border-red-800/60 text-xs font-semibold text-red-300 mb-3 glow-red-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>5-Star Google Reviews</span>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white leading-tight mb-2">
            Infinity Gaming MP Nagar
          </h1>

          {/* Star Rating */}
          <div className="flex items-center gap-1.5 text-amber-400 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" 
              />
            ))}
            <span className="text-xs sm:text-sm font-bold text-amber-300 ml-1">5.0 Star</span>
          </div>

          {/* Instruction Kicker */}
          <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto">
            Tap any review below to copy it and open Google:
          </p>

          {/* Pool Counter & Shuffle Pill */}
          <div className="flex items-center gap-2 mt-3 text-xs font-mono">
            <div className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1.5 tabular-nums">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-zinc-400">Available:</span>
              <strong className="text-red-400 font-bold">{stats.unused}</strong>
              <span className="text-zinc-600">/</span>
              <span>{stats.total}</span>
            </div>

            {unusedReviews.length > 5 && (
              <button
                type="button"
                onClick={() => refreshStack(unusedReviews)}
                className="px-3 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                title="Shuffle options"
              >
                <Shuffle className="w-3 h-3 text-red-400" />
                <span>Shuffle</span>
              </button>
            )}
          </div>
        </div>

        {/* PRIMARY 5-STACK REVIEW SECTION (TOP PRIORITY ON SCREEN) */}
        <section aria-label="Review Selection Pool" className="space-y-3">
          {stats.unused === 0 ? (
            <ZeroReviewsState 
              totalInPool={stats.total} 
              onOpenAdmin={() => setIsAdminOpen(true)} 
            />
          ) : (
            <div className="flex flex-col gap-2.5">
              {displayedReviews.map((review, index) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  index={index}
                  onCopyAndPost={handleCopyAndPost}
                />
              ))}
            </div>
          )}
        </section>

        {/* Secondary Info: Gaming Lounge Details & Location (Below the reviews) */}
        <div className="mt-4 pt-6 border-t border-zinc-800/80 space-y-4">
          {/* Compact Lounge Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-[#121215] p-4 flex items-center gap-4">
            <img
              src={BUSINESS_CONFIG.badgeImage}
              alt="Infinity Gaming Emblem"
              className="w-14 h-14 rounded-xl object-cover border border-red-500/60 shrink-0 glow-red-sm"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-red-400">
                <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                <span>MP Nagar Zone II · Bhopal</span>
              </div>
              <h2 className="text-sm font-bold text-white truncate">
                Premier Esports & Console Lounge
              </h2>
              <p className="text-[11px] text-zinc-400 line-clamp-1">
                RTX 40-Series Rigs · PS5 Private Booths · 240Hz OLED Displays
              </p>
            </div>
          </div>

          {/* Quick 3-Step Guide */}
          <div className="bg-zinc-950/60 border border-zinc-800/70 rounded-xl p-3.5 text-xs text-zinc-300">
            <div className="flex items-center gap-1.5 text-red-400 font-semibold mb-2 text-[11px] uppercase tracking-wider">
              <Flame className="w-3 h-3" />
              <span>3 Quick Steps</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="bg-zinc-900/80 p-2 rounded-lg">
                <span className="font-bold text-white block">1. Tap</span>
                <span className="text-zinc-400 text-[10px]">Copy & Post</span>
              </div>
              <div className="bg-zinc-900/80 p-2 rounded-lg">
                <span className="font-bold text-white block">2. Google Opens</span>
                <span className="text-zinc-400 text-[10px]">Paste Review</span>
              </div>
              <div className="bg-zinc-900/80 p-2 rounded-lg">
                <span className="font-bold text-white block">3. 5 Stars</span>
                <span className="text-zinc-400 text-[10px]">⭐⭐⭐⭐⭐</span>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Floating Bottom Bar (Write My Own Review + WhatsApp + Instagram as in screenshot) */}
      <FloatingBottomBar />

      {/* Footer with Discrete Admin Access Link */}
      <footer className="w-full border-t border-zinc-800/80 bg-[#09090b] py-5 px-4 pb-28 sm:pb-24 text-xs text-zinc-500 text-center">
        <div className="max-w-md mx-auto flex items-center justify-center gap-3">
          <span>Infinity Gaming MP Nagar</span>
          <span>·</span>
          <button
            type="button"
            onClick={() => setIsAdminOpen(true)}
            className="flex items-center gap-1 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
            title="Admin Access Login"
          >
            <Lock className="w-3 h-3" />
            <span>Admin Access</span>
          </button>
        </div>
      </footer>

      {/* Copy Feedback Modal */}
      {successReviewText && (
        <SuccessModal
          copiedText={successReviewText}
          onClose={() => setSuccessReviewText(null)}
        />
      )}

      {/* Admin Management Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        reviews={reviews}
        stats={stats}
        onAddBulkReviews={handleAddBulkReviews}
        onResetPool={handleResetPool}
        onDeleteReview={handleDeleteReview}
        onToggleReviewStatus={handleToggleReviewStatus}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
