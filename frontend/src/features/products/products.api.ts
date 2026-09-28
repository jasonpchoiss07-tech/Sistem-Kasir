import { apiRequest, API_BASE_URL, ApiError } from '@/lib/api';
import { tokenStore } from '@/lib/token';
import type { Product, StockAdjustment, StockAdjustmentType } from '@/types/product';

export interface ListParams {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  lowStock?: boolean;
}

export function listProducts(params: ListParams = {}) {
  const q = new URLSearchParams();
  if (params.search) q.set('search', params.search);
  if (params.status) q.set('status', params.status);
  if (params.lowStock) q.set('lowStock', 'true');
  const qs = q.toString();
  return apiRequest<{ products: Product[] }>(`/products${qs ? `?${qs}` : ''}`).then((d) => d.products);
}

export interface ProductInput {
  name: string;
  edx: string;
  unit: string;
  sellPrice: number;
  minStock: number;
  photoUrl?: string | null;
  stock?: number;
  isActive?: boolean;
}

export function createProduct(body: ProductInput) {
  return apiRequest<{ product: Product }>('/products', {
    method: 'POST',
    body: JSON.stringify(body),
  }).then((d) => d.product);
}

export function updateProduct(id: string, body: Partial<ProductInput>) {
  return apiRequest<{ product: Product }>(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }).then((d) => d.product);
}

export function adjustStock(
  id: string,
  body: { type: StockAdjustmentType; quantityChange: number; note?: string | null },
) {
  return apiRequest<{ product: Product; adjustment: StockAdjustment }>(
    `/products/${id}/stock-adjustments`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}

export function listAdjustments(id: string) {
  return apiRequest<{ adjustments: StockAdjustment[] }>(`/products/${id}/stock-adjustments`).then(
    (d) => d.adjustments,
  );
}

/** Uploads a photo via multipart/form-data and returns the stored URL. */
export async function uploadPhoto(file: File): Promise<string> {
  const form = new FormData();
  form.append('photo', file);
  const token = tokenStore.get();

  const res = await fetch(`${API_BASE_URL}/products/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, body?.error?.message ?? 'Upload gagal');
  }
  return (body as { data: { url: string } }).data.url;
}
