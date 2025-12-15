// src/app/dashboard/EditShares.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function EditShares({ id, currentShares }: { id: string; currentShares: number }) {
  const [shares, setShares] = useState(String(currentShares));
  const [editing, setEditing] = useState(false);
  const supabase = createClient();

  const handleSave = async () => {
    const num = Number(shares);
    if (isNaN(num) || num < 0) return alert('Invalid number');

    const { error } = await supabase
      .from('holdings')
      .update({ shares: num })
      .eq('id', id);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      window.location.reload();
    }
  };

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="text-blue-600 hover:text-blue-800 text-sm">
        Edit shares
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={shares}
        onChange={(e) => setShares(e.target.value)}
        className="w-20 px-2 py-1 border rounded text-sm"
        min="0"
        step="0.01"
        autoFocus
      />
      <button onClick={handleSave} className="text-green-600 text-sm font-medium">
        Save
      </button>
      <button onClick={() => setEditing(false)} className="text-gray-500 text-sm">
        Cancel
      </button>
    </div>
  );
}