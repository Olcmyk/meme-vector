'use client';

import Image from 'next/image';
import { MemeResult } from '@/lib/types';

interface MemeCardProps {
  meme: MemeResult;
}

export default function MemeCard({ meme }: MemeCardProps) {
  // 直接使用 R2 CDN URL（Pinecone 返回的已经是完整的 CDN 地址）
  const imageUrl = meme.imageUrl;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative aspect-square bg-gray-100">
        <Image
          src={imageUrl}
          alt={meme.description.substring(0, 100)}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          unoptimized
        />
      </div>
    </div>
  );
}
