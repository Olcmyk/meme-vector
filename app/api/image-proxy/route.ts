import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'Missing url parameter' },
        { status: 400 }
      );
    }

    // 验证 URL 是否来自允许的域名
    const allowedDomains = [
      'pub-c6243eb07e154b67970f8c15f44e1e5f.r2.dev',
      // 如果有其他允许的域名，可以在这里添加
    ];

    const urlObj = new URL(url);
    const isAllowed = allowedDomains.some((domain) =>
      urlObj.hostname.endsWith(domain)
    );

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Domain not allowed' },
        { status: 403 }
      );
    }

    // 获取图片
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: response.status }
      );
    }

    const blob = await response.blob();

    // 返回图片，设置正确的 CORS 头
    return new NextResponse(blob, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
