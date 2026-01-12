'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function AddStockForm() {
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [isHoldings, setIsHoldings] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    setLoading(true);
    setError('');

    const upperTicker = ticker.trim().toUpperCase();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    const table = isHoldings ? 'holdings' : 'watchlist';
    const data = isHoldings
      ? { ticker: upperTicker, shares: Number(shares) || 0, user_id: user.id }
      : { ticker: upperTicker, user_id: user.id };

    const { error } = await supabase.from(table).insert(data);

    if (error) {
      setError(error.message);
    } else {
      setTicker('');
      setShares('');
      // Restoring your exact reload logic to ensure data shows up immediately
      window.location.reload();
    }
    setLoading(false);
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-zinc-900/40 p-8 backdrop-blur-md">
      <h2 className="mb-6 text-xl font-bold tracking-tight text-white">Add Asset</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Toggle between Holdings and Watchlist */}
        <div className="flex p-1 rounded-xl bg-black/50 border border-white/5">
          <button
            type="button"
            onClick={() => setIsHoldings(true)}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
              isHoldings ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            Holdings
          </button>
          <button
            type="button"
            onClick={() => setIsHoldings(false)}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
              !isHoldings ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            Watchlist
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1.5 ml-1">
              Ticker Symbol
            </label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="AAPL"
              required
              className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-sm text-white placeholder-zinc-700 outline-none focus:border-white/20 transition-all uppercase"
            />
          </div>

          {isHoldings && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1.5 ml-1">
                Number of Shares
              </label>
              <input
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-sm text-white placeholder-zinc-700 outline-none focus:border-white/20 transition-all"
              />
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs font-bold text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !ticker.trim()}
          className="w-full rounded-xl bg-white py-4 text-[11px] font-black uppercase tracking-[0.2em] text-black hover:bg-zinc-200 disabled:opacity-50 transition active:scale-[0.98]"
        >
          {loading ? 'Adding to Ledger...' : 'Add to Portfolio'}
        </button>
      </form>
    </div>
  );
}