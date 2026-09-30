import path from 'node:path';
import fs from 'node:fs';
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

/** Local uploads dir (development fallback when Supabase is not configured). */
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

let supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!supabase) {
    supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return supabase;
}

function makeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase().slice(0, 10) || '.jpg';
  return `product_${Date.now()}_${randomBytes(6).toString('hex')}${ext}`;
}

/**
 * Stores a product image and returns a URL to reference it.
 * - Production/serverless: uploads to Supabase Storage → returns absolute public URL.
 * - Development (no Supabase env): writes to local uploads/ → returns "/uploads/<file>".
 */
export async function storeProductImage(file: {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}): Promise<string> {
  const filename = makeFilename(file.originalname);

  if (env.supabase.enabled) {
    const client = getSupabase();
    const { error } = await client.storage
      .from(env.supabase.bucket)
      .upload(filename, file.buffer, { contentType: file.mimetype, upsert: false });
    if (error) {
      throw new Error(`Gagal mengunggah ke storage: ${error.message}`);
    }
    const { data } = client.storage.from(env.supabase.bucket).getPublicUrl(filename);
    return data.publicUrl;
  }

  // Local fallback (development).
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), file.buffer);
  return `/uploads/${filename}`;
}
