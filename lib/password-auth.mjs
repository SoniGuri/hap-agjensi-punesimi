const encoder = new TextEncoder();
export const SESSION_COOKIE = 'hap_admin_session';
export const SESSION_SECONDS = 12 * 60 * 60;
export const hex = bytes => Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
export async function digest(value) { return hex(await crypto.subtle.digest('SHA-256', encoder.encode(value))); }
export async function verifyPassword(password, encoded) {
  if (typeof password !== 'string' || typeof encoded !== 'string' || password.length > 256) return false;
  const [algorithm, roundsText, salt, expected] = encoded.split(':');
  const iterations = Number(roundsText);
  if (algorithm !== 'pbkdf2-sha256' || iterations !== 100000 || !/^[a-f0-9]{32}$/.test(salt || '') || !/^[a-f0-9]{64}$/.test(expected || '')) return false;
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const saltBytes = Uint8Array.from(salt.match(/../g), byte => parseInt(byte, 16));
  const actual = hex(await crypto.subtle.deriveBits({name: 'PBKDF2', salt: saltBytes, iterations, hash: 'SHA-256'}, key, 256));
  let difference = 0;
  for (let i = 0; i < expected.length; i++) difference |= expected.charCodeAt(i) ^ actual.charCodeAt(i);
  return difference === 0;
}
export function sessionCookie(token, secure = true, clear = false) {
  return `${SESSION_COOKIE}=${clear ? '' : token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${clear ? 0 : SESSION_SECONDS}${secure ? '; Secure' : ''}`;
}
export function readSessionCookie(request) {
  return (request.headers.get('cookie') || '').split(';').map(s=>s.trim()).find(s=>s.startsWith(SESSION_COOKIE+'='))?.slice(SESSION_COOKIE.length+1) || '';
}
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const hash = await crypto.subtle.deriveBits({name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256'}, key, 256);
  return ['pbkdf2-sha256', '100000', hex(salt), hex(hash)].join(':');
}
