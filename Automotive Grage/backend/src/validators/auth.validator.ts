export const validateLoginInput = (body: any) => {
  const errors: Record<string, string> = {};
  if (!body.username || typeof body.username !== 'string' || body.username.trim().length === 0) {
    errors.username = 'Username or email is required.';
  }
  if (!body.password || typeof body.password !== 'string' || body.password.length === 0) {
    errors.password = 'Password is required.';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateCreateUserInput = (body: any) => {
  const errors: Record<string, string> = {};
  if (!body.name || body.name.trim().length < 2) {
    errors.name = 'Full name must be at least 2 characters.';
  }
  if (!body.username || body.username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters.';
  }
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.email = 'Valid email is required.';
  }
  if (!body.password || body.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }
  if (!['owner', 'manager', 'employee'].includes(body.role)) {
    errors.role = 'Role must be owner, manager, or employee.';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};
