import { cookies } from 'next/headers';
import {
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  authenticateAccount,
  checkRateLimit,
  clearRateLimit,
  createSession,
  isSameOrigin,
  isValidEmail,
  normalizeEmail,
} from '../../../auth';

export const dynamic = 'force-dynamic';

function json(data: unknown, init: ResponseInit = {}) {
  return Response.json(data, { ...init, headers: { 'Cache-Control': 'private, no-store', ...init.headers } });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: '请求来源无效' }, { status: 403 });
  const payload = await request.json().catch(() => null) as { email?: unknown; password?: unknown } | null;
  const email = normalizeEmail(payload?.email);
  const password = typeof payload?.password === 'string' ? payload.password : '';
  if (!isValidEmail(email) || !password || password.length > 128) {
    return json({ error: '邮箱或密码不正确' }, { status: 400 });
  }
  if (!(await checkRateLimit(`login:${email}`, 10, 15 * 60))) {
    return json({ error: '登录尝试过于频繁，请十五分钟后再试' }, { status: 429 });
  }

  try {
    const user = await authenticateAccount(email, password);
    if (!user) return json({ error: '邮箱或密码不正确' }, { status: 401 });
    await clearRateLimit(`login:${email}`);
    const token = await createSession(user.userId);
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: new URL(request.url).protocol === 'https:',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return json({ ok: true, color: user.color });
  } catch (error) {
    console.error('Failed to sign in', error);
    return json({ error: '登录失败，请稍后再试' }, { status: 500 });
  }
}

