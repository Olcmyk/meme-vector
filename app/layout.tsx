import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '中文表情包搜索',
  description: '使用 AI 语义搜索，轻松找到你想要的表情包',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
