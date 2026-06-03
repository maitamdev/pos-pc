import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Truck, Tag,
  Warehouse, Percent, BarChart3, Cpu, LogOut, Menu, X, ChevronDown, User, KeyRound, AlertTriangle,
  ClipboardList, RotateCcw, Shield, ScrollText, Settings, HardDrive
} from 'lucide-react';
import NotificationsDropdown from '../components/NotificationsDropdown';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager'] },
  { path: '/orders', label: 'Bán hàng', icon: ShoppingCart, roles: ['admin', 'manager', 'staff'] },
  { path: '/products', label: 'Sản phẩm', icon: Package, roles: ['admin', 'manager', 'staff'] },
  { path: '/categories', label: 'Danh mục', icon: Tag, roles: ['admin', 'manager'] },
  { path: '/suppliers', label: 'Nhà cung cấp', icon: Truck, roles: ['admin', 'manager'] },
  { path: '/customers', label: 'Khách hàng', icon: Users, roles: ['admin', 'manager', 'staff'] },
  { path: '/low-stock-alerts', label: 'Cảnh báo tồn kho', icon: AlertTriangle, roles: ['admin', 'manager'] },
  { path: '/inventory', label: 'Quản lý kho', icon: Warehouse, roles: ['admin', 'manager'] },
  { path: '/promotions', label: 'Khuyến mãi', icon: Percent, roles: ['admin', 'manager'] },
  { path: '/reports', label: 'Báo cáo', icon: BarChart3, roles: ['admin', 'manager'] },
  { path: '/build-pc', label: 'Build PC (AI)', icon: Cpu, roles: ['admin', 'manager', 'staff'] },
  { path: '/purchase-orders', label: 'Đơn nhập hàng', icon: ClipboardList, roles: ['admin', 'manager'] },
  { path: '/returns', label: 'Trả hàng', icon: RotateCcw, roles: ['admin', 'manager', 'staff'] },
  { path: '/warranties', label: 'Bảo hành', icon: Shield, roles: ['admin', 'manager', 'staff'] },
  { path: '/audit-logs', label: 'Nhật ký', icon: ScrollText, roles: ['admin'] },
  { path: '/settings', label: 'Cài đặt', icon: Settings, roles: ['admin', 'manager'] },
  { path: '/backup', label: 'Backup', icon: HardDrive, roles: ['admin'] },
  { path: '/users', label: 'Nhân viên', icon: User, roles: ['admin'] },
];

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPass, setChangingPass] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleChangePassword = async () => {
    if (!passForm.currentPassword || !passForm.newPassword) {
      toast.warning('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (passForm.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải ít nhất 6 ký tự');
      return;
    }
    setChangingPass(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      toast.success('Đổi mật khẩu thành công');
      setShowChangePass(false);
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi đổi mật khẩu');
    } finally { setChangingPass(false); }
  };

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-700">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Cpu className="w-8 h-8 text-primary-400" />
              <span className="font-bold text-lg">Computer POS</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-gray-700 rounded">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {filteredMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-sm font-bold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.full_name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">Hệ thống quản lý cửa hàng máy tính</h1>
          <div className="flex items-center gap-2">
            <NotificationsDropdown />
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <span className="text-sm font-medium">{user?.full_name}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium">{user?.full_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={() => { navigate('/profile'); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Hồ sơ cá nhân
                </button>
                <button
                  onClick={() => { setShowChangePass(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <KeyRound className="w-4 h-4" />
                  Đổi mật khẩu
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>

      {/* Change password modal */}
      {showChangePass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Đổi mật khẩu</h3>
              <button onClick={() => { setShowChangePass(false); setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mật khẩu hiện tại *</label>
                <input type="password" value={passForm.currentPassword} onChange={e => setPassForm({...passForm, currentPassword: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mật khẩu mới *</label>
                <input type="password" value={passForm.newPassword} onChange={e => setPassForm({...passForm, newPassword: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Xác nhận mật khẩu mới *</label>
                <input type="password" value={passForm.confirmPassword} onChange={e => setPassForm({...passForm, confirmPassword: e.target.value})} className="input-field" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => { setShowChangePass(false); setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }} className="btn-secondary">Hủy</button>
              <button onClick={handleChangePassword} disabled={changingPass} className="btn-primary">{changingPass ? 'Đang lưu...' : 'Đổi mật khẩu'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}