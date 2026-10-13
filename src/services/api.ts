/**
 * API Service Client for Garage POS & Workshop Management
 * Interacts with Vercel serverless /api routes with JWT Bearer authentication.
 * File: src/services/api.ts
 */

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  try {
    const raw = localStorage.getItem('umair_autocare_v2_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.token) {
        return { Authorization: `Bearer ${parsed.token}` };
      }
    }
  } catch (e) {
    // ignore
  }
  return {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data?.data !== undefined ? data.data : data;
}

export const api = {
  // Health
  checkHealth: () => request<{ status: string; app: string; currency: string; timezone: string }>('/health'),

  // Auth
  login: (credentials: { identifier: string; password: string }) =>
    request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: credentials.identifier,
        password: credentials.password
      })
    }),

  getCurrentUser: () => request<any>('/auth/me'),

  // Settings
  getSettings: () => request<any>('/settings'),
  updateSettings: (settings: any) =>
    request<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),

  // Customers
  getCustomers: () => request<any[]>('/customers'),
  createCustomer: (customer: any) =>
    request<any>('/customers', {
      method: 'POST',
      body: JSON.stringify(customer)
    }),
  updateCustomer: (id: string, customer: any) =>
    request<any>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer)
    }),
  deleteCustomer: (id: string) =>
    request<any>(`/customers/${id}`, {
      method: 'DELETE'
    }),

  // Vehicles
  getVehicles: () => request<any[]>('/vehicles'),
  createVehicle: (vehicle: any) =>
    request<any>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle)
    }),
  updateVehicle: (id: string, vehicle: any) =>
    request<any>(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicle)
    }),

  // Products & Inventory
  getProducts: () => request<any[]>('/products'),
  createProduct: (product: any) =>
    request<any>('/products', {
      method: 'POST',
      body: JSON.stringify(product)
    }),
  updateProduct: (id: string, product: any) =>
    request<any>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product)
    }),

  // Repair Jobs
  getJobs: () => request<any[]>('/jobs'),
  createJob: (job: any) =>
    request<any>('/jobs', {
      method: 'POST',
      body: JSON.stringify(job)
    }),
  updateJob: (id: string, job: any) =>
    request<any>(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(job)
    }),

  // Invoices & POS
  getInvoices: () => request<any[]>('/invoices'),
  createInvoice: (invoice: any) =>
    request<any>('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice)
    }),
  updateInvoice: (id: string, invoice: any) =>
    request<any>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoice)
    }),

  // Payments
  getPayments: () => request<any[]>('/payments'),
  createPayment: (payment: any) =>
    request<any>('/payments', {
      method: 'POST',
      body: JSON.stringify(payment)
    }),

  // Expenses
  getExpenses: () => request<any[]>('/expenses'),
  createExpense: (expense: any) =>
    request<any>('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense)
    }),

  // Document & Receipt Storage (Vercel Blob / Secure Payload)
  uploadDocument: (payload: {
    filename: string;
    mimeType: string;
    dataUrl: string;
    folder?: string;
    notes?: string;
    entityType?: string;
    entityId?: string;
  }) =>
    request<{
      url: string;
      pathname?: string;
      contentType: string;
      size: number;
      storageProvider: string;
      filename: string;
    }>('/uploads', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};
