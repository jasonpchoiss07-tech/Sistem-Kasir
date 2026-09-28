import { apiRequest } from '@/lib/api';
import type { Customer, CustomerDetail } from '@/types/customer';

export function listCustomers(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiRequest<{ customers: Customer[] }>(`/customers${qs}`).then((d) => d.customers);
}

export function getCustomer(id: string) {
  return apiRequest<{ customer: CustomerDetail }>(`/customers/${id}`).then((d) => d.customer);
}

export interface CustomerInput {
  name: string;
  address: string;
  whatsapp?: string | null;
}

export function createCustomer(body: CustomerInput) {
  return apiRequest<{ customer: Customer }>('/customers', {
    method: 'POST',
    body: JSON.stringify(body),
  }).then((d) => d.customer);
}

export function updateCustomer(id: string, body: Partial<CustomerInput>) {
  return apiRequest<{ customer: Customer }>(`/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }).then((d) => d.customer);
}
