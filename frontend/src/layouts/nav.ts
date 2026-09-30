import {
  LayoutDashboard,
  Receipt,
  Package,
  Users,
  Truck,
  Undo2,
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

/** Owner navigation. */
export const OWNER_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transaksi', icon: Receipt },
  { to: '/products', label: 'Produk', icon: Package },
  { to: '/customers', label: 'Pelanggan', icon: Users },
  { to: '/delivery', label: 'Pengiriman', icon: Truck },
  { to: '/returns', label: 'Retur', icon: Undo2 },
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
