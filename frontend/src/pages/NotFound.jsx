import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mt-4">Không tìm thấy trang</h2>
        <p className="text-gray-500 mt-2">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => navigate(-1)} className="btn-secondary flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
          <button onClick={() => navigate('/')} className="btn-primary flex items-center gap-2">
            <Home className="w-4 h-4" /> Trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}