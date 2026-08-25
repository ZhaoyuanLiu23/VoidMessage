import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://void-message.priyankapatel2624.chatgpt.site'),
  title: 'VOID MESSAGE · 匿名兴趣社区',
  description: '没有昵称，只用颜色说话。进入健身、大学生、跑步、雅思、舞蹈和编程社区，发送你的匿名留言。',
  openGraph: {
    title: 'VOID MESSAGE · 匿名兴趣社区',
    description: '匿名，也可以认真地说话。',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'VOID MESSAGE 匿名兴趣社区' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VOID MESSAGE · 匿名兴趣社区',
    description: '匿名，也可以认真地说话。',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

