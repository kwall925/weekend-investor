import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import AddStockForm from './AddStockForm';
import PriceCard from './PriceCard';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: holdings } = await supabase
    .from('holdings')
    .select('*')
    .eq('user_id', user.id)
    .order('ticker');

  const { data: watchlist } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', user.id)
    .order('ticker');

  // Logic for total value remains the same
  let totalValue = 0;
  if (holdings) {
    for (const h of holdings) {
      const quote = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${h.ticker}&token=${process.env.NEXT_PUBLIC_FINNHUB_KEY}`
      ).then(r => r.json());
      totalValue += (quote.c || 0) * Number(h.shares);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black">
      {/* Top Navigation */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
              <span className="text-black font-black text-sm">O</span>
            </div>
            <span className="font-semibold tracking-tight">Dashboard</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/activity" className="text-sm text-zinc-400 hover:text-white transition">
              Activity
            </Link>
            <Link 
              href="/account" 
              className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
              Settings
            </Link>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-10">
          <p className="text-sm font-medium text-zinc-500">{user.email}</p>
          <h1 className="text-2xl font-bold tracking-tight">Portfolio Overview</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Content Area (8 columns) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Bento Box: Total Value */}
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/20 p-10 backdrop-blur-sm">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z"/></svg>
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Net Worth Estimate</p>
              <h2 className="mt-4 text-6xl font-black tracking-tighter">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h2>
            </div>

            {/* Holdings Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Current Holdings</h3>
                <span className="text-xs text-zinc-600">{holdings?.length || 0} Assets</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {holdings && holdings.map(async (h: any) => {
                  const quote = await fetch(`https://finnhub.io/api/v1/quote?symbol=${h.ticker}&token=${process.env.NEXT_PUBLIC_FINNHUB_KEY}`).then(r => r.json());
                  return (
                    <div key={h.id} className="group rounded-2xl border border-white/5 bg-zinc-900/40 p-1 hover:border-white/20 transition-all">
                       <PriceCard ticker={h.ticker} shares={h.shares} id={h.id} isHolding={true} initialQuote={quote} initialNotes={h.notes} />
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Sidebar Area (4 columns) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Add Stock Bento */}
            <div className="rounded-[2rem] border border-white/10 bg-zinc-900/40 p-6">
              <h3 className="text-sm font-semibold mb-6">Manage Assets</h3>
              <AddStockForm />
            </div>

            {/* Watchlist Section */}
            <section className="space-y-4">
               <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 px-2">Watchlist</h3>
               <div className="space-y-3">
                {watchlist && watchlist.map(async (w: any) => {
                  const quote = await fetch(`https://finnhub.io/api/v1/quote?symbol=${w.ticker}&token=${process.env.NEXT_PUBLIC_FINNHUB_KEY}`).then(r => r.json());
                  return (
                    <div key={w.id} className="rounded-xl border border-white/5 bg-zinc-900/20 p-1">
                      <PriceCard ticker={w.ticker} id={w.id} isHolding={false} initialQuote={quote} initialNotes={w.notes} />
                    </div>
                  );
                })}
               </div>
            </section>
          </div>

        </div>
      </div>
    </main>
  );
}