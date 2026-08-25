import { env } from 'cloudflare:workers';
import { getSessionUser } from '../../auth';
import { ensureChatSchema, ensureUser, isCommunity } from '../../../db/chat';

export const dynamic = 'force-dynamic';

type MessageRow = { id: number; body: string; color: string; createdAt: number; userId: string };

const PRIVATE_JSON_HEADERS = {
  'Cache-Control': 'private, no-store, no-cache, max-age=0',
  Vary: 'Cookie',
};

function json(data: unknown, init: ResponseInit = {}) {
  return Response.json(data, { ...init, headers: { ...PRIVATE_JSON_HEADERS, ...init.headers } });
}

function publicMessage(row: MessageRow, currentUserId?: string) {
  return { id: row.id, body: row.body, color: row.color, createdAt: row.createdAt, mine: Boolean(currentUserId && row.userId === currentUserId) };
}

export async function GET(request: Request) {
  const community = new URL(request.url).searchParams.get('community');
  if (!isCommunity(community)) return json({ error: '无效的社区' }, { status: 400 });
  const afterValue = new URL(request.url).searchParams.get('after');
  const after = afterValue && /^\d+$/.test(afterValue) ? Number(afterValue) : null;
  if (after !== null && !Number.isSafeInteger(after)) return json({ error: '无效的消息游标' }, { status: 400 });

  try {
    await ensureChatSchema();
    const user = await getSessionUser();
    const result = after === null
      ? await env.DB.prepare(`SELECT m.id, m.body, m.created_at AS createdAt,
          m.user_id AS userId, u.color AS color
        FROM messages m JOIN users u ON u.user_id = m.user_id
        WHERE m.community = ?
        ORDER BY m.created_at DESC, m.id DESC LIMIT 100`)
        .bind(community)
        .all<MessageRow>()
      : await env.DB.prepare(`SELECT m.id, m.body, m.created_at AS createdAt,
          m.user_id AS userId, u.color AS color
        FROM messages m JOIN users u ON u.user_id = m.user_id
        WHERE m.community = ? AND m.id > ?
        ORDER BY m.created_at ASC, m.id ASC LIMIT 100`)
        .bind(community, after)
        .all<MessageRow>();
    const rows = [...(result.results ?? [])];
    const messages = (after === null ? rows.reverse() : rows).map((row) => publicMessage(row, user?.userId));
    return json({ messages });
  } catch (error) {
    console.error('Failed to load messages', error);
    return json({ error: '暂时无法读取留言，请稍后重试' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return json({ error: '请先登录后留言' }, { status: 401 });
  const payload = await request.json().catch(() => null) as { community?: unknown; body?: unknown } | null;
  const community = typeof payload?.community === 'string' ? payload.community : null;
  const body = typeof payload?.body === 'string' ? payload.body.trim() : '';
  if (!isCommunity(community)) return json({ error: '无效的社区' }, { status: 400 });
  if (!body || body.length > 500) return json({ error: '留言需为 1–500 个字符' }, { status: 400 });

  try {
    await ensureUser(user.userId);
    const row = await env.DB.prepare(`INSERT INTO messages (community, user_id, body)
        VALUES (?, ?, ?)
        RETURNING id, body, created_at AS createdAt, user_id AS userId,
          (SELECT color FROM users WHERE user_id = ?) AS color`)
      .bind(community, user.userId, body, user.userId)
      .first<MessageRow>();
    if (!row) return json({ error: '消息发送失败，请重试' }, { status: 500 });
    return json({ message: publicMessage(row, user.userId) }, { status: 201 });
  } catch (error) {
    console.error('Failed to send message', error);
    return json({ error: '消息发送失败，请稍后重试' }, { status: 500 });
  }
}

