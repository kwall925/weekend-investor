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

  holdings?.forEach(h => {
    activities.push({
      type: 'holding',
      action: 'added',
      ticker: h.ticker,
      shares: h.shares,
      date: h.created_at,
    });

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

  watchlist?.forEach(w => {
    activities.push({
      type: 'watchlist',
      action: 'added',
      ticker: w.ticker,
      date: w.created_at,
    });
  });

  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black">
      {/* Top Navigation */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-bold uppercase tracking-widest">Dashboard</span>
          </Link>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Activity Ledger</span>
        </div>
      </nav>

      <div className="mx-auto max-w-2xl px-6 py-16">
        <header className="mb-16">
          <h1 className="text-4xl font-black tracking-tighter">History</h1>
          <p className="text-zinc-500 mt-2 text-sm italic">Chronological tracking via database timestamps.</p>
        </header>

        {activities.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-[2rem]">
            <p className="text-sm text-zinc-600 font-bold uppercase tracking-widest">No history recorded</p>
          </div>
        ) : (
          <div className="relative space-y-10 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-zinc-900">
            {activities.map((a, i) => (
              <div key={i} className="relative flex items-start gap-8 group">
                
                {/* Timeline Indicator */}
                <div className={`absolute left-0 mt-1 h-10 w-10 flex items-center justify-center rounded-xl border bg-zinc-950 z-10 ${
                  a.type === 'holding' ? 'border-white/20' : 'border-blue-500/20'
                }`}>
                  <div className={`h-1.5 w-1.5 rounded-full ${
                    a.type === 'holding' ? 'bg-white shadow-[0_0_8px_white]' : 'bg-blue-500 shadow-[0_0_8px_#3b82f6]'
                  }`} />
                </div>

                <div className="ml-14 flex-1">
                  <div className="rounded-2xl border border-white/5 bg-zinc-900/20 p-6 backdrop-blur-sm hover:bg-zinc-900/40 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-sm font-bold tracking-tight">
                          {a.action === 'added' ? (
                            <>Added <span className="text-white">{a.ticker}</span> to {a.type === 'holding' ? 'Portfolio' : 'Watchlist'}</>
                          ) : (
                            <>Updated <span className="text-white">{a.ticker}</span> position</>
                          )}
                        </p>
                        
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                          {new Date(a.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      <div className="text-[10px] font-black px-2 py-1 rounded bg-white/5 border border-white/10 text-zinc-600 uppercase">
                        {a.type}
                      </div>
                    </div>

                    {/* Display Shares Detail */}
                    {a.shares !== undefined && (
                      <div className="mt-4 flex items-center gap-2">
                        <div className="h-px flex-1 bg-white/5"></div>
                        <span className="text-[11px] font-mono text-zinc-400">
                          {a.action === 'updated' ? 'NEW BALANCE: ' : 'POSITION: '} 
                          <span className="text-zinc-200">{a.shares} SHARES</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}