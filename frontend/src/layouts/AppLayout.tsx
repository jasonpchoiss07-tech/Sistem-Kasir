import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Store, Menu, X, LogOut, Download } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { navFor, type NavItem } from './nav';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui';
import { OfflineBanner } from '@/components/OfflineBanner';
import { usePwaInstall } from '@/hooks/usePwaInstall';

/**
 * Main authenticated app shell.
 * - Desktop/tablet (lg+): fixed sidebar on the left.
 * - Mobile: sidebar hidden, opened as an overlay drawer via the top-bar menu.
 * Navigation items are chosen by role.
 */
export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!user) return null;

  const items = navFor(user.role);
  const roleLabel = user.role === 'OWNER' ? 'Owner' : 'Kasir';
  const { canInstall, install } = usePwaInstall();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <Brand />
        <SidebarNav items={items} />
        <UserFooter name={user.name} roleLabel={roleLabel} onLogout={handleLogout} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pr-2">
              <Brand />
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Tutup menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav items={items} onNavigate={() => setDrawerOpen(false)} />
            <UserFooter name={user.name} roleLabel={roleLabel} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      {/* Content column */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur">
          <button
            onClick={() => setDrawerOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Buka menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="lg:hidden">
            <span className="text-sm font-semibold text-slate-900">POS Toko Bangunan</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {canInstall && (
              <Button variant="secondary" size="sm" onClick={install}>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Install</span>
              </Button>
            )}
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight text-slate-800">{user.name}</p>
              <p className="text-xs leading-tight text-slate-500">{roleLabel}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <OfflineBanner />

        <main className="mx-auto max-w-6xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex h-14 items-center gap-2 px-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
        <Store className="h-4 w-4" />
      </div>
      <span className="text-sm font-bold tracking-tight text-slate-900">POS Bangunan</span>
    </div>
  );
}

function SidebarNav({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
              isActive
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            )
          }
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function UserFooter({
  name,
  roleLabel,
  onLogout,
}: {
  name: string;
  roleLabel: string;
  onLogout: () => void;
}) {
  return (
    <div className="border-t border-slate-200 p-3">
      <div className="mb-2 flex items-center gap-3 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">{name}</p>
          <p className="text-xs text-slate-500">{roleLabel}</p>
        </div>
      </div>
      <Button variant="secondary" size="sm" className="w-full" onClick={onLogout}>
        <LogOut className="h-4 w-4" />
        Keluar
      </Button>
    </div>
  );
}
