'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface PriceCardProps {
  ticker: string;
  shares?: number;
  id: string;
  isHolding: boolean;
  initialQuote: any;
  initialNotes?: string;
}

export default function PriceCard({ ticker, shares: initialShares, id, isHolding, initialQuote, initialNotes }: PriceCardProps) {
  const [shares, setShares] = useState(initialShares || 0);
  const [notes, setNotes] = useState(initialNotes || '');
  const [showNotes, setShowNotes] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  const price = initialQuote?.c || 0;
  const changePercent = initialQuote?.dp || 0;
  const isPositive = changePercent >= 0;

  const handleUpdate = async () => {
    setLoading(true);
    const table = isHolding ? 'holdings' : 'watchlist';
    const payload = isHolding ? { shares, notes } : { notes };
    
    const { error } = await supabase
      .from(table)
      .update(payload)
      .eq('id', id);

    if (error) alert(error.message);
    else {
      setIsEditing(false);
      router.refresh();
    }
    setLoading(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents opening notes when clicking delete
    if (!confirm(`Remove ${ticker}?`)) return;
    setLoading(true);
    const table = isHolding ? 'holdings' : 'watchlist';
    await supabase.from(table).delete().eq('id', id);
    router.refresh();
    setLoading(false);
  };

  return (
    <div className={`group flex flex-col border-b border-white/5 last:border-0 transition-all ${loading ? 'opacity-50' : ''}`}>
      {/* Main Row */}
      <div 
        onClick={() => setShowNotes(!showNotes)}
        className="flex cursor-pointer items-center justify-between px-5 py-5 hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-800 to-black text-[13px] font-black tracking-tighter text-white">
            {ticker.substring(0, 3)}
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold tracking-tight text-zinc-100">{ticker}</h4>
              {notes && <div className="h-1 w-1 rounded-full bg-emerald-500" title="Has notes" />}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
              {isHolding ? `${shares} Shares` : 'Watchlist'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm font-bold tracking-tight text-white">
              ${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className={`text-[10px] font-black ${isPositive ? 'text-emerald-500' : 'text-red-400'}`}>
              {isPositive ? '↑' : '↓'} {Math.abs(changePercent).toFixed(2)}%
            </p>
          </div>
          {/* Subtle Chevron to indicate expandable */}
          <svg className={`w-4 h-4 text-zinc-700 transition-transform ${showNotes ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expandable Notes & Edit Section */}
      {showNotes && (
        <div className="bg-black/40 px-5 pb-6 pt-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 gap-4">
            {isHolding && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Total Shares</label>
                <input 
                  type="number"
                  value={shares}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => { setShares(Number(e.target.value)); setIsEditing(true); }}
                  className="w-full rounded-xl border border-white/5 bg-zinc-900/50 px-4 py-2 text-sm text-white outline-none focus:border-white/20"
                />
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Investment Notes</label>
              <textarea 
                value={notes}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => { setNotes(e.target.value); setIsEditing(true); }}
                placeholder="Why did you buy this? What's your exit plan?"
                className="w-full min-h-[100px] rounded-xl border border-white/5 bg-zinc-900/50 px-4 py-3 text-sm text-white placeholder-zinc-700 outline-none focus:border-white/20 resize-none"
              />
            </div>
          </div>

          {/* Inside the expanded section of PriceCard.tsx */}
  <div className="flex items-center justify-between pt-2">
  <div className="flex items-center gap-4">
    {/* Yahoo Finance Link * /}
    <a
      href={`https://finance.yahoo.com/quote/${ticker}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
    >
      <span>Yahoo Finance</span>
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>

    {/* 2. Financial Statements (Income/Balance/Cash Flow) */}
    <a
      href={`https://finance.yahoo.com/quote/${ticker}/financials/`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
    >
      <span>Financials</span>
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </a>

    {/* 2. News */}
    <a
      href={`https://finance.yahoo.com/quote/${ticker}/news/`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
    >
      <span>News</span>
      <svg 
        className="w-3.5 h-3.5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" 
        />
      </svg>
    </a>

  </div>
</div>

          <div className="flex items-center justify-between pt-2">
            <button 
              onClick={handleDelete}
              className="text-[10px] font-bold uppercase tracking-widest text-red-900 hover:text-red-500 transition-colors"
            >
              Remove Asset
            </button>
            
            {isEditing && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleUpdate(); }}
                className="rounded-lg bg-white px-4 py-2 text-[11px] font-bold text-black hover:bg-zinc-200 transition-all"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}