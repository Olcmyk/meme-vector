import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/embedding';
import { queryVectors } from '@/lib/pinecone';
import { SearchResponse, MemeResult } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 20;

    // 验证输入
    if (!query || query.trim().length === 0) {
      const response: SearchResponse = {
        success: false,
        results: [],
        total: 0,
        error: '请输入搜索内容',
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (query.length > 100) {
      const response: SearchResponse = {
        success: false,
        results: [],
        total: 0,
        error: '搜索内容过长，请简化查询',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // 生成查询向量
    console.log(`Generating embedding for query: "${query}"`);
    const queryEmbedding = await generateEmbedding(query);

    // 在 Pinecone 中搜索
    console.log(`Searching Pinecone with limit: ${limit}`);
    const results = await queryVectors(queryEmbedding, limit);

    // 格式化结果
    const memeResults: MemeResult[] = results.matches?.map((match: any) => ({
      id: match.id,
      imageUrl: match.metadata?.imageUrl || '',
      description: match.metadata?.description || '',
      score: match.score || 0,
    })) || [];

    const response: SearchResponse = {
      success: true,
      results: memeResults,
      total: memeResults.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Search API error:', error);

    const response: SearchResponse = {
      success: false,
      results: [],
      total: 0,
      error: '搜索服务暂时不可用，请稍后重试',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
