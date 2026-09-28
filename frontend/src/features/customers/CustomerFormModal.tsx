import { useEffect, useState } from 'react';
import { Modal, Button, Input, Alert } from '@/components/ui';
import type { Customer } from '@/types/customer';
import { createCustomer, updateCustomer } from './customers.api';

interface Props {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSaved: () => void;
}

export function CustomerFormModal({ open, customer, onClose, onSaved }: Props) {
  const isEdit = Boolean(customer);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setName(customer?.name ?? '');
    setAddress(customer?.address ?? '');
    setWhatsapp(customer?.whatsapp ?? '');
  }, [open, customer]);

  async function handleSubmit() {
    setError(null);
    if (!name.trim() || !address.trim()) {
      setError('Nama dan alamat wajib diisi.');
      return;
    }
    setSaving(true);
    try {
      const body = { name: name.trim(), address: address.trim(), whatsapp: whatsapp.trim() || null };
      if (isEdit && customer) await updateCustomer(customer.id, body);
      else await createCustomer(body);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan pelanggan.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
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
        <Input label="Nama" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Alamat" value={address} onChange={(e) => setAddress(e.target.value)} />
        <Input
          label="No. WhatsApp (opsional)"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
        />
      </div>
    </Modal>
  );
}
