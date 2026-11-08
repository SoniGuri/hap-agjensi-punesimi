import { env } from 'cloudflare:workers';
import { database, json, dbError, checkAuthRate, issueAdminSession } from '../../../../lib/admin';
import { isSameOrigin } from '../../../../lib/job-validation.mjs';
import { verifyPassword, hashPassword } from '../../../../lib/password-auth.mjs';
import { validateRegistration } from '../../../../lib/registration-validation.mjs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({error: 'Kërkesë e palejuar.'}, 403);
  if (!env.ADMIN_REGISTRATION_CODE_HASH) return json({error: 'Regjistrimi i administratorëve nuk është konfiguruar.'}, 503);
  let input;
  try { const body = await request.text(); if (body.length > 4096) return json({error: 'Të dhëna të pavlefshme.'}, 400); input = validateRegistration(JSON.parse(body)); } catch(error) { return json({error: error instanceof Error ? error.message : 'Të dhëna të pavlefshme.'}, 400); }
  try {
    const rate = await checkAuthRate(request, 'admin-register'); if (rate.error) return rate.error;
    if (!await verifyPassword(input.secretCode, env.ADMIN_REGISTRATION_CODE_HASH)) return json({error: 'Kodi sekret nuk është i saktë.'}, 403);
    if (input.email === env.ADMIN_EMAIL?.trim().toLowerCase()) return json({error: 'Një llogari me këtë email ekziston tashmë. Përdor hyrjen.'}, 409);
    const existing = await database().prepare('SELECT id FROM admin_accounts WHERE email = ?').bind(input.email).first();
    if (existing) return json({error: 'Një llogari me këtë email ekziston tashmë. Përdor hyrjen.'}, 409);
    const id = crypto.randomUUID(), passwordHash = await hashPassword(input.password);
    const result = await database().prepare('INSERT INTO admin_accounts (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(email) DO NOTHING').bind(id, input.name, input.email, passwordHash, new Date().toISOString()).run();
    if (!result.meta.changes) return json({error: 'Një llogari me këtë email ekziston tashmë. Përdor hyrjen.'}, 409);
    return await issueAdminSession(request, {userId: id, name: input.name, email: input.email}, passwordHash, rate.key, 201);
  } catch(error) { return dbError(error); }
}
