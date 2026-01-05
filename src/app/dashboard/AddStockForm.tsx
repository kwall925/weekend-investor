// src/app/dashboard/AddStockForm.tsx
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
      window.location.reload();
    }
    setLoading(false);
  };

  return (
    <div className="rounded-xl bg-white p-8 shadow-lg">
      <h2 className="mb-6 text-2xl text-black font-semibold">Add a Stock</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-black font-medium text-gray-700">Ticker</label>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="AAPL"
            required
            className="mt-1 w-full rounded-lg border text-black border-gray-300 px-4 py-3 text-lg uppercase"
          />
        </div>

        {isHoldings && (
          <div>
            <label className="block text-sm text-black font-medium text-gray-700">Shares</label>
            <input
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="100"
              min="0"
              step="0.01"
              className="mt-1 w-full rounded-lg text-black border border-gray-300 px-4 py-3 text-lg"
            />
          </div>
        )}

        <div className="flex gap-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              checked={isHoldings}
              onChange={() => setIsHoldings(true)}
              className="mr-2"
            />
            <span className="font-medium text-black">Add to Holdings</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              checked={!isHoldings}
              onChange={() => setIsHoldings(false)}
              className="mr-2"
            />
            <span className="font-medium text-black">Add to Watchlist</span>
          </label>
        </div>

        {error && <p className="text-red-600 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={loading || !ticker.trim()}
          className="w-full rounded-lg bg-black py-4 text-white font-semibold text-lg hover:bg-gray-800 disabled:opacity-50 transition"
        >
          {loading ? 'Adding...' : 'Add Stock'}
        </button>
      </form>
    </div>
  );
}