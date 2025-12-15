// src/app/dashboard/PriceCard.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';
import DeleteButton from './DeleteButton';
import EditShares from './EditShares';
import { createClient } from '@/utils/supabase/client';

type Props = {
  ticker: string;
  shares?: number;
  id: string;
  isHolding: boolean;
  initialQuote: { c: number; d: number; dp: number };
  initialNotes?: string;
};

export default function PriceCard({ 
  ticker, 
  shares, 
  id, 
  isHolding, 
  initialQuote,
  initialNotes = ''
}: Props) {
  const [logoError, setLogoError] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState(initialNotes);

  const supabase = createClient();

  const price = initialQuote.c?.toFixed(2) || '—';
  const change = initialQuote.d || 0;
  const changePct = initialQuote.dp || 0;
  const isUp = change >= 0;
  const value = shares ? (Number(price) * shares).toFixed(2) : null;

  const saveNotes = async () => {
    const table = isHolding ? 'holdings' : 'watchlist';
    const { error } = await supabase
      .from(table)
      .update({ notes: tempNotes })
      .eq('id', id);

    if (!error) {
      setNotes(tempNotes);
      setIsEditingNotes(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between gap-8">
          {/* Left */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-300">
              {!logoError ? (
                <Image
                  src={`https://finnhub.io/api/logo?symbol=${ticker}`}
                  alt={ticker}
                  width={64}
                  height={64}
                  className="object-contain"
                  unoptimized
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-2xl font-bold text-gray-500">{ticker[0]}</span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{ticker}</h3>
          </div>

          {/* Center */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">${price}</div>
            <div className={`text-lg font-medium mt-1 ${isUp ? 'text-green-600' : 'text-red-600'}`}>
              {isUp ? 'Up' : 'Down'} {Math.abs(change).toFixed(2)} ({changePct.toFixed(2)}%)
            </div>
          </div>

          {/* Right */}
          <div className="bg-gray-100 rounded-2xl px-10 py-6 text-center min-w-52">
            {shares !== undefined ? (
              <>
                <div className="text-lg font-medium text-gray-700">{shares} Shares</div>
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  ${Number(value).toLocaleString()}
                </div>
              </>
            ) : (
              <div className="text-xl font-medium text-gray-600">Watchlist</div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-6 pt-5 border-t border-gray-200 flex justify-end items-center gap-4 text-sm">
          {isHolding && shares !== undefined && <EditShares id={id} currentShares={shares} />}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {showNotes ? 'Hide' : 'View'} Notes
          </button>
          <DeleteButton id={id} table={isHolding ? 'holdings' : 'watchlist'} />
        </div>

        {/* Notes Section */}
        {showNotes && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {isEditingNotes ? (
              <div className="space-y-3">
                <textarea
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Add your private notes..."
                />
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={saveNotes}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setTempNotes(notes);
                      setIsEditingNotes(false);
                    }}
                    className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <p className="text-gray-700 whitespace-pre-wrap flex-1">
                  {notes || <span className="text-gray-400 italic">No notes yet</span>}
                </p>
                <button
                  onClick={() => {
                    setTempNotes(notes);
                    setIsEditingNotes(true);
                  }}
                  className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}