/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Star,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { ReviewItem, ReviewStats } from './types';
import { BUSINESS_CONFIG } from './constants';
import { copyTextToClipboard } from './utils/clipboard';
import { supabase } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { ReviewCard } from './components/ReviewCard';
import { ZeroReviewsState } from './components/ZeroReviewsState';
import { SuccessModal } from './components/SuccessModal';
import { AdminModal } from './components/AdminModal';
import { FloatingBottomBar } from './components/FloatingBottomBar';

export default function App() {
  // Supabase State
  const [displayedReviews, setDisplayedReviews] = useState<ReviewItem[]>([]);
  const [allReviews, setAllReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ total: 0, used: 0, unused: 0, percentUsed: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Modals & UI States
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [successReviewText, setSuccessReviewText] = useState<string | null>(null);

  // 1. Fetch Real-time Counts and Pool from Supabase
  const fetchReviewData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true);
      setDbError(null);

      // Fetch accurate Total & Unused Counts
      // Total count
      const totalPromise = supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true });

      // Unused count
      const unusedPromise = supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('is_used', false);

      // Fetch customer 5-stack: SELECT * FROM reviews WHERE is_used = false LIMIT 5
      const stackPromise = supabase
        .from('reviews')
        .select('*')
        .eq('is_used', false)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch all reviews for admin overview
      const allPromise = supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      const [totalRes, unusedRes, stackRes, allRes] = await Promise.all([
        totalPromise,
        unusedPromise,
        stackPromise,
        allPromise,
      ]);

      if (totalRes.error) throw totalRes.error;
      if (unusedRes.error) throw unusedRes.error;
      if (stackRes.error) throw stackRes.error;

      const total = totalRes.count || 0;
      const unused = unusedRes.count || 0;
      const used = Math.max(0, total - unused);
      const percentUsed = total > 0 ? Math.round((used / total) * 100) : 0;

      setStats({ total, used, unused, percentUsed });
      setDisplayedReviews((stackRes.data as ReviewItem[]) || []);
      setAllReviews((allRes.data as ReviewItem[]) || []);
    } catch (err: any) {
      console.error('Error fetching reviews from Supabase:', err);
      setDbError(err.message || 'Unable to connect to Supabase. Check network or credentials.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchReviewData();
  }, [fetchReviewData]);

  // Realtime subscription to Supabase 'reviews' table
  useEffect(() => {
    const channel = supabase
      .channel('public:reviews')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reviews' },
        () => {
          // Sync in background when changes occur in Supabase
          fetchReviewData(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchReviewData]);

  // 2. One-Tap Copy & Deplete Logic
  const handleCopyAndPost = async (review: ReviewItem) => {
    // a. Execute navigator.clipboard.writeText(reviewText)
    await copyTextToClipboard(review.text);

    // c. Instantly launch direct Google Review page
    window.open(BUSINESS_CONFIG.googleReviewUrl, '_blank', 'noopener,noreferrer');

    // d. Instantly remove that item from the current UI stack so it never appears again
    setDisplayedReviews((prev) => prev.filter((r) => r.id !== review.id));
    setStats((prev) => {
      const newUnused = Math.max(0, prev.unused - 1);
      const newUsed = prev.used + 1;
      const percent = prev.total > 0 ? Math.round((newUsed / prev.total) * 100) : 0;
      return { ...prev, unused: newUnused, used: newUsed, percentUsed: percent };
    });

    // e. Show feedback confirmation modal
    setSuccessReviewText(review.text);

    // b. Perform async update to Supabase: UPDATE reviews SET is_used = true WHERE id = reviewId
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_used: true })
        .eq('id', review.id);

      if (error) {
        console.error('Supabase update review error:', error);
      } else {
        // Replenish the stack by fetching another unused review if available
        const { data } = await supabase
          .from('reviews')
          .select('*')
          .eq('is_used', false)
          .order('created_at', { ascending: false })
          .limit(5);

        if (data && data.length > 0) {
          setDisplayedReviews(data as ReviewItem[]);
        }
      }
    } catch (err) {
      console.error('Error updating review in Supabase:', err);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchReviewData(true);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col font-sans selection:bg-red-600 selection:text-white antialiased">
      {/* Top Bar Navigation */}
      <Navbar
        unusedCount={stats.unused}
        totalCount={stats.total}
        isLoading={isLoading}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Main Native-App Style Container (max-w-md mx-auto px-4 pb-48) */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-3 pb-48 flex flex-col gap-3.5">
        
        {/* Error notification banner if Supabase encounters issues */}
        {dbError && (
          <div className="p-3 rounded-2xl bg-red-950/70 border border-red-800 text-xs text-red-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white">Database Notice</p>
              <p className="text-[11px] text-red-300 mt-0.5 leading-relaxed">{dbError}</p>
            </div>
            <button
              onClick={() => fetchReviewData()}
              className="text-xs text-red-400 hover:text-white underline shrink-0 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Top Header Card */}
        <section aria-label="Lounge Introduction" className="text-center flex flex-col items-center pt-1">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/70 border border-red-800/60 text-xs font-semibold text-red-300 mb-2.5 glow-red-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>5-Star Google Reviews</span>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl font-extrabold font-display tracking-tight text-white leading-tight mb-1.5">
            Infinity Gaming MP Nagar
          </h1>

          {/* Star Rating Badge */}
          <div className="flex items-center gap-1.5 text-amber-400 mb-1.5">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" 
              />
            ))}
            <span className="text-xs font-bold text-amber-300 ml-1">5.0 Star</span>
          </div>

          <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
            Tap <strong className="text-zinc-200 font-semibold">Copy & Post</strong> to paste a 5-star review directly on Google in seconds.
          </p>
        </section>

        {/* Header Action Row: Reviews count & Refresh button */}
        <div className="flex items-center justify-between px-1 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-[11px]">
              Available Reviews: <strong className="text-red-400 font-bold">{stats.unused}</strong> / {stats.total}
            </span>
          </div>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white px-2 py-1 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Refresh review pool from Supabase"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-red-400' : ''}`} />
            <span>Sync</span>
          </button>
        </div>

        {/* PRIMARY 5-STACK REVIEW SECTION */}
        <section aria-label="Review Selection Pool" className="space-y-3">
          {isLoading ? (
            /* Loading Skeleton */
            <div className="space-y-3 py-6">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className="bg-[#131316] border border-zinc-800/70 rounded-2xl p-4 animate-pulse space-y-3"
                >
                  <div className="h-4 bg-zinc-800/80 rounded w-28" />
                  <div className="h-12 bg-zinc-800/50 rounded w-full" />
                  <div className="h-12 bg-zinc-800/80 rounded-xl w-full" />
                </div>
              ))}
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 pt-2 font-mono">
                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                <span>Loading live reviews from Supabase...</span>
              </div>
            </div>
          ) : stats.unused === 0 || displayedReviews.length === 0 ? (
            /* Out-of-Stock Handler Requirement */
            <ZeroReviewsState 
              totalInPool={stats.total} 
              onOpenAdmin={() => setIsAdminOpen(true)} 
            />
          ) : (
            /* Customer 5-Stack Reviews */
            <div className="flex flex-col gap-3">
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

        {/* Secondary Info: Gaming Lounge Details & Location */}
        <div className="mt-2 pt-4 border-t border-zinc-800/80 space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-[#121215] p-3.5 flex items-center gap-3">
            <img
              src={BUSINESS_CONFIG.badgeImage}
              alt="Infinity Gaming Emblem"
              className="w-12 h-12 rounded-xl object-cover border border-red-500/60 shrink-0 glow-red-sm"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-red-400">
                <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                <span className="truncate">MP Nagar Zone II · Bhopal</span>
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-white truncate">
                Premier Esports & Console Lounge
              </h2>
              <p className="text-[10px] text-zinc-400 line-clamp-1">
                RTX 40-Series Rigs · PS5 Private Booths · 240Hz Displays
              </p>
            </div>
          </div>

          <p className="text-[10px] text-zinc-500 text-center">
            Reviews are synced live with Supabase cloud database to ensure 100% unique posts.
          </p>
        </div>
      </main>

      {/* Floating Bottom Bar with 48px touch targets */}
      <FloatingBottomBar />

      {/* Admin Dashboard Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        reviews={allReviews}
        stats={stats}
        onRefreshData={() => fetchReviewData(true)}
      />

      {/* One-Tap Copy Success Feedback Modal */}
      {successReviewText && (
        <SuccessModal
          copiedText={successReviewText}
          onClose={() => setSuccessReviewText(null)}
        />
      )}
    </div>
  );
}
