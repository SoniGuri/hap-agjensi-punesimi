export const sectors = ['Teknologji', 'Financë', 'Marketing', 'Hoteleri', 'Shitje', 'Administratë', 'Tjetër'];
export const modes = ['Në zyrë', 'Hibrid', 'Në distancë', 'Në ambient'];
export const types = ['Kohë e plotë', 'Kohë e pjesshme', 'Me turne', 'Praktikë', 'Kontratë'];
export const statuses = ['draft', 'published', 'closed'];
export function validateJob(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Të dhëna të pavlefshme.');
  const limits = {title: [3, 100], company: [2, 120], city: [2, 80], description: [30, 6000], salary: [0, 100]};
  /** @type {Record<string, string>} */
  const job = {};
  for (const [key, [min, max]] of Object.entries(limits)) {
    if (typeof input[key] !== 'string') throw new Error('Plotëso saktë fushat e njoftimit.');
    const value = input[key].trim();
    if (value.length < min || value.length > max) throw new Error('Kontrollo gjatësinë e fushave të njoftimit. Përshkrimi kërkon të paktën 30 karaktere.');
    job[key] = value;
  }
  for (const [key, allowed] of Object.entries({sector: sectors, mode: modes, type: types, status: statuses})) {
    if (!allowed.includes(input[key])) throw new Error('Zgjedhje e pavlefshme për sektorin, orarin ose statusin.');
    job[key] = input[key];
  }
  return job;
}
export function isSameOrigin(request) { return request.headers.get('origin') === new URL(request.url).origin; }

