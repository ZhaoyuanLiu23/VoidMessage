import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  userId: text('user_id').primaryKey(),
  color: text('color').notNull(),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
});

export const accounts = sqliteTable('accounts', {
  userId: text('user_id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
});

export const authSessions = sqliteTable(
  'auth_sessions',
  {
    tokenHash: text('token_hash').primaryKey(),
    userId: text('user_id').notNull().references(() => accounts.userId, { onDelete: 'cascade' }),
    expiresAt: integer('expires_at').notNull(),
    createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    index('idx_auth_sessions_user').on(table.userId),
    index('idx_auth_sessions_expires').on(table.expiresAt),
  ],
);

export const authRateLimits = sqliteTable('auth_rate_limits', {
  key: text('key').primaryKey(),
  count: integer('count').notNull(),
  windowStarted: integer('window_started').notNull(),
});

export const messages = sqliteTable(
  'messages',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    community: text('community').notNull(),
    userId: text('user_id').notNull().references(() => users.userId),
    body: text('body').notNull(),
    createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    index('idx_messages_community_created').on(table.community, table.createdAt, table.id),
    check('messages_body_length', sql`length(${table.body}) BETWEEN 1 AND 500`),
  ],
);

