import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, deleteSession, isSameOrigin } from '../../../auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: '请求来源无效' }, { status: 403 });
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (token) await deleteSession(token).catch((error) => console.error('Failed to delete session', error));
  cookieStore.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: new URL(request.url).protocol === 'https:',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'private, no-store' } });
}

