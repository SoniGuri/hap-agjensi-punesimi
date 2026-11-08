import { getAdmin, database, json, dbError } from '../../../../../lib/admin';
import { validateJob, isSameOrigin } from '../../../../../lib/job-validation.mjs';
export const dynamic = 'force-dynamic';
export async function PUT(request: Request, context: {params: Promise<{id: string}>}) {
  const auth = await getAdmin(); if (auth.error) return auth.error;
  if (!isSameOrigin(request)) return json({error: 'Kërkesë e palejuar.'}, 403);
  const {id} = await context.params;
  if (!/^[a-f0-9-]{36}$/.test(id)) return json({error: 'Njoftimi nuk u gjet.'}, 404);
  let job;
  try { const text = await request.text(); if (text.length > 20000) return json({error: 'Njoftimi është tepër i gjatë.'}, 413); job = validateJob(JSON.parse(text)); } catch(error) { return json({error: error instanceof Error ? error.message : 'Të dhëna të pavlefshme.'}, 400); }
  try {
    const result = await database().prepare('UPDATE jobs SET title = ?, company = ?, city = ?, sector = ?, mode = ?, type = ?, description = ?, salary = ?, status = ?, updated_at = ? WHERE id = ?').bind(job.title, job.company, job.city, job.sector, job.mode, job.type, job.description, job.salary, job.status, new Date().toISOString(), id).run();
    if (!result.meta.changes) return json({error: 'Njoftimi nuk u gjet.'}, 404);
    return json({id, status: job.status});
  } catch(error) { return dbError(error); }
}
