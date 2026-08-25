import { cookies } from 'next/headers';
import {
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  checkRateLimit,
  createSession,
  isSameOrigin,
  isValidEmail,
  normalizeEmail,
  passwordProblem,
  registerAccount,
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
  if (!isValidEmail(email)) return json({ error: '请输入有效的邮箱地址' }, { status: 400 });
  const problem = passwordProblem(password);
  if (problem) return json({ error: problem }, { status: 400 });
  if (!(await checkRateLimit(`register:${email}`, 3, 60 * 60))) {
    return json({ error: '注册尝试过于频繁，请一小时后再试' }, { status: 429 });
  }

  try {
    const user = await registerAccount(email, password);
    if (!user) return json({ error: '此邮箱已注册，请直接登录' }, { status: 409 });
    const token = await createSession(user.userId);
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: new URL(request.url).protocol === 'https:',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return json({ ok: true, color: user.color }, { status: 201 });
  } catch (error) {
    console.error('Failed to register account', error);
    return json({ error: '注册失败，请稍后再试' }, { status: 500 });
  }
}

