export const validateJobData = (body: any) => {
  const errors: Record<string, string> = {};
  if (!body.customerId) {
    errors.customerId = 'Customer is required.';
  }
  if (!body.vehicleId) {
    errors.vehicleId = 'Vehicle is required.';
  }
  if (!body.customerComplaint || body.customerComplaint.trim().length < 3) {
    errors.customerComplaint = 'Customer complaint or issue description is required.';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};
