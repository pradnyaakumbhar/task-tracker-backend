export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateRegisterInput = (name: string, email: string, password: string): string[] => {
  const errors: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!email || !isValidEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password || !isValidPassword(password)) {
    errors.push('Password must be at least 6 characters long');
  }

  return errors;
};

export const validateLoginInput = (email: string, password: string): string[] => {
  const errors: string[] = [];

  if (!email || !isValidEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  return errors;
};