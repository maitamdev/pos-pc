import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Search, AlertTriangle, ArrowDown, ArrowUp, Plus, X } from 'lucide-react';

export default function Inventory() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('stock');
  const [showImport, setShowImport] = useState(false);
  const [importForm, setImportForm] = useState({ product_id: '', quantity: '', reference: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [prodRes, alertRes] = await Promise.all([
        api.get('/products'),
        api.get('/inventory/alerts'),
      ]);
      setProducts(prodRes.data.data);
      setAlerts(alertRes.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleImport = async () => {
    try {
      await api.post('/inventory/import', {
        product_id: parseInt(importForm.product_id),
        quantity: parseInt(importForm.quantity),
        reference: importForm.reference || null,
      });
      toast.success('Nhập kho thành công');
      setShowImport(false);
      setImportForm({ product_id: '', quantity: '', reference: '' });
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi nhập kho'); }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await api.put(`/inventory/alerts/${alertId}/resolve`);
      toast.success('Đã đánh dấu cảnh báo đã xử lý');
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi cập nhật cảnh báo'); }
  };

  const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockProducts = products.filter(p => p.stock <= p.min_stock_level);
  const totalValue = products.reduce((sum, p) => sum + p.cost_price * p.stock, 0);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Đang tải...</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý kho</h2>
          <p className="text-gray-500 mt-1">Tồn kho & cảnh báo hết hàng</p>
        </div>
        <button onClick={() => setShowImport(true)} className="btn-primary flex items-center gap-2">
          <ArrowDown className="w-4 h-4" /> Nhập kho
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Tổng sản phẩm</p>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Sắp hết hàng</p>
          <p className="text-2xl font-bold text-red-600">{lowStockProducts.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Tổng giá trị kho</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('stock')} className={activeTab === 'stock' ? 'btn-primary' : 'btn-secondary'}>Tồn kho</button>
        <button onClick={() => setActiveTab('alerts')} className={activeTab === 'alerts' ? 'btn-primary' : 'btn-secondary'}>
          Cảnh báo ({alerts.filter(a => a.status === 'active').length})
        </button>
      </div>

      {activeTab === 'stock' ? (
        <div className="card">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Tìm sản phẩm..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">SKU</th>
                  <th className="table-header">Sản phẩm</th>
                  <th className="table-header text-right">Giá vốn</th>
                  <th className="table-header text-right">Tồn kho</th>
                  <th className="table-header text-right">Tồn tối thiểu</th>
                  <th className="table-header">Trạng thái</th>
                  <th className="table-header text-right">Giá trị tồn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-xs">{p.sku}</td>
                    <td className="table-cell font-medium">{p.name}</td>
                    <td className="table-cell text-right">{formatCurrency(p.cost_price)}</td>
                    <td className="table-cell text-right font-bold">
                      <span className={p.stock <= 0 ? 'text-red-600' : p.stock <= p.min_stock_level ? 'text-orange-600' : ''}>{p.stock}</span>
                    </td>
                    <td className="table-cell text-right text-gray-500">{p.min_stock_level}</td>
                    <td className="table-cell">
                      {p.stock <= 0 ? <span className="badge-danger">Hết hàng</span> :
                       p.stock <= p.min_stock_level ? <span className="badge-warning">Sắp hết</span> :
                       <span className="badge-success">Bình thường</span>}
                    </td>
                    <td className="table-cell text-right font-medium">{formatCurrency(p.cost_price * p.stock)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.filter(a => a.status === 'active').length === 0 ? (
            <div className="card text-center py-8 text-gray-400">Không có cảnh báo nào</div>
          ) : alerts.filter(a => a.status === 'active').map(a => (
            <div key={a.id} className="card flex items-center justify-between border-l-4 border-red-500">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium">{a.product_name}</p>
                  <p className="text-sm text-gray-500">Tồn kho: <span className="text-red-600 font-bold">{a.current_stock}</span> / Tối thiểu: {a.min_stock}</p>
                </div>
              </div>
              <button onClick={() => handleResolveAlert(a.id)} className="btn-secondary text-sm">Đã xử lý</button>
            </div>
          ))}
        </div>
      )}

      {/* Import modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Nhập kho</h3>
              <button onClick={() => setShowImport(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sản phẩm *</label>
                <select value={importForm.product_id} onChange={e => setImportForm({...importForm, product_id: e.target.value})} className="input-field">
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Kho: {p.stock})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số lượng *</label>
                <input type="number" min="1" value={importForm.quantity} onChange={e => setImportForm({...importForm, quantity: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ghi chú</label>
                <input value={importForm.reference} onChange={e => setImportForm({...importForm, reference: e.target.value})} className="input-field" placeholder="Phiếu nhập, nhà cung cấp..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setShowImport(false)} className="btn-secondary">Hủy</button>
              <button onClick={handleImport} className="btn-primary">Nhập kho</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}