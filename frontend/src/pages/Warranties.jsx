import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Plus, Search, X, Eye, Shield, AlertTriangle } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function Warranties() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ order_id: '', product_id: '', customer_id: '', serial_number: '', warranty_months: 12, start_date: '', notes: '' });

  useEffect(() => { loadData(1); }, []);

  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const res = await api.get(`/warranties?${params.toString()}`);
      setItems(res.data.items);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const loadDropdowns = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/customers?limit=100')
      ]);
      setProducts(pRes.data.data || pRes.data.items || []);
      setCustomers(cRes.data.data || cRes.data.items || []);
    } catch (err) { console.error(err); }
  };

  const openCreate = () => {
    setForm({ order_id: '', product_id: '', customer_id: '', serial_number: '', warranty_months: 12, start_date: new Date().toISOString().slice(0, 10), notes: '' });
    setShowModal(true);
    loadDropdowns();
  };

  const handleSave = async () => {
    if (!form.product_id || !form.customer_id || !form.start_date) {
      toast.warning('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    try {
      await api.post('/warranties', form);
      toast.success('Tạo phiếu bảo hành thành công');
      setShowModal(false);
      loadData(1);
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi tạo phiếu bảo hành'); }
  };

  const viewDetail = async (id) => {
    try {
      const res = await api.get(`/warranties/${id}`);
      setViewItem(res.data.data);
    } catch (err) { console.error(err); }
  };

  const statusColors = { active: 'bg-green-100 text-green-700', expired: 'bg-gray-100 text-gray-700', claimed: 'bg-yellow-100 text-yellow-700', replaced: 'bg-blue-100 text-blue-700' };
  const statusLabels = { active: 'Còn bảo hành', expired: 'Hết hạn', claimed: 'Đã claim', replaced: 'Đã thay thế' };

  const isExpiringSoon = (endDate) => {
    const diff = new Date(endDate) - new Date();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Đang tải...</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý bảo hành</h2>
          <p className="text-gray-500 mt-1">Theo dõi bảo hành sản phẩm cho khách hàng</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Tạo phiếu bảo hành</button>
      </div>

      <div className="card flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Tìm mã BH, sản phẩm, KH, S/N..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadData(1)} className="input-field pl-10" />
          </div>
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-auto">
          <option value="">Tất cả trạng thái</option>
          <option value="active">Còn bảo hành</option>
          <option value="expired">Hết hạn</option>
          <option value="claimed">Đã claim</option>
          <option value="replaced">Đã thay thế</option>
        </select>
        <button onClick={() => loadData(1)} className="btn-secondary">Tìm kiếm</button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="table-header">Mã BH</th>
              <th className="table-header">Sản phẩm</th>
              <th className="table-header">Khách hàng</th>
              <th className="table-header">S/N</th>
              <th className="table-header">Ngày hết hạn</th>
              <th className="table-header text-center">Trạng thái</th>
              <th className="table-header text-right">Thao tác</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(w => (
                <tr key={w.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{w.warranty_code}</td>
                  <td className="table-cell">{w.product_name}</td>
                  <td className="table-cell">{w.customer_name}</td>
                  <td className="table-cell text-sm font-mono">{w.serial_number || '-'}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      {isExpiringSoon(w.end_date) && <AlertTriangle className="w-3 h-3 text-yellow-500" />}
                      <span className={isExpiringSoon(w.end_date) ? 'text-yellow-600 font-medium' : ''}>
                        {new Date(w.end_date).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[w.status]}`}>{statusLabels[w.status]}</span></td>
                  <td className="table-cell text-right"><button onClick={() => viewDetail(w.id)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Eye className="w-4 h-4" /></button></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-400">Chưa có phiếu bảo hành nào</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={loadData} />
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Tạo phiếu bảo hành</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sản phẩm *</label>
                <select value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})} className="input-field">
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Khách hàng *</label>
                <select value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value})} className="input-field">
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Số serial</label>
                  <input value={form.serial_number} onChange={e => setForm({...form, serial_number: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Thời gian BH (tháng)</label>
                  <input type="number" min="1" value={form.warranty_months} onChange={e => setForm({...form, warranty_months: parseInt(e.target.value) || 12})} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày bắt đầu *</label>
                  <input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ID đơn hàng</label>
                  <input type="number" value={form.order_id} onChange={e => setForm({...form, order_id: e.target.value})} className="input-field" placeholder="Tùy chọn" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ghi chú</label>
                <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Hủy</button>
              <button onClick={handleSave} className="btn-primary">Tạo phiếu</button>
            </div>
          </div>
        </div>
      )}

      {/* View Detail */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold">{viewItem.warranty_code}</h3>
                  <p className="text-sm text-gray-500">{viewItem.product_name}</p>
                </div>
              </div>
              <button onClick={() => setViewItem(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">Khách hàng</p><p className="font-medium">{viewItem.customer_name}</p></div>
                <div><p className="text-xs text-gray-500">Số serial</p><p className="font-mono">{viewItem.serial_number || '-'}</p></div>
                <div><p className="text-xs text-gray-500">Trạng thái</p><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[viewItem.status]}`}>{statusLabels[viewItem.status]}</span></div>
                <div><p className="text-xs text-gray-500">Thời gian BH</p><p>{viewItem.warranty_months} tháng</p></div>
                <div><p className="text-xs text-gray-500">Bắt đầu</p><p>{new Date(viewItem.start_date).toLocaleDateString('vi-VN')}</p></div>
                <div><p className="text-xs text-gray-500">Kết thúc</p><p className={isExpiringSoon(viewItem.end_date) ? 'text-yellow-600 font-medium' : ''}>{new Date(viewItem.end_date).toLocaleDateString('vi-VN')}</p></div>
              </div>
              {viewItem.notes && <div><p className="text-xs text-gray-500">Ghi chú</p><p>{viewItem.notes}</p></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}