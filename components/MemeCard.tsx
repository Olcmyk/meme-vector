'use client';

import Image from 'next/image';
import { MemeResult } from '@/lib/types';

interface MemeCardProps {
  meme: MemeResult;
}

export default function MemeCard({ meme }: MemeCardProps) {
  const handleCopy = async () => {
    try {
      // 尝试复制图片
      const response = await fetch(meme.imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      alert('图片已复制到剪贴板！');
    } catch (error) {
      console.error('Copy failed:', error);
      alert('复制失败，请手动保存图片');
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = meme.imageUrl;
    link.download = `meme-${meme.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative aspect-square bg-gray-100">
        <Image
          src={meme.imageUrl}
          alt={meme.description.substring(0, 100)}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
          {meme.description}
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            复制
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            下载
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          相似度: {(meme.score * 100).toFixed(1)}%
        </p>
      </div>
    </div>
  );
}
