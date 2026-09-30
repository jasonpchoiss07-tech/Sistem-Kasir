import { Router } from 'express';
import healthRoute from './health.route';
import authRoutes from '../modules/auth/auth.routes';
import usersRoutes from '../modules/users/users.routes';
import productsRoutes from '../modules/products/products.routes';
import transactionsRoutes from '../modules/transactions/transactions.routes';
import customersRoutes from '../modules/customers/customers.routes';
import returnsRoutes from '../modules/returns/returns.routes';
import dashboardRoutes from '../modules/dashboard/dashboard.routes';
import auditRoutes from '../modules/audit/audit.routes';
import expensesRoutes from '../modules/expenses/expenses.routes';

/**
 * API root router. Feature routers (products, transactions, ...) will be
 * mounted here in later steps.
 */
const router = Router();

router.use('/health', healthRoute);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/products', productsRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/customers', customersRoutes);
router.use('/returns', returnsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/audit', auditRoutes);
router.use('/expenses', expensesRoutes);

export default router;
