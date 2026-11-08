import { env } from 'cloudflare:workers';
import { cookies } from 'next/headers';
import { digest, SESSION_COOKIE, hex, sessionCookie, readSessionCookie, SESSION_SECONDS } from './password-auth.mjs';
export function json(data: unknown, status = 200) { return Response.json(data, {status, headers: {'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'}}); }
export function database() { if (!env.DB) throw new Error('Databaza nuk është konfiguruar.'); return env.DB; }
export function dbError(error: unknown) { console.error('Admin operation failed', error instanceof Error ? error.message : 'unknown'); return json({error: 'Veprimi nuk u krye. Provo përsëri pas pak.'}, 503); }
export const columns = `id, title, company, city, sector, mode, type, description, salary, status, created_at AS createdAt, updated_at AS updatedAt`;
export type AdminIdentity = {userId: string; email: string; name: string};
export async function getAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const denied = () => ({user: null, error: json({error: 'Hyr me emailin dhe fjalëkalimin e administratorit.', code: 'signin_required'}, 401)});
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return denied();
  try {
    const session = await database().prepare('SELECT admin_id, credential_version FROM admin_sessions WHERE token_hash = ? AND expires_at > ?').bind(await digest(token), Date.now()).first<{admin_id: string | null; credential_version: string}>();
    if (!session) return denied();
    if (session.admin_id) {
      const account = await database().prepare('SELECT id, name, email, password_hash FROM admin_accounts WHERE id = ?').bind(session.admin_id).first<{id: string; name: string; email: string; password_hash: string}>();
      if (!account || session.credential_version !== await digest(account.password_hash)) return denied();
      return {user: {userId: account.id, email: account.email, name: account.name}, error: null};
    }
    if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD_HASH || session.credential_version !== await digest(env.ADMIN_PASSWORD_HASH)) return denied();
    return {user: {userId: 'admin', email: env.ADMIN_EMAIL, name: 'Administrator'}, error: null};
  } catch(error) { return {user: null, error: dbError(error)}; }
}
export async function checkAuthRate(request: Request, scope: string) {
  const now = Date.now(), windowMs = 15 * 60 * 1000;
  const key = await digest(scope + ':' + (request.headers.get('cf-connecting-ip') || 'unknown'));
  const attempt = await database().prepare('INSERT INTO login_attempts (key, count, window_start) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = CASE WHEN window_start < ? THEN 1 ELSE count + 1 END, window_start = CASE WHEN window_start < ? THEN excluded.window_start ELSE window_start END RETURNING count, window_start').bind(key, now, now - windowMs, now - windowMs).first<{count: number; window_start: number}>();
  if (!attempt || attempt.count > 5) {
    const response = json({error: 'Shumë tentativa. Provo përsëri pas 15 minutash.'}, 429);
    response.headers.set('Retry-After', String(Math.max(1, Math.ceil(((attempt?.window_start || now) + windowMs - now) / 1000))));
    return {key, error: response};
  }
  return {key, error: null};
}
export async function issueAdminSession(request: Request, admin: AdminIdentity, passwordHash: string, rateKey: string, status = 200) {
  const now = Date.now(), token = hex(crypto.getRandomValues(new Uint8Array(32))), db = database();
  await db.batch([
    db.prepare('DELETE FROM admin_sessions WHERE expires_at <= ? OR token_hash = ?').bind(now, await digest(readSessionCookie(request))),
    db.prepare('INSERT INTO admin_sessions (token_hash, admin_id, credential_version, expires_at) VALUES (?, ?, ?, ?)').bind(await digest(token), admin.userId === 'admin' ? null : admin.userId, await digest(passwordHash), now + SESSION_SECONDS * 1000),
    db.prepare('DELETE FROM login_attempts WHERE key = ? OR window_start < ?').bind(rateKey, now - 15 * 60 * 1000),
  ]);
  const response = json({user: {name: admin.name, login: admin.email}}, status);
  response.headers.set('Set-Cookie', sessionCookie(token, new URL(request.url).protocol === 'https:'));
  return response;
}
