import { env } from 'cloudflare:workers';

export const COMMUNITY_IDS = [
  'running', 'badminton', 'yoga', 'fitness', 'weight-loss', 'basketball',
  'astrology', 'tarot', 'mbti', 'celebrity', 'travel', 'pets',
  'robotics', 'chips', 'ai', 'astrophysics', 'quantum', 'theory',
  'music', 'painting', 'dance', 'photography', 'film', 'design',
  'math', 'ielts', 'cet', 'coding', 'physics', 'chemistry',
  'genshin', 'honor-of-kings', 'delta-force', 'minecraft', 'league', 'indie-games',
] as const;
export const IDENTITY_COLORS = [
  '#ff385c', '#ff8a00', '#ffd60a', '#24d66c', '#00c2ff', '#3568ff',
  '#7c4dff', '#c83cff', '#ff3d9a', '#00d4b4', '#e84c3d', '#a3e635',
] as const;

let schemaPromise: Promise<void> | null = null;

export function isCommunity(value: string | null): value is (typeof COMMUNITY_IDS)[number] {
  return value !== null && COMMUNITY_IDS.includes(value as (typeof COMMUNITY_IDS)[number]);
}

export function isIdentityColor(value: unknown): value is (typeof IDENTITY_COLORS)[number] {
  return typeof value === 'string' && IDENTITY_COLORS.includes(value as (typeof IDENTITY_COLORS)[number]);
}

export function colorForUser(userId: string): string {
  let hash = 2166136261;
  for (let index = 0; index < userId.length; index += 1) {
    hash ^= userId.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return IDENTITY_COLORS[Math.abs(hash) % IDENTITY_COLORS.length];
}

export async function ensureChatSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await env.DB.batch([
        env.DB.prepare(`CREATE TABLE IF NOT EXISTS users (
          user_id TEXT PRIMARY KEY,
          color TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          updated_at INTEGER NOT NULL DEFAULT (unixepoch())
        )`),
        env.DB.prepare(`CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          community TEXT NOT NULL,
          user_id TEXT NOT NULL REFERENCES users(user_id),
          body TEXT NOT NULL CHECK(length(body) BETWEEN 1 AND 500),
          created_at INTEGER NOT NULL DEFAULT (unixepoch())
        )`),
        env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_messages_community_created
          ON messages(community, created_at, id)`),
      ]);
      await env.DB.prepare('PRAGMA optimize').run();
    })();
  }
  try {
    await schemaPromise;
  } catch (error) {
    schemaPromise = null;
    throw error;
  }
}

export async function ensureUser(userId: string) {
  await ensureChatSchema();
  const color = colorForUser(userId);
  await env.DB.prepare('INSERT INTO users (user_id, color) VALUES (?, ?) ON CONFLICT(user_id) DO NOTHING')
    .bind(userId, color)
    .run();
  return env.DB.prepare('SELECT color FROM users WHERE user_id = ?')
    .bind(userId)
    .first<{ color: string }>();
}

