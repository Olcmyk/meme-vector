'use client';

import { useState, useCallback } from 'react';
import SearchBar from '@/components/SearchBar';
import MemeGrid from '@/components/MemeGrid';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import { MemeResult, SearchResponse } from '@/lib/types';

export default function Home() {
  const [results, setResults] = useState<MemeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=20`);
      const data: SearchResponse = await response.json();

      if (data.success) {
        setResults(data.results);
      } else {
        setError(data.error || '搜索失败');
        setResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('网络错误，请稍后重试');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            😄 中文表情包搜索
          </h1>
          <p className="text-xl text-gray-600">
            使用 AI 语义搜索，轻松找到你想要的表情包
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {isLoading && <LoadingState />}

          {!isLoading && hasSearched && results.length === 0 && !error && (
            <EmptyState message="未找到相关表情包，试试其他关键词" />
          )}

          {!isLoading && results.length > 0 && (
            <>
              <div className="mb-4 text-gray-600">
                找到 {results.length} 个相关表情包
              </div>
              <MemeGrid memes={results} />
            </>
          )}

          {!isLoading && !hasSearched && (
            <EmptyState message="输入关键词开始搜索表情包" />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 text-sm">
          <p>数据来源: emo-visual-data | 技术支持: Pinecone + Qwen3-VL-Embedding-8B</p>
        </div>
      </div>
    </div>
  );
}
