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
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-8">
        
        {/* Hero Gaming Banner Section */}
        <div className="relative rounded-3xl overflow-hidden border border-red-500/30 bg-[#121215] glow-border">
          {/* Background Image with Dark Vignette */}
          <div className="relative h-48 sm:h-64 w-full overflow-hidden">
            <img
              src={BUSINESS_CONFIG.bannerImage}
              alt="Infinity Gaming MP Nagar interior esports arena"
              className="w-full h-full object-cover object-center filter brightness-[0.7] contrast-[1.1]"
              referrerPolicy="no-referrer"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-[#121215]/75 to-transparent" />
            <div className="absolute inset-0 bg-radial from-transparent via-[#09090b]/40 to-[#09090b]/90" />
          </div>

          {/* Hero Content Overlap */}
          <div className="relative -mt-16 sm:-mt-20 px-5 sm:px-8 pb-6 sm:pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="flex items-start sm:items-end gap-4">
              {/* Emblem Badge */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black border-2 border-red-500/80 p-1 shadow-2xl glow-red shrink-0 overflow-hidden">
                <img
                  src={BUSINESS_CONFIG.badgeImage}
                  alt="Infinity Gaming Emblem"
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-red-400 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>MP Nagar Zone II · Bhopal</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display tracking-tight text-white leading-tight">
                  Infinity Gaming
                </h1>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-md">
                  Premier Esports Arena, RTX 40-Series Gaming Rigs, PS5 Consoles & Tournament Lounge.
                </p>
              </div>
            </div>

            {/* Quick Rating Badge */}
            <div className="flex items-center gap-3 sm:self-end bg-black/60 border border-zinc-800 backdrop-blur-md px-4 py-2.5 rounded-2xl shrink-0">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="border-l border-zinc-700 pl-3">
                <span className="text-xs font-bold text-white block">5.0 Star Target</span>
                <span className="text-[10px] text-zinc-400 block font-mono">Google Verified</span>
              </div>
            </div>
          </div>

          {/* Lounge Feature Pill Bar */}
          <div className="border-t border-zinc-800/80 px-5 sm:px-8 py-3 bg-[#0d0d10] flex items-center justify-between gap-4 overflow-x-auto text-xs text-zinc-400">
            <div className="flex items-center gap-5 whitespace-nowrap">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Cpu className="w-3.5 h-3.5 text-red-500" /> RTX 40-Series Rigs
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Tv className="w-3.5 h-3.5 text-red-500" /> 240Hz OLED Displays
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Gamepad2 className="w-3.5 h-3.5 text-red-500" /> PS5 Private Booths
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Trophy className="w-3.5 h-3.5 text-red-500" /> Weekly Esports LAN
              </span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500 whitespace-nowrap hidden md:inline">
              Zone II, MP Nagar, Bhopal
            </span>
          </div>
        </div>

        {/* 3-Step Instruction Guide Banner */}
        <div className="bg-[#121215] border border-zinc-800/90 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-red-500" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-display text-zinc-200">
              How To Post Your 5-Star Experience In 10 Seconds
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/70">
              <div className="w-6 h-6 rounded-lg bg-red-950 text-red-400 border border-red-800/60 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">Select a Review</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
                  Find the pre-written review card that best matches your gaming visit.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/70">
              <div className="w-6 h-6 rounded-lg bg-red-950 text-red-400 border border-red-800/60 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">Tap "Copy & Post"</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
                  Text copies to your clipboard & Google Review window opens directly.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/70">
              <div className="w-6 h-6 rounded-lg bg-red-950 text-red-400 border border-red-800/60 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">Paste & 5 Stars</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
                  Paste the text, tap all 5 Stars ⭐⭐⭐⭐⭐, and hit Post!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic 5-Stack Section */}
        <section aria-label="Review Selection Pool" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                  Available Pre-Written 5-Star Reviews
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Each review can only be used once. Select one to claim and copy it.
              </p>
            </div>

            {/* Controls: Shuffle and Live counter */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              {unusedReviews.length > 5 && (
                <button
                  type="button"
                  onClick={() => refreshStack(unusedReviews)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Shuffle 5 random options from pool"
                >
                  <Shuffle className="w-3.5 h-3.5 text-red-400" />
                  <span>Shuffle Options</span>
                </button>
              )}

              <div className="px-3 py-1.5 rounded-xl text-xs font-mono tabular-nums bg-red-950/40 border border-red-900/50 text-red-300 flex items-center gap-1.5">
                <span>Pool:</span>
                <strong className="text-white font-bold">{stats.unused}</strong>
                <span className="text-zinc-500">/</span>
                <span>{stats.total} left</span>
              </div>
            </div>
          </div>

          {/* Condition: Zero Reviews Left Screen OR Active 5-Stack */}
          {stats.unused === 0 ? (
            <ZeroReviewsState 
              totalInPool={stats.total} 
              onOpenAdmin={() => setIsAdminOpen(true)} 
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Omnichannel Social & Direct Buttons (Requirement #4) */}
        <section className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 sm:p-7 glow-red-sm">
          <div className="text-center max-w-lg mx-auto mb-6">
            <h3 className="text-base sm:text-lg font-bold font-display text-white">
              Connect With Infinity Gaming Bhopal
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Have suggestions, want to write your own review, or need to book a gaming rig?
            </p>
          </div>

          {/* Distinct Social Quick-Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Button 1: Write Custom Review (Red Outline Button) */}
            <a
              href={BUSINESS_CONFIG.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-red-400 hover:text-white bg-transparent hover:bg-red-600/10 border-2 border-red-500 hover:border-red-400 active:scale-95 transition-all duration-150 glow-border"
            >
              <Sparkles className="w-4 h-4 text-red-500" />
              <span>Write Custom Review</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            {/* Button 2: WhatsApp Support */}
            <a
              href={BUSINESS_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-emerald-400 hover:text-white bg-zinc-900 hover:bg-emerald-600/20 border border-emerald-500/50 hover:border-emerald-400 active:scale-95 transition-all duration-150"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Support</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            {/* Button 3: Instagram Page */}
            <a
              href={BUSINESS_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-pink-400 hover:text-white bg-zinc-900 hover:bg-pink-600/20 border border-pink-500/50 hover:border-pink-400 active:scale-95 transition-all duration-150"
            >
              <Instagram className="w-4 h-4 text-pink-400" />
              <span>Instagram Page</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </section>

        {/* Location & Lounge Trust Info */}
        <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-500 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-zinc-200">Infinity Gaming Lounge MP Nagar</p>
              <p className="text-[11px] text-zinc-500">Zone II, Maharana Pratap Nagar, Bhopal, Madhya Pradesh</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Everyday · 10:00 AM - 11:30 PM</span>
          </div>
        </div>

      </main>

      {/* Footer with Discrete Admin Access Link (Requirement #5) */}
      <footer className="w-full border-t border-zinc-800/80 bg-[#09090b] py-6 px-4 sm:px-6 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div>
            <span className="text-zinc-300 font-medium font-display">Infinity Gaming MP Nagar</span>
            <span className="mx-2 text-zinc-600">·</span>
            <span>Reputation Management & Review System</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={BUSINESS_CONFIG.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-200 transition-colors"
            >
              Google Place Link
            </a>
            <span className="text-zinc-600">·</span>
            {/* Discrete Admin Access Lock Icon & Link */}
            <button
              type="button"
              onClick={() => setIsAdminOpen(true)}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-red-400 transition-colors p-1 rounded cursor-pointer group"
              title="Admin Access Login"
            >
              <Lock className="w-3.5 h-3.5 text-zinc-400 group-hover:text-red-400" />
              <span className="group-hover:underline">Admin Access</span>
            </button>
          </div>
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
