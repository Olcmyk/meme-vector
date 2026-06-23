'use client';

import { MemeResult } from '@/lib/types';
import MemeCard from './MemeCard';

interface MemeGridProps {
  memes: MemeResult[];
}

export default function MemeGrid({ memes }: MemeGridProps) {
  if (memes.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {memes.map((meme) => (
        <MemeCard key={meme.id} meme={meme} />
      ))}
    </div>
  );
}
