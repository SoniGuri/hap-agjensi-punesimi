import { sqliteTable, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const jobs = sqliteTable('jobs', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  company: text('company').notNull(),
  city: text('city').notNull(),
  sector: text('sector').notNull(),
  mode: text('mode').notNull(),
  type: text('type').notNull(),
  description: text('description').notNull(),
  salary: text('salary').notNull().default(''),
  status: text('status', {enum: ['draft', 'published', 'closed']}).notNull().default('draft'),
  authorId: text('author_id').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, table => [index('jobs_status_created_idx').on(table.status, table.createdAt)]);
import { integer } from 'drizzle-orm/sqlite-core';
export const adminSessions = sqliteTable('admin_sessions', {
  tokenHash: text('token_hash').primaryKey(),
  adminId: text('admin_id'),
  credentialVersion: text('credential_version').notNull(),
  expiresAt: integer('expires_at').notNull(),
}, table => [index('admin_sessions_expiry_idx').on(table.expiresAt)]);
export const loginAttempts = sqliteTable('login_attempts', {
  key: text('key').primaryKey(),
  count: integer('count').notNull(),
  windowStart: integer('window_start').notNull(),
});
export const adminAccounts = sqliteTable('admin_accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
}, table => [uniqueIndex('admin_accounts_email_unique').on(table.email)]);
