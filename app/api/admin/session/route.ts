import { getAdmin, json } from '../../../../lib/admin';
export const dynamic = 'force-dynamic';
export async function GET() {
  const auth = await getAdmin(); if (auth.error) return auth.error;
  return json({user: {name: auth.user!.name, login: auth.user!.email}});
}
