'use client';

import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/search?q=高兴&limit=3');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: String(error) });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API 测试页面</h1>

        <button
          onClick={testSearch}
          disabled={loading}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? '测试中...' : '测试搜索 API'}
        </button>

        {result && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">返回结果：</h2>
            <pre className="bg-white p-4 rounded-lg overflow-auto max-h-96 text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>

            {result.results && result.results.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">第一张图片预览：</h2>
                <div className="bg-white p-4 rounded-lg">
                  <p className="mb-2 text-sm text-gray-600">
                    <strong>Image URL:</strong> {result.results[0].imageUrl}
                  </p>
                  <img
                    src={result.results[0].imageUrl}
                    alt="Test"
                    className="max-w-md border rounded"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.alt = '图片加载失败';
                      e.currentTarget.className = 'text-red-500';
                    }}
                  />
                  <p className="mt-2 text-sm">
                    <strong>描述:</strong> {result.results[0].description}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
