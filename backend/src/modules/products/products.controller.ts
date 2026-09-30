import type { Request, Response } from 'express';
import { validate } from '../../utils/validate';
import { ApiError } from '../../utils/ApiError';
import { emitRealtime } from '../../realtime/socket';
import { recordAudit } from '../../services/audit';
import { storeProductImage } from '../../services/storage';
import {
  createProductSchema,
  listProductsQuerySchema,
  stockAdjustmentSchema,
  updateProductSchema,
} from './products.validation';
import * as productsService from './products.service';

/** GET /api/products (OWNER + KASIR). Cashiers only ever see active products. */
export async function list(req: Request, res: Response): Promise<void> {
  const query = validate(listProductsQuerySchema, req.query);
  const isCashier = req.user?.role === 'KASIR';
  const products = await productsService.listProducts({
    search: query.search,
    status: query.status,
    lowStock: query.lowStock,
    activeOnly: isCashier,
  });
  res.json({ success: true, data: { products } });
}

/** GET /api/products/:id (OWNER + KASIR) */
export async function getOne(req: Request, res: Response): Promise<void> {
  const product = await productsService.getProduct(req.params.id);
  if (req.user?.role === 'KASIR' && !product.isActive) {
    throw ApiError.notFound('Produk tidak ditemukan');
  }
  res.json({ success: true, data: { product } });
}

/** POST /api/products (OWNER) */
export async function create(req: Request, res: Response): Promise<void> {
  const input = validate(createProductSchema, req.body);
  const product = await productsService.createProduct(input);
  emitRealtime('product:changed', { id: product.id });
  await recordAudit({
    userId: req.user?.id,
    action: 'PRODUCT_CREATE',
    entity: 'Product',
    entityId: product.id,
    metadata: { name: product.name, sellPrice: product.sellPrice.toString(), stock: product.stock },
  });
  res.status(201).json({ success: true, data: { product } });
}

/** PATCH /api/products/:id (OWNER) */
export async function update(req: Request, res: Response): Promise<void> {
  const input = validate(updateProductSchema, req.body);
  const product = await productsService.updateProduct(req.params.id, input);
  emitRealtime('product:changed', { id: product.id });
  await recordAudit({
    userId: req.user?.id,
    action: 'PRODUCT_UPDATE',
    entity: 'Product',
    entityId: product.id,
    // `input` captures exactly which fields changed (incl. price changes).
    metadata: input,
  });
  res.json({ success: true, data: { product } });
}

/** POST /api/products/:id/stock-adjustments (OWNER) */
export async function adjustStock(req: Request, res: Response): Promise<void> {
  const input = validate(stockAdjustmentSchema, req.body);
  const userId = req.user!.id;
  const result = await productsService.adjustStock(req.params.id, input, userId);
  emitRealtime('stock:updated', { productId: req.params.id });
  await recordAudit({
    userId,
    action: 'STOCK_ADJUSTMENT',
    entity: 'Product',
    entityId: req.params.id,
    metadata: {
      type: input.type,
      quantityChange: input.quantityChange,
      resultingStock: result.product.stock,
      note: input.note ?? null,
    },
  });
  res.status(201).json({ success: true, data: result });
}

/** GET /api/products/:id/stock-adjustments (OWNER) */
export async function listAdjustments(req: Request, res: Response): Promise<void> {
  const adjustments = await productsService.listAdjustments(req.params.id);
  res.json({ success: true, data: { adjustments } });
}

/** POST /api/products/upload (OWNER). Uploads to storage, returns the file URL. */
export async function upload(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    throw ApiError.badRequest('Tidak ada file yang diunggah (field: photo)');
  }
  const url = await storeProductImage({
    buffer: req.file.buffer,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
  });
  res.status(201).json({ success: true, data: { url } });
}
