import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imagePath = searchParams.get('path');

    if (!imagePath) {
      return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
    }

    // 确保路径在项目目录内，防止路径遍历攻击
    const fullPath = path.resolve(imagePath);
    const projectRoot = path.resolve(process.cwd());

    if (!fullPath.startsWith(projectRoot)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
    }

    // 检查文件是否存在
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // 读取文件
    const fileBuffer = fs.readFileSync(fullPath);

    // 根据文件扩展名设置 Content-Type
    const ext = path.extname(fullPath).toLowerCase();
    const contentTypeMap: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    const contentType = contentTypeMap[ext] || 'image/jpeg';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Image API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
