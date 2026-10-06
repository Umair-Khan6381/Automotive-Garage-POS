export const validateInvoiceData = (body: any) => {
  const errors: Record<string, string> = {};
  if (!body.customerId) {
    errors.customerId = 'Customer is required.';
  }
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    errors.items = 'At least one line item (part, labour, or service) is required.';
  }
  if (body.grandTotal !== undefined && body.grandTotal < 0) {
    errors.grandTotal = 'Grand total cannot be negative.';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};
