import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DeleteAccountButton from './DeleteAccountButton';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-xs font-black uppercase tracking-[0.2em]">Dashboard</span>
          </Link>
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" title="System Online" />
        </div>
      </nav>

      <div className="mx-auto max-w-2xl px-6 py-20">
        <header className="mb-12">
          <h1 className="text-4xl font-black tracking-tighter">Settings</h1>
          <p className="text-zinc-500 mt-2 text-sm italic font-medium">Identity and data privacy control.</p>
        </header>

        <div className="space-y-6">
          {/* Identity Section */}
          <section className="rounded-[2rem] border border-white/10 bg-zinc-900/20 p-8 backdrop-blur-md">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Primary Identity</span>
                <p className="text-xl font-bold text-white mt-1 select-all tracking-tight">{user.email}</p>
              </div>
              
              <div className="flex gap-12">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Member Since</span>
                  <p className="text-sm font-bold text-zinc-300 mt-1">
                    {new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Status</span>
                  <p className="text-sm font-bold text-emerald-500 mt-1">Verified Account</p>
                </div>
              </div>
            </div>
          </section>

          {/* Danger Zone Section */}
          <section className="rounded-[2rem] border border-red-900/20 bg-red-950/5 p-8">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/60">Danger Zone</h2>
            </div>
            
            <p className="text-xs text-zinc-500 mb-8 leading-relaxed max-w-md">
              Permanently delete your account and all associated data. This includes your holdings, watchlist, and historical activity ledger.
            </p>
            
            <DeleteAccountButton />
          </section>
        </div>
      </div>
    </main>
  );
}