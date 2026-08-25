import { env } from 'cloudflare:workers';
import { getSessionUser } from '../../auth';
import { ensureUser, isIdentityColor } from '../../../db/chat';

export const dynamic = 'force-dynamic';

const PRIVATE_JSON_HEADERS = {
  'Cache-Control': 'private, no-store, no-cache, max-age=0',
  Vary: 'Cookie',
};

function json(data: unknown, init: ResponseInit = {}) {
  return Response.json(data, { ...init, headers: { ...PRIVATE_JSON_HEADERS, ...init.headers } });
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return json({ signedIn: false });
  const profile = await ensureUser(user.userId);
  return json({ signedIn: true, color: profile?.color ?? '#7c4dff' });
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) return json({ error: '请先登录' }, { status: 401 });
  const payload = await request.json().catch(() => null) as { color?: unknown } | null;
  if (!isIdentityColor(payload?.color)) return json({ error: '无效的身份颜色' }, { status: 400 });
  try {
    await ensureUser(user.userId);
    await env.DB.prepare('UPDATE users SET color = ?, updated_at = unixepoch() WHERE user_id = ?')
      .bind(payload.color, user.userId)
      .run();
    return json({ color: payload.color });
  } catch (error) {
    console.error('Failed to update identity color', error);
    return json({ error: '颜色保存失败，请稍后重试' }, { status: 500 });
  }
}

