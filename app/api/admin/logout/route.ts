import { database, json, dbError } from '../../../../lib/admin';
import { isSameOrigin } from '../../../../lib/job-validation.mjs';
import { digest, sessionCookie, readSessionCookie } from '../../../../lib/password-auth.mjs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({error: 'Kërkesë e palejuar.'}, 403);
  try {
    const token = readSessionCookie(request);
    if (token) await database().prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(await digest(token)).run();
    const response = json({ok: true});
    response.headers.set('Set-Cookie', sessionCookie('', new URL(request.url).protocol === 'https:', true));
    return response;
  } catch(error) { return dbError(error); }
}
