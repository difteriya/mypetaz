'use client';

import { useState } from 'react';

const MAX_MB = 5;

/** File input that rejects images over 5 MB and shows an error (PLAN admin). */
export function AdminImageInput({ name = 'image' }: { name?: string }) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <input
        type="file"
        name={name}
        accept="image/*"
        className="text-sm"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && file.size > MAX_MB * 1024 * 1024) {
            setError(`Şəkil ${MAX_MB} MB-dan böyük ola bilməz.`);
            e.target.value = ''; // block oversized upload
          } else {
            setError(null);
          }
        }}
      />
      {error && <p className="mt-1 text-xs text-badge-lostfound">{error}</p>}
    </div>
  );
}
