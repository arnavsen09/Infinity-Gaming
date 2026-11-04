import React, { useState } from 'react';
import { 
  Lock, 
  X, 
  Plus, 
  RotateCcw, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  LogOut, 
  FileText, 
  Search, 
  Eye, 
  EyeOff,
  Sparkles,
  Download,
  Loader2,
  AlertTriangle,
  Copy,
  Check,
  Code2,
  ExternalLink
} from 'lucide-react';
import { ReviewItem, ReviewStats } from '../types';
import { BUSINESS_CONFIG, SAMPLE_GAMING_REVIEWS } from '../constants';
import { supabase } from '../lib/supabase';
import { copyTextToClipboard } from '../utils/clipboard';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: ReviewItem[];
  stats: ReviewStats;
  onRefreshData: () => Promise<void>;
}

const RLS_FIX_SQL = `-- Run this in your Supabase SQL Editor to allow public reviews:
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- OR if you prefer to keep RLS active with public policies:
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon" ON reviews;
CREATE POLICY "Allow all for anon" ON reviews FOR ALL TO public USING (true) WITH CHECK (true);`;

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  reviews,
  stats,
  onRefreshData,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(BUSINESS_CONFIG.adminSessionKey) === 'true';
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Bulk input state
  const [bulkInput, setBulkInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Table filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unused' | 'used'>('all');

  // Supabase RLS Helper State
  const [showRlsHelper, setShowRlsHelper] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [hasRlsError, setHasRlsError] = useState(false);

  if (!isOpen) return null;

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const handleCopySql = async () => {
    const success = await copyTextToClipboard(RLS_FIX_SQL);
    if (success) {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      username.trim() === BUSINESS_CONFIG.adminCredentials.username &&
      password === BUSINESS_CONFIG.adminCredentials.password
    ) {
      setIsAuthenticated(true);
      sessionStorage.setItem(BUSINESS_CONFIG.adminSessionKey, 'true');
      setLoginError('');
      onRefreshData();
    } else {
      setLoginError('Invalid admin username or password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(BUSINESS_CONFIG.adminSessionKey);
    setUsername('');
    setPassword('');
  };

  const parsedBulkLines = bulkInput
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Check if an error is an RLS violation
  const checkRlsError = (err: any) => {
    const msg = err?.message || '';
    if (
      msg.includes('row-level security') ||
      msg.includes('policy') ||
      err?.code === '42501'
    ) {
      setHasRlsError(true);
      setShowRlsHelper(true);
      return true;
    }
    return false;
  };

  // Bulk Insert into Supabase
  const handleAddBulk = async () => {
    if (parsedBulkLines.length === 0) return;

    try {
      setIsSubmitting(true);
      const recordsToInsert = parsedBulkLines.map((text) => ({
        business_id: BUSINESS_CONFIG.businessId,
        text,
        is_used: false,
      }));

      const { error } = await supabase
        .from('reviews')
        .insert(recordsToInsert);

      if (error) throw error;

      setBulkInput('');
      setHasRlsError(false);
      showNotification(`Added ${recordsToInsert.length} reviews to cloud database!`);
      await onRefreshData();
    } catch (err: any) {
      console.error('Supabase bulk insert error:', err);
      const isRls = checkRlsError(err);
      if (isRls) {
        showNotification(
          'Supabase Row-Level Security (RLS) is blocking inserts. Use the SQL fix below to allow public access.',
          'error'
        );
      } else {
        showNotification(err.message || 'Failed to insert reviews into Supabase', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load 20 Bhopal Sample pack into Supabase
  const handleLoadSamplePack = async () => {
    try {
      setIsSubmitting(true);
      const records = SAMPLE_GAMING_REVIEWS.map((text) => ({
        business_id: BUSINESS_CONFIG.businessId,
        text,
        is_used: false,
      }));

      const { error } = await supabase.from('reviews').insert(records);
      if (error) throw error;

      setHasRlsError(false);
      showNotification(`Successfully seeded ${records.length} authentic gaming reviews!`);
      await onRefreshData();
    } catch (err: any) {
      console.error('Supabase sample load error:', err);
      const isRls = checkRlsError(err);
      if (isRls) {
        showNotification(
          'Supabase Row-Level Security (RLS) is blocking inserts. Use the SQL fix below to enable access.',
          'error'
        );
      } else {
        showNotification(err.message || 'Failed to load sample reviews', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Pool: UPDATE reviews SET is_used = false
  const handleResetPool = async () => {
    if (!window.confirm('Reset all reviews back to UNUSED in Supabase?')) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('reviews')
        .update({ is_used: false })
        .eq('is_used', true);

      if (error) throw error;

      showNotification('Reset all reviews to UNUSED in Supabase database!');
      await onRefreshData();
    } catch (err: any) {
      console.error('Supabase reset pool error:', err);
      checkRlsError(err);
      showNotification(err.message || 'Failed to reset pool in Supabase', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle individual review status
  const handleToggleStatus = async (item: ReviewItem) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_used: !item.is_used })
        .eq('id', item.id);

      if (error) throw error;
      await onRefreshData();
    } catch (err: any) {
      console.error('Toggle status error:', err);
      checkRlsError(err);
      showNotification(err.message || 'Failed to update review status', 'error');
    }
  };

  // Delete review
  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Delete this review permanently from database?')) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await onRefreshData();
    } catch (err: any) {
      console.error('Delete review error:', err);
      checkRlsError(err);
      showNotification(err.message || 'Failed to delete review', 'error');
    }
  };

  // Clear entire pool
  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL reviews from the cloud database? This cannot be undone.')) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('reviews')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;
      showNotification('Cleared all reviews from Supabase database.');
      await onRefreshData();
    } catch (err: any) {
      console.error('Clear all error:', err);
      checkRlsError(err);
      showNotification(err.message || 'Failed to clear reviews', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportText = () => {
    const textContent = reviews.map((r, i) => `${i + 1}. [${r.is_used ? 'USED' : 'AVAILABLE'}] ${r.text}`).join('\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `infinity_gaming_reviews_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    const matchesQuery = r.text.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'unused') return matchesQuery && !r.is_used;
    if (statusFilter === 'used') return matchesQuery && r.is_used;
    return matchesQuery;
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-[#141417] border border-zinc-800 rounded-3xl p-4 sm:p-6 glow-red-sm shadow-2xl my-auto text-zinc-100 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-950/70 border border-red-500/60 flex items-center justify-center glow-red-sm shrink-0">
              <Lock className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-white">
                Admin Console
              </h2>
              <p className="text-[11px] text-zinc-400">
                Supabase Cloud Database
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-zinc-400 hover:text-red-400 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Logout</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-white w-9 h-9 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {!isAuthenticated ? (
          /* Secure Login Form - No credentials in placeholders or messages */
          <div className="py-6 max-w-sm mx-auto w-full">
            <div className="text-center mb-5">
              <h3 className="text-sm font-semibold text-white mb-1">
                Authorized Personnel Only
              </h3>
              <p className="text-xs text-zinc-400">
                Enter your administrative credentials to manage reviews.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full min-h-[48px] py-3 px-4 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-500 active:scale-[0.98] transition-all glow-red-sm cursor-pointer mt-2"
              >
                Access Dashboard
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {/* Live Counters from Supabase */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3">
                <span className="text-[11px] text-zinc-400 block">Total Pool</span>
                <span className="text-xl font-bold font-mono text-white mt-0.5 block tabular-nums">
                  {stats.total}
                </span>
                <span className="text-[10px] text-zinc-500 block">In Supabase</span>
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3">
                <span className="text-[11px] text-zinc-400 block">Unused (Live)</span>
                <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5 block tabular-nums">
                  {stats.unused}
                </span>
                <span className="text-[10px] text-emerald-500/80 block">Ready to copy</span>
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3">
                <span className="text-[11px] text-zinc-400 block">Used / Depleted</span>
                <span className="text-xl font-bold font-mono text-red-400 mt-0.5 block tabular-nums">
                  {stats.used}
                </span>
                <span className="text-[10px] text-zinc-500 block">Claimed</span>
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3">
                <span className="text-[11px] text-zinc-400 block">Depletion</span>
                <span className="text-xl font-bold font-mono text-amber-400 mt-0.5 block tabular-nums">
                  {stats.percentUsed}%
                </span>
                <span className="text-[10px] text-zinc-500 block">Rate</span>
              </div>
            </div>

            {/* Notification message */}
            {feedbackMsg && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${feedbackMsg.type === 'error' ? 'bg-red-950/60 border-red-800 text-red-300' : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'}`}>
                {feedbackMsg.type === 'error' ? (
                  <XCircle className="w-4 h-4 shrink-0 text-red-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                )}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            {/* Supabase Row-Level Security (RLS) Resolution Box */}
            {(hasRlsError || showRlsHelper) && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/60 text-xs text-amber-200 space-y-3 glow-red-sm">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-amber-300 text-sm">
                      Fix Supabase Row-Level Security (RLS) Policy
                    </h4>
                    <p className="text-[11px] text-amber-200/90 mt-1 leading-relaxed">
                      Supabase restricts table inserts by default until an RLS policy is granted to the public <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">anon</code> key.
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-3 font-mono text-[11px] text-zinc-300 overflow-x-auto relative">
                  <pre className="whitespace-pre">{`ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;`}</pre>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="min-h-[42px] px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-zinc-950" />
                        <span>Copied SQL to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-950" />
                        <span>Copy 1-Click SQL Fix</span>
                      </>
                    )}
                  </button>

                  <a
                    href="https://supabase.com/dashboard/project/_/sql"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[42px] px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>Open Supabase SQL Editor</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </div>

                <p className="text-[10px] text-amber-300/80 leading-normal">
                  💡 In Supabase: open your project &rarr; <strong>SQL Editor</strong> &rarr; paste & click <strong>RUN</strong>. Then return here and retry inserting!
                </p>
              </div>
            )}

            {/* Bulk Insert Section */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 sm:p-4">
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-500" />
                  <h3 className="text-xs sm:text-sm font-semibold text-white">
                    Bulk Insert to Supabase (1 Per Line)
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <button
                    type="button"
                    onClick={() => setShowRlsHelper(!showRlsHelper)}
                    className="text-[11px] text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
                    title="View Supabase SQL helper"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>RLS Guide</span>
                  </button>
                  <span>Lines: </span>
                  <span className="font-bold text-red-400 tabular-nums">{parsedBulkLines.length}</span>
                </div>
              </div>

              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="Paste reviews here, one per line..."
                rows={4}
                className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 text-xs font-sans focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-y"
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleAddBulk}
                  disabled={parsedBulkLines.length === 0 || isSubmitting}
                  className="min-h-[44px] px-4 py-2 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] transition-all glow-red-sm flex items-center gap-1.5 cursor-pointer touch-manipulation"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>Insert {parsedBulkLines.length > 0 ? `${parsedBulkLines.length} to Database` : 'to Supabase'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadSamplePack}
                    disabled={isSubmitting}
                    className="min-h-[44px] px-3 py-2 rounded-xl font-medium text-xs text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer touch-manipulation"
                    title="Load 20 Bhopal gaming lounge sample reviews directly into Supabase"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Seed 20 Sample Reviews</span>
                  </button>

                  {reviews.length > 0 && (
                    <button
                      type="button"
                      onClick={handleExportText}
                      className="min-h-[44px] px-3 py-2 rounded-xl font-medium text-xs text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer touch-manipulation"
                      title="Export review pool as text file"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-300 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                Cloud Maintenance:
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetPool}
                  disabled={stats.used === 0 || isSubmitting}
                  className="min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1.5 cursor-pointer touch-manipulation"
                  title="Run UPDATE reviews SET is_used = false"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                  <span>Reset All to Unused</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={reviews.length === 0 || isSubmitting}
                  className="min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/80 border border-red-900/60 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1.5 cursor-pointer touch-manipulation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>

            {/* Review List & Management Table */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-red-500" />
                  <h3 className="text-xs sm:text-sm font-semibold text-white">
                    Database Items ({filteredReviews.length} / {reviews.length})
                  </h3>
                </div>

                {/* Filter and Search */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-44">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className={`px-2 py-1 rounded-md transition-colors ${statusFilter === 'all' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-white'}`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('unused')}
                      className={`px-2 py-1 rounded-md transition-colors ${statusFilter === 'unused' ? 'bg-emerald-950/80 text-emerald-400 font-medium' : 'text-zinc-400 hover:text-white'}`}
                    >
                      Unused
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('used')}
                      className={`px-2 py-1 rounded-md transition-colors ${statusFilter === 'used' ? 'bg-red-950/80 text-red-400 font-medium' : 'text-zinc-400 hover:text-white'}`}
                    >
                      Used
                    </button>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800/80 bg-zinc-950 max-h-64 overflow-y-auto">
                {filteredReviews.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-500">
                    {reviews.length === 0 ? (
                      <div>
                        <p className="font-medium text-zinc-400 mb-1">No reviews in Supabase database yet</p>
                        <p>Paste lines above or tap "Seed 20 Sample Reviews".</p>
                      </div>
                    ) : (
                      'No reviews matching your filter.'
                    )}
                  </div>
                ) : (
                  filteredReviews.map((r, idx) => (
                    <div 
                      key={r.id} 
                      className={`p-2.5 sm:p-3 flex items-start justify-between gap-2.5 transition-colors ${r.is_used ? 'bg-zinc-950/60 opacity-60' : 'hover:bg-zinc-900/60'}`}
                    >
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <span className="text-[10px] font-mono text-zinc-500 mt-0.5 tabular-nums shrink-0">
                          #{(idx + 1).toString().padStart(2, '0')}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-zinc-200 line-clamp-2">
                            {r.text}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500">
                            {r.is_used ? (
                              <span className="text-red-400 flex items-center gap-1 font-mono">
                                <XCircle className="w-3 h-3" /> Used
                              </span>
                            ) : (
                              <span className="text-emerald-400 flex items-center gap-1 font-mono">
                                <CheckCircle2 className="w-3 h-3" /> Available
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(r)}
                          className="px-2 py-1.5 rounded text-[11px] font-mono text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                          title={r.is_used ? 'Mark as Unused' : 'Mark as Used'}
                        >
                          {r.is_used ? 'Make Unused' : 'Mark Used'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(r.id)}
                          className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Delete review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
