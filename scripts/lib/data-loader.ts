import * as fs from 'fs';
import * as path from 'path';

export interface MemeData {
  filename: string;
  content: string;
}

export function loadMemeData(dataPath: string): MemeData[] {
  try {
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const data: MemeData[] = JSON.parse(rawData);
    console.log(`Loaded ${data.length} memes from ${dataPath}`);
    return data;
  } catch (error) {
    console.error('Error loading meme data:', error);
    throw error;
  }
}

export function getImageUrl(filename: string, baseDir: string): string {
  // 返回 R2 CDN URL 而不是本地路径
  const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-8afedeb37e124f06aef2f0e431bc3aaf.r2.dev';
  return `${R2_PUBLIC_URL}/${filename}`;
}
