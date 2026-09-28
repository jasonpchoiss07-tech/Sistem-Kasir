import { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Modal, Button, Input, Alert } from '@/components/ui';
import { assetUrl } from '@/lib/asset';
import { COMMON_UNITS, type Product } from '@/types/product';
import { createProduct, updateProduct, uploadPhoto, type ProductInput } from './products.api';

interface Props {
  open: boolean;
  product: Product | null; // null = create mode
  onClose: () => void;
  onSaved: () => void;
}

/** Add/edit product form. Stock is only set on create; afterwards it changes
 * exclusively through stock adjustments (traceable). */
export function ProductFormModal({ open, product, onClose, onSaved }: Props) {
  const isEdit = Boolean(product);
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [edx, setEdx] = useState('');
  const [unit, setUnit] = useState('Sak');
  const [sellPrice, setSellPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [minStock, setMinStock] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setPhotoFile(null);
    if (product) {
      setName(product.name);
      setEdx(product.edx);
      setUnit(product.unit);
      setSellPrice(String(Number(product.sellPrice)));
      setStock(String(product.stock));
      setMinStock(String(product.minStock));
      setIsActive(product.isActive);
      setPhotoUrl(product.photoUrl);
      setPreview(product.photoUrl);
    } else {
      setName('');
      setEdx('');
      setUnit('Sak');
      setSellPrice('');
      setStock('0');
      setMinStock('0');
      setIsActive(true);
      setPhotoUrl(null);
      setPreview(null);
    }
  }, [open, product]);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    setPreview(file ? URL.createObjectURL(file) : photoUrl);
  }

  async function handleSubmit() {
    setError(null);

    if (!name.trim() || !edx.trim() || !unit.trim()) {
      setError('Nama, EDX, dan satuan wajib diisi.');
      return;
    }
    const priceNum = Number(sellPrice);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setError('Harga jual tidak valid.');
      return;
    }

    setSaving(true);
    try {
      let finalPhotoUrl = photoUrl;
      if (photoFile) {
        finalPhotoUrl = await uploadPhoto(photoFile);
      }

      if (isEdit && product) {
        const body: Partial<ProductInput> = {
          name: name.trim(),
          edx: edx.trim(),
          unit: unit.trim(),
          sellPrice: priceNum,
          minStock: Number(minStock) || 0,
          photoUrl: finalPhotoUrl,
          isActive,
        };
        await updateProduct(product.id, body);
      } else {
        const body: ProductInput = {
          name: name.trim(),
          edx: edx.trim(),
          unit: unit.trim(),
          sellPrice: priceNum,
          stock: Number(stock) || 0,
          minStock: Number(minStock) || 0,
          photoUrl: finalPhotoUrl,
          isActive,
        };
        await createProduct(body);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan produk.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Produk' : 'Tambah Produk'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            Simpan
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}

        {/* Photo */}
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
            {preview ? (
              <img src={assetUrl(preview)} alt="preview" className="h-full w-full object-cover" />
            ) : (
              <Upload className="h-6 w-6 text-slate-400" />
            )}
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickFile}
            />
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              {preview ? 'Ganti Foto' : 'Unggah Foto'}
            </Button>
            <p className="mt-1 text-xs text-slate-400">JPG/PNG/WebP, maks 5MB</p>
          </div>
        </div>

        <Input label="Nama Produk" value={name} onChange={(e) => setName(e.target.value)} placeholder="Semen Tiga Roda" />
        <Input label="EDX / Kode Modal" value={edx} onChange={(e) => setEdx(e.target.value)} placeholder="EDX" />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Satuan</label>
          <input
            list="unit-options"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="h-11 w-full rounded-lg bg-white px-3 text-sm text-slate-900 shadow-sm ring-1 ring-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
            placeholder="Sak / Batang / Kg ..."
          />
          <datalist id="unit-options">
            {COMMON_UNITS.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </div>

        <Input
          label="Harga Jual (Rp)"
          type="number"
          min={0}
          value={sellPrice}
          onChange={(e) => setSellPrice(e.target.value)}
          placeholder="65000"
        />

        <div className="grid grid-cols-2 gap-3">
          {!isEdit && (
            <Input
              label="Stok Awal"
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          )}
          <Input
            label="Stok Minimum"
            type="number"
            min={0}
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
          />
        </div>

        {isEdit && (
          <p className="text-xs text-slate-400">
            Stok tidak diubah di sini. Gunakan menu &ldquo;Stok&rdquo; untuk barang masuk / koreksi
            agar tercatat.
          </p>
        )}

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Produk aktif (tampil untuk kasir)
        </label>
      </div>
    </Modal>
  );
}
