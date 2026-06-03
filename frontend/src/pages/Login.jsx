import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Cpu, Eye, EyeOff, Monitor, ShoppingCart, BarChart3,
  Package, Users, Shield, Zap, ChevronRight
} from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: ShoppingCart, title: 'Quản lý bán hàng', desc: 'Tạo đơn hàng nhanh chóng, hỗ trợ nhiều phương thức thanh toán' },
    { icon: Package, title: 'Quản lý kho', desc: 'Theo dõi tồn kho, cảnh báo hết hàng tự động' },
    { icon: BarChart3, title: 'Báo cáo doanh thu', desc: 'Thống kê chi tiết theo ngày, tuần, tháng' },
    { icon: Users, title: 'Quản lý khách hàng', desc: 'Tích điểm loyalty, lịch sử mua hàng' },
    { icon: Monitor, title: 'Build PC (AI)', desc: 'Gợi ý cấu hình máy tính bằng AI' },
    { icon: Shield, title: 'Bảo mật cao', desc: 'Phân quyền chi tiết cho từng nhân viên' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Features & Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/30">
              <Cpu className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Computer POS</h1>
              <p className="text-sm text-gray-400">Hệ thống quản lý cửa hàng máy tính</p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="my-8">
            <h2 className="text-3xl xl:text-4xl font-bold text-white mb-2 leading-tight">
              Giải pháp quản lý<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-400">
                cửa hàng toàn diện
              </span>
            </h2>
            <p className="text-gray-400 mb-8 max-w-md">
              Hệ thống POS chuyên biệt cho cửa hàng máy tính và lin kiện, giúp quản lý hiệu quả từ bán hàng đến kho vận.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {features.map((f, i) => (
                <div key={i} className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-primary-500/30 transition-all duration-300">
                  <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary-600/30 transition-colors">
                    <f.icon className="w-5 h-5 text-primary-400" />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1">{f.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            {[
              { value: '500+', label: 'Sản phẩm' },
              { value: '10K+', label: 'Đơn hàng/tháng' },
              { value: '99.9%', label: 'Uptime' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <Cpu className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Computer POS</h1>
              <p className="text-sm text-gray-500">Hệ thống quản lý cửa hàng máy tính</p>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại 👋</h2>
            <p className="text-gray-500">Đăng nhập để tiếp tục quản lý cửa hàng của bạn</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100 p-6 sm:p-8">
            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên đăng nhập</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="Nhập tên đăng nhập"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-gray-900 placeholder:text-gray-400 pr-11"
                    placeholder="Nhập mật khẩu"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary-600/25 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    Đăng nhập
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Demo Accounts */}
          <div className="mt-6 p-4 bg-gray-100/80 rounded-xl border border-gray-200/60">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Tài khoản demo</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { user: 'admin', role: 'Admin', color: 'bg-red-50 text-red-700 border-red-200' },
                { user: 'manager', role: 'Manager', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { user: 'staff', role: 'Staff', color: 'bg-green-50 text-green-700 border-green-200' },
              ].map((acc) => (
                <button
                  key={acc.user}
                  onClick={() => { setUsername(acc.user); setPassword('12345678'); }}
                  className={`p-2.5 rounded-lg border text-center hover:shadow-sm transition-all cursor-pointer ${acc.color}`}
                >
                  <p className="font-semibold text-sm">{acc.user}</p>
                  <p className="text-xs opacity-70">{acc.role}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-8">
            © 2026 Computer POS System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}