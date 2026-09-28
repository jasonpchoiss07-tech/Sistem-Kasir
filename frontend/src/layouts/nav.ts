import {
  LayoutDashboard,
  Receipt,
  Package,
  Boxes,
  Users,
  Truck,
  Undo2,
  BarChart3,
  Settings,
  ShoppingCart,
  History,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '@/types/auth';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

/** Owner navigation. Reserves space for all owner areas (built in later steps). */
export const OWNER_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transaksi', icon: Receipt },
  { to: '/products', label: 'Produk', icon: Package },
  { to: '/stock', label: 'Stok', icon: Boxes },
  { to: '/customers', label: 'Pelanggan', icon: Users },
  { to: '/delivery', label: 'Pengiriman', icon: Truck },
  { to: '/returns', label: 'Retur', icon: Undo2 },
  { to: '/reports', label: 'Laporan', icon: BarChart3 },
  { to: '/settings', label: 'Pengaturan', icon: Settings },
];

/** Cashier navigation. */
export const CASHIER_NAV: NavItem[] = [
  { to: '/pos', label: 'Kasir', icon: ShoppingCart },
  { to: '/products', label: 'Produk', icon: Package },
  { to: '/history', label: 'Riwayat Transaksi', icon: History },
];

export function navFor(role: Role): NavItem[] {
  return role === 'OWNER' ? OWNER_NAV : CASHIER_NAV;
}
