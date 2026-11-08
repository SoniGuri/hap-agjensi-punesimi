export function validateRegistration(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Të dhëna të pavlefshme.');
  const {name, email, password, confirmPassword, secretCode} = input;
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) throw new Error('Shkruaj emrin tënd, nga 2 deri në 100 karaktere.');
  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new Error('Shkruaj një email të vlefshëm.');
  if (typeof password !== 'string' || password.length < 8 || password.length > 256) throw new Error('Fjalëkalimi duhet të ketë të paktën 8 karaktere.');
  if (confirmPassword !== password) throw new Error('Fjalëkalimet nuk përputhen.');
  if (typeof secretCode !== 'string' || !secretCode.length || secretCode.length > 256) throw new Error('Shkruaj kodin sekret të regjistrimit.');
  return {name: name.trim(), email: email.trim().toLowerCase(), password, secretCode};
}
