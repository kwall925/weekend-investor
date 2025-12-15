// src/app/activity/page.tsx
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Activity() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch holdings with updated_at
  const { data: holdings } = await supabase
    .from('holdings')
    .select('id, ticker, shares, created_at, updated_at')
    .eq('user_id', user.id);

  const { data: watchlist } = await supabase
    .from('watchlist')
    .select('id, ticker, created_at')
    .eq('user_id', user.id);

  const activities: any[] = [];

  // Holdings — add "added" + "updated" if shares changed
  holdings?.forEach(h => {
    activities.push({
      type: 'holding',
      action: 'added',
      ticker: h.ticker,
      shares: h.shares,
      date: h.created_at,
    });

    // If updated_at exists and differs from created_at → user edited shares
    if (h.updated_at && new Date(h.updated_at).getTime() !== new Date(h.created_at).getTime()) {
      activities.push({
        type: 'holding',
        action: 'updated',
        ticker: h.ticker,
        shares: h.shares,
        date: h.updated_at,
      });
    }
  });

  // Watchlist — only "added"
  watchlist?.forEach(w => {
    activities.push({
      type: 'watchlist',
      action: 'added',
      ticker: w.ticker,
      date: w.created_at,
    });
  });

  // Sort newest first
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Activity</h1>
          <Link href="/dashboard" className="text-blue-600 hover:underline font-medium">
            ← Back to Dashboard
          </Link>
        </div>

        {activities.length === 0 ? (
          <p className="text-center text-gray-500 py-20 text-lg">
            No activity yet.
          </p>
        ) : (
          <div className="space-y-6">
            {activities.map((a, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    a.type === 'holding' ? 'bg-emerald-600' : 'bg-blue-600'
                  }`}>
                    {a.type === 'holding' ? 'H' : 'W'}
                  </div>
                </div>
                <div className="flex-1 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <p className="font-medium text-gray-900">
                    {a.action === 'added' && (
                      <>Added <strong>{a.ticker}</strong> to {a.type === 'holding' ? 'Holdings' : 'Watchlist'}</>
                    )}
                    {a.action === 'updated' && (
                      <>Updated shares for <strong>{a.ticker}</strong> → {a.shares} shares</>
                    )}
                  </p>
                  {a.shares !== undefined && a.action === 'added' && (
                    <p className="text-sm text-gray-600 mt-1">{a.shares} shares</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(a.date).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}