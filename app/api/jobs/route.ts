import { database, json, dbError, columns } from '../../../lib/admin';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const {results} = await database().prepare(`SELECT ${columns} FROM jobs WHERE status = ? ORDER BY created_at DESC, id DESC`).bind('published').all();
    return json({jobs: results});
  } catch(error) { return dbError(error); }
}
