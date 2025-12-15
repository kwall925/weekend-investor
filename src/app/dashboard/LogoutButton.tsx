// src/app/dashboard/LogoutButton.tsx
'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg bg-red-600 px-6 py-3 text-white font-medium hover:bg-red-700 transition"
    >
      Log Out
    </button>
  );
}