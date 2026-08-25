import type { Metadata } from 'next';
import { getSessionUser } from '../auth';
import AuthForm from './auth-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '邮箱登录 · VOID MESSAGE',
  description: '使用个人邮箱进入 VOID MESSAGE 匿名兴趣社区。',
};

function safeReturnTo(value: string | undefined) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const [user, params] = await Promise.all([getSessionUser(), searchParams]);
  return <AuthForm returnTo={safeReturnTo(params.returnTo)} signedIn={Boolean(user)} />;
}

