import React, { useEffect, useMemo, useState } from 'react';

function NotesCard({ appUser }) {
  const storageKey = useMemo(
    () => `cv_metavisi_notes_${appUser?.name?.toLowerCase?.() || 'default'}`,
    [appUser],
  );
  const [notes, setNotes] = useState(() => localStorage.getItem(storageKey) || '');

  useEffect(() => {
    localStorage.setItem(storageKey, notes);
  }, [notes, storageKey]);

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden h-full">
      <div className="p-4 border-b border-white/30 bg-white/20">
        <h3 className="font-bold text-gray-800 text-sm">Catatan Saya</h3>
        <p className="text-[11px] text-gray-500 mt-1">Hanya tersimpan di browser ini.</p>
      </div>
      <div className="p-4">
        <textarea
          rows="14"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Tulis catatan kerja, to-do, atau memo singkat di sini..."
          className="w-full px-3 py-3 bg-white/60 border border-white/60 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-400/20 outline-none transition-all resize-y min-h-[260px]"
        />
      </div>
    </div>
  );
}

export { NotesCard };
