import { env } from 'cloudflare:workers';
import { cookies } from 'next/headers';
import { colorForUser, ensureChatSchema } from '../db/chat';

export const AUTH_COOKIE_NAME = 'void_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const PASSWORD_ITERATIONS = 210_000;
const PASSWORD_ALGORITHM = 'PBKDF2';
const HASH_ALGORITHM = 'SHA-256';

export type SessionUser = { userId: string; email: string; color: string };
type AccountRow = { userId: string; email: string; passwordHash: string };

let authSchemaPromise: Promise<void> | null = null;

function bytesToBase64Url(bytes: Uint8Array) {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest(HASH_ALGORITHM, new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(digest));
}

async function derivePassword(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), PASSWORD_ALGORITHM, false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: PASSWORD_ALGORITHM, hash: HASH_ALGORITHM, salt, iterations }, key, 256);
  return new Uint8Array(bits);
}

export function normalizeEmail(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function isValidEmail(email: string) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function passwordProblem(password: unknown) {
  if (typeof password !== 'string' || password.length < 10) return '密码至少需要 10 位';
  if (password.length > 128) return '密码不能超过 128 位';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return '密码需要同时包含字母和数字';
  return null;
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePassword(password, salt, PASSWORD_ITERATIONS);
  return `pbkdf2_sha256$${PASSWORD_ITERATIONS}$${bytesToBase64Url(salt)}$${bytesToBase64Url(hash)}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, rawIterations, rawSalt, rawHash] = stored.split('$');
  const iterations = Number(rawIterations);
  if (scheme !== 'pbkdf2_sha256' || !Number.isSafeInteger(iterations) || iterations < 100_000 || !rawSalt || !rawHash) return false;
  try {
    const actual = await derivePassword(password, base64UrlToBytes(rawSalt), iterations);
    return constantTimeEqual(actual, base64UrlToBytes(rawHash));
  } catch {
    return false;
  }
}

export async function ensureAuthSchema() {
  if (!authSchemaPromise) {
    authSchemaPromise = (async () => {
      await ensureChatSchema();
      await env.DB.batch([
        env.DB.prepare(`CREATE TABLE IF NOT EXISTS accounts (
          user_id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          updated_at INTEGER NOT NULL DEFAULT (unixepoch())
        )`),
        env.DB.prepare(`CREATE TABLE IF NOT EXISTS auth_sessions (
          token_hash TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES accounts(user_id) ON DELETE CASCADE,
          expires_at INTEGER NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (unixepoch())
        )`),
        env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_auth_sessions_user
          ON auth_sessions(user_id)`),
        env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires
          ON auth_sessions(expires_at)`),
        env.DB.prepare(`CREATE TABLE IF NOT EXISTS auth_rate_limits (
          key TEXT PRIMARY KEY,
          count INTEGER NOT NULL,
          window_started INTEGER NOT NULL
        )`),
      ]);
      await env.DB.prepare('PRAGMA optimize').run();
    })();
  }
  try {
    await authSchemaPromise;
  } catch (error) {
    authSchemaPromise = null;
    throw error;
  }
}

export async function checkRateLimit(key: string, maximum: number, windowSeconds: number) {
  await ensureAuthSchema();
  const row = await env.DB.prepare(`INSERT INTO auth_rate_limits (key, count, window_started)
      VALUES (?, 1, unixepoch())
      ON CONFLICT(key) DO UPDATE SET
        count = CASE WHEN unixepoch() - window_started >= ? THEN 1 ELSE count + 1 END,
        window_started = CASE WHEN unixepoch() - window_started >= ? THEN unixepoch() ELSE window_started END
      RETURNING count`)
    .bind(key, windowSeconds, windowSeconds)
    .first<{ count: number }>();
  return (row?.count ?? maximum + 1) <= maximum;
}

export async function clearRateLimit(key: string) {
  await env.DB.prepare('DELETE FROM auth_rate_limits WHERE key = ?').bind(key).run();
}

export async function findAccountByEmail(email: string) {
  await ensureAuthSchema();
  return env.DB.prepare(`SELECT user_id AS userId, email, password_hash AS passwordHash
      FROM accounts WHERE email = ?`)
    .bind(email)
    .first<AccountRow>();
}

export async function registerAccount(email: string, password: string) {
  await ensureAuthSchema();
  const existing = await findAccountByEmail(email);
  if (existing) return null;
  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  const color = colorForUser(userId);
  await env.DB.batch([
    env.DB.prepare('INSERT INTO accounts (user_id, email, password_hash) VALUES (?, ?, ?)').bind(userId, email, passwordHash),
    env.DB.prepare('INSERT INTO users (user_id, color) VALUES (?, ?)').bind(userId, color),
  ]);
  return { userId, email, color } satisfies SessionUser;
}

export async function authenticateAccount(email: string, password: string) {
  const account = await findAccountByEmail(email);
  if (!account) {
    await derivePassword(password, new Uint8Array(16), PASSWORD_ITERATIONS);
    return null;
  }
  if (!(await verifyPassword(password, account.passwordHash))) return null;
  const profile = await env.DB.prepare('SELECT color FROM users WHERE user_id = ?')
    .bind(account.userId)
    .first<{ color: string }>();
  return { userId: account.userId, email: account.email, color: profile?.color ?? colorForUser(account.userId) } satisfies SessionUser;
}

export async function createSession(userId: string) {
  await ensureAuthSchema();
  const token = bytesToBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const tokenHash = await sha256(token);
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  await env.DB.batch([
    env.DB.prepare('DELETE FROM auth_sessions WHERE expires_at <= unixepoch()'),
    env.DB.prepare('INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').bind(tokenHash, userId, expiresAt),
  ]);
  return token;
}

export async function deleteSession(token: string) {
  await ensureAuthSchema();
  await env.DB.prepare('DELETE FROM auth_sessions WHERE token_hash = ?').bind(await sha256(token)).run();
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token || token.length > 100) return null;
  await ensureAuthSchema();
  const tokenHash = await sha256(token);
  return env.DB.prepare(`SELECT a.user_id AS userId, a.email, u.color
      FROM auth_sessions s
      JOIN accounts a ON a.user_id = s.user_id
      JOIN users u ON u.user_id = a.user_id
      WHERE s.token_hash = ? AND s.expires_at > unixepoch()`)
    .bind(tokenHash)
    .first<SessionUser>();
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
}

