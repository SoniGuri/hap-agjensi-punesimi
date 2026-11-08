import { getAdmin, database, json, dbError, columns } from '../../../../lib/admin';
import { validateJob, isSameOrigin } from '../../../../lib/job-validation.mjs';
export const dynamic = 'force-dynamic';
export async function GET() {
  const auth = await getAdmin(); if (auth.error) return auth.error;
  try { const {results} = await database().prepare(`SELECT ${columns} FROM jobs ORDER BY created_at DESC, id DESC`).all(); return json({jobs: results}); } catch(error) { return dbError(error); }
}
export async function POST(request: Request) {
  const auth = await getAdmin(); if (auth.error) return auth.error;
  if (!isSameOrigin(request)) return json({error: 'Kërkesë e palejuar.'}, 403);
  let job;
  try { const text = await request.text(); if (text.length > 20000) return json({error: 'Njoftimi është tepër i gjatë.'}, 413); job = validateJob(JSON.parse(text)); } catch(error) { return json({error: error instanceof Error ? error.message : 'Të dhëna të pavlefshme.'}, 400); }
  try {
    const id = crypto.randomUUID(); const now = new Date().toISOString();
    await database().prepare('INSERT INTO jobs (id, title, company, city, sector, mode, type, description, salary, status, author_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id, job.title, job.company, job.city, job.sector, job.mode, job.type, job.description, job.salary, job.status, auth.user!.userId, now, now).run();
    return json({id, status: job.status}, 201);
  } catch(error) { return dbError(error); }
}
