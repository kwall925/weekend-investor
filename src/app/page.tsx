// src/app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#050505] p-6 text-white selection:bg-white selection:text-black">
      {/* Background Radial Glow (PhotoAI vibe) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-sm space-y-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="mb-4 h-12 w-12 rounded-2xl bg-gradient-to-br from-white to-zinc-400 p-[1px]">
            <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-black">
              <span className="text-2xl font-black italic tracking-tighter text-white">O</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            OwnShares
          </h1>
          <p className="max-w-[280px] text-sm leading-relaxed text-zinc-400">
            Automated weekly briefings for the <span className="text-zinc-200">disciplined investor.</span>
          </p>
        </div>
        
        {/* Action Card */}
        <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-8 backdrop-blur-md">
          <div className="space-y-4">
            <Link
              href="/signup"
              className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-white px-8 py-4 text-sm font-semibold text-black transition-all hover:bg-zinc-200 active:scale-[0.98]"
            >
              Create Free Account
            </Link>
            
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-xl border border-white/5 bg-white/5 py-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              Sign in to your dashboard
            </Link>
          </div>
        </div>

        {/* Minimalist Footer Note */}
        <p className="text-center text-[11px] uppercase tracking-[0.2em] text-zinc-600">
          Manage your own portfolio
        </p>
      </div>
    </main>
  );
}