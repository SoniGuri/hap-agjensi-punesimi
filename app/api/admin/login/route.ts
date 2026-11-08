import { env } from 'cloudflare:workers';
import { database, json, dbError, checkAuthRate, issueAdminSession } from '../../../../lib/admin';
import { isSameOrigin } from '../../../../lib/job-validation.mjs';
import { verifyPassword } from '../../../../lib/password-auth.mjs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({error: 'Kërkesë e palejuar.'}, 403);
  let input;
  try { const body = await request.text(); if (body.length > 4096) return json({error: 'Të dhëna të pavlefshme.'}, 400); input = JSON.parse(body); } catch { return json({error: 'Të dhëna të pavlefshme.'}, 400); }
  if (!input || typeof input.email !== 'string' || typeof input.password !== 'string' || input.email.length > 254 || input.password.length > 256) return json({error: 'Plotëso emailin dhe fjalëkalimin.'}, 400);
  try {
    const rate = await checkAuthRate(request, 'admin-login'); if (rate.error) return rate.error;
    const email = input.email.trim().toLowerCase();
    const bootstrap = Boolean(env.ADMIN_EMAIL && env.ADMIN_PASSWORD_HASH && email === env.ADMIN_EMAIL.trim().toLowerCase());
    const account = bootstrap ? null : await database().prepare('SELECT id, name, email, password_hash FROM admin_accounts WHERE email = ?').bind(email).first<{id: string; name: string; email: string; password_hash: string}>();
    const hash = bootstrap ? env.ADMIN_PASSWORD_HASH! : account?.password_hash || 'pbkdf2-sha256:100000:00000000000000000000000000000000:0000000000000000000000000000000000000000000000000000000000000000';
    if (!await verifyPassword(input.password, hash) || (!bootstrap && !account)) return json({error: 'Emaili ose fjalëkalimi nuk është i saktë.'}, 401);
    return await issueAdminSession(request, bootstrap ? {userId: 'admin', name: 'Administrator', email: env.ADMIN_EMAIL!} : {userId: account!.id, name: account!.name, email: account!.email}, hash, rate.key);
  } catch(error) { return dbError(error); }
}
