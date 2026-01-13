'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function DeleteAccountButton() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleDelete = async () => {
    // Stage 1: Initial Intent
    const confirmed = confirm("Are you absolutely sure? This will wipe your entire investment history and portfolio data.");
    if (!confirmed) return;

    // Stage 2: Final Confirmation (Friction to prevent accidents)
    const finalCheck = prompt("To confirm deletion, type 'DELETE' in all caps:");
    if (finalCheck !== 'DELETE') return;

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 1. Wipe all relational database entries
        // Note: We run these in parallel for speed
        await Promise.all([
          supabase.from('holdings').delete().eq('user_id', user.id),
          supabase.from('watchlist').delete().eq('user_id', user.id)
        ]);

        // 2. Terminate the Supabase Session
        await supabase.auth.signOut();

        // 3. Purge local browser state 
        // This ensures no 'ghost' data remains in the browser's memory
        window.localStorage.clear();
        window.sessionStorage.clear();

        // 4. Final Success Feedback
        alert("Account data purged. You have been securely logged out.");

        // 5. Hard Redirect
        // Using window.location.href instead of router.push for a clean slate
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Critical Error during deletion:', error);
      alert('An error occurred while wiping data. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-4">
      <button
        onClick={handleDelete}
        disabled={loading}
        className="w-full md:w-auto px-10 py-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-red-600 hover:text-white hover:border-red-600 disabled:opacity-50 active:scale-[0.98] shadow-[0_0_20px_rgba(239,68,68,0.1)]"
      >
        {loading ? 'Executing Purge...' : 'Terminate Account'}
      </button>
      
      {loading && (
        <p className="text-[10px] font-bold text-red-500/60 animate-pulse uppercase tracking-widest">
          Clearing database records...
        </p>
      )}
    </div>
  );
}