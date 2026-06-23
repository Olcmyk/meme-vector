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
  // 构建图片的相对路径
  return path.join(baseDir, 'emo', filename);
}
