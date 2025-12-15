// src/app/dashboard/page.tsx
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
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12 space-y-16">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-lg text-gray-600">{user.email}</p>
          </div>
          <Link
            href="/activity"
            className="text-blue-600 hover:text-blue-800 font-medium text-lg flex items-center gap-2"
          >
            Activity →
          </Link>
        </div>

        {/* Total Value */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-10 text-white text-center shadow-xl">
          <p className="text-xl opacity-90">Total Portfolio Value</p>
          <p className="text-6xl font-bold mt-4">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Holdings */}
        {holdings && holdings.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Your Holdings</h2>
            <div className="space-y-5">
              {await Promise.all(
                holdings.map(async (h: any) => {
                  const quote = await fetch(
                    `https://finnhub.io/api/v1/quote?symbol=${h.ticker}&token=${process.env.NEXT_PUBLIC_FINNHUB_KEY}`
                  ).then(r => r.json());
                  return (
                    <PriceCard
                      key={h.id}
                      ticker={h.ticker}
                      shares={h.shares}
                      id={h.id}
                      isHolding={true}
                      initialQuote={quote}
                      initialNotes={h.notes}
                    />
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* Watchlist */}
        {watchlist && watchlist.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Your Watchlist</h2>
            <div className="space-y-5">
              {await Promise.all(
                watchlist.map(async (w: any) => {
                  const quote = await fetch(
                    `https://finnhub.io/api/v1/quote?symbol=${w.ticker}&token=${process.env.NEXT_PUBLIC_FINNHUB_KEY}`
                  ).then(r => r.json());
                  return (
                    <PriceCard
                      key={w.id}
                      ticker={w.ticker}
                      id={w.id}
                      isHolding={false}
                      initialQuote={quote}
                      initialNotes={w.notes}
                    />
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* Empty State */}
        {(!holdings || holdings.length === 0) && (!watchlist || watchlist.length === 0) && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">Add stocks to get started</p>
          </div>
        )}

        {/* Add Stock — now at the bottom */}
        <section className="mt-16">
          <AddStockForm />
        </section>

        <div className="flex justify-center pt-12">
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}