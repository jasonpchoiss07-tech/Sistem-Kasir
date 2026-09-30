import { Routes, Route } from 'react-router-dom';
import { LoginPage } from '@/features/auth/LoginPage';
import { ProductsPage } from '@/features/products/ProductsPage';
import { PosPage } from '@/features/pos/PosPage';
import { TransactionsPage } from '@/features/transactions/TransactionsPage';
import { CustomersPage } from '@/features/customers/CustomersPage';
import { DeliveryPage } from '@/features/delivery/DeliveryPage';
import { ReturnsPage } from '@/features/returns/ReturnsPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ProtectedRoute } from '@/app/ProtectedRoute';
import { RoleRoute } from '@/app/RoleRoute';
import { HomeRedirect } from '@/app/HomeRedirect';
import { AppLayout } from '@/layouts/AppLayout';
import { NotFoundPage } from '@/pages/NotFoundPage';

/**
 * Application routes.
 *
 * Public:            /login
 * Authenticated:     everything under ProtectedRoute + AppLayout
 *   Shared:          products, transactions history
 *   OWNER-only:      dashboard, customers, delivery, returns, reports
 *   CASHIER-only:    pos
 */
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<HomeRedirect />} />

          {/* Shared (both roles) */}
          <Route path="/products" element={<ProductsPage />} />
          {/* History: /transactions (owner nav) and /history (cashier nav) → same page */}
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/history" element={<TransactionsPage />} />

          {/* Owner area */}
          <Route element={<RoleRoute allow="OWNER" />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/delivery" element={<DeliveryPage />} />
            <Route path="/returns" element={<ReturnsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          {/* Cashier area */}
          <Route element={<RoleRoute allow="KASIR" />}>
            <Route path="/pos" element={<PosPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
