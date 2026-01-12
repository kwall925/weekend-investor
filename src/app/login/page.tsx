'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#050505] p-6 text-white">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-zinc-400">Enter your details to access your portfolio</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-8 backdrop-blur-md shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            {errorMsg && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-xs text-red-400">
                {errorMsg}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-zinc-500 ml-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-white/20 focus:bg-white/10"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label htmlFor="password" className="text-xs font-medium text-zinc-500">
                  Password
                </label>
                <Link href="#" className="text-[11px] text-zinc-500 hover:text-white transition">
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-white/20 focus:bg-white/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative mt-2 flex w-full items-center justify-center overflow-hidden rounded-xl bg-white px-8 py-3 text-sm font-semibold text-black transition-all hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500">
          Don't have an account?{' '}
          <Link href="/signup" className="text-white hover:underline font-medium">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}