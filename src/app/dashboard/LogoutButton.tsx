'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500 transition-colors hover:text-white"
    >
      Sign Out
    </button>
  );
}