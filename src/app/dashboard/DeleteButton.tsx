// src/app/dashboard/DeleteButton.tsx
'use client';

import { createClient } from '@/utils/supabase/client';

export default function DeleteButton({ id, table }: { id: string; table: 'holdings' | 'watchlist' }) {
  const supabase = createClient();

  const handleDelete = async () => {
    if (!confirm(`Delete this ${table === 'holdings' ? 'holding' : 'watchlist item'}?`)) return;

    const { error } = await supabase.from(table).delete().eq('id', id);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      window.location.reload();
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:text-red-800 text-sm font-medium"
    >
      Remove
    </button>
  );
}