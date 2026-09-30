export const validateCustomerData = (body: any) => {
  const errors: Record<string, string> = {};
  if (!body.fullName || body.fullName.trim().length < 2) {
    errors.fullName = 'Customer full name must be at least 2 characters.';
  }
  if (!body.phone || body.phone.trim().length < 7) {
    errors.phone = 'Valid phone number is required (min 7 digits).';
  }
  if (body.email && body.email.trim().length > 0) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};
