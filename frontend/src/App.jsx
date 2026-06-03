import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import Users from './pages/Users';
import Inventory from './pages/Inventory';
import Promotions from './pages/Promotions';
import Reports from './pages/Reports';
import BuildPC from './pages/BuildPC';
import LowStockAlerts from './pages/LowStockAlerts';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import PurchaseOrders from './pages/PurchaseOrders';
import Returns from './pages/Returns';
import Warranties from './pages/Warranties';
import AuditLogs from './pages/AuditLogs';
import SettingsPage from './pages/Settings';
import BackupRestore from './pages/BackupRestore';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <MainLayout>{children}</MainLayout>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

      <Route path="/" element={
        <ProtectedRoute roles={['admin', 'manager']}>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/orders" element={
        <ProtectedRoute roles={['admin', 'manager', 'staff']}>
          <Orders />
        </ProtectedRoute>
      } />

      <Route path="/orders/:id" element={
        <ProtectedRoute roles={['admin', 'manager', 'staff']}>
          <OrderDetail />
        </ProtectedRoute>
      } />

      <Route path="/products" element={
        <ProtectedRoute roles={['admin', 'manager', 'staff']}>
          <Products />
        </ProtectedRoute>
      } />

      <Route path="/categories" element={
        <ProtectedRoute roles={['admin', 'manager']}>
          <Categories />
        </ProtectedRoute>
      } />

      <Route path="/suppliers" element={
        <ProtectedRoute roles={['admin', 'manager']}>
          <Suppliers />
        </ProtectedRoute>
      } />

      <Route path="/customers" element={
        <ProtectedRoute roles={['admin', 'manager', 'staff']}>
          <Customers />
        </ProtectedRoute>
      } />

      <Route path="/inventory" element={
        <ProtectedRoute roles={['admin', 'manager']}>
          <Inventory />
        </ProtectedRoute>
      } />

      <Route path="/low-stock-alerts" element={
        <ProtectedRoute roles={['admin', 'manager']}>
          <LowStockAlerts />
        </ProtectedRoute>
      } />

      <Route path="/promotions" element={
        <ProtectedRoute roles={['admin', 'manager']}>
          <Promotions />
        </ProtectedRoute>
      } />

      <Route path="/reports" element={
        <ProtectedRoute roles={['admin', 'manager']}>
          <Reports />
        </ProtectedRoute>
      } />

      <Route path="/build-pc" element={
        <ProtectedRoute roles={['admin', 'manager', 'staff']}>
          <BuildPC />
        </ProtectedRoute>
      } />

      <Route path="/users" element={
        <ProtectedRoute roles={['admin']}>
          <Users />
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute roles={['admin', 'manager', 'staff']}>
          <Profile />
        </ProtectedRoute>
      } />

      <Route path="/purchase-orders" element={
        <ProtectedRoute roles={['admin', 'manager']}>
          <PurchaseOrders />
        </ProtectedRoute>
      } />

      <Route path="/returns" element={
        <ProtectedRoute roles={['admin', 'manager', 'staff']}>
          <Returns />
        </ProtectedRoute>
      } />

      <Route path="/warranties" element={
        <ProtectedRoute roles={['admin', 'manager', 'staff']}>
          <Warranties />
        </ProtectedRoute>
      } />

      <Route path="/audit-logs" element={
        <ProtectedRoute roles={['admin']}>
          <AuditLogs />
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute roles={['admin', 'manager']}>
          <SettingsPage />
        </ProtectedRoute>
      } />

      <Route path="/backup" element={
        <ProtectedRoute roles={['admin']}>
          <BackupRestore />
        </ProtectedRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
