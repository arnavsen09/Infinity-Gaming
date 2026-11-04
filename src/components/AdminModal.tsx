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
  Download
} from 'lucide-react';
import { ReviewItem, ReviewStats } from '../types';
import { BUSINESS_CONFIG, SAMPLE_GAMING_REVIEWS } from '../constants';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: ReviewItem[];
  stats: ReviewStats;
  onAddBulkReviews: (lines: string[]) => void;
  onResetPool: () => void;
  onDeleteReview: (id: string) => void;
  onToggleReviewStatus: (id: string) => void;
  onClearAll: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  reviews,
  stats,
  onAddBulkReviews,
  onResetPool,
  onDeleteReview,
  onToggleReviewStatus,
  onClearAll,
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
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState('');

  // Table filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unused' | 'used'>('all');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      username.trim() === BUSINESS_CONFIG.adminCredentials.username &&
      password === BUSINESS_CONFIG.adminCredentials.password
    ) {
      setIsAuthenticated(true);
      sessionStorage.setItem(BUSINESS_CONFIG.adminSessionKey, 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid admin credentials. Please verify username and password.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(BUSINESS_CONFIG.adminSessionKey);
    setUsername('');
    setPassword('');
  };

  const parsedBulkCount = bulkInput
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0).length;

  const handleAddBulk = () => {
    const lines = bulkInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    onAddBulkReviews(lines);
    setBulkInput('');
    setBulkSuccessMsg(`Successfully added ${lines.length} reviews to the live pool!`);
    setTimeout(() => setBulkSuccessMsg(''), 4000);
  };

  const handleLoadSamplePack = () => {
    onAddBulkReviews(SAMPLE_GAMING_REVIEWS);
    setBulkSuccessMsg(`Loaded ${SAMPLE_GAMING_REVIEWS.length} Bhopal gaming lounge template reviews!`);
    setTimeout(() => setBulkSuccessMsg(''), 4000);
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
        className="w-full max-w-4xl bg-[#141417] border border-zinc-800 rounded-3xl p-5 sm:p-7 glow-red-sm shadow-2xl my-auto text-zinc-100 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/70 border border-red-500/60 flex items-center justify-center glow-red-sm">
              <Lock className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                Infinity Gaming Admin Console
              </h2>
              <p className="text-xs text-zinc-400">
                Review Pool Depletion & Inventory Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-zinc-400 hover:text-red-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {!isAuthenticated ? (
          /* Login Form */
          <div className="py-8 max-w-md mx-auto w-full">
            <div className="text-center mb-6">
              <h3 className="text-base font-semibold text-white mb-1">
                Authorized Personnel Only
              </h3>
              <p className="text-xs text-zinc-400">
                Enter your credentials to manage the Google Review pool.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Admin Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-300">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-red-600 hover:bg-red-500 active:scale-95 transition-all glow-red-sm cursor-pointer mt-2"
              >
                Access Dashboard
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
            {/* Stats Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4">
                <span className="text-xs text-zinc-400 font-medium block">Total Pool</span>
                <span className="text-2xl font-bold font-mono text-white mt-1 block tabular-nums">
                  {stats.total}
                </span>
                <span className="text-[11px] text-zinc-500 mt-0.5 block">Reviews loaded</span>
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4">
                <span className="text-xs text-zinc-400 font-medium block">Unused (Live)</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block tabular-nums">
                  {stats.unused}
                </span>
                <span className="text-[11px] text-emerald-500/80 mt-0.5 block">Ready for visitors</span>
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4">
                <span className="text-xs text-zinc-400 font-medium block">Used / Depleted</span>
                <span className="text-2xl font-bold font-mono text-red-400 mt-1 block tabular-nums">
                  {stats.used}
                </span>
                <span className="text-[11px] text-zinc-500 mt-0.5 block">Copied & consumed</span>
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4">
                <span className="text-xs text-zinc-400 font-medium block">Depletion Rate</span>
                <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block tabular-nums">
                  {stats.percentUsed}%
                </span>
                <span className="text-[11px] text-zinc-500 mt-0.5 block">Pool consumed</span>
              </div>
            </div>

            {/* Bulk Add Section */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-500" />
                  <h3 className="text-sm font-semibold text-white">
                    Bulk Review Input (1 Review Per Line)
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <span>Lines detected:</span>
                  <span className="font-bold text-red-400 tabular-nums">{parsedBulkCount}</span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 mb-3">
                Paste raw review texts below. Each non-empty line will become an individual review card in the live pool.
              </p>

              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="Example:
Best gaming cafe in MP Nagar Bhopal! Super smooth 240Hz monitors.
Loved the PS5 private room, FIFA sessions were epic!
Great crowd, low ping on Valorant, and very friendly management."
                rows={5}
                className="w-full p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 text-xs sm:text-sm font-sans focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-y"
              />

              {bulkSuccessMsg && (
                <div className="mt-3 p-3 rounded-lg bg-emerald-950/50 border border-emerald-800/80 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{bulkSuccessMsg}</span>
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={handleAddBulk}
                  disabled={parsedBulkCount === 0}
                  className="px-5 py-2 rounded-xl font-semibold text-xs text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:pointer-events-none active:scale-95 transition-all glow-red-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add {parsedBulkCount > 0 ? `${parsedBulkCount} Reviews` : 'to Pool'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadSamplePack}
                    className="px-3 py-2 rounded-xl font-medium text-xs text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Quickly fill pool with 20 authentic Bhopal gaming lounge reviews"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Load 20 Bhopal Sample Reviews</span>
                  </button>

                  {reviews.length > 0 && (
                    <button
                      type="button"
                      onClick={handleExportText}
                      className="px-3 py-2 rounded-xl font-medium text-xs text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
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
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-zinc-400" />
                <span className="text-xs text-zinc-300">
                  Pool Maintenance:
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset all reviews back to UNUSED status?')) {
                      onResetPool();
                      setBulkSuccessMsg('Reset all reviews to UNUSED! Available count restored.');
                      setTimeout(() => setBulkSuccessMsg(''), 4000);
                    }
                  }}
                  disabled={stats.used === 0}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                  <span>Reset All to Unused</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to completely clear the entire review pool? This will delete all reviews from localStorage.')) {
                      onClearAll();
                    }
                  }}
                  disabled={reviews.length === 0}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/80 border border-red-900/60 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Entire Pool</span>
                </button>
              </div>
            </div>

            {/* Review List & Management Table */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-red-500" />
                  <h3 className="text-sm font-semibold text-white">
                    Live Pool Items ({filteredReviews.length} / {reviews.length})
                  </h3>
                </div>

                {/* Filter and Search */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search text..."
                      className="w-full pl-8 pr-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
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
              <div className="border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800/80 bg-zinc-950 max-h-72 overflow-y-auto">
                {filteredReviews.length === 0 ? (
                  <div className="p-8 text-center text-xs text-zinc-500">
                    {reviews.length === 0 ? (
                      <div>
                        <p className="font-medium text-zinc-400 mb-1">No reviews in the pool yet</p>
                        <p>Paste lines into the bulk box above or load the 20-sample template pack to get started.</p>
                      </div>
                    ) : (
                      'No reviews matching your search filter.'
                    )}
                  </div>
                ) : (
                  filteredReviews.map((r, idx) => (
                    <div 
                      key={r.id} 
                      className={`p-3 flex items-start justify-between gap-3 transition-colors ${r.is_used ? 'bg-zinc-950/60 opacity-60' : 'hover:bg-zinc-900/60'}`}
                    >
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
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
                            {r.used_at && (
                              <span>· Copied {new Date(r.used_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => onToggleReviewStatus(r.id)}
                          className="px-2 py-1 rounded text-[11px] font-mono text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 transition-colors cursor-pointer"
                          title={r.is_used ? 'Mark as Unused' : 'Mark as Used'}
                        >
                          {r.is_used ? 'Make Available' : 'Mark Used'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteReview(r.id)}
                          className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
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
