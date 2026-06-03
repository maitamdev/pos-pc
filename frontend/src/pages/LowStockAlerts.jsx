import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function LowStockAlerts() {
  const { addToast } = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get('/inventory/low-stock-alerts');
      setAlerts(res.data.data?.data || res.data.data?.items || res.data.data);
    } catch { addToast('Lỗi tải cảnh báo', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleResolve = async (id) => {
    try {
      await api.put(`/inventory/alerts/${id}/resolve`);
      addToast('Đã xử lý cảnh báo');
      load();
    } catch (err) { addToast(err.response?.data?.message || 'Lỗi', 'error'); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-yellow-500" />
        Cảnh báo tồn kho thấp
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="text-left py-3 px-4 text-slate-500 font-medium">SKU</th>
              <th className="text-left py-3 px-4 text-slate-500 font-medium">Sản phẩm</th>
              <th className="text-right py-3 px-4 text-slate-500 font-medium">Tồn kho hiện tại</th>
              <th className="text-right py-3 px-4 text-slate-500 font-medium">Tối thiểu</th>
              <th className="text-left py-3 px-4 text-slate-500 font-medium">Ngày tạo</th>
              <th className="text-center py-3 px-4 text-slate-500 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div></td></tr>
            ) : alerts.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-10 text-slate-400">Không có cảnh báo nào</td></tr>
            ) : alerts.map((a) => (
              <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 font-mono text-xs">{a.sku}</td>
                <td className="py-3 px-4 font-medium">{a.product_name}</td>
                <td className="py-3 px-4 text-right font-semibold text-red-600">{a.current_stock}</td>
                <td className="py-3 px-4 text-right text-slate-500">{a.min_stock}</td>
                <td className="py-3 px-4 text-slate-500">{new Date(a.created_at).toLocaleString('vi-VN')}</td>
                <td className="py-3 px-4 text-center">
                  <button onClick={() => handleResolve(a.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs mx-auto">
                    <CheckCircle className="w-3.5 h-3.5" /> Đã xử lý
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
