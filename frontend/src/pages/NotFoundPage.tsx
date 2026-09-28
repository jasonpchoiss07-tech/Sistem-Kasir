import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

/** 404 page for unknown routes inside the app. */
export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-5xl font-bold text-slate-300">404</p>
      <h1 className="mt-3 text-lg font-semibold text-slate-800">Halaman tidak ditemukan</h1>
      <p className="mt-1 text-sm text-slate-500">Halaman yang kamu cari tidak ada.</p>
      <Link to="/" className="mt-5">
        <Button variant="secondary">Kembali ke beranda</Button>
      </Link>
    </div>
  );
}
