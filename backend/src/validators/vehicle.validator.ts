export const validateVehicleData = (body: any) => {
  const errors: Record<string, string> = {};
  if (!body.customerId) {
    errors.customerId = 'Customer ID is required.';
  }
  if (!body.registrationNumber || body.registrationNumber.trim().length < 2) {
    errors.registrationNumber = 'Registration number is required.';
  }
  if (!body.make || body.make.trim().length < 2) {
    errors.make = 'Vehicle make is required.';
  }
  if (!body.model || body.model.trim().length < 1) {
    errors.model = 'Vehicle model is required.';
  }
  if (body.currentMileage !== undefined && body.currentMileage < 0) {
    errors.currentMileage = 'Mileage cannot be negative.';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};
